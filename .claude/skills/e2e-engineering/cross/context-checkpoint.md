# context-checkpoint — 65% snapshot

When context reaches 65% (hook-injected %), **set a checkpoint flag** — do NOT interrupt immediately. Finish the current in-flight task to its next fan-in boundary, then save the checkpoint and end the session so a fresh one resumes cleanly. Provenance: ralph checkpoint/phase-transition. ADR 0002.

## When to trigger

| State at 65% | Action |
|---|---|
| Between slices / at fan-in / idle | Checkpoint immediately |
| Mid-slice TDD loop | Finish current slice, checkpoint at fan-in |
| Mid-subagent (spawned, not returned) | Wait for subagent result, checkpoint after fan-in |
| Mid-user-message reply | Complete reply, then checkpoint |
| Session start / after bootstrap, already ≥ 65% | Checkpoint immediately — do NOT start gate work. Write handoff from prd.json + progress.txt and end session. |

Never abort mid-task. The 65% signal means "next safe stop, not right now." Exception: if already ≥ 65% at session start (e.g., resumed from system compaction mid-flow), there is no in-flight work to finish — checkpoint is immediate.

## What to write (three files)
1. **prd.json** — already maintained live by the orchestrator. Ensure `status` of every story is current.
2. **progress.txt** — caveman:ultra. Ensure Story Log / Pending Amendments / Blocked are up to date.
3. **Handoff doc** — `.e2e-engineering/handoff-<phase>-<timestamp>.md`, GENERATED from prd.json + progress.txt (not hand-written). caveman:ultra. Self-contained primer:
```
## Domain language   # compressed glossary summary (enough to work; full CONTEXT.md pulled on demand)
## Current state     # phase, taskType, which stories done/todo/blocked
## Next action       # the very next concrete step
## Artifacts         # paths: prd.json, progress.txt, codebase-map?, research?, test-cases/
## Suggested skill   # which e2e-engineering sub-skill the fresh session should invoke
```

## Then — checkpoint instruction + HARD STOP

After writing the three files:

1. Output this exact message to the user:
   ```
   Context at 65%+ — checkpoint saved.
   Handoff: .e2e-engineering/handoff-<phase>-<timestamp>.md

   Resume (manual):
     1. /clear    ← reset context
     2. /e2e-engineering    ← fresh session reads handoff automatically

   <e2e-checkpoint handoff=".e2e-engineering/handoff-<phase>-<timestamp>.md" />
   ```
   (substitute actual handoff path in BOTH the Handoff line and the signal)
2. **HARD STOP** — process NO further messages in this session. Any further user message gets one reply: "Checkpoint saved — `/clear` then `/e2e-engineering` to resume."

> **Unattended automation (AFK wrapper):** `scripts/afk.ps1` detects `<e2e-checkpoint />` and restarts automatically. Run `.\scripts\afk.ps1` after gate 1 to enable AFK mode. Supports claude (default), opencode, codex via `-AI` param. (ADR 0005)

The fresh session runs [phase-transition](./phase-transition.md) bootstrap when `/e2e-engineering` is invoked.

## Red flags (stop)
- Checkpointing mid-task instead of waiting for fan-in boundary.
- Treating 65% as an immediate hard stop — it's a "prepare to stop" signal.
- Hand-writing the handoff instead of generating from state files (drift).
- Writing the handoff in prose (it's caveman:ultra).
- Continuing to process user messages after outputting the stop message.
- Telling user to start fresh without providing the exact handoff path.
