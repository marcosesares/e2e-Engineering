# Dispatching Parallel Agents, Design

> Technical design for parallel task decomposition and subagent dispatch.

## Interface

**Input Specification:**

A task + metadata:

```
{
  "description": "string — human-readable task description",
  "subtasks": [
    {
      "id": "string — unique identifier",
      "description": "what this subtask does",
      "dependencies": ["id-of-task-X"] — empty if independent
    },
    ...
  ]
}
```

**Output Format:**

```
Parallel Dispatch Results:
├── Task A: ✅ COMPLETED (1.2s)
│   └── [subagent output]
├── Task B: ✅ COMPLETED (0.9s)
│   └── [subagent output]
├── Task C: ❌ FAILED (timeout after 30s)
│   └── Error: Request timed out
└── Summary: 2/3 completed, 1 failed | Total time: 1.2s (parallel) vs ~3s (sequential)
```

## Execution Flow

### 1. Dependency Analysis (DAG Construction)

```
Input: List of subtasks with dependency edges
Output: Directed Acyclic Graph (DAG)

Algorithm:
  1. Build adjacency list: task → dependencies
  2. Check for cycles: if cycle found, fail with "Circular dependencies detected"
  3. Compute topological sort (for sequential fallback if needed)
  4. Identify "independent" nodes (no incoming/outgoing edges)
  5. Group independent tasks into parallel batches
```

**Example DAG:**
```
Task A (analyze module auth) — no dependencies
Task B (analyze module orders) — no dependencies
Task C (analyze module payments) — no dependencies

All independent → Can dispatch in one parallel batch
```

### 2. Dispatch Decision Tree

```
If all subtasks are independent:
  → Dispatch all in parallel (one batch)

If subtasks have linear dependency (A → B → C):
  → Execute A alone
  → After A completes, dispatch B and C in parallel (if C doesn't depend on A output)

If mixed (A independent, B → A, C independent):
  → Dispatch A and C in parallel
  → After A completes, dispatch B
```

**Confidence:** 🟡 (DAG analysis assumed; circular dependency handling not detailed)

### 3. Subagent Dispatch

```
For each independent subtask:
  1. Create subagent with role = "analyzer" / "implementer" / "reviewer"
  2. Pass subtask + context (from previous stages if any)
  3. Set timeout = 30s (configurable)
  4. Mark subagent as "in progress"
  5. Do NOT wait for subagent; return immediately (async)
```

**Dispatch Format:**

```
Dispatching parallel subagents...

Subagent 1 (Task A: analyze auth module)
  → Role: analyzer
  → Timeout: 30s
  → Status: QUEUED

Subagent 2 (Task B: analyze orders module)
  → Role: analyzer
  → Timeout: 30s
  → Status: QUEUED

Subagent 3 (Task C: analyze payments module)
  → Role: analyzer
  → Timeout: 30s
  → Status: QUEUED

Waiting for all to complete...
```

### 4. Result Collection & Aggregation

```
Collect results as they arrive:
  → Store result in buffer with source task ID
  → If task fails, log error and continue
  → When all tasks complete or timeout expires:
    1. Sort results by original task order
    2. Merge outputs
    3. Tag each result with source task ID
    4. Generate summary (X/N completed, timing)
```

## Dependencies

- **Subagent Dispatch Capability:** Harness must support spawning independent subagents (all 6 harnesses do)
- **Async Notification:** Harness must notify when subagent completes (callback or event stream)
- **Task Queuing:** Harness provides task queue for subagent batching
- **Context Isolation:** Each subagent runs in isolated session to prevent cross-contamination

## Design Decisions

| Decision | Evidence | Confidence |
|----------|----------|-----------|
| Use DAG model for dependency analysis | Skill mentions "task graph" and "independent subtasks" | 🟡 |
| Timeout per subagent (30s default) | Prevents hanging; prevents resource exhaustion | 🟡 |
| Fail-fast on circular dependencies | DAG must be acyclic; circular deps = malformed task | 🟢 |
| Aggregate results in original order | Maintains task sequence for user comprehension | 🟢 |
| Continue on partial failure (1 of 3 fails) | Maximize value extraction; don't discard 2 successful results | 🟢 |

## Internal State

**Session State:**
- `parallel_dispatch_active: boolean` — whether dispatch is in progress
- `subagent_results: Map<task_id, result>` — results keyed by task ID
- `subagent_failures: Map<task_id, error>` — failures keyed by task ID
- `start_time: timestamp` — when dispatch began
- `end_time: timestamp` — when last subagent completed

**Subagent State (per subagent):**
- `id: string` — unique subagent ID
- `task_id: string` — which task it's executing
- `status: "queued" | "running" | "completed" | "failed" | "timeout"`
- `result: string | null` — output if completed
- `error: string | null` — error message if failed
- `elapsed_time: number` — wall-clock time (ms)

## Observability

**Log Signals:**
- "Dispatching N parallel subagents for tasks: [A, B, C]"
- "Task A completed in 1.2s"
- "Task B failed: [error]"
- "All parallel tasks completed in 1.2s (vs ~3s sequential)"

## Risks & Lacunas

- 🟡 DAG cycle detection: How expensive is it? For N tasks with many dependencies, O(N²) DFS might be slow
- 🔴 Timeout value: 30s is hardcoded; should it be configurable per task? Per harness?
- 🟡 Subagent role templates: "analyzer", "implementer", etc. — how many roles exist? What do they do differently?
- 🔴 Cross-session communication: If subagent 2 needs output from subagent 1 (even though marked independent), how are they shared? Not specified.
- 🟡 Resource limits: What if user tries to dispatch 100 subagents on a harness that supports max 4 parallel? Queue behavior unclear.
