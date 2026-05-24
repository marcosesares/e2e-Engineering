# Schema — prd.json

Structured state for one Task. Written and owned by the orchestrator (sole writer). New task → overwrite fresh. Lives at task root (e.g. `.ship-it/prd.json`).

```json
{
  "project": "string — repo/product name",
  "description": "string — one-paragraph intent of THIS task",
  "taskType": "greenfield | feature | bugfix | refactor",
  "baseBranch": "string — branch slices fork from and merge back into",
  "stories": [
    {
      "id": "string — stable slug, referenced by depends_on and testCases",
      "title": "string",
      "description": "string — refactor-shaped allowed (behavior-preservation + structural goal), not forced 'As a user…'",
      "acceptanceCriteria": ["string", "..."],
      "priority": "number — lower = sooner within ready set",
      "sliceType": "tracer | schema | logic | api | ui",
      "depends_on": ["story-id", "..."],
      "status": "todo | done | blocked",
      "branch": "string — worktree branch for this slice",
      "testCases": ["test-case-id", "..."],
      "notes": "string — free, e.g. blocked reason, gap-check escalation"
    }
  ]
}
```

## Invariants
- **COMPLETE** = every story `status: "done"`. (Replaces Ralph's `passes: true`.)
- `status` enum is exactly three values. `blocked` is set only after debug escalation (3 strikes + systematic-debugging re-dispatch failed).
- `depends_on` edges encode the tracer→schema→logic→api→ui ordering. Each feature is sequential along its chain; independent chains run in parallel.
- **Ready set** = stories whose `depends_on` are all `done` AND own `status` is `todo`.
- Subagents NEVER write this file. They return a summary; the orchestrator writes `status` at fan-in.
- `testCases[]` ids point at `.md` test-case docs authored upfront by to-issues.
