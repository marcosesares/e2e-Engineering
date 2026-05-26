<#
.SYNOPSIS
  AFK wrapper — unattended e2e-engineering session driver.
  Spawns fresh AI sessions in loop. Auto-restarts on 65% checkpoint.

.DESCRIPTION
  WARNING: Runs with --dangerously-skip-permissions (or equivalent).
  All tool calls execute without approval. Only launch after gate 1.

.USAGE
  .\scripts\afk.ps1                              # claude default
  .\scripts\afk.ps1 -AI opencode                 # opencode preset
  .\scripts\afk.ps1 -AI codex                    # codex preset
  .\scripts\afk.ps1 -Command "custom cmd"        # custom override
  .\scripts\afk.ps1 -Skill "/other-skill"        # different skill
  .\scripts\afk.ps1 -MaxSessions 50              # raise ceiling
#>
param(
    [ValidateSet("claude", "opencode", "codex")]
    [string]$AI = "claude",
    [string]$Command = "",
    [string]$Skill = "/e2e-engineering",
    [int]$MaxSessions = 30
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$presets = @{
    "claude"   = "claude --print --dangerously-skip-permissions `"$Skill`""
    "opencode" = "opencode -p --dangerously-skip-permissions `"$Skill`""
    "codex"    = "codex exec --dangerously-bypass-approvals-and-sandbox `"$Skill`""
}

$cmd = if ($Command) { $Command } else { $presets[$AI] }
$session = 0
$startTime = Get-Date

function Write-Ralph([string]$msg, [string]$color = "Cyan") {
    Write-Host "[afk $(Get-Date -Format 'HH:mm:ss')] $msg" -ForegroundColor $color
}

Write-Ralph "Starting. AI=$AI MaxSessions=$MaxSessions Skill=$Skill"
Write-Ralph "Command: $cmd" "DarkGray"

while ($session -lt $MaxSessions) {
    $session++
    Write-Ralph "Session $session/$MaxSessions" "Green"

    $outputLines = [System.Collections.Generic.List[string]]::new()
    Invoke-Expression $cmd 2>&1 | ForEach-Object {
        Write-Host $_
        $outputLines.Add([string]$_)
    }

    $tail = ($outputLines | Select-Object -Last 30) -join "`n"

    if ($tail -match '<e2e-complete\s*(?:[^/]*)/>') {
        $elapsed = ((Get-Date) - $startTime).ToString("hh\:mm\:ss")
        Write-Ralph "COMPLETE after $session session(s) [$elapsed]" "Green"
        exit 0
    }

    if ($tail -match '<e2e-checkpoint\s+handoff="([^"]*)"') {
        Write-Ralph "Checkpoint. Handoff: $($Matches[1])" "Cyan"
        Write-Ralph "Restarting session $($session + 1)..."
        continue
    }

    if ($tail -match '<e2e-stall\s+reason="([^"]*)"') {
        Write-Ralph "STALL: $($Matches[1]). Human input required." "Yellow"
        Write-Ralph "Resolve stall then resume: .\scripts\afk.ps1"
        exit 1
    }

    Write-Ralph "No signal detected in session $session. Review output." "Red"
    $outputLines | Select-Object -Last 5 | ForEach-Object { Write-Host "  $_" }
    exit 2
}

Write-Ralph "Safety ceiling reached ($MaxSessions sessions)." "Red"
exit 3
