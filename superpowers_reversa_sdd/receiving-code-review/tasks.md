# Receiving Code Review, Tasks

> Implementation tasks for the review-feedback intake workflow.

## Prerequisites

- [ ] Access to full review feedback.
- [ ] Access to relevant codebase files and tests.
- [ ] Ability to run targeted verification commands.

## Tasks

### Intake and Clarification

- [ ] T-01, Read complete feedback before responding
  - Origin: `skills/receiving-code-review/SKILL.md` — Response Pattern
  - Acceptance: All review items are listed before action starts
  - Confidence: 🟢

- [ ] T-02, Split feedback into atomic items and classify source
  - Origin: `skills/receiving-code-review/SKILL.md` — Source-Specific Handling
  - Acceptance: Each item has a source type and clear/unclear status
  - Confidence: 🟢

- [ ] T-03, Stop and ask if any item is unclear
  - Origin: `skills/receiving-code-review/SKILL.md` — Handling Unclear Feedback
  - Acceptance: No implementation begins while unresolved ambiguity exists
  - Confidence: 🟢

### Verification

- [ ] T-04, Verify each clear suggestion against current code
  - Origin: `skills/receiving-code-review/SKILL.md` — VERIFY step
  - Acceptance: Relevant code/tests/docs are checked before acceptance
  - Confidence: 🟢

- [ ] T-05, Check compatibility, regressions, and reason for current implementation
  - Origin: `skills/receiving-code-review/SKILL.md` — External reviewer checklist
  - Acceptance: Agent can explain whether the suggestion fits this codebase
  - Confidence: 🟢

- [ ] T-06, Run YAGNI usage search for "proper implementation" requests
  - Origin: `skills/receiving-code-review/SKILL.md` — YAGNI Check
  - Acceptance: Unused requested feature work is challenged or removed by decision
  - Confidence: 🟢

### Response and Implementation

- [ ] T-07, Accept correct feedback with concise technical acknowledgment
  - Origin: `skills/receiving-code-review/SKILL.md` — Acknowledging Correct Feedback
  - Acceptance: Response states what changed without performative agreement
  - Confidence: 🟢

- [ ] T-08, Push back on incorrect feedback with evidence
  - Origin: `skills/receiving-code-review/SKILL.md` — When To Push Back
  - Acceptance: Pushback references code, tests, compatibility, or prior decisions
  - Confidence: 🟢

- [ ] T-09, Implement accepted items one at a time
  - Origin: `skills/receiving-code-review/SKILL.md` — Implementation Order
  - Acceptance: Each item is fixed and tested before the next complex item
  - Confidence: 🟢

- [ ] T-10, Reply to GitHub inline review comments in-thread when applicable
  - Origin: `skills/receiving-code-review/SKILL.md` — GitHub Thread Replies
  - Acceptance: Inline review replies are posted via the review comment thread
  - Confidence: 🟢

### Testing

- [ ] TT-01, Ambiguous multi-item review blocks all implementation
  - Verification: Provide six review items with two unclear; agent asks before changes
  - Confidence: 🟢

- [ ] TT-02, External incorrect suggestion receives technical pushback
  - Verification: Reviewer suggests removing required compatibility code; agent cites evidence
  - Confidence: 🟢

- [ ] TT-03, Correct feedback is implemented and verified
  - Verification: Agent changes one item, runs targeted test, reports concrete fix
  - Confidence: 🟢

- [ ] TT-04, Unused feature request triggers YAGNI question
  - Verification: Search finds no callers; agent asks whether to remove instead
  - Confidence: 🟢

## Implementation Order

1. Intake and ambiguity detection.
2. Technical verification.
3. YAGNI gate for unused implementation requests.
4. Response decision.
5. One-item-at-a-time implementation and verification.

## Gaps Pending Validation (🔴)

- Exact GitHub inline reply command depends on repository owner/name, PR number, comment ID, and authenticated CLI/API access.
- Some external review claims may require domain context unavailable in the current checkout.
