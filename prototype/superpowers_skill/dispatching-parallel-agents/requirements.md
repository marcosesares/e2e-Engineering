# Dispatching Parallel Agents — Independent Task Parallelization

> Skill for decomposing large tasks into independent subtasks and dispatching them to parallel agent workers.

## Overview

Dispatching Parallel Agents enables breaking down complex problems into independent subtasks that can run in parallel without blocking each other, improving throughput and session efficiency. Task decomposition follows a decision matrix: analyze dependencies, identify parallelizable work, dispatch to subagents, aggregate results. 🟢

## Responsibilities

- Analyze task dependencies to identify parallelizable work
- Decompose complex tasks into independent subtasks (no cross-blocking)
- Dispatch subtasks to independent subagent workers
- Manage parallel execution without oversubscribing harness capacity
- Aggregate results from all parallel workers
- Handle subagent failures with fallback/retry strategies
- Report back with combined output

## Business Rules

- **Parallelization Rule:** Only dispatch tasks with NO cross-dependencies (A doesn't wait for B, B doesn't wait for A). 🟢
- **Capacity Rule:** Never dispatch more parallel tasks than harness thread pool supports; queue excess tasks. 🟡
- **Failure Handling Rule:** If one subagent fails, mark that subtask as failed but continue others; aggregate at end. 🟢
- **Result Aggregation Rule:** Merge all subagent outputs in original task order; maintain traceability to source subtask. 🟢
- **Autonomy Rule:** Subagents execute independently; main agent does NOT block or poll; uses notification callback when ready. 🟡

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| RF-01 | Analyze task DAG to identify parallelizable nodes | Must | Given task with 3 independent subtasks, identify all 3 as parallelizable |
| RF-02 | Dispatch N subtasks to N independent subagents | Must | Dispatch succeeds without main agent blocking |
| RF-03 | Execute subtasks in parallel, not sequentially | Must | 3 parallel tasks finish in time ≈ 1 task time, not 3x |
| RF-04 | Aggregate results from all subagents in order | Must | Output preserves subtask sequence despite concurrent execution |
| RF-05 | Handle subagent failure gracefully | Should | If subagent 2/3 fails, report failure for task 2 but complete tasks 1, 3 |
| RF-06 | Support retry logic on transient failures | Should | Transient error (network) → retry; persistent error (timeout) → fail fast |
| RF-07 | Report execution summary (successes, failures, timings) | Should | Summary shows which subtasks completed, which failed, total parallel time |

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|------------|----------|-----------|
| Performance | 3 parallel tasks complete in ~1 task time | Skill design, parallel execution without sequential blocking | 🟢 |
| Reliability | Failure in 1 subagent doesn't kill entire dispatch | Fault isolation; aggregate after all complete or timeout | 🟡 |
| Scalability | Supports N subagents (harness-dependent, typically 2-6 parallel) | Depends on harness thread pool; Claude Code supports 4-6 in practice | 🟡 |
| Observability | Each subagent output tagged with source subtask | Traceability preserved in aggregation | 🟢 |

## Acceptance Criteria

```gherkin
Scenario: Three independent analysis tasks
Given task "analyze 3 unrelated codebase modules (A, B, C)"
When dispatching to 3 parallel subagents
Then all 3 complete in parallel (not sequential)
And results are aggregated with tags for A, B, C

Scenario: Subagent failure handling
Given 3 parallel subtasks, subtask 2 fails with timeout
When aggregating results
Then subtask 1 and 3 complete successfully
And task 2 shows "FAILED: timeout" in summary
And overall status is "partial success"

Scenario: Result order preservation
Given 3 parallel tasks dispatched in order (first, second, third)
When results arrive out-of-order (third, first, second)
Then aggregation re-orders them to match original sequence
```

## Priority (MoSCoW)

| Requirement | MoSCoW | Justification |
|-------------|--------|---------------|
| Decompose & identify parallelizable work | Must | Core feature; without this, no parallelization possible |
| Dispatch to independent subagents | Must | Parallelization requires independent agents |
| Aggregate results | Must | Results must be useful; aggregation is integration |
| Execute truly in parallel | Must | Sequential execution provides no benefit |
| Handle subagent failures | Should | Robustness; some failures expected in large batches |
| Retry logic | Should | Improve reliability for transient errors |
| Performance metrics | Could | Nice-to-have for observability |

## Code Traceability

| File | Function / Section | Coverage |
|------|------------------|----------|
| `skills/dispatching-parallel-agents/SKILL.md` | Main skill definition, dependency analysis, dispatch algorithm | 🟢 |
| `skills/dispatching-parallel-agents/SKILL.md` | Failure handling, result aggregation | 🟢 |
