# Verification Before Completion — Technical Design

## Interface

| Input | Type | Required | Description | Confidence |
|-------|------|----------|-------------|------------|
| Intended claim | Status statement | Yes | Claim the agent is about to make | 🟢 |
| Verification command | Shell/tool command or checklist | Yes | Evidence source for the claim | 🟢 |
| Command output | stdout/stderr/exit code | Yes | Proof material that must be read | 🟢 |
| Requirements checklist | Plan, spec, or acceptance criteria | Conditional | Needed for requirements-complete claims | 🟢 |

| Output | Description | Confidence |
|--------|-------------|------------|
| Supported claim | Claim with evidence attached | 🟢 |
| Actual status report | Failure or partial status when evidence does not support success | 🟢 |

## Main Flow

1. Detect an upcoming success, completion, fixed, passing, ready, commit, PR, or positive status claim. 🟢
2. Identify the command or checklist that proves that exact claim. 🟢
3. Run the full verification freshly. 🟢
4. Read full output, exit code, and failure counts. 🟢
5. If output proves the claim, state the claim with evidence. 🟢
6. If output does not prove it, report the actual status and next required action. 🟢

## Alternative Flows

- **Regression test claim:** Run pass, revert fix, observe fail, restore fix, observe pass. 🟢
- **Build claim:** Run build, not only lint. 🟢
- **Delegated work claim:** Inspect VCS diff and verify changes independently. 🟢
- **Requirements claim:** Re-read the plan/spec and check each item. 🟢

## Dependencies

- Verification commands are project-specific. 🟡
- The agent must have permission to run proof commands. 🟡
- Requirements source must be available for scope-completion claims. 🟢

## Design Decisions Identified

| Decision | Evidence | Confidence |
|----------|----------|------------|
| Evidence must precede claims | `skills/verification-before-completion/SKILL.md` | 🟢 |
| Partial checks are insufficient for broad claims | `skills/verification-before-completion/SKILL.md` | 🟢 |
| Agent reports require independent verification | `skills/verification-before-completion/SKILL.md` | 🟢 |

## Risks and Gaps

- 🟢 Reimplementation should store verification evidence in a project-local file-backed evidence log/checkpoint model with command, exit code, timestamp, summary, and relevant file/test references.
- 🟡 Some projects have slow or unavailable full verification commands, requiring scoped claims.

## Reviewer Validation Addendum

- Question 7 answered: verification evidence should be persisted to files in the reimplementation. Host checkpoint mechanisms can mirror the evidence, but file-backed records are the portable source of truth.
