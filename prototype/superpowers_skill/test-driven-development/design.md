# Test-Driven Development — Technical Design

## Interface

| Input | Type | Required | Description | Confidence |
|-------|------|----------|-------------|------------|
| Implementation request | Feature, bug fix, refactor, behavior change | Yes | Trigger for TDD workflow | 🟢 |
| Desired behavior | Testable behavior statement | Yes | Basis for the first failing test | 🟢 |
| Test command | Project-specific command | Yes | Used to verify red and green | 🟡 |
| Existing production code | Source files | Conditional | Must be deleted if written before the failing test | 🟢 |
| Human exception approval | Explicit approval | Conditional | Required to skip TDD for prototype, generated code, or config-only changes | 🟢 |

| Output | Description | Confidence |
|--------|-------------|------------|
| Failing test | A focused test that fails for missing behavior | 🟢 |
| Minimal implementation | Production code just sufficient to pass | 🟢 |
| Refactored green code | Cleaned implementation with unchanged behavior | 🟢 |
| Verification evidence | Red run, green run, and broader test result | 🟢 |

## Main Flow

1. Classify the task as feature, bug fix, refactor, or behavior change. 🟢
2. Write one minimal test with a behavior-oriented name and real-code path where practical. 🟢
3. Run the test and verify it fails for the expected reason. 🟢
4. If the test passes, correct or delete it because it is testing existing behavior. 🟢
5. If the test errors, fix test setup until it fails correctly. 🟢
6. Write the simplest production code that passes the test. 🟢
7. Run the target test and relevant existing tests. 🟢
8. Refactor only after tests are green; rerun tests after every cleanup. 🟢
9. Repeat the loop for the next behavior. 🟢

## Alternative Flows

- **Bug fix:** Start with a failing test that reproduces the bug before changing production code. 🟢
- **Premature production code:** Delete the code and start from a failing test. 🟢
- **Hard-to-test behavior:** Treat difficulty as design feedback; simplify interface or use dependency injection. 🟢
- **Mock temptation:** Understand side effects first, mock at the lowest useful level, and avoid asserting on mock artifacts. 🟢
- **Exception request:** Ask the human partner before skipping TDD for prototypes, generated code, or configuration-only changes. 🟢

## Dependencies

- Project test runner and commands are required but not specified by the legacy skill. 🟡
- `skills/test-driven-development/testing-anti-patterns.md` supplies gates for mock and test utility design. 🟢
- `superpowers:systematic-debugging` supplies the root-cause process when a test failure or bug appears. 🟢
- `superpowers:verification-before-completion` supplies final proof rules before claiming work is done. 🟢

## Design Decisions Identified

| Decision | Evidence | Confidence |
|----------|----------|------------|
| TDD is mandatory for production implementation | `skills/test-driven-development/SKILL.md` | 🟢 |
| Red must be observed, not assumed | `skills/test-driven-development/SKILL.md` | 🟢 |
| Code written before test must be deleted | `skills/test-driven-development/SKILL.md` | 🟢 |
| Mocks must not become the behavior under test | `skills/test-driven-development/testing-anti-patterns.md` | 🟢 |
| Refactoring is separated from behavior changes | `skills/test-driven-development/SKILL.md` | 🟢 |

## Internal State

The workflow tracks the current TDD phase, the behavior under test, red-run result, green-run result, refactor status, and final verification checklist. 🟢

The legacy skill does not define a persisted state file for TDD progress. For reimplementation, red/green/refactor evidence should be written to the shared project-local evidence log/checkpoint model used by debugging and verification. 🟢

## Observability

- The red run must be captured with the expected failure message. 🟢
- The green run must be captured with target and relevant broader tests passing. 🟢
- Output should be pristine, with no unaddressed errors or warnings. 🟢
- Exact command output storage is engine-dependent in the legacy skill; the reimplementation should persist command, exit code, timestamp, summary, and relevant file/test references. 🟢

## Risks and Gaps

- 🔴 Project-specific test commands are not defined by the skill.
- 🟢 Red/green evidence persistence should use the file-backed evidence log/checkpoint model validated during review.
- 🟡 Legacy projects without tests require creating a minimal test harness before the normal loop can operate.

## Reviewer Validation Addendum

- Question 7 answered: TDD evidence should be persisted to files in the reimplementation. Conversation state is live context only.
