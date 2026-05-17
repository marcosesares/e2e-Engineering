# Executing Plans, Tasks

> Implementation tasks for sequential task execution with checkpointing.

## Prerequisites

- [ ] Plan file exists and is readable (markdown format with [ ] checkboxes)
- [ ] Disk write access available for checkpoint files
- [ ] User interaction mechanism available (pause, wait for input)
- [ ] Task execution environment available (can run code, tests, etc.)

## Tasks

### Plan Parsing & Initialization

- [ ] T-01, Parse markdown plan file (extract [ ] tasks with descriptions)
  - Origin: `skills/executing-plans/SKILL.md` — Plan loading
  - Acceptance: Given `docs/plan.md` with 5 tasks, extract all 5 with title/description/order correct
  - Confidence: 🟢

- [ ] T-02, Initialize checkpoint file if doesn't exist
  - Origin: `skills/executing-plans/SKILL.md` — Checkpoint initialization
  - Acceptance: `.plan-state.json` created with all fields initialized
  - Confidence: 🟢

- [ ] T-03, Load existing checkpoint and determine resume position
  - Origin: `skills/executing-plans/SKILL.md` — Recovery loading
  - Acceptance: Read .plan-state.json, find last completed task index, next index is current
  - Confidence: 🟢

- [ ] T-04, Display plan summary and current progress
  - Origin: `skills/executing-plans/SKILL.md` — UI/reporting
  - Acceptance: Output shows "3/5 tasks completed, resuming at task 4"
  - Confidence: 🟢

### Task Execution Loop

- [ ] T-05, Execute task N (implement code, write docs, etc. per task description)
  - Origin: `skills/executing-plans/SKILL.md` — Core execution
  - Acceptance: Task runs to completion (or user stops), output captured
  - Confidence: 🟢

- [ ] T-06, Pause after task and report progress
  - Origin: `skills/executing-plans/SKILL.md` — Pause mechanism
  - Acceptance: Output "✅ Task N done. Files changed: [list]. Press CONTINUE."
  - Confidence: 🟢

- [ ] T-07, Wait for user command (CONTINUE | PAUSE | REDO | EDIT-PLAN)
  - Origin: `skills/executing-plans/SKILL.md` — User interaction
  - Acceptance: Block until user provides one of 4 commands
  - Confidence: 🟢

- [ ] T-08, Handle CONTINUE command (mark task complete, move to next)
  - Origin: `skills/executing-plans/SKILL.md` — Execution flow
  - Acceptance: Task marked complete, checkpoint updated, loop continues with next task
  - Confidence: 🟢

- [ ] T-09, Handle PAUSE command (save checkpoint, exit skill)
  - Origin: `skills/executing-plans/SKILL.md` — User-initiated pause
  - Acceptance: Checkpoint saved, skill exits, on re-run resumes from current position
  - Confidence: 🟢

- [ ] T-10, Handle REDO command (mark task incomplete, re-execute)
  - Origin: `skills/executing-plans/SKILL.md` — Rollback mechanism
  - Acceptance: Task marked incomplete, re-executed from beginning
  - Confidence: 🟡

- [ ] T-11, Handle EDIT-PLAN command (reload plan, apply edits to pending tasks)
  - Origin: `skills/executing-plans/SKILL.md` — Plan modification
  - Acceptance: User edits plan.md, skill re-parses, applies edits only to pending (not completed) tasks
  - Confidence: 🟡

### Checkpoint Management

- [ ] T-12, Save checkpoint after each task (task ID, status, timestamp, duration)
  - Origin: `skills/executing-plans/SKILL.md` — Checkpointing
  - Acceptance: .plan-state.json updated with completed_tasks list, current_index, timestamp
  - Confidence: 🟢

- [ ] T-13, Load checkpoint on session start and restore state
  - Origin: `skills/executing-plans/SKILL.md` — Recovery
  - Acceptance: State restored; execution resumes from last completed task + 1
  - Confidence: 🟢

