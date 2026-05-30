# Implementation loop is skill-driven in-session, not an external shell script

Ralph drives its loop with `ralph.sh`, which spawns a fresh agent process per story and greps stdout for `<promise>COMPLETE</promise>`. e2e-engineering instead runs the loop inside the orchestrator skill: it iterates slices in-session, and at the 65% context checkpoint it writes the handoff doc + `prd.json` + `progress.txt` and ends, so a fresh session resumes from those artifacts. We adopt Ralph's stateless-fresh-agent and file-persistence ideas but reject the external bash driver — it adds a shell dependency, is weak on Windows/PowerShell, and pushes orchestration outside the skill. Ralph's COMPLETE signal becomes "all stories `passes: true` in prd.json". A future `--afk` wrapper could still emit a ralph.sh for unattended overnight runs, but the default path stays inside the harness.

## Status update — AFK wrapper implemented

The carved-out `--afk` path is now implemented as `scripts/afk.ps1`.
It is NOT the default loop driver — the default remains in-session.
AFK wrapper spawns `claude --print --dangerously-skip-permissions "/e2e-engineering"` in a loop.
Signals emitted by the skill: `<e2e-checkpoint>` (restart), `<e2e-stall>` (human needed), `<e2e-complete>` (done).
Supports claude, opencode (`-p --dangerously-skip-permissions`), codex (`exec --dangerously-bypass-approvals-and-sandbox`).
Cursor excluded — no headless CLI.
Test confirmed: `claude --print --dangerously-skip-permissions` supports Agent tool spawning (subagents run headlessly, permissions propagate to children).
