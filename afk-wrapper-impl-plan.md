# AFK Wrapper — Implementation Plan
_caveman:ultra. Self-contained. Start fresh session, read this first._

## What
Optional external session-restart driver for unattended e2e-engineering runs.
Spawns fresh `claude --print --dangerously-skip-permissions` sessions in loop.
Restarts on `<e2e-checkpoint>`. Stops on `<e2e-stall>` or `<e2e-complete>`.
Runs AFTER gate 1 (PRD approved). Default loop = in-session [[Loop driver]] unchanged.

## Settled decisions
| Decision | Choice |
|---|---|
| Mechanism | A1: `claude --print --dangerously-skip-permissions` |
| AI presets | claude / opencode / codex + `-Command` custom override |
| Signals | XML: `<e2e-checkpoint>`, `<e2e-stall>`, `<e2e-complete>` |
| Script | `scripts/afk.ps1` |
| CONTEXT.md term | **AFK wrapper** |
| Gate 1 | Manual interactive; afk starts after |
| ADR | Update ADR 0005 (not new ADR) |
| Cursor | Excluded — no headless CLI |
| `-Skill` param | Default `/e2e-engineering`; override for other skills |
| MaxSessions | 30 default |
| Security | `--dangerously-skip-permissions` baked into presets; user consent = explicit invocation |

## AI preset commands
```
claude   → claude --print --dangerously-skip-permissions "{skill}"
opencode → opencode -p --dangerously-skip-permissions "{skill}"
codex    → codex exec --dangerously-bypass-approvals-and-sandbox "{skill}"
```

## Files to create/modify

### 1. scripts/afk.ps1 — NEW
```powershell
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
```

### 2. .claude/skills/e2e-engineering/cross/context-checkpoint.md — MODIFY
In "Then — checkpoint instruction + HARD STOP" section, step 1, add signal line to output block:

BEFORE (end of output block):
```
   Resume:
     1. /clear    ← reset context
     2. /e2e-engineering    ← fresh session reads handoff automatically
   ```
```

AFTER:
```
   Resume (manual):
     1. /clear    ← reset context
     2. /e2e-engineering    ← fresh session reads handoff automatically

   <e2e-checkpoint handoff=".e2e-engineering/handoff-<phase>-<timestamp>.md" />
   ```
   (substitute actual handoff path in BOTH the Handoff line and the signal)
```

Also update "Unattended automation" note at bottom:
BEFORE:
```
> **Unattended automation:** a future `ralph --afk` wrapper will detect the checkpoint signal and restart automatically (ADR 0005). Not yet implemented — manual `/clear` + `/e2e-engineering` is the current path.
```
AFTER:
```
> **Unattended automation (AFK wrapper):** `scripts/afk.ps1` detects `<e2e-checkpoint />` and restarts automatically. Run `.\scripts\afk.ps1` after gate 1 to enable AFK mode. Supports claude (default), opencode, codex via `-AI` param. (ADR 0005)
```

### 3. .claude/skills/e2e-engineering/SKILL.md — MODIFY two locations

**Location A — gate 3 stall (implementation loop section):**
Find: "Escalate to human ONLY on stall (no ready work left, or every remaining story depends on a blocked one)."
Add after: "Emit `<e2e-stall reason=\"all-stories-blocked\" />` before escalating."

**Location B — task close (post-implementation section):**
Find: "Task close: extract durable learnings, ensure amendments resolved, progress.txt resets on the NEXT task."
Add after: "Emit `<e2e-complete stories=\"N\" />` (N = total story count from prd.json)."

### 4. CONTEXT.md — ADD term "AFK wrapper"
Add after the "Loop driver" entry:

```
**AFK wrapper**: Optional external script (`scripts/afk.ps1`) that drives unattended e2e-engineering runs. Spawns fresh `claude --print --dangerously-skip-permissions` sessions in a loop. Restarts on `<e2e-checkpoint>`, stops on `<e2e-stall>` or `<e2e-complete>`. Runs only after gate 1 (PRD approved). Not the default path — default is the in-session [[Loop driver]]. Supports claude (default), opencode, codex via preset commands.
_Avoid_: "ralph loop", "ralph.sh", "session manager"
```

### 5. docs/adr/0005-skill-driven-loop-not-external-shell.md — APPEND
Add section at end:

```
## Status update — AFK wrapper implemented

The carved-out `--afk` path is now implemented as `scripts/afk.ps1`.
It is NOT the default loop driver — the default remains in-session.
AFK wrapper spawns `claude --print --dangerously-skip-permissions "/e2e-engineering"` in a loop.
Signals emitted by the skill: `<e2e-checkpoint>` (restart), `<e2e-stall>` (human needed), `<e2e-complete>` (done).
Supports claude, opencode (`-p --dangerously-skip-permissions`), codex (`exec --dangerously-bypass-approvals-and-sandbox`).
Cursor excluded — no headless CLI.
Test confirmed: `claude --print --dangerously-skip-permissions` supports Agent tool spawning (subagents run headlessly, permissions propagate to children).
```

## Signal protocol summary
| Signal | Where emitted | Who detects |
|---|---|---|
| `<e2e-checkpoint handoff="PATH" />` | context-checkpoint.md output | afk.ps1 → restart |
| `<e2e-stall reason="REASON" />` | SKILL.md gate 3 stall | afk.ps1 → stop, alert |
| `<e2e-complete stories="N" />` | SKILL.md task close | afk.ps1 → stop, success |

## Test already run
```
claude --print --dangerously-skip-permissions "use Agent tool to spawn subagent that reads README.md and returns first line"
→ "First line: `# e2e-engineering`"
```
Agent spawning works in --print mode. Permissions propagate to children.
