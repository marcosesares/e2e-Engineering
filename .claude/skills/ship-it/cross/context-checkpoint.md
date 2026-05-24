# context-checkpoint — 65% snapshot

When context reaches 65% (hook-injected %), save a checkpoint and end the session so a fresh one resumes cleanly. Provenance: ralph checkpoint/phase-transition. ADR 0002.

## What to write (three files)
1. **prd.json** — already maintained live by the orchestrator. Ensure `status` of every story is current.
2. **progress.txt** — caveman:ultra. Ensure Story Log / Pending Amendments / Blocked are up to date.
3. **Handoff doc** — `.ship-it/handoff-<phase>-<timestamp>.md`, GENERATED from prd.json + progress.txt (not hand-written). caveman:ultra. Self-contained primer:
```
## Domain language   # compressed glossary summary (enough to work; full CONTEXT.md pulled on demand)
## Current state     # phase, taskType, which stories done/todo/blocked
## Next action       # the very next concrete step
## Artifacts         # paths: prd.json, progress.txt, codebase-map?, research?, test-cases/
## Suggested skill   # which ship-it sub-skill the fresh session should invoke
```

## Then
End the session. The fresh session runs [phase-transition](./phase-transition.md) bootstrap.

## Red flags (stop)
- Hand-writing the handoff instead of generating from state files (drift).
- Checkpointing mid-subagent (checkpoint at fan-in boundaries, between slices — not inside a slice's TDD).
- Writing the handoff in prose (it's caveman:ultra).
