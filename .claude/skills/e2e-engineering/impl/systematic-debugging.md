# systematic-debugging — 4-phase root-cause (gate 3 re-dispatch)

Invoked by the orchestrator ONCE when a slice subagent reports 3 failed fix attempts (HARD GATE 3). Replaces blind retries with disciplined root-cause analysis. Provenance: superpowers systematic-debugging.

## 4 phases
1. **Reproduce** — get a reliable, minimal repro. If it's flaky, make it deterministic first. No fixing what you can't reproduce.
2. **Isolate** — bisect. Narrow to the smallest failing unit: which layer, which input, which commit. Form ONE hypothesis at a time and test it.
3. **Root cause** — explain WHY it fails, not just where. State the causal chain. A fix without a root cause is a guess.
4. **Fix + verify** — minimal fix at the root (constitution: surgical). Re-run the failing test AND the surrounding suite to confirm no regression. Diagnosable assertions (testing principle 2).

## Outcome → orchestrator
- **Fixed** → return summary; orchestrator resumes normal fan-in.
- **Still red after this single re-dispatch** → orchestrator marks the story `blocked` in prd.json, appends `## Blocked` (id | why | this 4-phase diagnosis) to progress.txt, and keeps draining the ready set.
- Escalate to HUMAN only on **stall**: no ready work remains, or every remaining story depends on a blocked one.

## Red flags (stop)
- More than one re-dispatch per story (it's ONCE — then `blocked`).
- Fixing without a reproduction.
- Changing multiple variables at once (can't attribute the fix).
- Silently deferring a block to human-QA (E2E gate could deadlock — mark `blocked` now, escalate on stall).
