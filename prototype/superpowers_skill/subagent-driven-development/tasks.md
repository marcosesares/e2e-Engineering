# Subagent-Driven Development, Implementation Tasks

> Executable task contract for reimplementing the same-session subagent orchestration workflow from the legacy skill. Every task references the source artifact where the behavior was extracted.

## Prerequisites

- [ ] Dependencies from `design.md` are available: implementer dispatch, spec compliance review, code quality review, requesting-code-review integration, finishing-a-development-branch integration, and an engine-specific subagent API. 🟢
- [ ] A validated implementation plan exists before this unit is invoked. 🟢
- [ ] The controller can maintain an in-session task tracker equivalent to `TodoWrite` or an engine-native substitute. 🟡
- [ ] Git branch/worktree safety has already been handled by the surrounding workflow before implementation tasks start. 🟢
- [ ] No database schema or migrations are required for this markdown-only workflow. 🟢
- [ ] Engine-specific model names and subagent isolation guarantees are mapped through a host capability adapter before production use. 🟡

## Tasks

- [ ] T-01, Implement workflow selection guard
  - Origin in legacy: `skills/subagent-driven-development/SKILL.md:16`
  - Build a decision check that selects this workflow only when an implementation plan exists, tasks are mostly independent, and execution should remain in the current session.
  - Criterion of ready: Given plan availability, task independence, and session preference inputs, the controller selects `subagent-driven-development` only for the documented yes/yes/yes path and routes other paths away from this unit.
  - Confidence: 🟢

- [ ] T-02, Extract plan tasks into controller-owned task records
  - Origin in legacy: `skills/subagent-driven-development/SKILL.md:42`
  - Parse or otherwise read the implementation plan once, extract every task with full text, acceptance criteria, dependencies, and scene-setting context, then create a task tracker before dispatching implementers.
  - Criterion of ready: Each task record contains enough text for an implementer prompt without asking the subagent to read the plan file.
  - Confidence: 🟢

- [ ] T-03, Generate fresh implementer prompts per task
  - Origin in legacy: `skills/subagent-driven-development/implementer-prompt.md:1`
  - Construct one fresh implementer dispatch per task using the template sections: task description, context, before-you-begin questions, job steps, code organization guidance, escalation rules, self-review, and report format.
  - Criterion of ready: The prompt includes the complete task text inline and rejects inherited full-session context as the default handoff mechanism.
  - Confidence: 🟢

- [ ] T-04, Support implementer clarification before and during work
  - Origin in legacy: `skills/subagent-driven-development/implementer-prompt.md:14`
  - Allow implementers to ask questions before starting and while working, then resume dispatch only after the controller provides missing requirements, assumptions, dependencies, or approach guidance.
  - Criterion of ready: A `NEEDS_CONTEXT` or question path pauses implementation, records the missing context, supplies an answer, and retries with changed information.
  - Confidence: 🟢

