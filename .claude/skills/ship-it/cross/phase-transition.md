# phase-transition — fresh-session bootstrap

Sequence a restarted session MUST follow before any work. Applies to both phase boundaries AND mid-phase context restarts (after a 65% checkpoint). Provenance: ralph stateless-fresh-agent. ADR 0004.

## Bootstrap read order (strict)
1. **Handoff doc** (`.ship-it/handoff-*.md`, latest) — FIRST. Self-contained primer: domain language, current state, next action, artifacts, suggested skill.
2. **prd.json** — structured state: story statuses, DAG, taskType, baseBranch.
3. **progress.txt** — learnings, Pending Amendments, Blocked.
4. **Invoke the suggested skill** from the handoff.

Do NOT read CONTEXT.md first — the handoff already carries a language summary; pull the full glossary on demand only if a term is unclear.

## Resuming a blocked story
Read `## Blocked` in progress.txt. Have its `depends_on` changed (a dep now `done`) since it was blocked? → re-dispatch ONCE. Else still stalled → escalate to human. No blind cross-session retry.

## Resuming the loop
Recompute the ready set from prd.json (deps `done` + own `status: todo`) and continue fan-out/fan-in. The orchestrator remains sole writer.

## Red flags (stop)
- Reading CONTEXT.md or raw code before the handoff (wastes fresh context; handoff is the primer).
- Re-running completed work because state wasn't read first.
- Blind-retrying a blocked story whose deps haven't changed.
