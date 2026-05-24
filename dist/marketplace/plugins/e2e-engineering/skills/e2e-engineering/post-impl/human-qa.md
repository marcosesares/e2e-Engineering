# human-qa — Manual test script + amendment approval (single chokepoint)

The single human-approval chokepoint of the whole flow. In ONE touch the human (1) walks the Manual test-case script and signs off QA, AND (2) approves/drops the batched constitution amendments. Provenance: mattpocock + qa dispositions.

## What to do
1. **Manual script** — present the test-cases with disposition **Manual** (those with no E2E). For each: preconditions, steps, expected. The human walks them and records pass/fail.
2. **Pending Amendments** — present the `## Pending Amendments` staged in progress.txt (durable learnings extracted across the task). For each, the human: **promote** → append to [constitution](../constitution.md) (bump version + changelog), or **drop**.
3. Record QA sign-off.

## Why batched here (not task-by-task)
Pattern promotion is batched at this gate so the human never approves patterns one-task-at-a-time. progress.txt stays per-task scratch and resets on the next task; durable learnings survive only if promoted to the constitution here.

## Task close
- QA signed off + amendments resolved (promoted or dropped) → task DONE.
- progress.txt resets when the NEXT task begins (append-only only WITHIN a task).

## Red flags (stop)
- Auto-promoting amendments without human approval (wrong rule then injected into every future subagent).
- Approving QA per-slice/per-task instead of at this single chokepoint.
- Carrying Pending Amendments forward unresolved.
