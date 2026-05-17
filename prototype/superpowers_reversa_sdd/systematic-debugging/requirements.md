# Systematic Debugging — Requirements

> Skill for handling bugs, test failures, build failures, performance problems, integration issues, and unexpected behavior through disciplined root-cause investigation before any fix attempt.

## Overview

Systematic Debugging prevents random fixes, quick patches, and symptom treatment by requiring root-cause investigation before implementation. 🟢

The unit defines a four-phase debugging workflow: root cause investigation, pattern analysis, hypothesis testing, and implementation with a failing test. 🟢

It also provides supporting techniques for backward root-cause tracing, defense-in-depth validation, and condition-based waiting for flaky async behavior. 🟢

## Responsibilities

- Trigger whenever a technical issue appears: test failure, production bug, unexpected behavior, performance problem, build failure, or integration issue. 🟢
- Block fixes until Phase 1 root-cause investigation is complete. 🟢
- Require consistent reproduction or additional evidence gathering before diagnosis. 🟢
- Require comparison against working examples and reference implementations before applying a pattern. 🟢
- Require a single explicit hypothesis and the smallest possible test of that hypothesis. 🟢
- Require a failing test case before implementing the root-cause fix. 🟢
- Stop after three failed fix attempts and question the architecture before continuing. 🟢
- Use root-cause tracing when the failure appears deep in a call stack. 🟢
- Add defense-in-depth validation after invalid data root causes are found. 🟢
- Replace arbitrary async waits with condition-based waits unless actual timing behavior is being tested. 🟢

## Business Rules

- **No Fix Without Root Cause Rule:** No fix may be proposed or implemented until root-cause investigation has been completed. 🟢
- **Four-Phase Order Rule:** The workflow must proceed in order: root cause investigation, pattern analysis, hypothesis and testing, implementation. 🟢
- **Evidence Before Diagnosis Rule:** If an issue is not reproducible, the controller must gather more data rather than guess. 🟢
- **Multi-Component Boundary Rule:** In multi-component systems, diagnostic instrumentation must be added at component boundaries before proposing fixes. 🟢
- **Backward Trace Rule:** When an error appears deep in the stack, trace backward through callers and data flow until the original trigger is found. 🟢
- **Working Example Rule:** Similar working code or complete reference implementations must be studied before adapting a pattern. 🟢
- **Single Hypothesis Rule:** Test one clearly stated hypothesis at a time with the smallest possible change. 🟢
- **Failing Test First Rule:** Phase 4 requires a failing reproduction test before the fix is implemented. 🟢
- **Single Fix Rule:** Implementation addresses the identified root cause with one change at a time and avoids bundled refactors. 🟢
- **Three-Failure Architecture Rule:** After three failed fix attempts, the workflow stops and questions whether the underlying architecture or pattern is wrong. 🟢
- **No-Root-Cause Exception Rule:** If investigation shows an environmental, timing-dependent, or external cause, document the investigation and add appropriate handling, monitoring, or logging. 🟢
- **Condition Waiting Rule:** Flaky tests should wait for the actual condition being asserted rather than using guessed sleeps. 🟢

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| RF-01 | Detect technical issue contexts and activate systematic debugging | Must | Test failures, bugs, unexpected behavior, performance problems, build failures, and integration issues enter this workflow |
| RF-02 | Enforce Phase 1 before any fix | Must | The controller refuses to propose fixes until errors, reproduction, recent changes, evidence, and data flow have been investigated |
| RF-03 | Read and preserve diagnostic details | Must | Error messages, stack traces, file paths, line numbers, warnings, and error codes are captured before analysis proceeds |
| RF-04 | Establish reproduction or gather more data | Must | Reliable reproduction is documented, or additional instrumentation is added when reproduction is inconsistent |
| RF-05 | Inspect recent changes | Must | Git diffs, recent commits, dependency changes, configuration changes, and environment differences are checked |
| RF-06 | Instrument multi-component boundaries | Must | For each relevant boundary, inputs, outputs, environment/config propagation, and state are logged or inspected |
| RF-07 | Trace bad values backward through call chains | Must | Deep-stack failures identify where the invalid value or event originated rather than fixing only the symptom location |
| RF-08 | Compare broken behavior to working examples | Must | Similar working code or complete reference implementations are read and differences are listed |
| RF-09 | Form one explicit hypothesis at a time | Must | Each hypothesis states "I think X is the root cause because Y" and is tested independently |
| RF-10 | Test hypotheses minimally | Must | The test changes one variable at a time and avoids stacking multiple speculative fixes |
| RF-11 | Create failing test or reproduction before fix | Must | Phase 4 starts with an automated failing test or the simplest possible reproduction script |
| RF-12 | Implement a single root-cause fix | Must | The fix targets the confirmed root cause without unrelated refactoring or "while here" changes |
| RF-13 | Verify the fix and regression surface | Must | The failing test now passes, relevant broader tests pass, and the issue is demonstrably resolved |
| RF-14 | Stop after three failed fixes | Must | After three failed attempts, the controller stops normal fixing and raises an architecture or pattern discussion |
| RF-15 | Support no-root-cause outcomes | Should | Environmental, timing-dependent, or external findings are documented with handling and future observability |
| RF-16 | Add defense-in-depth after invalid data bugs | Should | Entry validation, business validation, environment guards, and debug instrumentation are mapped and tested where applicable |
| RF-17 | Replace arbitrary waits with condition waits | Should | Async/flaky tests wait for events, state, counts, files, or explicit predicates with timeout errors |
| RF-18 | Integrate with TDD and verification skills | Should | The failing test uses test-driven-development guidance and final claims use verification-before-completion |

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-------------|----------|------------|
| Correctness | Root cause must be found before fixes to avoid symptom patches | `skills/systematic-debugging/SKILL.md:16` | 🟢 |
| Process integrity | Debugging phases must be completed in order | `skills/systematic-debugging/SKILL.md:46` | 🟢 |
| Observability | Multi-component failures require boundary diagnostics before fixes | `skills/systematic-debugging/SKILL.md:74` | 🟢 |
| Maintainability | Fixes must be minimal and avoid bundled refactoring | `skills/systematic-debugging/SKILL.md:181` | 🟢 |
| Testability | A failing test or simplest reproduction must exist before fixing | `skills/systematic-debugging/SKILL.md:171` | 🟢 |
| Reliability | Condition-based waiting replaces arbitrary delays in flaky async tests | `skills/systematic-debugging/condition-based-waiting.md:3` | 🟢 |
| Safety | Three failed fixes trigger architecture review instead of another speculative patch | `skills/systematic-debugging/SKILL.md:199` | 🟢 |
| Portability | Exact tooling for diagnostics depends on language, framework, and runtime | `skills/systematic-debugging/SKILL.md:74` | 🟡 |

