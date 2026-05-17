# ADR-0004: `grill-with-docs` uses one-question-at-a-time conversational grilling

> Status: ACCEPTED
> Date: 2026-04-28 (commit `839025a`)
> Confidence: 🟢 CONFIRMED — invariant explicitly stated in `grill-with-docs/SKILL.md` and `domain.md`

---

## Context

`grill-with-docs` (and related grilling skills: `grill-me`, `triage`) need to extract structured requirements from a user. Two interaction styles were possible:

1. **Form-style**: present all required fields upfront, user fills them in batch
2. **Conversational**: ask one question at a time, branch based on answers

The form-style approach produces faster initial capture but generates low-quality answers — users fill in minimal text to complete the form rather than thinking through the implications of each question.

The conversational approach takes longer but surfaces constraints, edge cases, and business rules that users would not think to volunteer unprompted.

## Decision

All grilling sessions ask exactly one question at a time. No batch questioning. No maximum question cap — the session runs until the agent has enough information to produce a correct output.

Additionally: if a question can be answered by exploring the codebase, the skill should explore instead of asking.

## Alternatives considered

**Option A — Batch questions (2-3 at a time)**: Compromise between speed and depth. Rejected: two questions in one message causes users to answer only the last one (cognitive load heuristic).

**Option B — No question cap with form scaffold**: Ask one at a time but limit to N questions. Rejected explicitly in `.out-of-scope/question-limits.md` (issue #44) — arbitrary caps produce incomplete specs.

**Option C — Current approach (one question, no cap, codebase-first)**: Accepted. Validated in issue #44.

## Consequences

**Positive:**
- Richer outputs — users think through each question fully before moving to the next
- Natural branching — agent can pivot based on previous answers
- Codebase exploration reduces redundant questions

**Negative:**
- Sessions can be long for complex requirements (no cap)
- Users accustomed to form-based tools may find the pace slow
- No cap means an agent in a confused state could loop indefinitely (mitigated by natural language judgment)
