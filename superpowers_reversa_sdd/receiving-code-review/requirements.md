# Receiving Code Review — Requirements

> Skill for evaluating review feedback before implementing it.

## Overview

Receiving Code Review defines how an agent handles human or external reviewer feedback: read all feedback, understand it, verify it against the codebase, evaluate technical fit, respond with technical reasoning, then implement one item at a time. 🟢

## Responsibilities

- Prevent blind implementation of review suggestions. 🟢
- Require clarification before partial or ambiguous feedback is implemented. 🟢
- Distinguish trusted human feedback from external reviewer suggestions that still require verification. 🟢
- Allow technical pushback when feedback is wrong, incomplete, harmful, or violates YAGNI. 🟢
- Enforce non-performative responses: technical acknowledgment and action instead of praise or gratitude language. 🟢

## Business Rules

- **Verify-Before-Implement Rule:** Every review item must be checked against codebase reality before implementation. 🟢
- **Clarify-First Rule:** If any item in a multi-item review is unclear, stop and ask before implementing any subset. 🟢
- **External-Feedback-Skepticism Rule:** External reviewer feedback is evaluated as a suggestion, not followed as an order. 🟢
- **YAGNI Review Rule:** If a reviewer requests a "proper" implementation for unused code, the agent must check actual usage and ask whether removal is preferred. 🟢
- **No Performative Agreement Rule:** Responses like "You're absolutely right" and broad praise are forbidden. 🟢
- **One-Item Implementation Rule:** Multi-item feedback is implemented in priority order, testing each fix individually. 🟢

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| RF-01 | Read all review feedback before responding | Must | Agent has complete feedback context before action |
| RF-02 | Restate or clarify unclear requirements | Must | Ambiguous review items block implementation until clarified |
| RF-03 | Verify each suggestion against the current codebase | Must | Agent checks whether the suggestion is technically correct for this repo |
| RF-04 | Evaluate compatibility, regressions, and prior decisions | Must | Agent identifies conflicts with existing behavior or human decisions |
| RF-05 | Push back with technical reasoning when feedback is wrong | Must | Response cites code, tests, constraints, or missing context |
| RF-06 | Implement accepted fixes one item at a time | Must | Each fix is independently testable and verified |
| RF-07 | Handle GitHub inline review replies in-thread | Should | Replies use the review comment thread, not top-level PR comments |

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-------------|----------|------------|
| Safety | Avoid implementing harmful review feedback | External review checklist and pushback rules | 🟢 |
| Clarity | Ask specific clarification questions when feedback is unclear | Handling unclear feedback section | 🟢 |
| Traceability | Reference code/tests when accepting or rejecting feedback | Pushback guidance | 🟢 |
| Process Discipline | Fix and test one review item at a time | Implementation order section | 🟢 |

## Acceptance Criteria

```gherkin
Scenario: Feedback is partially unclear
Given review feedback contains six items
And items four and five are ambiguous
When the agent evaluates the feedback
Then the agent asks for clarification before implementing any item
And does not partially implement the clear subset

Scenario: External reviewer suggests unused feature work
Given a reviewer requests a full implementation for an endpoint
When the agent searches the codebase and finds no callers
Then the agent asks whether the unused endpoint should be removed instead

Scenario: Feedback conflicts with existing compatibility requirement
Given a reviewer suggests removing legacy behavior
When codebase evidence shows the behavior is still required
Then the agent pushes back with technical reasoning
And asks the human partner whether to fix or drop compatibility

Scenario: Feedback is correct
Given a review item identifies a real defect
When the agent verifies the defect
Then the agent implements the fix
And reports the concrete change without performative agreement
```

## Priority (MoSCoW)

| Requirement | MoSCoW | Justification |
|-------------|--------|---------------|
| Verify suggestions | Must | Prevents regressions from blind implementation |
| Clarify unclear items | Must | Partial understanding can produce wrong fixes |
| Push back technically | Must | External review can be incorrect or context-poor |
| Implement one item at a time | Must | Preserves debuggability and verification quality |
| GitHub thread replies | Should | Important for PR hygiene, but harness-dependent |

## Code Traceability

| File | Function / Section | Coverage |
|------|--------------------|----------|
| `skills/receiving-code-review/SKILL.md` | Response pattern, forbidden responses, unclear feedback, source-specific handling, YAGNI check, implementation order | 🟢 |
| `_reversa_sdd/domain.md` | Reviewer role and PR review philosophy | 🟡 |
| `_reversa_sdd/permissions.md` | Code reviewer and implementer boundaries | 🟡 |
