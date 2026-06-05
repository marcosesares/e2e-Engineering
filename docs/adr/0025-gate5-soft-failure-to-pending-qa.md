# Gate 5 failures route to pending-qa, not blocked

**Status:** accepted — amends ADR 0007, ADR 0024.

Gate 5 (verification-before-completion) was a hard block: red suite or unmapped AC → Task marked `blocked` → skipped the QA sign-off session entirely. Human never saw the completed work.

## Problem

`blocked` is too blunt for test failures. A red suite at Gate 5 may be:
- **(A)** A regression introduced by this Task's slices
- **(B)** A pre-existing broken test unrelated to this Task
- **(C)** A flaky test

In all three cases the human is better placed than the agent to judge whether to reopen, repair, or drop. Preventing the Task from reaching `pending-qa` denies the human that judgment and hides otherwise-complete work.

`blocked` was appropriate for Gate 3 exhausted stories (agent truly cannot proceed) but too aggressive as the outcome for automated test failures.

## Decision

**Gate 5 failures → `pending-qa`, not `blocked`.**

1. **Both regression and pre-existing failures** route the same way — no agent-side triage.
2. Flight records each failure in `qa-signoff.md ## Gate 5 Failures` (test name + reason, or unmapped AC).
3. Task proceeds to `pending-qa` regardless of Gate 5 outcome.
4. During [[QA sign-off session]], human routes each Gate 5 failure through `triage` into a repair Task (`parentTask=<this id>`, `status:todo`, unselected) or drops it (flaky/pre-existing judgment is human's).
5. The built Task STILL goes `done` — Gate 5 failures are new scope, not a reason to reopen.
6. **`blocked` is reserved for Gate 3 exhaustion only** — stories the agent genuinely cannot complete.

Self-review constitution violations (Step 5.2) remain a `blocked` path — those are agent-recoverable failures, not test failures.

## Consequences

- Human always sees completed work at QA, even when Gate 5 is red.
- Repair Tasks enter the queue via the same triage pipe as human QA findings — one entry point.
- `blocked` is now unambiguous: it means "agent cannot proceed" (Gate 3), not "tests are red."
- `qa-signoff.md` schema gains `## Gate 5 Failures` section; `human-qa.md` gains a routing step for it.
- CONTEXT.md: `Verification-before-completion`, `Hard gate`, `Gate 5 failure` (new term) updated.
