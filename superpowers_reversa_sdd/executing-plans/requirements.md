# Executing Plans — Sequential Task Execution with Checkpoints

> Skill for following implementation plans step-by-step, with savepoints and recovery mechanisms.

## Overview

Executing Plans guides agent execution of pre-written plans in strict sequence, pausing after each task to allow user review, file verification, and test runs. Checkpoints save progress to disk; if a session restarts, execution resumes from the last completed checkpoint. 🟢

## Responsibilities

- Load plan from disk and parse task list
- Execute tasks in strict sequence (no jumping, no parallelization)
- Checkpoint after each task (save to `.reversa/plan.md` or task state file)
- Pause and wait for user confirmation after each task
- Support inline code review, test execution, and verification gates
- Handle plan modifications (user edits task list mid-execution)
- Recover from interruptions (session restart, network drop) by resuming from last checkpoint
- Report progress and completion status

## Business Rules

- **Sequentiality Rule:** Tasks execute in strict order; no task starts until previous completes. 🟢
- **Verification Rule:** After each task, pause and wait for user "CONTINUE" or "PAUSE" command. 🟢
- **Checkpoint Rule:** After each task, save progress to disk with task completion timestamp. 🟢
- **No Backtracking Rule:** Once a task is marked complete, don't re-execute it unless explicitly rolled back by user. 🟢
- **Plan Immutability Rule:** User can modify plan mid-execution, but changes only apply to tasks not yet started. 🟡
- **Recovery Rule:** On session restart, resume from last completed task; don't repeat work. 🟢

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| RF-01 | Load plan file and parse task list | Must | Given plan.md with 5 tasks, extract all 5 with correct order |
| RF-02 | Execute tasks in strict sequential order | Must | Task 2 doesn't start until Task 1 completes |
| RF-03 | Pause after each task for user review | Must | After completing task, output "✅ Task 1 done. Press CONTINUE to proceed." and wait |
| RF-04 | Checkpoint after each task | Must | State saved to disk; on session restart, resume from correct position |
| RF-05 | Support task rollback (user says "redo task 3") | Should | Mark task 3 as incomplete, re-execute from task 3 |
| RF-06 | Handle plan modification mid-execution | Should | User adds task, deletes task, reorders — changes apply to pending tasks only |
| RF-07 | Integrate test execution | Should | After implementing task, auto-run tests if tests exist; show results before pause |
| RF-08 | Resume from checkpoint on session restart | Must | Session 1 completes task 3/5; session 2 resumes with task 4 |

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|------------|----------|-----------|
| Reliability | No task executed twice unless explicitly rolled back | Checkpoint tracking + idempotence checks | 🟢 |
| Durability | Checkpoint survives session restart, network interruption | Disk-based state persistence | 🟢 |
| Safety | User must approve before proceeding to next task | Blocking pause mechanism | 🟢 |
| Observability | Progress visible (X/N tasks complete) | Progress reporting per checkpoint | 🟢 |

## Acceptance Criteria

```gherkin
Scenario: Execute 3-task plan in sequence
Given plan with tasks [T1, T2, T3]
When executing
Then T1 runs, pauses, waits for CONTINUE
Then T2 runs after user confirms, pauses, waits
Then T3 runs after user confirms, completes

Scenario: Resume from checkpoint
Given plan [T1, T2, T3] with checkpoint at T2 (T1 complete, T2 complete, T3 pending)
When session restarts with same plan
Then execution resumes at T3 (doesn't re-run T1, T2)

Scenario: Rollback and re-execute
Given T1 complete, T2 complete, user says "redo T2"
When rollback T2
Then T2 marked incomplete, next "CONTINUE" re-executes T2
And T3 execution deferred until T2 re-completes

Scenario: Plan modification mid-execution
Given plan [T1, T2, T3], currently at T1 complete/waiting
When user adds T2.5 between T2 and T3
Then T2.5 is not executed; only T2, T3 execute in original order
And new task T2.5 can be added to a new plan afterward (separate concern)
```

## Priority (MoSCoW)

| Requirement | MoSCoW | Justification |
|-------------|--------|---------------|
| Load & parse plan | Must | No execution without a plan |
| Sequential execution | Must | Out-of-order would break dependencies |
| Pause for review | Must | User oversight critical; no auto-pilot |
| Checkpoint after task | Must | Recovery capability requires persistence |
| Resume from checkpoint | Must | Session continuity essential |
| Test integration | Should | Verification helpful but not blocking |
| Plan modification | Could | Users rarely change plans mid-execution |
| Rollback | Should | Safety mechanism for mistakes |

## Code Traceability

| File | Function / Section | Coverage |
|------|------------------|----------|
| `skills/executing-plans/SKILL.md` | Main skill definition | 🟢 |
| `skills/executing-plans/SKILL.md` | Checkpoint loading/saving | 🟢 |
| `skills/executing-plans/SKILL.md` | Recovery on session restart | 🟢 |
