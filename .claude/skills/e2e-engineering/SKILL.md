---
name: e2e-engineering
description: Master engineering orchestrator — drives a Task from idea to passing E2E across pre-implementation, implementation, and post-implementation phases. Detects phase and task type, sequences sub-skills, runs the vertical-slice TDD loop with parallel subagents, enforces five hard gates, and checkpoints at 65% context. Handles greenfield, feature, bugfix, and refactor on new or existing codebases, plus a one-time `adopt` mode for onboarding an in-progress project. Use when the user says "e2e-engineering", "e2e-eng", "ship-it", "ship it", "/e2e-engineering", "implement feature <name>", "write e2e for <feature>", "build this end to end", "run the full flow", or otherwise wants the complete engineering pipeline rather than a single isolated step.
---

# e2e-engineering — orchestrator

Master skill. Detect phase + task type, route mode, sequence sub-skills, drive the loop, enforce gates, checkpoint. Read CONTEXT.md (glossary) for any term below.

State lives under `.e2e-engineering/` at repo root: `prd.json`, `progress.txt`, `codebase-map.md` (brownfield), `research.md` (if research ran), `test-cases/*.md`, handoff docs. Schemas: [prd.json](./schemas/prd.json.md), [progress.txt](./schemas/progress.txt.md), [codebase-map](./schemas/codebase-map.md).

**Sole-writer rule:** ONLY this orchestrator writes `prd.json` + `progress.txt`. Subagents return summaries; never touch shared state.

---

## Step 0 — route mode

- User invoked `/e2e-engineering adopt` → run [adopt](./adopt.md). One-time onboarding, not the per-task flow. Stop here.
- Otherwise → per-task flow below.

## Step 1 — detect phase + task type

Determine where to enter (phase-adaptive — user may start mid-flow):

1. Does `.e2e-engineering/prd.json` exist?
   - **No** → start Pre-implementation from the top.
   - **Yes** → read it. Any story `status != done` → resume Implementation. All `done` → Post-implementation.
2. If a handoff doc exists (`.e2e-engineering/handoff-*.md`), this is a fresh-session resume → run [phase-transition](./cross/phase-transition.md) bootstrap FIRST (read handoff → prd.json → progress.txt → invoke suggested skill).
3. **Task type** (set/confirm `taskType` in prd.json): `greenfield` (new app/codebase), `feature` (add to existing), `bugfix`, `refactor`. Refactor runs the FULL flow — no lite path (ADR 0012).
4. **Greenfield vs brownfield**: greenfield skips map-codebase; brownfield (feature/bugfix/refactor on existing code) runs it.

Confirm the detected entry with the user in one line before proceeding.

---

## Pre-implementation phase

Sequence (bracketed = conditional): **grill-me → [map-codebase?] → [research?] → [prototype?] → to-prd**.

1. [grill-me](./pre-impl/grill-me.md) — Karpathy brainstorm loop. Stateless, one question at a time, no doc deps. Also gates whether map-codebase / research / prototype fire. Loops until user approves direction.
2. [map-codebase](./pre-impl/map-codebase.md) — brownfield only. Produces `codebase-map.md` (5 sections, scoped). Section 5 refactor candidates are WALLED.
3. [research](./pre-impl/research.md) — only if task leans on external APIs / unfamiliar libs. Produces `research.md` (rots).
4. [prototype](./pre-impl/prototype.md) — only if taste/UX/state-machine uncertainty needs concrete feedback. Throwaway. ui-branch or logic-branch.
5. [to-prd](./pre-impl/to-prd.md) — convert grill-me notes into the formal PRD → writes `prd.json`. Owns its own interview step (no double-interview). Refactor-shaped stories allowed. Captures testing-decisions that become test-cases.

**HARD GATE 1 — PRD approved → implementation.** Present the PRD; require explicit human consent before any code. Do not proceed on silence.

→ checkpoint candidate / phase transition to a fresh session.

---

## Implementation phase

Entry: PRD approved (gate 1 passed).

