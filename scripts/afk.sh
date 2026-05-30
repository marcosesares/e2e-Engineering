#!/usr/bin/env bash
#
# AFK driver — unattended e2e-flight Task-queue drain (POSIX port of afk.ps1).
# Loops fresh /e2e-flight sessions. Each spawn = fresh context (external /clear).
#
# Drives the Task queue at .e2e-engineering/queue.json one Task-step per spawn.
# WARNING: runs with --dangerously-skip-permissions. All tool calls execute
# without approval. Only reachable post-gate-1 (flight needs a selected queue).
#
# Sets E2E_DRIVER=1 so /e2e-flight enters worker mode (Step 0 guard). Catches
# four signals on each session tail:
#   <e2e-complete>   -> success, exit 0
#   <e2e-stall>      -> human needed, exit 1
#   <e2e-task-done>  -> next Task, respawn
#   <e2e-checkpoint> -> resume same Task, respawn
#
# Usage:
#   ./afk.sh                    # claude default, /e2e-flight
#   AI=opencode ./afk.sh        # opencode preset
#   AI=codex ./afk.sh           # codex preset
#   SKILL=/other ./afk.sh       # different skill
#   MAX_SESSIONS=80 ./afk.sh    # raise ceiling
#   CMD="custom cmd" ./afk.sh   # custom override

set -euo pipefail

AI="${AI:-claude}"
SKILL="${SKILL:-/e2e-flight}"
MAX_SESSIONS="${MAX_SESSIONS:-50}"
CMD="${CMD:-}"

case "$AI" in
  claude)   PRESET="claude --print --dangerously-skip-permissions \"$SKILL\"" ;;
  opencode) PRESET="opencode -p --dangerously-skip-permissions \"$SKILL\"" ;;
  codex)    PRESET="codex exec --dangerously-bypass-approvals-and-sandbox \"$SKILL\"" ;;
  *) echo "Unknown AI preset: $AI" >&2; exit 64 ;;
esac

[ -n "$CMD" ] || CMD="$PRESET"

# Worker mode for /e2e-flight Step 0 guard.
export E2E_DRIVER=1

session=0
start_ts=$(date +%s)

log() { printf '[afk %s] %s\n' "$(date +%H:%M:%S)" "$1"; }

log "Starting. AI=$AI MAX_SESSIONS=$MAX_SESSIONS SKILL=$SKILL"
log "Command: $CMD"

while [ "$session" -lt "$MAX_SESSIONS" ]; do
  session=$((session + 1))
  log "Session $session/$MAX_SESSIONS"

  # Capture full output while streaming it; keep only the tail for matching.
  out="$(eval "$CMD" 2>&1 | tee /dev/stderr)"
  tail="$(printf '%s\n' "$out" | tail -n 30)"

  # Order matters: complete/stall terminal; task-done/checkpoint respawn.
  if printf '%s' "$tail" | grep -Eq '<e2e-complete[^/]*/>'; then
    elapsed=$(( $(date +%s) - start_ts ))
    log "COMPLETE — queue drained after $session session(s) [${elapsed}s]"
    exit 0
  fi

  if printf '%s' "$tail" | grep -Eq '<e2e-stall[[:space:]]+reason="[^"]*"'; then
    reason="$(printf '%s' "$tail" | grep -oE 'reason="[^"]*"' | head -1)"
    log "STALL: $reason. Human input required."
    log "Resolve then resume: ./.e2e-engineering/afk.sh"
    exit 1
  fi

  if printf '%s' "$tail" | grep -Eq '<e2e-task-done[[:space:]]+id="[^"]*"'; then
    id="$(printf '%s' "$tail" | grep -oE 'id="[^"]*"' | head -1)"
    log "Task done: $id. Next Task -> session $((session + 1))..."
    continue
  fi

  if printf '%s' "$tail" | grep -Eq '<e2e-checkpoint[[:space:]]+handoff="[^"]*"'; then
    log "Checkpoint. Resuming same Task..."
    continue
  fi

  log "No signal detected in session $session. Review output."
  printf '%s\n' "$out" | tail -n 5 | sed 's/^/  /'
  exit 2
done

log "Safety ceiling reached ($MAX_SESSIONS sessions)."
exit 3
