<#
.SYNOPSIS
  Build + publish a new e2e-engineering release. Auto-decides the version bump.

.DESCRIPTION
  Pipeline:
    1. Decide the SemVer bump (auto, or -Bump override).
    2. Set the new version in all three manifests:
         package.json
         dist/marketplace/.claude-plugin/marketplace.json        (metadata.version)
         dist/marketplace/plugins/e2e-engineering/.claude-plugin/plugin.json
    3. npm run build        (scripts/build-dist.js — syncs skills + afk into dist/)
    4. git commit + tag v<version>   (unless -NoGit)
    5. npm publish --access public
    6. npm run publish:marketplace -- --remote <url> --push --force

  Auto bump heuristic (compares the last git tag against the working tree):
    MAJOR  — a published top-level skill dir (.claude/skills/<name>/) was REMOVED
             (breaks installs that reference it).
    MINOR  — a NEW top-level skill dir was ADDED (new capability/command).
    PATCH  — everything else (edits, fixes, docs, ADRs).
  Override anytime with -Bump major|minor|patch. The decision is printed before
  any file is touched.

.EXAMPLE
  pwsh -File scripts/publish.ps1                 # auto bump, build, publish all
  pwsh -File scripts/publish.ps1 -Bump minor     # force minor
  pwsh -File scripts/publish.ps1 -DryRun         # show bump + npm pack dry-run, no push
#>
param(
    [ValidateSet("auto", "major", "minor", "patch")]
    [string]$Bump = "auto",
    [string]$MarketplaceRemote = "https://github.com/marcosesares/e2e-Engineering",
    [switch]$DryRun,
    [switch]$NoGit
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

function Step([string]$m) { Write-Host "`n=== $m ===" -ForegroundColor Cyan }
function Run([string]$exe, [string[]]$argv) {
    Write-Host "> $exe $($argv -join ' ')" -ForegroundColor DarkGray
    & $exe @argv
    if ($LASTEXITCODE -ne 0) { throw "$exe exited $LASTEXITCODE" }
}

$pkgPath = Join-Path $repo "package.json"
$mktPath = Join-Path $repo "dist/marketplace/.claude-plugin/marketplace.json"
$plgPath = Join-Path $repo "dist/marketplace/plugins/e2e-engineering/.claude-plugin/plugin.json"
foreach ($p in @($pkgPath, $mktPath, $plgPath)) {
    if (-not (Test-Path $p)) { throw "manifest missing: $p (run npm run build first)" }
}

# --- current version (npm is the source of truth) ---
$current = ((Get-Content $pkgPath -Raw | ConvertFrom-Json).version)
if ($current -notmatch '^\d+\.\d+\.\d+$') { throw "package.json version not X.Y.Z: $current" }

# --- skill-dir sets: last tag vs now (drives the auto bump) ---
function Get-SkillNames-FromTree([string]$ref) {
    $out = git ls-tree -r --name-only $ref -- .claude/skills 2>$null
    if (-not $out) { return @() }
    $names = foreach ($line in $out) {
        if ($line -match '^\.claude/skills/([^/]+)/SKILL\.md$') { $Matches[1] }
    }
    return @($names | Sort-Object -Unique)
}
$nowSkills = @(Get-ChildItem (Join-Path $repo ".claude/skills") -Directory -ErrorAction SilentlyContinue |
    Where-Object { Test-Path (Join-Path $_.FullName "SKILL.md") } | Select-Object -ExpandProperty Name | Sort-Object -Unique)

# Prefer the nearest tag reachable from HEAD; fall back to the highest version tag
# (the release tag may not be an ancestor of the current branch).
$lastTag = (git describe --tags --abbrev=0 2>$null)
if (-not $lastTag) {
    $lastTag = (git tag --sort=-v:refname 2>$null | Select-Object -First 1)
}
$added = @(); $removed = @()
if ($lastTag) {
    $tagSkills = Get-SkillNames-FromTree $lastTag
    $added   = @($nowSkills | Where-Object { $_ -notin $tagSkills })
    $removed = @($tagSkills | Where-Object { $_ -notin $nowSkills })
}

if ($Bump -eq "auto") {
    if     ($removed.Count -gt 0) { $bumpType = "major"; $reason = "removed skill(s): $($removed -join ', ')" }
    elseif ($added.Count   -gt 0) { $bumpType = "minor"; $reason = "added skill(s): $($added -join ', ')" }
    else                          { $bumpType = "patch"; $reason = "no skill add/remove since $lastTag — content-only" }
} else {
    $bumpType = $Bump; $reason = "forced via -Bump"
}

$parts = $current.Split('.')
[int]$maj = $parts[0]; [int]$min = $parts[1]; [int]$pat = $parts[2]
switch ($bumpType) {
    "major" { $maj++; $min = 0; $pat = 0 }
    "minor" { $min++; $pat = 0 }
    "patch" { $pat++ }
}
$newVersion = "$maj.$min.$pat"

Step "Version"
Write-Host "  current : $current   (last tag: $(if ($lastTag) { $lastTag } else { 'none' }))"
Write-Host "  bump    : $bumpType  ($reason)"
Write-Host "  new     : $newVersion" -ForegroundColor Green

# --- set version in the three manifests (regex on the version line; preserve formatting) ---
function Set-JsonVersion([string]$path, [string]$version) {
    $raw = Get-Content $path -Raw
    $pattern = '("version"\s*:\s*")\d+\.\d+\.\d+(")'
    if (-not [regex]::IsMatch($raw, $pattern)) { throw "no version field found in $path" }
    # first "version": "X.Y.Z" occurrence (top-level for package/plugin; metadata for marketplace)
    $new = [regex]::Replace($raw, $pattern, "`${1}$version`${2}", 1)
    if ($new -ne $raw) { Set-Content -Path $path -Value $new -NoNewline -Encoding utf8 }
    Write-Host "  set $version → $([System.IO.Path]::GetFileName($path))"
}
Step "Stamp manifests"
Set-JsonVersion $pkgPath $newVersion
Set-JsonVersion $plgPath $newVersion
Set-JsonVersion $mktPath $newVersion

# --- build ---
Step "Build (npm run build)"
Run "npm" @("run", "build")

# --- publish ---
if ($DryRun) {
    Step "DRY RUN — npm publish --dry-run (no push, no tag)"
    Run "npm" @("publish", "--access", "public", "--dry-run")
    Write-Host "`nDry run complete. Nothing published, no git changes committed." -ForegroundColor Yellow
    Write-Host "Manifests were stamped to $newVersion on disk — revert with: git checkout -- package.json dist/" -ForegroundColor Yellow
    return
}

if (-not $NoGit) {
    Step "Commit + tag"
    Run "git" @("add", "-A")
    $status = git status --porcelain
    if ($status) { Run "git" @("commit", "-m", "Release v$newVersion") }
    else { Write-Host "  nothing to commit" }
    $existing = git tag --list "v$newVersion"
    if ($existing) { Write-Host "  tag v$newVersion already exists — skipping" }
    else { Run "git" @("tag", "v$newVersion") }
}

Step "npm publish"
Run "npm" @("publish", "--access", "public")

Step "Publish marketplace"
Run "npm" @("run", "publish:marketplace", "--", "--remote", $MarketplaceRemote, "--push", "--force")

Step "Done"
Write-Host "Published e2e-engineering v$newVersion (npm + marketplace)." -ForegroundColor Green
if (-not $NoGit) { Write-Host "Tagged v$newVersion. Push this repo's commit/tag: git push --follow-tags" -ForegroundColor DarkGray }
