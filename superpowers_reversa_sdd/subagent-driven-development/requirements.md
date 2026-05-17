# Subagent-Driven Development — Requirements

> Skill for executing an implementation plan inside the current session by dispatching one fresh subagent per task and enforcing two review gates after each task.

## Overview

Subagent-Driven Development coordinates implementation plans whose tasks are mostly independent and should be executed without leaving the current session. It preserves controller context by giving each task to a fresh subagent with explicit task text, curated context, and a required review loop before the next task starts. 🟢

## Responsibilities

- Determine whether the current plan is suitable for same-session subagent execution. 🟢
- Dispatch one fresh implementer subagent per task with full task text and scene-setting context. 🟢
- Require the implementer to ask clarifying questions before work when requirements, assumptions, dependencies, or approach are unclear. 🟢
- Interpret implementer status values: `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, and `BLOCKED`. 🟢
- Enforce spec compliance review before code quality review for every task. 🟢
- Loop reviewer findings back to the implementer until spec and quality gates pass. 🟢
- Mark task completion only after both review gates approve the implementation. 🟢
- Dispatch a final implementation-wide code review after all tasks complete, then hand off to branch-finishing workflow. 🟢

## Business Rules

- **Fresh Subagent Rule:** Each task gets a new subagent with isolated context; the controller constructs the exact context instead of inheriting full session history. 🟢
- **Continuous Execution Rule:** After the user asks to execute a plan, the controller does not stop between tasks except for unresolved blockers, genuine ambiguity, or completion. 🟢
- **Plan Suitability Rule:** Use this skill only when an implementation plan exists, tasks are mostly independent, and execution should remain in the current session. 🟢
- **Task Context Rule:** The implementer receives the full task text directly and must not be told to read the plan file itself. 🟢
- **Clarification Rule:** If the implementer asks questions before or during work, the controller answers clearly before implementation continues. 🟢
- **Status Handling Rule:** `DONE` proceeds to spec review; `DONE_WITH_CONCERNS` requires concern triage; `NEEDS_CONTEXT` receives missing context; `BLOCKED` requires changed conditions before retry. 🟢
- **Review Ordering Rule:** Spec compliance review must pass before code quality review starts. 🟢
- **Review Loop Rule:** Any reviewer issue returns to the implementer for fixes, followed by re-review until approved. 🟢
- **No Parallel Implementers Rule:** Implementation subagents are dispatched sequentially, not in parallel, to avoid shared-worktree conflicts. 🟢
- **Escalation Rule:** If the plan is wrong, task scope is too large, or reasoning requirements exceed the assigned model, the controller escalates instead of forcing a blind retry. 🟢
- **Model Economy Rule:** Use cheaper models for mechanical tasks, standard models for integration work, and the strongest available model for design and review judgment. 🟢

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| RF-01 | Detect that a plan exists and tasks are mostly independent before using the workflow | Must | Skill is selected only when the decision flow resolves to same-session subagent-driven execution |
| RF-02 | Extract each task's full text and context before dispatch | Must | Implementer prompt contains task text directly and does not ask the subagent to read the plan file |
| RF-03 | Create and maintain a task tracker for all extracted tasks | Must | Each task can be marked complete only after both review gates pass |
| RF-04 | Dispatch one implementer subagent per task | Must | Each task starts with a fresh implementer prompt using `implementer-prompt.md` |
| RF-05 | Allow implementers to ask questions before and during work | Must | Controller answers or supplies context before work proceeds |
| RF-06 | Require implementer output in the defined status format | Must | Output includes status, implementation summary, tests, changed files, self-review, and concerns |
| RF-07 | Handle `DONE` status by starting spec compliance review | Must | Spec reviewer is dispatched immediately after a completed implementation report |
| RF-08 | Handle `DONE_WITH_CONCERNS` by reading and triaging concerns before review | Must | Scope or correctness concerns are resolved before continuing |
| RF-09 | Handle `NEEDS_CONTEXT` by providing missing context and re-dispatching | Must | Same task is retried with the additional context requested |
| RF-10 | Handle `BLOCKED` by changing conditions or escalating | Must | Controller provides context, upgrades model, splits task, or escalates to the human |
| RF-11 | Dispatch spec compliance reviewer after implementation | Must | Reviewer compares actual code to requested task and reports missing, extra, or misunderstood work |
| RF-12 | Block code quality review until spec compliance is approved | Must | Code quality reviewer is not dispatched while spec issues remain open |
| RF-13 | Dispatch code quality reviewer after spec approval | Must | Reviewer uses the standard requesting-code-review template plus decomposition and maintainability checks |
| RF-14 | Re-run reviewers after fixes | Must | Fixes are verified by the same gate that found the issue before the task can close |
| RF-15 | Dispatch a final code reviewer after all tasks are complete | Should | Entire implementation receives a final independent review before finishing branch workflow |
| RF-16 | Hand off to `finishing-a-development-branch` after final review | Should | Branch completion workflow is invoked after all tasks and reviews finish |

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-------------|----------|------------|
| Context control | Subagents receive curated task context instead of inherited full session history | `skills/subagent-driven-development/SKILL.md:10` | 🟢 |
| Quality | Each task requires implementer self-review, spec review, and code quality review | `skills/subagent-driven-development/SKILL.md:53`, `skills/subagent-driven-development/SKILL.md:73`, `skills/subagent-driven-development/SKILL.md:77` | 🟢 |
| Correctness | Spec compliance verifies actual code rather than trusting implementer claims | `skills/subagent-driven-development/spec-reviewer-prompt.md` | 🟢 |
| Maintainability | Code quality review checks file responsibility, decomposition, and plan structure | `skills/subagent-driven-development/code-quality-reviewer-prompt.md` | 🟢 |
| Efficiency | Controller extracts plan context once and gives complete context to each subagent | `skills/subagent-driven-development/SKILL.md:217` | 🟢 |
| Cost control | Model selection should match task complexity | `skills/subagent-driven-development/SKILL.md:89` | 🟢 |
| Safety | Parallel implementation dispatch is forbidden to avoid conflicts | `skills/subagent-driven-development/SKILL.md:242` | 🟢 |

## Acceptance Criteria

```gherkin
Scenario: Same-session plan execution
Given an implementation plan exists
And the tasks are mostly independent
And the user wants to stay in the current session
When Subagent-Driven Development is selected
Then the controller extracts all tasks and creates a task tracker
And dispatches the first fresh implementer subagent with full task text
```

```gherkin
Scenario: Implementer needs clarification
Given an implementer subagent receives a task
When the subagent reports NEEDS_CONTEXT
Then the controller provides the missing context
And re-dispatches the task with the clarified information
```

```gherkin
Scenario: Completed task passes both gates
Given an implementer reports DONE for a task
When spec compliance review passes
And code quality review passes
Then the task is marked complete
And the controller proceeds to the next task
```

```gherkin
Scenario: Spec compliance fails
Given an implementer reports DONE for a task
When the spec reviewer finds missing or extra behavior
Then the controller sends the findings back to the implementer
And does not start code quality review until spec compliance passes
```

```gherkin
Scenario: Implementer is blocked
Given an implementer reports BLOCKED
When the controller assesses the blocker
Then the controller changes the retry conditions by adding context, upgrading model, splitting the task, or escalating to the human
And does not force an unchanged retry
```

## Priority (MoSCoW)

| Requirement | MoSCoW | Justification |
|-------------|--------|---------------|
| Dispatch fresh implementer per task | Must | Core execution model of the skill |
| Provide full task text directly | Must | Prevents context loss and plan-reading ambiguity |
| Enforce spec compliance before quality review | Must | Explicit red flag forbids reversed review order |
| Loop on reviewer findings | Must | Review gates are ineffective without re-review |
| Handle implementer statuses | Must | Controls retries, context requests, and escalation paths |
| Select model by task complexity | Should | Important cost and speed optimization, but workflow can still run without explicit model tiers |
| Final implementation-wide review | Should | Recommended completion step after all task-level gates |
| Use cheaper model for mechanical tasks | Could | Cost optimization depends on available engine models |

## Code Traceability

| File | Function / Section | Coverage |
|------|--------------------|----------|
| `skills/subagent-driven-development/SKILL.md` | Core principle, use decision, process graph, status handling, red flags, integration | 🟢 |
| `skills/subagent-driven-development/implementer-prompt.md` | Implementer dispatch contract and status report format | 🟢 |
| `skills/subagent-driven-development/spec-reviewer-prompt.md` | Spec compliance review contract | 🟢 |
| `skills/subagent-driven-development/code-quality-reviewer-prompt.md` | Code quality review contract and extra review concerns | 🟢 |
| `_reversa_sdd/code-analysis.md` | System-level summary and pseudocode for subagent-driven execution | 🟡 |
| `_reversa_sdd/state-machines.md` | Subagent dispatch and review-loop state interpretation | 🟡 |
| `_reversa_sdd/permissions.md` | Subagent authority boundary and review implications | 🟡 |
