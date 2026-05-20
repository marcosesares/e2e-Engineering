# Test-Driven Development — Implementation Tasks

## Prerequisites

- [ ] The target project has, or can accept, a test runner. Confidence: 🟡
- [ ] The implementation request can be expressed as observable behavior. Confidence: 🟢
- [ ] The agent can run focused tests and broader regression tests. Confidence: 🟡

## Tasks

- [ ] T-01, Detect TDD-required work
  - Origin in legacy: `skills/test-driven-development/SKILL.md`
  - Criteria done: Features, bug fixes, refactors, and behavior changes enter the TDD workflow before production edits.
  - Confidence: 🟢

- [ ] T-02, Implement the no-production-code gate
  - Origin in legacy: `skills/test-driven-development/SKILL.md`
  - Criteria done: Production code edits are blocked until a failing test has been written and run.
  - Confidence: 🟢

- [ ] T-03, Implement premature-code deletion handling
  - Origin in legacy: `skills/test-driven-development/SKILL.md`
  - Criteria done: If code was written before the test, the controller removes it and restarts from red.
  - Confidence: 🟢

- [ ] T-04, Create focused behavior-test guidance
  - Origin in legacy: `skills/test-driven-development/SKILL.md`
  - Criteria done: Tests cover one behavior, have clear names, and use real code unless mocks are unavoidable.
  - Confidence: 🟢

- [ ] T-05, Verify red correctly
  - Origin in legacy: `skills/test-driven-development/SKILL.md`
  - Criteria done: Passing tests and setup errors are rejected until the test fails because behavior is missing.
  - Confidence: 🟢

- [ ] T-06, Implement minimal-green discipline
  - Origin in legacy: `skills/test-driven-development/SKILL.md`
  - Criteria done: The controller writes only enough production code to pass the current failing test.
  - Confidence: 🟢

- [ ] T-07, Verify green and regression surface
  - Origin in legacy: `skills/test-driven-development/SKILL.md`
  - Criteria done: New test, relevant existing tests, and pristine output are checked before refactoring.
  - Confidence: 🟢

- [ ] T-08, Implement refactor-after-green loop
  - Origin in legacy: `skills/test-driven-development/SKILL.md`
  - Criteria done: Cleanup happens only after green and is reverted or corrected if tests fail.
  - Confidence: 🟢

- [ ] T-09, Add mock anti-pattern gates
  - Origin in legacy: `skills/test-driven-development/testing-anti-patterns.md`
  - Criteria done: Assertions on mocks, test-only production methods, uninformed mocks, and incomplete mocks are blocked.
  - Confidence: 🟢

- [ ] T-10, Add final TDD checklist
  - Origin in legacy: `skills/test-driven-development/SKILL.md`
  - Criteria done: Completion requires watched red, minimal green, passing tests, real behavior coverage, and edge/error coverage.
  - Confidence: 🟢

## Test Tasks

- [ ] TT-01, Test that production code is blocked before a failing test exists.
- [ ] TT-02, Test that a passing first run is rejected.
- [ ] TT-03, Test that setup errors do not count as red.
- [ ] TT-04, Test that minimal green excludes untested options.
- [ ] TT-05, Test that refactoring cannot change behavior.
- [ ] TT-06, Test that mock-only assertions are rejected.

## Data Migration Tasks

- [ ] TM-01, No data migration is required; this unit is an instruction workflow. Confidence: 🟢

## Suggested Order

1. Implement task classification and the production-code gate. 🟢
2. Add red verification and premature-code deletion handling. 🟢
3. Add minimal-green and green verification behavior. 🟢
4. Add refactor loop and final checklist. 🟢
5. Add mock anti-pattern gates. 🟢

## Pending Gaps (🔴)

- 🔴 Project-specific test commands and framework conventions must be discovered per target repository.
- 🟢 Reimplementation should persist red/green/refactor evidence to the shared project-local evidence log/checkpoint model.