## Acceptance Criteria

```gherkin
Scenario: Root cause blocks premature fix
Given a test failure has occurred
When Phase 1 root-cause investigation has not been completed
Then no fix is proposed
And error details, reproduction steps, recent changes, and data flow evidence are gathered
```

```gherkin
Scenario: Multi-component issue requires instrumentation
Given a failure crosses component boundaries
When the cause is not yet localized
Then diagnostics are added at every relevant boundary
And the evidence identifies which component breaks before any fix is attempted
```

```gherkin
Scenario: Deep-stack failure is traced to source
Given an error appears far below the original caller
When root-cause tracing is applied
Then the controller follows callers and value propagation backward
And fixes the original trigger instead of only the immediate symptom
```

```gherkin
Scenario: Hypothesis testing uses one variable
Given Phase 2 pattern analysis is complete
When a hypothesis is formed
Then it states the suspected root cause and reason
And the controller tests the smallest possible change without combining unrelated fixes
```

```gherkin
Scenario: Implementation requires failing reproduction
Given a root cause has been confirmed
When Phase 4 starts
Then a failing automated test or minimal reproduction exists before the fix
And the implemented fix addresses only the confirmed root cause
```

```gherkin
Scenario: Three failed fixes stop normal debugging
Given three fix attempts have failed
When another patch seems tempting
Then the controller stops
And raises an architecture or pattern discussion before attempting more fixes
```

```gherkin
Scenario: Flaky wait is replaced by condition polling
Given a test uses an arbitrary timeout while waiting for async completion
When the timeout is not testing timing behavior
Then the test waits for the actual event, state, count, file, or predicate
And includes a timeout with a clear failure message
```

## Priority (MoSCoW)

| Requirement | MoSCoW | Justification |
|-------------|--------|---------------|
| No fix before root cause | Must | This is the explicit iron law and core purpose of the skill |
| Four-phase debugging order | Must | The phase sequence defines the operational contract |
| Reproduction and evidence gathering | Must | Without evidence, the workflow degenerates into guessing |
| Single hypothesis and minimal test | Must | Isolates cause and avoids stacked speculative changes |
| Failing test before fix | Must | Ensures the fix is proven against the observed failure |
| Stop after three failed fixes | Must | Prevents endless patching when the architecture may be wrong |
| Root-cause tracing | Should | Required when failures appear deep in the stack, but not every bug has that shape |
| Defense-in-depth validation | Should | Strongly recommended after invalid data root causes, but not every issue involves invalid data |
| Condition-based waiting | Should | Required for flaky async tests, but not relevant to every debugging session |
| Real-world impact metrics | Could | Useful supporting evidence, not required to execute the workflow |

## Code Traceability

| File | Function / Section | Coverage |
|------|--------------------|----------|
| `skills/systematic-debugging/SKILL.md` | Iron Law, When to Use, Four Phases, Red Flags, Common Rationalizations, Supporting Techniques | 🟢 |
| `skills/systematic-debugging/root-cause-tracing.md` | Backward tracing process, stack trace instrumentation, pollution finding, source fix principle | 🟢 |
| `skills/systematic-debugging/defense-in-depth.md` | Entry validation, business validation, environment guards, debug instrumentation | 🟢 |
| `skills/systematic-debugging/condition-based-waiting.md` | Condition polling pattern, timeout rules, arbitrary timeout exceptions | 🟢 |
| `_reversa_sdd/code-analysis.md` | System-level classification as a development discipline and four-phase debugging summary | 🟡 |
| `_reversa_sdd/state-machines.md` | Trigger mapping from failures/errors into systematic-debugging | 🟡 |
| `_reversa_sdd/permissions.md` | Debugging phases treated as mandatory process gates | 🟡 |
