# ADR-0009: Grilling sessions have no maximum question cap

> Status: ACCEPTED
> Date: 2026-04-28 (`.out-of-scope/question-limits.md`, issue #44)
> Confidence: 🟢 CONFIRMED — explicit `.out-of-scope` entry

---

## Context

Early in the design of `grill-me`, `grill-with-docs`, and `triage`, contributors proposed adding a question cap (e.g., "ask no more than 10 questions") to prevent sessions from becoming exhausting. The reasoning was user experience: users might feel overwhelmed by an open-ended interrogation.

Issue #44 explicitly evaluated this proposal and rejected it.

## Decision

All grilling sessions are open-ended — no maximum question count. A session ends when:
- The agent has sufficient information to produce a correct and complete output
- The user explicitly signals they are done (e.g., "that's all", "enough questions")

Additionally: if a question can be answered by exploring the codebase, the agent explores instead of asking, which naturally reduces question count without an artificial cap.

## Alternatives considered

**Option A — Hard cap (e.g., N=10 questions)**: Prevents session fatigue. Rejected: arbitrary caps produce incomplete specs. An issue with 15 necessary clarifications would be underspecified at question 10.

**Option B — Soft cap with user override**: Suggest ending at N but allow more. Rejected: the suggestion itself creates social pressure to stop early, producing the same defect as the hard cap.

**Option C — Adaptive cap based on complexity**: Estimate issue complexity and scale the cap. Rejected: complexity estimation in natural language is unreliable; still risks cutting off necessary questions.

**Option D — Current approach (no cap, codebase exploration first)**: Accepted.

## Consequences

**Positive:**
- No artificially incomplete specs
- Agent continues until it has real confidence in the output
- Codebase exploration reduces question count organically

**Negative:**
- Sessions can be long for complex requirements — user discipline required
- No automated termination means a poorly calibrated agent could loop on irrelevant questions (mitigated by natural language judgment)
- Users who want a quick answer may find grilling sessions frustrating compared to form-based tools
