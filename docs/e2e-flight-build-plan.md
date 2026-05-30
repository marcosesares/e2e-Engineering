# e2e-flight + multi-task queue — Build Plan (handoff for fresh session)

Design FROZEN (grill session 2026-05-29). This doc = what to build. Read order before building:
1. `CONTEXT.md` — new terms: /e2e-flight, Task queue, Task dependsOn, Run selection, pending-qa, qa-signoff.md, QA sign-off session, QA finding, E2E_DRIVER guard, AFK wrapper (amended)
2. `docs/adr/0015`–`0018` (the four decisions behind this layer)
3. `docs/e2e-engineering-build-plan.md` (the existing single-Task system this extends)

## Goal
Turn the single-Task orchestrator into a multi-Task, walk-away pipeline. Human specs N features interactively, selects a batch, and an external driver drains them unattended — saving progress, resetting context, and advancing Task-to-Task on its own — then parks human-QA for one batched sign-off pass.

## The cycle
```
/e2e-engineering  (spec N features; gate 1 each -> append to queue)
  -> show Run-selection checkbox -> user picks batch -> invoke /e2e-flight
       -> Step 0 E2E_DRIVER guard: unset -> spawn afk.{ps1,sh}, exit
       -> driver loops: E2E_DRIVER=1; claude --print "/e2e-flight"
            -> drain selected Tasks serially (<=1 in-progress)
            -> per Task: impl loop -> gate4 -> gate5(auto) -> review
                         -> write qa-signoff.md -> status: pending-qa
            -> signals: checkpoint | task-done | stall | complete
  -> /e2e-engineering (auto-detects pending-qa) -> QA sign-off session
       -> walk each qa-signoff.md -> approve (pending-qa -> done)
       -> findings -> triage -> NEW queue Tasks (bug=linked bugfix; idea=feature)
  (loop) select -> flight -> ...
```

## File layout to create / change
```
.e2e-engineering/                      # NEW state home (gitignorable), at repo root
  afk.ps1                              # driver (rewrite of scripts/afk.ps1)
  afk.sh                               # driver, POSIX port (cross-platform)
  queue.json                           # NEW: Task queue (schema below)
  tasks/<id>/
    prd.json                           # existing schema, unchanged
    progress.txt                       # existing schema, unchanged
    handoff.md                         # existing, unchanged
    qa-signoff.md                      # NEW: per-Task human checklist (schema below)

.claude/skills/e2e-engineering/
  SKILL.md                             # CHANGE: front-door role — batch-spec loop,
                                       #   queue append at gate 1, Run-selection checkbox,
                                       #   pending-qa auto-detect -> QA sign-off session,
                                       #   invoke /e2e-flight at launch
  flight/SKILL.md                      # NEW skill: /e2e-flight (headless worker)
  cross/phase-transition.md            # CHANGE: prepend queue.json read (which Task)
  impl/triage.md                       # CHANGE: accept QA findings -> new queue Tasks
  post-impl/human-qa.md                # CHANGE: wrap as multi-Task QA sign-off session
```

## Schemas

queue.json (writers: /e2e-engineering creates entries; /e2e-flight flips status — disjoint fields, never concurrent):
```
{ tasks: [{
    id,                                # also the tasks/<id>/ dir name
    title,
    priority,                          # integer or P1..Pn; lower = sooner
    dependsOn: [ids],                  # CROSS-TASK DAG (camelCase) — distinct from story depends_on
    status: todo|in-progress|pending-qa|done|blocked,
    selected: true|false,              # in THIS flight batch
    parentTask: id|null                # set when this Task was born from a QA finding
}] }
```
- Single-in-progress invariant: at most one Task is `in-progress`.
- `<e2e-complete>` when no selected Task is `todo` or `in-progress`.
- Selecting a Task auto-includes its unmet `dependsOn` Tasks.

qa-signoff.md (written by flight when it defers human-QA; audit record — queue.json holds actionable state):
```
# QA Sign-off: <task-id>
Status: PENDING

## Manual test cases (walk these)
- [ ] TC-03 <journey> — steps / expected

## PRD acceptance criteria (auto-verified, confirm visually)
- [x] AC-1 <criterion>     # flight ticked via /verify
- [ ] AC-4 <criterion>     # needs human eyes

## Pending amendments (promote/drop)
- constitution: <learning from progress.txt>
- ARCHITECTURE.md: <proposed change>

## Findings (-> triage -> new queue Tasks)
- (filled during QA session)

## Decision
- [ ] Approve -> status: done
- [ ] Reject  -> reason:
```

