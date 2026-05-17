# Verification Before Completion — Implementation Tasks

## Prerequisites

- [ ] The implementation can detect or intercept status claims. Confidence: 🟢
- [ ] Proof commands or checklists can be selected for each claim type. Confidence: 🟡

## Tasks

- [ ] T-01, Implement claim detection
  - Origin in legacy: `skills/verification-before-completion/SKILL.md`
  - Criteria done: Completion, fixed, passing, ready, commit, PR, and positive status claims trigger verification.
  - Confidence: 🟢

- [ ] T-02, Implement proof-command selection
  - Origin in legacy: `skills/verification-before-completion/SKILL.md`
  - Criteria done: Tests, lint, build, bug fix, regression, delegated work, and requirements claims map to proper evidence.
  - Confidence: 🟢

- [ ] T-03, Run fresh verification
  - Origin in legacy: `skills/verification-before-completion/SKILL.md`
  - Criteria done: The full command runs in the current context before the claim is made.
  - Confidence: 🟢

- [ ] T-04, Parse and report actual status
  - Origin in legacy: `skills/verification-before-completion/SKILL.md`
  - Criteria done: Exit code, failures, warnings, and unsupported scope are reflected honestly.
  - Confidence: 🟢

- [ ] T-05, Add delegated-work verification
  - Origin in legacy: `skills/verification-before-completion/SKILL.md`
  - Criteria done: Agent reports are checked via diffs and relevant verification before success is reported.
  - Confidence: 🟢

## Test Tasks

- [ ] TT-01, Test that "tests pass" is blocked without test command output.
- [ ] TT-02, Test nonzero verification reports failure instead of success.
- [ ] TT-03, Test lint-only output cannot support build-success claims.
- [ ] TT-04, Test requirements-complete claim requires checklist verification.

## Pending Gaps (🔴)

- 🔴 Evidence persistence format is not specified.
- 🟡 Proof command discovery is project-specific.
