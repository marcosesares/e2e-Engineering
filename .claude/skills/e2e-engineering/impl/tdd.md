# tdd — SLICE SUBAGENT

Runs INSIDE a fan-out subagent, in its own git worktree, for ONE story. Receives: the [constitution](../constitution.md), the story (acceptanceCriteria, sliceType, depends_on), and its feature test-cases. Returns a SUMMARY ONLY — never writes prd.json/progress.txt (orchestrator is sole writer). Provenance: mattpocock tdd + superpowers subagent-driven-development.

## Sequence

### 1. Slice gap-check (FIRST move, before any TDD)
Validate the story is implementable:
- Acceptance criteria clear?
- `testCases[]` present?
- `depends_on` real and satisfied (the upstream code exists in this worktree)?
Gap found → escalate ONE question to the orchestrator. DO NOT guess. (Distinct from grill-with-docs, which handled LANGUAGE once at entry. This catches under-spec; the red phase catches remaining behavioral ambiguity.)

### 2. Red-green-refactor
- **RED** — write a failing test FIRST, for the behavior in the acceptance criteria. Run it; confirm it fails for the right reason. **HARD GATE 2: no production code before a failing test.**
- **GREEN** — write the minimum production code to pass. Constitution: simplicity-first (new code), surgical-changes (editing existing).
- **REFACTOR** — clean up with tests green. Stay in scope (constitution principle 4 — no "while I'm here").

### 3. Automate the FEATURE e2e
Automate this story's **feature** test-case(s) as executable E2E in the project stack (Playwright when web UI). Regression cases are NOT yours — the final e2e-loop handles cross-slice journeys. Map each E2E back to its test-case id.

### 4. Debug escalation (HARD GATE 3)
If a fix fails 3 times, STOP. Do not blind-retry. Return to the orchestrator reporting the 3-strike. The orchestrator re-dispatches ONCE with [systematic-debugging](./systematic-debugging.md).

## Return summary (to orchestrator)
- Story id, what was built, files touched.
- Tests added (with test-case ids) + red→green evidence.
- Any constitution tensions / scope pressure resisted.
- Durable learnings (candidate Pending Amendments).
- Blockers / gap-check escalations.
Keep it tight — the orchestrator reads summaries, not raw churn.

## Red flags (stop)
- Production code before a failing test (gate 2 violation).
- Guessing past a gap instead of escalating one question.
- Blind-retrying a 4th time after 3 strikes (gate 3 violation).
- Writing prd.json / progress.txt (sole-writer violation).
- Automating regression/cross-slice journeys here (not this subagent's job).
- Testing internal state instead of real interfaces (constitution testing principle 1).
