# Dispatching Parallel Agents, Tasks

> Implementation tasks for parallel task decomposition and subagent dispatch.

## Prerequisites

- [ ] Harness supports subagent spawning (all 6 harnesses do)
- [ ] Subagent result collection mechanism available (async callback or event stream)
- [ ] Task queuing system available for managing parallel batches
- [ ] Timeout/timer mechanism available

## Tasks

### DAG Construction & Dependency Analysis

- [ ] T-01, Parse subtask list and build dependency adjacency list
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — DAG construction
  - Acceptance: Given [A (no deps), B (no deps), C (depends on A)], build adjacency list {A: [], B: [], C: [A]}
  - Confidence: 🟢

- [ ] T-02, Implement cycle detection (topological sort or DFS)
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — DAG validation
  - Acceptance: Detect if tasks form a cycle; reject with error message
  - Confidence: 🟢

- [ ] T-03, Identify independent tasks (no incoming or outgoing dependency edges)
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — Task grouping
  - Acceptance: From DAG, extract nodes with in-degree=0 and out-degree=0
  - Confidence: 🟢

- [ ] T-04, Group independent tasks into parallel batches
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — Batch construction
  - Acceptance: All independent tasks grouped in first batch; dependent tasks in subsequent batches
  - Confidence: 🟡

### Subagent Dispatch

- [ ] T-05, Create subagent per independent task with specified role
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — Subagent creation
  - Acceptance: For each task in batch, spawn subagent with role="analyzer" or "implementer"
  - Confidence: 🟢

- [ ] T-06, Dispatch all subagents in a batch without blocking
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — Async dispatch
  - Acceptance: All subagents queued/started before main agent returns; no blocking on individual subagent
  - Confidence: 🟢

- [ ] T-07, Use host default wait behavior with optional per-task timeout override
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — Timeout handling
  - Acceptance: If the host exposes a timeout override and it fires, record `timed_out`; otherwise use the host default wait behavior and record the returned status.
  - Confidence: 🟡

- [ ] T-08, Implement progress reporting (optional status updates)
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — Observability
  - Acceptance: Main agent reports "Waiting for subagents..." with list of in-progress tasks
  - Confidence: 🟡

### Result Collection & Aggregation

- [ ] T-09, Collect subagent results as they complete (async callback)
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — Result aggregation
  - Acceptance: Store result immediately upon subagent completion; don't block on others
  - Confidence: 🟢

- [ ] T-10, Handle subagent failure gracefully (capture error, continue)
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — Failure isolation
  - Acceptance: If subagent 2/3 fails with error, log error, keep subagent 1 and 3 results
  - Confidence: 🟢

- [ ] T-11, Reorder results to match original task sequence
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — Result ordering
  - Acceptance: Results may arrive out-of-order; final output is re-sorted by original task ID sequence
  - Confidence: 🟢

- [ ] T-12, Generate aggregation summary (successes, failures, timings)
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — Summary reporting
  - Acceptance: Output includes "2/3 completed, 1 timeout", elapsed times per task
  - Confidence: 🟢

- [ ] T-13, Tag each result with source task ID for traceability
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — Traceability
  - Acceptance: Output format clearly shows "Task A: [result]", "Task B: [result]"
  - Confidence: 🟢

### Robustness & Edge Cases

- [ ] T-14, Implement retry logic for transient failures (optional)
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — Fault tolerance
  - Acceptance: If subagent fails with "network timeout", retry up to 2x; if persistent, fail
  - Confidence: 🟡

- [ ] T-15, Handle resource exhaustion (too many parallel tasks for harness capacity)
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — Capacity management
  - Acceptance: If harness supports max 4 parallel and user requests 6, queue 2 excess tasks for next batch
  - Confidence: 🟡

- [ ] T-16, Implement cancellation mechanism (user requests cancel mid-dispatch)
  - Origin: `skills/dispatching-parallel-agents/SKILL.md` — User control
  - Acceptance: User says "stop" → cancel queued/running subagents, aggregate completed results so far
  - Confidence: 🟡

### Testing

- [ ] TT-01, Three independent tasks dispatch and complete in parallel (not sequential)
  - Measure: 3 tasks with 1s each should complete in ~1s, not 3s
  - Confidence: 🟢

- [ ] TT-02, Dependency analysis: mixed independent + dependent tasks dispatched in correct order
  - Scenario: A (indep), B (depends on A), C (indep) → Batch 1: [A, C], Batch 2: [B]
  - Confidence: 🟢

- [ ] TT-03, Failure isolation: 1 of 3 subagents fails, others complete successfully
  - Expected: Output shows Task 1 ✅, Task 2 ❌, Task 3 ✅
  - Confidence: 🟢

- [ ] TT-04, Result aggregation preserves original task order despite async completion
  - Scenario: Tasks dispatched as [A, B, C], complete as [C, A, B]; output in [A, B, C] order
  - Confidence: 🟢

- [ ] TT-05, Timeout handling: subagent exceeds 30s, marked as TIMEOUT, others complete
  - Confidence: 🟡

- [ ] TT-06, Cycle detection: DAG with A→B→C→A rejected with error
  - Confidence: 🟢

- [ ] TT-07, Result tagging: each output clearly shows "Task A: [result]" and source
  - Confidence: 🟢

- [ ] TT-08, User cancellation: cancel mid-dispatch aggregates completed results only
  - Confidence: 🟡

## Implementation Order

1. **Foundation (T-01 to T-03):** DAG parsing, cycle detection, independent task identification
2. **Dispatch (T-05 to T-07):** Subagent creation, async dispatch, timeouts
3. **Aggregation (T-09 to T-13):** Result collection, failure handling, reordering, tagging
4. **Robustness (T-14 to T-16):** Retry, capacity, cancellation (optional/advanced)
5. **Testing (TT-01 to TT-08):** Comprehensive coverage

**Critical Blockers:**
- T-01 must complete before T-02 (can't detect cycles without DAG)
- T-05 must complete before T-09 (can't collect results before dispatch)

## Gaps Pending Validation (🔴)

- **Subagent role differentiation:** What are all valid roles? How do "analyzer" and "implementer" differ in behavior?
- **Cross-task data sharing:** If Task B needs output from Task A (even independent dispatch), how is it passed? Not specified.
- **Queue capacity:** How does harness queue excess tasks when N > max parallelism? FIFO? Priority? Unpredictable.

## Reviewer Validation Addendum

- Question 3 answered: use host engine default wait behavior by default; allow an optional per-task timeout override only when the host exposes one. Do not hardcode `30s` as repository behavior.
- Question 3 answered: incomplete subagents should be recorded as `pending`, `timed_out`, or `returned_partial`. The controller reviews partial results and either waits longer, re-dispatches narrowly, or proceeds without that result only when the task is non-blocking.