1. [grill-with-docs](./impl/grill-with-docs.md) — run ONCE at entry. Reconcile PRD + (brownfield) codebase-map "existing language" against CONTEXT.md glossary. NOT per-slice.
2. [to-issues](./impl/to-issues.md) — split PRD into vertical slices, emit the `depends_on` DAG (tracer→schema→logic→api→ui as edges), author test-case `.md` docs upfront and attach `testCases[]` per story. Output is born `ready-for-agent` (skips triage).
3. [triage](./impl/triage.md) — only for EXTERNALLY-sourced work (bug reports, feature requests) and walled refactor candidates. Forward-flow slices skip it.

### The loop (skill-driven, in-session — ADR 0005)

Repeat until COMPLETE (all stories `status: done`):

1. **Compute ready set** — stories whose `depends_on` are all `done` AND own `status: todo`.
2. **Fan-out** — dispatch each ready story to its OWN git worktree + subagent (use EnterWorktree). Inject [constitution](./constitution.md) + the story + its testCases into each subagent. Subagent runs [tdd](./impl/tdd.md): gap-check → red-green-refactor → automate its FEATURE e2e → return SUMMARY ONLY.
   - **HARD GATE 2 — TDD red before green.** Each subagent must write a failing test before production code. Enforced inside tdd.md.
   - **HARD GATE 3 — debug escalation.** Subagent fails 3 fix attempts → orchestrator re-dispatches ONCE with [systematic-debugging](./impl/systematic-debugging.md) (4-phase root-cause). Still red → mark story `blocked`, append `## Blocked` in progress.txt, keep draining the ready set. Escalate to human ONLY on stall (no ready work left, or every remaining story depends on a blocked one).
3. **Fan-in (orchestrator, serial — sole writer):** for each returned summary:
   - Per-slice review: check summary against the story spec + constitution. Drift → bounce back to the subagent, do not merge.
   - Merge the worktree branch into baseBranch. Resolve conflicts (never discard work).
   - Write `status: done` in prd.json.
   - Append a `## Story Log` line to progress.txt. Stage durable learnings under `## Pending Amendments`.
4. **Checkpoint** if context ≥ 65% (see Cross-cutting). Then loop.

### After COMPLETE

4. [e2e-loop](./impl/e2e-loop.md) — FINAL pass. Automate the REGRESSION (cross-slice) test-cases now that the whole feature exists. Run the full accumulated suite.
   - **HARD GATE 4 — E2E suite green → post-implementation.** Full suite must pass.
5. [verification](./impl/verification.md) — gate 5.
   - **HARD GATE 5 — verification-before-completion.** Full suite re-run (all tests) + live exercise via `/run` + `/verify` + every PRD acceptance criterion ticked. Passing = implementation done.

---

## Post-implementation phase

Entry: gate 5 passed.

1. [review](./post-impl/review.md) — fresh-context, full-diff, cross-slice audit by a clean reviewer. Findings ranked by severity.
2. [human-qa](./post-impl/human-qa.md) — walk the Manual test-case set (the disposition `Manual` cases). Single human-approval chokepoint: in ONE touch the human approves QA sign-off AND batched `## Pending Amendments` → promote to [constitution](./constitution.md) (bump version) or drop.

Task close: extract durable learnings, ensure amendments resolved, progress.txt resets on the NEXT task.

---

## Gates summary

| # | Gate | Type | Where |
|---|------|------|-------|
| 1 | PRD approved → impl | HARD | end of pre-impl |
| 2 | TDD red before green | HARD | in tdd.md per slice |
| 3 | debug escalation (3 strikes → systematic-debugging → blocked → stall→human) | HARD | in loop |
| 4 | E2E suite green → post-impl | HARD | e2e-loop |
| 5 | verify-before-completion | HARD | verification |
| — | coverage / lint / style | SOFT | overridable WITH logged justification; silent skip not allowed |

Hard gates need explicit human consent and surface as a red-flags line in their sub-skill. Never rationalize past a hard gate.

---

## Cross-cutting

- **Checkpoint at 65% context** — [context-checkpoint](./cross/context-checkpoint.md): write handoff doc + prd.json + progress.txt (caveman:ultra), then end the session.
- **Phase transition / fresh-session resume** — [phase-transition](./cross/phase-transition.md): read handoff → prd.json → progress.txt → invoke suggested skill. Do NOT read CONTEXT.md first (handoff carries a language summary; pull glossary on demand).
- **Writing style:** generated state artifacts (progress.txt, handoff) = caveman:ultra. User-facing conversation = caveman:full. Code, commits, PRs = normal prose.
