# Executing Plans, Design

> Technical design for sequential task execution with checkpointing and recovery.

## Interface

**Input:** Plan file path (typically `.reversa/plan.md` or `docs/plan.md`)

```markdown
# Implementation Plan

- [ ] T-01: Implement authentication module
  - Description: Add login/logout endpoints
  - Est. time: 2h

- [ ] T-02: Add password validation
  - Description: Enforce minimum 8 chars, special char requirement
  - Est. time: 1h

- [ ] T-03: Write integration tests
  - Description: Test login flow end-to-end
  - Est. time: 1.5h
```

**Output:** Progress report after each task

```
✅ Task 1/3 COMPLETED: Implement authentication module
└── Changes: src/auth/login.ts (42 lines), src/auth/logout.ts (18 lines)
└── Tests: 3 new tests, all passing
└── Checkpoint saved to .plan-state.json

Next task: Add password validation

Press CONTINUE to proceed, or PAUSE to stop here.
```

**Checkpoint State File:** `.plan-state.json` (or configurable)

```json
{
  "plan_path": "docs/plan.md",
  "total_tasks": 3,
  "completed_tasks": 1,
  "current_task": 1,
  "task_history": [
    {
      "task_id": "T-01",
      "status": "completed",
      "started_at": "2026-05-17T10:00:00Z",
      "completed_at": "2026-05-17T10:45:00Z",
      "duration_ms": 2700000,
      "notes": "Completed on first attempt"
    }
  ],
  "pending_tasks": ["T-02", "T-03"],
  "last_checkpoint": "2026-05-17T10:45:00Z"
}
```

## Execution Flow

### 1. Initialization (Session Start)

```
On /execute-plan command or skill trigger:
  1. Load plan file from provided path
  2. Parse markdown task list ([ ] format)
  3. Check for existing checkpoint (.plan-state.json)
  4. If checkpoint exists:
       Resume from last completed task
       Load task history
     Else:
       Start from first task
       Initialize empty checkpoint file
  5. Display plan summary and current position
```

### 2. Task Execution Loop

```
For each pending task:
  1. Display task description and context
  2. Agent executes task (implement code, write docs, run tests)
  3. Pause: output progress, list files changed, show any test results
  4. Wait for user command: CONTINUE | PAUSE | REDO | EDIT-PLAN
  5. Handle user command:
       CONTINUE → mark task complete, save checkpoint, move to next
       PAUSE → save checkpoint, exit skill
       REDO → mark current task incomplete, re-execute
       EDIT-PLAN → user modifies plan.md, re-parse, apply only to pending tasks
  6. Repeat
```

### 3. Checkpoint Management

**Save Checkpoint After Each Task:**

```json
{
  "completed_tasks": [
    {
      "task_id": "T-01",
      "status": "completed",
      "timestamp": "ISO 8601"
    }
  ],
  "current_position": 1,
  "pending": ["T-02", "T-03"]
}
```

**Load Checkpoint on Session Restart:**

```
1. Read .plan-state.json
2. Find last completed_task index
3. Resume from next task (index + 1)
4. Verify plan file hasn't changed significantly (warn if it has)
5. Continue execution
```

### 4. Recovery from Interruption

**Scenario:** Session crashes mid-task (T-02 incomplete)

```
Session 1:
  ✅ T-01 done, checkpoint saved
  Starting T-02...
  [Session crashes]

Session 2:
  Load .plan-state.json
  Find: T-01 complete, T-02 in progress but not completed
  Decision: Skip T-02 (was started but not completed) or ask user?
  
  Option A: Skip to T-03 (assume T-02 work is lost or will be redone)
  Option B: Re-run T-02 (idempotent; safe to re-execute)
  Option C: Ask user "Resume T-02 or continue to T-03?"
  
  Current design: Option C (ask user)
```

## Dependencies

- **Plan File Format:** Markdown with `[ ]` checkbox format
- **Checkpoint Storage:** Disk write access (same directory as plan or `.plan-state.json`)
- **User Interaction:** Ability to pause and wait for CONTINUE command
- **Test Execution:** Optional; if test files detected, run them (pytest, npm test, etc.)

## Design Decisions

| Decision | Evidence | Confidence |
|----------|----------|-----------|
| Sequential execution only | Skill named "executing-plans", emphasis on order | 🟢 |
| Checkpoint after each task | Recovery design mentions checkpoints | 🟢 |
| Pause for user review | Skill description emphasizes human oversight | 🟢 |
| Disk-based persistence | Checkpoint file saved to `.plan-state.json` | 🟡 |
| Resume from last completed task | Recovery flow in skill | 🟡 |
| No task parallelization | Sequentiality rule explicit | 🟢 |

## Internal State

**Session State:**
- `plan_path: string` — path to plan file
- `checkpoint_path: string` — path to checkpoint file
- `tasks: Task[]` — parsed task list
- `current_index: number` — 0-based index of current task
- `completed_indices: Set<number>` — indices of completed tasks
- `execution_log: Log[]` — timestamped log of actions

**Task State:**
```typescript
interface Task {
  id: string;           // T-01, T-02, etc.
  title: string;
  description: string;
  estimated_duration: string | null;
  status: "pending" | "running" | "completed" | "blocked" | "rolled_back";
  started_at: ISO8601 | null;
  completed_at: ISO8601 | null;
  notes: string | null;
}
```

## Observability

**Log Signals:**
- "Loaded plan with N tasks"
- "Resuming from checkpoint: T-02 (task 2/5)"
- "Task T-01 completed in 2h 15m"
- "Task T-02 blocked: failing test 'validatePassword'"
- "User requested PAUSE; checkpoint saved"

## Risks & Lacunas

- 🟡 Plan file modifications: If user edits plan.md mid-execution, does skill detect/warn? Current: no re-parsing mid-execution
- 🔴 Idempotence assumption: Skill assumes tasks can be re-run safely; some tasks (data migrations, deletions) are NOT idempotent
- 🟡 Test integration: How does skill detect which test framework to use? Assumes `npm test` or `pytest` exists
- 🟡 Task dependencies between units: If T-02 depends on T-01 output, how is output passed? Not specified
- 🟢 Partial failure recovery: continue from the partial state after diagnosing failed verification. Do not automatically roll back edits; ask the user only when recovery requires destructive rollback, broad rewrite, or plan correction.
- 🟡 Checkpoint versioning: If plan changes structure significantly, old checkpoint might be invalid; no forward-compatibility check

## Reviewer Validation Addendum

- Question 4 answered: failed verification after partial success should trigger diagnosis and targeted continuation from the current state. Automatic rollback is not the default because the governing skills emphasize preserving work and avoiding destructive cleanup unless explicitly chosen.
- Question 4 answered: implementation tasks should be written to tolerate resume from partial completion, with verification evidence deciding the next action.