- [ ] T-05, Implement status handling state machine
  - Origin in legacy: `skills/subagent-driven-development/SKILL.md:104`
  - Interpret implementer statuses `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, and `BLOCKED` according to the documented behavior.
  - Criterion of ready: `DONE` starts spec review, `DONE_WITH_CONCERNS` triggers concern triage before review, `NEEDS_CONTEXT` adds missing context before retry, and `BLOCKED` changes retry conditions or escalates.
  - Confidence: 🟢

- [ ] T-06, Enforce sequential implementer dispatch
  - Origin in legacy: `skills/subagent-driven-development/SKILL.md:236`
  - Prevent multiple implementation subagents from running in parallel for the same plan, because the legacy workflow treats parallel implementers as a shared-worktree conflict risk.
  - Criterion of ready: The controller can dispatch only one active implementer for the current task and does not advance to the next task until both review gates pass.
  - Confidence: 🟢

- [ ] T-07, Add model selection policy hooks
  - Origin in legacy: `skills/subagent-driven-development/SKILL.md:89`
  - Classify tasks as mechanical, integration/judgment, or architecture/review work and choose the least powerful suitable model exposed by the host engine.
  - Criterion of ready: The implementation stores task complexity signals and supports cheaper models for mechanical tasks, standard models for integration tasks, and strongest available models for design or review judgment.
  - Confidence: 🟢

- [ ] T-08, Implement spec compliance review gate
  - Origin in legacy: `skills/subagent-driven-development/spec-reviewer-prompt.md:1`
  - Dispatch a spec compliance reviewer after a task implementation report is ready and require the reviewer to inspect actual code instead of trusting the implementer report.
  - Criterion of ready: A task cannot proceed to quality review unless the spec reviewer reports compliance or all listed issues have been fixed and re-reviewed.
  - Confidence: 🟢

- [ ] T-09, Implement code quality review gate
  - Origin in legacy: `skills/subagent-driven-development/code-quality-reviewer-prompt.md:1`
  - Dispatch code quality review only after spec compliance passes, using the requesting-code-review template plus checks for responsibility boundaries, decomposition, plan structure, and task-created file growth.
  - Criterion of ready: Quality review receives task summary, plan requirements, base SHA, head SHA, and actual diff context, and open Critical or Important issues return to the implementer for fixes.
  - Confidence: 🟢

- [ ] T-10, Implement review-loop remediation
  - Origin in legacy: `skills/subagent-driven-development/SKILL.md:77`
  - Route spec or quality findings back to the implementer, then rerun the same review gate after fixes until approval.
  - Criterion of ready: The task tracker cannot mark a task complete while either review gate has unresolved issues.
  - Confidence: 🟢

- [ ] T-11, Mark task completion only after both gates pass
  - Origin in legacy: `skills/subagent-driven-development/SKILL.md:80`
  - Update the task tracker only after implementation, spec compliance review, and code quality review are all complete.
  - Criterion of ready: A completed task record includes implementer report, spec review result, quality review result, changed files, tests, and any concerns.
  - Confidence: 🟢

- [ ] T-12, Continue automatically through remaining tasks
  - Origin in legacy: `skills/subagent-driven-development/SKILL.md:14`
  - After a task is approved, automatically select the next pending task without a user check-in unless there is an unresolved blocker, genuine ambiguity, or all tasks are complete.
  - Criterion of ready: The workflow emits progress but does not ask whether to continue between ordinary completed tasks.
  - Confidence: 🟢

- [ ] T-13, Dispatch final implementation-wide review
  - Origin in legacy: `skills/subagent-driven-development/SKILL.md:82`
  - After all task-level gates pass, dispatch one final independent code review for the entire implementation before branch finishing.
  - Criterion of ready: The final review receives the full implementation diff and can block branch completion when broad integration issues are found.
  - Confidence: 🟢

- [ ] T-14, Hand off to branch finishing workflow
  - Origin in legacy: `skills/subagent-driven-development/SKILL.md:84`
  - Invoke or instruct use of `superpowers:finishing-a-development-branch` after task completion and final review approval.
  - Criterion of ready: The workflow exposes a clear terminal transition from final review approval into branch-finishing behavior.
  - Confidence: 🟢

- [ ] T-15, Preserve escalation paths for unsuitable work
  - Origin in legacy: `skills/subagent-driven-development/SKILL.md:114`
  - When an implementer is blocked because of missing context, insufficient reasoning capacity, oversized task scope, or a wrong plan, change the retry condition or escalate instead of forcing an unchanged retry.
  - Criterion of ready: Every `BLOCKED` path records what changed before retry, or stops with a human-readable escalation if the controller cannot resolve it.
  - Confidence: 🟢

- [ ] T-16, Document harness-specific dispatch assumptions
  - Origin in legacy: `_reversa_sdd/subagent-driven-development/design.md`
  - Identify the concrete host-engine APIs or fallback behavior for spawning subagents, sharing filesystem state, choosing models, and obtaining base/head SHAs.
  - Criterion of ready: Unknown dispatch semantics are represented as explicit configuration or documentation rather than hardcoded assumptions.
  - Confidence: 🟡

## Test Tasks

- [ ] TT-01, Test workflow selection happy path
  - Validate that the workflow is selected only when an implementation plan exists, tasks are mostly independent, and same-session execution is requested.
  - Covers: `requirements.md`, Scenario "Same-session plan execution"
  - Confidence: 🟢

- [ ] TT-02, Test implementer prompt completeness
  - Validate that a generated implementer prompt contains full task text, context, question instructions, job steps, self-review guidance, and the required status report format.
  - Covers: `requirements.md`, RF-02, RF-04, RF-06
  - Confidence: 🟢

- [ ] TT-03, Test `NEEDS_CONTEXT` retry behavior
  - Validate that `NEEDS_CONTEXT` causes the controller to add missing context before re-dispatching the same task.
  - Covers: `requirements.md`, Scenario "Implementer needs clarification"
  - Confidence: 🟢

- [ ] TT-04, Test `BLOCKED` escalation behavior
  - Validate that `BLOCKED` changes retry conditions through more context, a stronger model, task splitting, or human escalation.
  - Covers: `requirements.md`, Scenario "Implementer is blocked"
  - Confidence: 🟢

- [ ] TT-05, Test review gate ordering
  - Validate that code quality review cannot start before spec compliance review passes.
  - Covers: `requirements.md`, RF-12
  - Confidence: 🟢

- [ ] TT-06, Test spec failure loop
  - Validate that missing or extra implementation found by spec review returns to the implementer and blocks quality review until re-review passes.
  - Covers: `requirements.md`, Scenario "Spec compliance fails"
  - Confidence: 🟢

- [ ] TT-07, Test quality failure loop
  - Validate that Critical or Important quality issues return to the implementer and block task completion until quality re-review approves.
  - Covers: `requirements.md`, RF-14
  - Confidence: 🟢

- [ ] TT-08, Test task completion guard
  - Validate that a task is marked complete only after implementation report, passing spec review, and passing quality review are present.
  - Covers: `requirements.md`, Scenario "Completed task passes both gates"
  - Confidence: 🟢

- [ ] TT-09, Test no parallel implementers
  - Validate that dispatching a second implementer while a task is active is rejected or queued.
  - Covers: `requirements.md`, No Parallel Implementers Rule
  - Confidence: 🟢

- [ ] TT-10, Test final review and branch finishing handoff
  - Validate that after all task-level gates pass, a final implementation-wide review occurs before the branch-finishing workflow is invoked.
  - Covers: `requirements.md`, RF-15, RF-16
  - Confidence: 🟢

## Data Migration Tasks

- [ ] TM-01, No data migration required
  - Origin in legacy: `skills/subagent-driven-development/SKILL.md`
  - The unit is markdown workflow logic and does not define persisted application data or database schemas.
  - Criterion of ready: Implementation contains no database migration step for this unit unless the host product adds persistence outside the legacy contract.
  - Confidence: 🟢

## Suggested Order

1. Implement T-01 and T-02 first because the controller must select the workflow and own the task list before any subagent dispatch can be correct. 🟢
2. Implement T-03 and T-04 next because implementer prompts and clarification handling define the subagent input contract. 🟢
3. Implement T-05, T-06, T-12, and T-15 together as the controller state machine for task progression, sequential execution, continuation, and escalation. 🟢
4. Implement T-08 through T-11 as the mandatory review gates and completion guard. 🟢
5. Implement T-07 after the basic dispatch path works because model selection optimizes the workflow without changing its core correctness contract. 🟢
6. Implement T-13 and T-14 last because final review and branch finishing only occur after all task-level gates pass. 🟢
7. Resolve T-16 before production release on a specific harness because exact subagent APIs and isolation guarantees require host capability mapping. 🟡

## Pending Gaps (🔴)

- 🟡 The legacy skill does not define concrete spawn APIs, filesystem isolation guarantees, or model identifiers for Claude Code, Codex, Cursor, Gemini CLI, OpenCode, or other harnesses; reimplementation should use a host capability adapter and fall back to inline/manual review where unavailable.
- 🔴 The final implementation-wide review is required, but the legacy text does not fully specify the remediation loop if that final review finds broad integration issues.
- 🔴 The workflow names `TodoWrite`, but cross-engine task tracker availability and replacement behavior are not specified.
