# Verification Before Completion — Requirements

## Overview

Verification Before Completion prevents unsupported claims of success by requiring fresh evidence before any completion, fixed, passing, or ready statement. 🟢

The unit requires the agent to identify the proof command, run it, read the full output and exit code, then state only what the evidence supports. 🟢

## Responsibilities

- Block success claims without fresh verification evidence. 🟢
- Require full command execution, not partial checks or assumptions. 🟢
- Require output and exit code review before reporting status. 🟢
- Report actual failures or uncertainty when verification does not support the claim. 🟢
- Apply before commits, PRs, task completion, and positive status statements. 🟢

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| RF-01 | Identify proof command for each claim | Must | The command directly proves the claim being made |
| RF-02 | Run fresh verification | Must | Verification is run in the current turn/session before the claim |
| RF-03 | Read full output and exit code | Must | Failures, warnings, and partial results are not ignored |
| RF-04 | Match claim to evidence | Must | The final statement is limited to what the command proves |
| RF-05 | Reject unsupported success language | Must | "should", "probably", "seems", and satisfaction claims are blocked without proof |
| RF-06 | Verify delegated work independently | Should | Agent reports and diffs are checked rather than trusted |
| RF-07 | Verify requirements line by line | Should | Requirements completion is not inferred from tests alone |

## Acceptance Criteria

```gherkin
Scenario: Tests pass claim requires test output
Given the agent wants to say tests pass
When no fresh test command has been run
Then the claim is blocked
And the agent runs the full test command first
```

```gherkin
Scenario: Verification fails
Given a verification command exits nonzero
When reporting status
Then the agent states the actual failure
And does not claim completion
```

```gherkin
Scenario: Requirements completion
Given tests pass
When requirements remain unchecked
Then phase completion is not claimed until each requirement is verified
```

## Code Traceability

| File | Section | Coverage |
|------|---------|----------|
| `skills/verification-before-completion/SKILL.md` | Iron Law, Gate Function, Common Failures, Red Flags | 🟢 |
| `_reversa_sdd/flowcharts/verification-before-completion.md` | Verification gate flow | 🟢 |
