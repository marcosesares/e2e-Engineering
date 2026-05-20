# Writing Plans — Requirements

## Overview

Writing Plans produces executable implementation plans for multi-step tasks before code changes begin. 🟢

The unit requires exact files, code, commands, expected outputs, TDD steps, frequent commits, and self-review for spec coverage and placeholder removal. 🟢

## Responsibilities

- Activate before touching code for multi-step tasks with specs or requirements. 🟢
- Save plans to `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md` unless user preference overrides. 🟢
- Map file structure before decomposing tasks. 🟢
- Break work into bite-sized 2-5 minute steps. 🟢
- Include exact code, commands, expected outputs, tests, docs, and commits. 🟢
- Forbid placeholders and vague instructions. 🟢
- Self-review against the spec before handoff. 🟢
- Offer subagent-driven or inline execution after saving. 🟢

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| RF-01 | Announce use of planning skill | Must | Agent states it is using writing-plans |
| RF-02 | Scope-check independent subsystems | Must | Oversized specs are split or flagged before planning |
| RF-03 | Map file structure first | Must | Create/modify/test files and responsibilities are listed before tasks |
| RF-04 | Use required plan header | Must | Plan begins with feature name, required sub-skill, goal, architecture, and tech stack |
| RF-05 | Create bite-sized tasks | Must | Each step is one small action with exact details |
| RF-06 | Include TDD sequence | Must | Failing test, red run, minimal implementation, green run, commit are explicit |
| RF-07 | Ban placeholders | Must | No TBD, TODO, "similar to", vague validation, or undefined symbols remain |
| RF-08 | Run self-review | Must | Spec coverage, placeholder scan, and type consistency are checked |
| RF-09 | Offer execution handoff | Should | User chooses subagent-driven or inline execution |

## Acceptance Criteria

```gherkin
Scenario: Plan includes executable steps
Given a multi-step implementation spec
When the plan is written
Then each task lists exact files, code, commands, expected output, tests, and commit command
```

```gherkin
Scenario: Placeholder scan catches vague text
Given a plan contains "add appropriate error handling"
When self-review runs
Then the vague instruction is replaced with concrete behavior and code
```

## Code Traceability

| File | Section | Coverage |
|------|---------|----------|
| `skills/writing-plans/SKILL.md` | Scope Check, File Structure, Task Structure, No Placeholders, Self-Review | 🟢 |
