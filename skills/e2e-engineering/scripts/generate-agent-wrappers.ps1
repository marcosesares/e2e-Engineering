#!/usr/bin/env pwsh
# Reads canonical specs + agents.manifest.json, emits self-contained runtime wrappers.
# Never hand-edit .claude/agents/ or ~/.codex/agents/ — regenerate from canonical source.
#
# Usage:
#   ./generate-agent-wrappers.ps1           # emit all wrappers
#   ./generate-agent-wrappers.ps1 -DryRun   # show what would be written without writing

param(
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$scriptDir   = $PSScriptRoot                                          # .../skills/e2e-engineering/scripts
$e2eEngDir   = Split-Path $scriptDir -Parent                          # .../skills/e2e-engineering
$agentsDir   = Join-Path $e2eEngDir 'agents'
$manifestPath = Join-Path $e2eEngDir 'agents.manifest.json'
$repoRoot    = Split-Path (Split-Path $e2eEngDir -Parent) -Parent     # up: skills/ -> repo root

$claudeAgentsDir = Join-Path $repoRoot '.claude\agents'
$codexAgentsDir  = Join-Path $env:USERPROFILE '.codex\agents'

if (-not (Test-Path $manifestPath)) {
    Write-Error "Manifest not found: $manifestPath"
    exit 1
}

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$roles    = $manifest.roles.PSObject.Properties

Write-Host "Repo root    : $repoRoot"
Write-Host "Claude agents: $claudeAgentsDir"
Write-Host "Codex agents : $codexAgentsDir"
Write-Host "Roles        : $($roles.Name -join ', ')"
Write-Host ""

foreach ($role in $roles) {
    $roleName = $role.Name
    $meta     = $role.Value

    $specPath = Join-Path $agentsDir "$roleName.md"
    if (-not (Test-Path $specPath)) {
        Write-Warning "Canonical spec not found, skipping: $specPath"
        continue
    }

    $specBody    = Get-Content $specPath -Raw
    $toolsStr    = $meta.tools -join ', '
    $description = $meta.description
    $claudeName  = $meta.claude_name
    $codexName   = $meta.codex_name
    $model       = if ($meta.model) { $meta.model } else { 'auto' }
    $sandboxMode = if ($meta.sandbox_mode) { $meta.sandbox_mode } else { 'read-only' }

    # ── Claude Code wrapper (.md with YAML frontmatter) ──────────────────────
    $claudeFrontmatter = @"
---
name: $claudeName
description: $description
tools: $toolsStr
---

"@
    $claudeContent  = $claudeFrontmatter + $specBody
    $claudeOutPath  = Join-Path $claudeAgentsDir "$claudeName.md"

    if ($DryRun) {
        Write-Host "[DRY RUN] Claude Code: $claudeOutPath"
    } else {
        New-Item -ItemType Directory -Force -Path $claudeAgentsDir | Out-Null
        [System.IO.File]::WriteAllText($claudeOutPath, $claudeContent, [System.Text.Encoding]::UTF8)
        Write-Host "Written : $claudeOutPath"
    }

    # ── Codex TOML wrapper ───────────────────────────────────────────────────
    # developer_instructions inlines the canonical spec (no path reference — fails silently in Codex)
    $codexHeader = @"
[agent]
name = "$codexName"
description = "$description"
model = "$model"
sandbox_mode = "$sandboxMode"

[developer_instructions]
content = """
"@
    $codexContent = $codexHeader + $specBody + '"""'
    $codexOutPath = Join-Path $codexAgentsDir "$codexName.toml"

    if ($DryRun) {
        Write-Host "[DRY RUN] Codex      : $codexOutPath"
    } else {
        New-Item -ItemType Directory -Force -Path $codexAgentsDir | Out-Null
        [System.IO.File]::WriteAllText($codexOutPath, $codexContent, [System.Text.Encoding]::UTF8)
        Write-Host "Written : $codexOutPath"
    }

    Write-Host ""
}

if ($DryRun) {
    Write-Host "Dry run complete. $($roles.Count) role(s) would be processed."
} else {
    Write-Host "Done. $($roles.Count) role(s) processed."
    Write-Host "Note: delete any legacy hand-authored wrappers no longer in the manifest."
}
