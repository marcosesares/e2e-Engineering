# Systematic Debugging — Technical Design

> Operational design for the debugging discipline that must run before any bug fix, test-failure fix, build-failure fix, performance fix, or unexpected-behavior fix.

## Interface

| Input | Type | Required | Description | Confidence |
|-------|------|----------|-------------|------------|
| Technical issue signal | Bug, failing test, build failure, integration issue, performance problem, unexpected behavior | Yes | Trigger condition for activating the workflow | 🟢 |
| Error evidence | Messages, warnings, stack traces, file paths, line numbers, error codes | Yes | Raw diagnostic material that must be read before proposing fixes | 🟢 |
| Reproduction context | Steps, environment, recent changes, observed consistency | Yes | Determines whether diagnosis can proceed or more data is needed | 🟢 |
| Working examples | Similar working code, reference implementation, known-good pattern | Yes when applicable | Baseline for pattern comparison | 🟢 |
| Hypothesis | Text statement | Yes | Single statement of suspected root cause and evidence | 🟢 |
| Failing test or minimal reproduction | Automated test or script | Yes before implementation | Proof that the confirmed root cause is reproducible | 🟢 |

| Output | Description | Confidence |
|--------|-------------|------------|
| Root-cause finding | The source of the failure, not just the symptom location | 🟢 |
| Minimal fix plan | One change targeted at the confirmed root cause | 🟢 |
| Verification result | Evidence that the failing case now passes and relevant regressions are covered | 🟢 |
| Architecture escalation | Required discussion after three failed fix attempts | 🟢 |

## Main Flow

1. Detect a technical issue and enter the workflow before proposing any fix. Evidence: `skills/systematic-debugging/SKILL.md`. 🟢
2. Run Phase 1 root-cause investigation: read errors fully, reproduce consistently, inspect recent changes, instrument component boundaries, and trace data flow backward when the symptom is deep in the stack. 🟢
3. If reproduction is inconsistent or evidence is incomplete, gather more data instead of guessing. 🟢
4. Run Phase 2 pattern analysis by finding similar working code, reading reference implementations completely, listing differences, and identifying dependencies. 🟢
5. Run Phase 3 by writing one explicit hypothesis and testing it with the smallest possible change. 🟢
6. If the hypothesis is refuted, form a new hypothesis rather than layering another fix on top. 🟢
7. Run Phase 4 only after the root cause is confirmed: create a failing test or minimal reproduction, implement one root-cause fix, and verify the result. 🟢
8. If three fix attempts fail, stop normal fixing and raise an architecture or pattern discussion. 🟢

## Alternative Flows

- **Non-reproducible issue:** The controller adds diagnostics or collects more evidence before diagnosis. 🟢
- **Multi-component issue:** The controller instruments every relevant boundary, including input, output, environment/config propagation, and state. 🟢
- **Deep-stack issue:** The controller applies backward tracing until the original trigger is found, then fixes at the source. 🟢
- **Invalid data root cause:** The controller adds defense-in-depth validation at entry, business logic, environment guard, and diagnostic layers. 🟢
- **Flaky async test:** The controller replaces arbitrary sleeps with condition-based waiting unless the test is specifically about timing behavior. 🟢
- **Environmental or external root cause:** The controller documents the investigation and adds handling, logging, monitoring, retry, timeout, or clearer error behavior. 🟢

## Dependencies

- `skills/systematic-debugging/root-cause-tracing.md` provides the backward tracing technique for deep-stack symptoms. 🟢
- `skills/systematic-debugging/defense-in-depth.md` provides the multi-layer validation pattern after invalid data bugs. 🟢
- `skills/systematic-debugging/condition-based-waiting.md` provides the polling pattern for async and flaky tests. 🟢
- `superpowers:test-driven-development` is used for Phase 4 failing-test construction. 🟢
- `superpowers:verification-before-completion` is used before claiming that the fix is complete. 🟢
- Exact language, test runner, logging, and instrumentation APIs depend on the target project. 🟡

## Design Decisions Identified

| Decision | Evidence | Confidence |
|----------|----------|------------|
| Root-cause investigation is a hard gate before fixes | `skills/systematic-debugging/SKILL.md` | 🟢 |
| Debugging is modeled as four ordered phases | `skills/systematic-debugging/SKILL.md`, `_reversa_sdd/flowcharts/systematic-debugging.md` | 🟢 |
| Hypothesis testing must isolate one variable | `skills/systematic-debugging/SKILL.md` | 🟢 |
| Implementation requires a failing test or minimal reproduction first | `skills/systematic-debugging/SKILL.md` | 🟢 |
| Repeated failed fixes are treated as architecture evidence | `skills/systematic-debugging/SKILL.md` | 🟢 |
| Condition waiting is preferred over arbitrary timeout guessing | `skills/systematic-debugging/condition-based-waiting.md` | 🟢 |

## Internal State

The legacy skill does not define a persisted data model. It maintains process state through the conversation and work artifacts: current phase, collected evidence, reproduction status, working-example comparison, current hypothesis, fix-attempt count, failing test, and verification result. 🟢

For reimplementation, persist evidence to a project-local file-backed evidence log/checkpoint model. Conversation state remains the live working context, but the portable audit source should record command, exit code, timestamp, summary, and relevant file/test references. 🟢

## Observability

- Phase 1 requires preserving raw diagnostic details, including errors, warnings, stack traces, file paths, line numbers, and codes. 🟢
- Multi-component investigation requires boundary logging or inspection at every layer. 🟢
- Deep-stack tracing may add temporary stack trace logging before dangerous operations. 🟢
- Defense-in-depth validation includes debug instrumentation as the fourth layer. 🟢
- The exact log sink and retention policy are not specified by the legacy skill. 🟡

## Risks and Gaps

- 🟢 Reimplementation should define a small file-backed evidence/checkpoint schema for command, exit code, timestamp, summary, and file/test references.
- 🔴 The skill does not define project-specific diagnostics for each language, runtime, framework, or CI provider.
- 🟡 The workflow assumes the agent can access source history, tests, logs, and enough runtime context to gather evidence.
- 🟡 The three-failed-fixes threshold is explicit, but the definition of a distinct "fix attempt" can require judgment in complex changes.

## Reviewer Validation Addendum

- Question 7 answered: debugging evidence should be persisted to files in the reimplementation. Host checkpoint mechanisms may mirror the same fields, but the portable source of truth should be file-backed.
