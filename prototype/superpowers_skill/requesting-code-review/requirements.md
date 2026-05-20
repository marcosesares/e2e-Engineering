# Requesting Code Review — Requirements

> Skill for dispatching an independent code reviewer before work proceeds or merges.

## Overview

Requesting Code Review defines when and how an agent asks for an independent review of completed work. The reviewer receives a focused prompt with the implementation description, requirements or plan, and git range; it should evaluate the work product, not the implementer's session history. 🟢

## Responsibilities

- Trigger review after major work, before merge, and after each task in subagent-driven development. 🟢
- Build reviewer context from explicit artifacts: description, requirements/plan, base SHA, head SHA. 🟢
- Dispatch an independent reviewer with a calibrated severity model. 🟢
- Require Critical and Important issues to be addressed before proceeding. 🟢
- Preserve the implementer's context by avoiding full-session handoff to the reviewer. 🟢

## Business Rules

- **Review-Early Rule:** Request review at natural checkpoints before defects cascade. 🟢
- **Mandatory Review Rule:** Review is mandatory after each subagent-driven task, after major feature completion, and before merge to main. 🟢
- **Focused Context Rule:** Reviewer receives work-product context, not the implementer's full session history. 🟢
- **Git Range Rule:** Review prompt must include base and head SHAs for diff inspection. 🟢
- **Severity Rule:** Critical issues are fixed immediately; Important issues are fixed before proceeding; Minor issues can be noted for later. 🟢
- **Pushback Rule:** If reviewer feedback is wrong, respond with technical reasoning and evidence. 🟢

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| RF-01 | Determine when review is required | Must | Review triggered for mandatory checkpoints |
| RF-02 | Capture base and head git SHAs | Must | Prompt includes valid `{BASE_SHA}` and `{HEAD_SHA}` |
| RF-03 | Provide implementation description | Must | Reviewer understands what changed |
| RF-04 | Provide requirements or plan context | Must | Reviewer can evaluate plan alignment |
| RF-05 | Dispatch reviewer using `code-reviewer.md` template | Must | Prompt includes plan alignment, quality, architecture, testing, readiness checks |
| RF-06 | Triage returned feedback by severity | Must | Critical/Important/Minor categories drive next action |
| RF-07 | Fix Critical and Important findings before proceeding | Must | Work does not advance with unresolved blocking review findings |

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-------------|----------|------------|
| Independence | Reviewer must focus on diff and requirements, not prior reasoning | "never your session's history" instruction | 🟢 |
| Traceability | Review scope identified by git SHAs | SHA capture instructions | 🟢 |
| Quality | Reviewer checks plan alignment, tests, architecture, production readiness | `code-reviewer.md` template | 🟢 |
| Calibration | Issues categorized by actual severity | Template calibration section | 🟢 |

## Acceptance Criteria

```gherkin
Scenario: Review after subagent task
Given a subagent completes a task
When requesting-code-review is invoked
Then the agent captures base and head SHAs
And dispatches a reviewer with description, plan, and git range

Scenario: Reviewer finds Critical issue
Given reviewer output includes a Critical issue
When the implementer receives feedback
Then the issue is fixed immediately
And the work does not proceed until verified

Scenario: Reviewer finds Important issue
Given reviewer output includes an Important issue
When the implementer receives feedback
Then the issue is fixed before the next task or merge

Scenario: Reviewer feedback is wrong
Given reviewer output conflicts with code evidence
When the implementer verifies the claim
Then the implementer pushes back with technical reasoning
```

## Priority (MoSCoW)

| Requirement | MoSCoW | Justification |
|-------------|--------|---------------|
| Capture git range | Must | Reviewer needs exact diff scope |
| Include requirements/plan | Must | Enables plan-alignment review |
| Dispatch independent reviewer | Must | Core value of the skill |
| Fix Critical/Important issues | Must | Prevents known defects from cascading |
| Note Minor issues | Should | Useful but not always blocking |

## Code Traceability

| File | Function / Section | Coverage |
|------|--------------------|----------|
| `skills/requesting-code-review/SKILL.md` | When to request, how to request, act on feedback, workflow integrations | 🟢 |
| `skills/requesting-code-review/code-reviewer.md` | Reviewer prompt template and output contract | 🟢 |
| `_reversa_sdd/domain.md` | Reviewer role and code review trigger | 🟡 |
| `_reversa_sdd/state-machines.md` | Code reviewer role state and review trigger | 🟡 |