- [ ] T-14, Validate checkpoint consistency (plan hasn't changed drastically)
  - Origin: `skills/executing-plans/SKILL.md` — Fault detection
  - Acceptance: Warn user if plan structure changed; offer to reset or continue
  - Confidence: 🟡

### Test Integration (Optional)

- [ ] T-15, Detect test framework (npm test, pytest, etc.)
  - Origin: `skills/executing-plans/SKILL.md` — Test discovery
  - Acceptance: Look for test scripts in package.json or pytest.ini; auto-detect
  - Confidence: 🟡

- [ ] T-16, Execute tests after task completion (optional)
  - Origin: `skills/executing-plans/SKILL.md` — Verification
  - Acceptance: Run tests, show results before pause; tests don't block task completion
  - Confidence: 🟡

- [ ] T-17, Report test results in progress output
  - Origin: `skills/executing-plans/SKILL.md` — Observability
  - Acceptance: Output shows "Tests: 5 passed, 0 failed" after task
  - Confidence: 🟡

### Recovery & Error Handling

- [ ] T-18, Handle partial task failure (task runs but some goals incomplete)
  - Origin: `skills/executing-plans/SKILL.md` — Partial failure
  - Acceptance: Mark task complete but warn user; user can REDO if needed
  - Confidence: 🟡

- [ ] T-19, Handle session interruption recovery (detect mid-task completion on restart)
  - Origin: `skills/executing-plans/SKILL.md` — Interruption handling
  - Acceptance: Session 1 starts T-02; Session 2 asks "was T-02 successful?" and resumes from user answer
  - Confidence: 🟡

- [ ] T-20, Skip blocked tasks (if task dependency fails, mark dependent as blocked)
  - Origin: `skills/executing-plans/SKILL.md` — Dependency handling
  - Acceptance: If T-01 fails, T-02 (which depends on T-01) marked BLOCKED, skip to T-03
  - Confidence: 🟡

### Testing

- [ ] TT-01, Execute 3-task plan in sequence, pause after each, all complete
  - Verification: Task 1, pause, CONTINUE, Task 2, pause, CONTINUE, Task 3 done
  - Confidence: 🟢

- [ ] TT-02, Resume from checkpoint after session restart
  - Setup: 3-task plan, complete tasks 1-2, restart session
  - Verification: Session 2 resumes at task 3, doesn't re-run 1-2
  - Confidence: 🟢

- [ ] TT-03, REDO command re-executes task
  - Scenario: Complete task 2, say REDO, task 2 re-executes
  - Verification: Task 2 runs again, checkpoint updated
  - Confidence: 🟡

- [ ] TT-04, PAUSE command saves checkpoint and exits
  - Scenario: Pause mid-execution, restart later
  - Verification: Resumes from pause point, not from beginning
  - Confidence: 🟢

- [ ] TT-05, Plan modification mid-execution (add new task)
  - Scenario: During execution, user edits plan.md to add task T-2.5 between T-2 and T-3
  - Verification: T-2.5 is ignored (already planned); only original T-1, T-2, T-3 execute
  - Confidence: 🟡

- [ ] TT-06, Test integration: tests run after task, results shown before pause
  - Confidence: 🟡

- [ ] TT-07, Interruption recovery: session crashes mid-task
  - Scenario: T-02 starts, session crashes, restart
  - Verification: User asked "was T-02 successful?"; can resume or redo
  - Confidence: 🟡

## Implementation Order

1. **Foundation (T-01 to T-04):** Plan parsing and initialization
2. **Execution Loop (T-05 to T-11):** Core task execution and command handling
3. **Checkpointing (T-12 to T-14):** Persistence and recovery
4. **Robustness (T-15 to T-20):** Test integration, error handling, dependency management (optional/advanced)
5. **Testing (TT-01 to TT-07):** Comprehensive coverage

**Critical Blockers:**
- T-01 must complete before T-05 (can't execute tasks without parsing plan)
- T-02/T-03 must complete before T-05 (checkpoint required for recovery)

## Gaps Pending Validation (🔴)

- **Idempotence assumption:** Task re-execution assumes tasks are idempotent. Some tasks (data migrations) are NOT. Need per-task idempotence flag.
- **Dependency tracking:** How are task dependencies specified in plan? Current markdown format doesn't support dependency annotations.
- **Partial failure semantics:** If T-02 completes 80% but tests fail, is it marked complete or blocked? Current: unclear.
- **Test framework detection:** How does skill auto-detect `npm test` vs `pytest` vs other? Current: unspecified heuristic.
- **Checkpoint versioning:** If plan structure changes significantly, old checkpoint might be stale. How is this detected? Current: basic check only.
- **Plan modification safety:** User edits plan mid-execution; how are conflicts between old checkpoint and new plan resolved? Current: apply only to pending tasks, but unclear if robust.
