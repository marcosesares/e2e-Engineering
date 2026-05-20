# Test-Driven Development — Requirements

> Skill for implementing features, bug fixes, refactors, and behavior changes with tests written and observed failing before production code.

## Overview

Test-Driven Development enforces a strict red-green-refactor loop: write a failing test, verify the failure, write minimal production code, verify green, then refactor while tests stay green. 🟢

The unit prevents biased tests-after implementation by requiring proof that each new test fails for the expected reason before implementation begins. 🟢

## Responsibilities

- Trigger before implementing new features, bug fixes, refactors, or behavior changes. 🟢
- Block production code until a failing test exists and has been observed failing correctly. 🟢
- Require deletion and restart when production code was written before the test. 🟢
- Keep each test focused on one behavior with a clear behavior-oriented name. 🟢
- Prefer real code in tests and use mocks only when unavoidable and understood. 🟢
- Require minimal implementation for green and refactoring only after green. 🟢
- Prevent test anti-patterns such as testing mocks, adding test-only production methods, and incomplete mocks. 🟢

## Business Rules

- **No Production Code Without Failing Test Rule:** Production code cannot be written before a failing test is observed. 🟢
- **Delete Premature Code Rule:** Code written before the test must be deleted and reimplemented from tests, not kept as reference. 🟢
- **Correct Red Rule:** The test must fail because the behavior is missing, not because of typo, setup error, or config failure. 🟢
- **Minimal Green Rule:** Implementation must do only enough to pass the current failing test. 🟢
- **Green Refactor Rule:** Refactoring may occur only after tests are green and must preserve behavior. 🟢
- **Real Behavior Rule:** Tests should verify behavior of real code, not mock presence or mock behavior. 🟢
- **Human Exception Rule:** Throwaway prototypes, generated code, and configuration-only changes require human permission to skip TDD. 🟢

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| RF-01 | Detect implementation contexts that require TDD | Must | New features, bug fixes, refactors, and behavior changes enter the TDD workflow |
| RF-02 | Require a failing test before production code | Must | Implementation is blocked until the test has been run and fails for the expected reason |
| RF-03 | Reject tests that pass immediately | Must | A passing first run causes the test to be corrected or deleted |
| RF-04 | Reject tests that error instead of fail | Must | Setup errors are fixed until the test fails because behavior is missing |
| RF-05 | Require focused behavior tests | Must | Each test covers one behavior and has a clear name |
| RF-06 | Minimize mocks | Should | Mocks are used only when unavoidable and after dependencies are understood |
| RF-07 | Implement only enough code to pass | Must | Green code does not add untested features, premature options, or unrelated refactors |
| RF-08 | Verify green and regression surface | Must | New test passes, existing tests pass, and output is pristine |
| RF-09 | Refactor only after green | Must | Cleanup preserves test behavior and keeps the suite green |
| RF-10 | Detect and stop testing anti-patterns | Should | Mock assertions, test-only production methods, and incomplete mocks are flagged |
| RF-11 | Support bug-fix workflow | Must | A bug fix starts with a failing test that reproduces the bug |
| RF-12 | Enforce final checklist | Should | Completion requires watched red, minimal green, passing suite, real-code tests, and edge/error coverage |

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-------------|----------|------------|
| Correctness | Tests must prove they catch missing behavior before implementation | `skills/test-driven-development/SKILL.md` | 🟢 |
| Maintainability | Refactoring is allowed only while preserving green tests | `skills/test-driven-development/SKILL.md` | 🟢 |
| Testability | Code that is hard to test indicates unclear design or coupling | `skills/test-driven-development/SKILL.md` | 🟢 |
| Reliability | Existing tests must remain green after new implementation | `skills/test-driven-development/SKILL.md` | 🟢 |
| Safety | Test-only production APIs are forbidden | `skills/test-driven-development/testing-anti-patterns.md` | 🟢 |

## Acceptance Criteria

```gherkin
Scenario: Production code is blocked without a failing test
Given a feature implementation is requested
When no test has been written and observed failing
Then no production code is written
And the agent writes the minimal behavior test first
```

```gherkin
Scenario: Test fails for the correct reason
Given a new test has been written
When the test is run
Then it fails because the behavior is missing
And setup errors, typos, and already-passing tests are corrected before implementation
```

```gherkin
Scenario: Minimal green implementation
Given a test fails correctly
When production code is written
Then only the behavior required by the test is implemented
And unrelated features and refactors are deferred
```

```gherkin
Scenario: Refactor preserves behavior
Given all tests are green
When code is cleaned up
Then all tests remain green
And no new behavior is introduced during refactoring
```

```gherkin
Scenario: Mock behavior is not tested
Given a test uses a mock
When assertions target only the mock artifact
Then the test is rejected
And the agent tests real behavior or removes the unnecessary mock
```

## Priority (MoSCoW)

| Requirement | MoSCoW | Justification |
|-------------|--------|---------------|
| Failing test before production code | Must | Core iron law of the skill |
| Verify red for correct reason | Must | Without observed red, the test may prove nothing |
| Minimal green implementation | Must | Prevents untested behavior and overengineering |
| Verify green and regression surface | Must | Confirms implementation did not break existing behavior |
| Refactor after green | Must | Preserves behavioral safety during cleanup |
| Mock anti-pattern gates | Should | Important for test quality, but not every test uses mocks |
| Exception handling for prototypes/generated/config | Could | Allowed only with human permission |

## Code Traceability

| File | Section | Coverage |
|------|---------|----------|
| `skills/test-driven-development/SKILL.md` | Iron Law, Red-Green-Refactor, Verification Checklist | 🟢 |
| `skills/test-driven-development/testing-anti-patterns.md` | Mock behavior, test-only methods, incomplete mocks | 🟢 |
| `_reversa_sdd/flowcharts/test-driven-development.md` | TDD cycle and phase gates | 🟢 |