## /e2e-flight skill spec
- **Step 0 — E2E_DRIVER guard.** `E2E_DRIVER` unset -> pick driver by `$IsWindows` (afk.ps1 else afk.sh), `Start-Process` detached, tell user "flight driver running", exit. Set -> proceed to worker.
- **Worker bootstrap.** Read `queue.json`: find `status:in-progress` -> resume (handoff.md -> prd.json -> progress.txt). None -> pick next `selected:true` + `status:todo` + `dependsOn` all done/pending-qa, highest priority -> flip `in-progress`.
- **Run one Task-step**, then at boundary: write handoff.md, emit signal, exit. ONE step per process — wrapper owns the loop.
- **Per-Task arc:** impl loop (existing) -> gate 4 (e2e-loop) -> gate 5 automatable half (full suite + /run + /verify + auto-tick ACs) -> review -> write qa-signoff.md -> status `pending-qa` -> `<e2e-task-done id next>`.
- **Never** runs human-qa; never spawns a driver (guard prevents nesting).

## afk.{ps1,sh} rewrite spec
- Default skill `/e2e-flight` (was `/e2e-engineering`).
- Set `E2E_DRIVER=1` before each spawn.
- Loop body matches last-30-lines:
  - `<e2e-complete` -> exit 0
  - `<e2e-stall reason="...">` -> alert, exit 1
  - `<e2e-task-done` -> continue (next Task)
  - `<e2e-checkpoint` -> continue (resume same Task)
  - else -> "no signal", exit 2
- MaxSessions safety ceiling kept. `--dangerously-skip-permissions` kept (unattended) — only reachable post-gate-1 since flight requires a populated, selected queue.

## /e2e-engineering changes
- **Batch-spec loop:** after gate 1 per feature, append Task to queue.json; ask "add another feature / launch flight / save & exit".
- **Run-selection checkbox** at launch: list `status:todo` Tasks with priority + deps; user checks subset; validate + auto-include `dependsOn`; set `selected`.
- **Launch:** invoke `/e2e-flight` (which self-bootstraps the driver). No direct afk awareness.
- **pending-qa auto-detect** on entry: if any Task `pending-qa`, offer the QA sign-off session.

## QA sign-off session spec (wraps post-impl/human-qa across Tasks)
- For each `pending-qa` Task (priority order): open qa-signoff.md, walk manual cases, confirm visual ACs, decide pending amendments.
- Approve -> `done`. Log findings -> triage -> new queue Tasks (bug = linked bugfix Task, `parentTask` set, original stays `done`; idea = feature Task `todo`/unselected).

## Signal table (flight emits -> driver acts)
| Signal | When | Driver |
|---|---|---|
| `<e2e-checkpoint reason="threshold|gate-N">` | 65% or gate 1/4/5 reset, Task unfinished | respawn, resume same Task |
| `<e2e-task-done id="..." next="...">` | Task -> pending-qa, more selected remain | respawn, next Task |
| `<e2e-stall reason="...">` | no ready work / needs human | stop, alert |
| `<e2e-complete/>` | no selected Task todo/in-progress | stop, success |

## Build order
1. queue.json + qa-signoff.md schemas (foundational)
2. afk.ps1 rewrite + afk.sh port
3. flight/SKILL.md (Step 0 guard + worker bootstrap + per-Task arc + signals)
4. phase-transition.md change (queue read prepend)
5. /e2e-engineering changes (batch loop, checkbox, launch, pending-qa detect)
6. human-qa.md + triage.md changes (QA session + findings loop)
7. mirror all to dist/marketplace/plugins/e2e-engineering/ ; ship afk.{ps1,sh} INSIDE the plugin

## Open / deferred
- afk.sh parity testing on macOS/Linux (Windows-first dev env).
- Whether `selected` resets to false after a completed flight (status:done already tells the real story) — left as flight's choice, document it.
```
