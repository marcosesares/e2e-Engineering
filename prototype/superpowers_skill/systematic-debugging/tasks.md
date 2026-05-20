# Systematic Debugging — Implementation Tasks

> Tasks to reimplement the systematic debugging behavior as an operational agent skill.

## Prerequisites

- [ ] The agent runtime can detect or be invoked for technical issue contexts. Confidence: 🟢
- [ ] The agent has read access to relevant source files, tests, recent diffs, logs, and command output. Confidence: 🟡
- [ ] Test execution or minimal reproduction is available for the target project. Confidence: 🟡
- [ ] Related TDD and verification workflows are available or equivalent behavior is implemented locally. Confidence: 🟢

## Tasks

- [ ] T-01, Implement technical-issue trigger detection
  - Origin in legacy: `skills/systematic-debugging/SKILL.md`
  - Criteria done: Bugs, test failures, build failures, performance issues, integration issues, and unexpected behavior route into systematic debugging before fixes.
  - Confidence: 🟢

- [ ] T-02, Enforce the no-fix-before-root-cause gate
  - Origin in legacy: `skills/systematic-debugging/SKILL.md`
  - Criteria done: The controller refuses to propose or implement fixes until Phase 1 evidence is collected and reviewed.
  - Confidence: 🟢

- [ ] T-03, Capture diagnostic evidence
  - Origin in legacy: `skills/systematic-debugging/SKILL.md`
  - Criteria done: Error messages, warnings, stack traces, file paths, line numbers, error codes, reproduction steps, and recent changes are recorded before diagnosis.
  - Confidence: 🟢

- [ ] T-04, Add multi-component boundary investigation
  - Origin in legacy: `skills/systematic-debugging/SKILL.md`
  - Criteria done: For each relevant boundary, the controller records incoming data, outgoing data, environment/config propagation, and state before localizing the failure.
  - Confidence: 🟢

- [ ] T-05, Implement backward root-cause tracing support
  - Origin in legacy: `skills/systematic-debugging/root-cause-tracing.md`
  - Criteria done: Deep-stack failures are traced backward through callers and data flow until the original trigger is identified.
  - Confidence: 🟢

- [ ] T-06, Implement pattern analysis before adaptation
  - Origin in legacy: `skills/systematic-debugging/SKILL.md`
  - Criteria done: Similar working code and reference implementations are read fully, differences are listed, and dependencies are documented before a fix pattern is applied.
  - Confidence: 🟢

- [ ] T-07, Implement single-hypothesis testing
  - Origin in legacy: `skills/systematic-debugging/SKILL.md`
  - Criteria done: Each hypothesis is written in explicit root-cause form and tested with the smallest practical change or observation.
  - Confidence: 🟢

- [ ] T-08, Require failing test or minimal reproduction before implementation
  - Origin in legacy: `skills/systematic-debugging/SKILL.md`
  - Criteria done: Phase 4 cannot proceed until an automated failing test or minimal reproduction demonstrates the confirmed root cause.
  - Confidence: 🟢

- [ ] T-09, Implement single root-cause fix discipline
  - Origin in legacy: `skills/systematic-debugging/SKILL.md`
  - Criteria done: The implementation changes only the confirmed root cause and excludes unrelated refactors or bundled speculative fixes.
  - Confidence: 🟢

- [ ] T-10, Track failed fix attempts and escalate architecture concerns
  - Origin in legacy: `skills/systematic-debugging/SKILL.md`
  - Criteria done: After three failed fix attempts, the controller stops normal fixing and asks whether the architecture or pattern is wrong.
  - Confidence: 🟢

- [ ] T-11, Add defense-in-depth validation behavior
  - Origin in legacy: `skills/systematic-debugging/defense-in-depth.md`
  - Criteria done: Invalid data bugs produce entry validation, business validation, environment guards, and diagnostic instrumentation where applicable.
  - Confidence: 🟢

- [ ] T-12, Add condition-based waiting guidance
  - Origin in legacy: `skills/systematic-debugging/condition-based-waiting.md`
  - Criteria done: Flaky async tests wait for events, state, counts, files, or predicates with timeout errors instead of guessed sleeps.
  - Confidence: 🟢

- [ ] T-13, Integrate verification before completion
  - Origin in legacy: `skills/systematic-debugging/SKILL.md`
  - Criteria done: The original failing case passes, relevant broader tests pass, and the agent reports exact verification evidence before claiming completion.
  - Confidence: 🟢

## Test Tasks

- [ ] TT-01, Verify premature fix requests are blocked until root-cause evidence exists.
- [ ] TT-02, Verify a multi-component issue causes boundary diagnostics before fix proposals.
- [ ] TT-03, Verify a deep-stack symptom is traced to the original caller or bad value source.
- [ ] TT-04, Verify refuted hypotheses do not accumulate speculative changes.
- [ ] TT-05, Verify Phase 4 requires a failing test or minimal reproduction.
- [ ] TT-06, Verify three failed fix attempts trigger architecture escalation.
- [ ] TT-07, Verify arbitrary async sleeps are replaced with condition polling unless timing is the behavior under test.

## Data Migration Tasks

- [ ] TM-01, No persisted legacy data migration is required; this unit is a process skill expressed as Markdown instructions. Confidence: 🟢

## Suggested Order

1. Implement the trigger and root-cause gate first because all other behavior depends on entering the correct workflow. 🟢
2. Add evidence capture, reproduction handling, recent-change inspection, and boundary instrumentation. 🟢
3. Add backward tracing and pattern analysis so diagnosis can move from symptom to source. 🟢
4. Add hypothesis testing, failing-test enforcement, minimal fix discipline, and verification. 🟢
5. Add specialized supporting techniques: defense in depth and condition-based waiting. 🟢
6. Add failed-attempt tracking and architecture escalation last because it spans the full workflow. 🟢

## Pending Gaps (🔴)

- 🟢 Reimplementation should persist interrupted debugging evidence to a project-local file-backed evidence log/checkpoint model.
- 🔴 Runtime-specific instrumentation libraries and commands must be selected per implementation target.
- 🟢 The evidence log/checkpoint model should record command, exit code, timestamp, summary, and relevant file/test references. Hypotheses and fix attempts can reference those evidence entries.
