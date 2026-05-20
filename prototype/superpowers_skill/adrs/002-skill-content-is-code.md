# ADR-002: Skill Content Is Code (Behavior-Shaping Content Requires Eval Evidence)

**Status:** ACCEPTED  
**Date:** 2025-11 (estimated from eval harness lift)  
**Updated:** 2026-05-16 (evals/ consolidation phase)

---

## Context

Early PRs attempted to "improve" skills by rewriting red flags, restructuring phases, or rewording process gates. These changes seemed like documentation improvements but actually changed agent behavior at runtime. 

For example:
- Removing a red flag from the TDD skill → agents started skipping phases
- Rewriting "human partner" to "user" → agents adopted different decision-making frames
- Adding new rationalization examples → agents used those examples to justify skipping gates

**Question:** How can maintainers distinguish between safe prose edits and behavior-changing content modifications?

## Decision

**Skills are code.** Modifying skill content changes agent behavior. Any modification to skill text requires:

1. **Before/After Evaluation** — Run the same scenarios against old and new skill; measure behavior differences
2. **Adversarial Testing** — Test whether agents rationalize away the change under pressure
3. **Evidence in PR Description** — Show eval results; document why change improves outcomes
4. **Maintainer Review** — High bar; changes without evidence are rejected

**Non-Negotiable Content** (requires special justification to modify):
- Red Flags tables (extensively tested for preventing agent rationalization)
- Process phase definitions (TDD RED, debugging phases, brainstorming gates)
- "Human partner" terminology (intentional frame, tested with different framings)
- Example rationalizations (these teach agents what NOT to do)

**Safe Modifications** (low friction):
- Typo fixes
- Broken link corrections
- Factual error corrections (e.g., "git push to main" when policy changed to "PR required")
- Clarity edits (reword for readability without changing meaning)

## Alternatives Considered

### A. No Restrictions; Skills Are Just Documentation

**Description:** Treat skills as prose documentation. Reword freely. If it reads better, merge it.

**Why Rejected:** Causes unintended behavior changes. Red flags disappear or are reworded to be less direct. Agents rationalize more easily. 94% PR rejection rate signals system maturity; this would degrade it.

### B. Code Review Only; No Eval Requirement

**Description:** Allow maintainers to approve changes based on code review (diff inspection) without running evals.

**Why Rejected:** Human review is necessary but insufficient. A reworded red flag might "look fine" to a reviewer but cause agents to rationalize in ways humans didn't predict.

### C. Locked Skills; No Modifications Allowed

**Description:** Freeze skills after acceptance. Never modify after initial merge.

**Why Rejected:** Prevents bug fixes (broken links, factual errors, new harness compatibility). Unsustainable long-term.

## How This Decision Shapes the System

### 1. Eval Harness Is Critical

The `evals/` directory is the **canonical source of truth** for skill behavior. Each scenario is a test case showing how agents behave with the skill. PRs modifying skill content must show evals results.

### 2. Skill Tuning is Expensive

Adding a red flag that "seems good" requires running it through multiple adversarial scenarios first. This filters out speculative changes and raises the quality bar.

### 3. Reword Changes Are Fast; Behavior Changes Are Slow

**Fast Path (no eval required):**
- "The quick brown fox" → "the swift brown fox" (synonym, no behavior change)
- "Use this command:" → "Run this command:" (readability, no behavior change)

**Slow Path (eval required):**
- "TDD is recommended" → "TDD is mandatory" (changes enforcement)
- Red flag "Code before test" → "Test before code" (same, but order change signals different priority)

### 4. Skill Content Priority Is Clear

| Priority | Content | Modification Friction |
|---|---|---|
| **Highest** | Red flags, process gates, "human partner" frame | Very high (eval required) |
| **High** | Phase descriptions, decision trees | High (eval required) |
| **Medium** | Examples, alternative approaches | Medium (code review sufficient) |
| **Low** | Prose clarity, typos, links | Low (auto-merge) |

## Implementation Details

### Eval Test Structure

Each scenario runs the skill against an agent and measures:
- Does agent follow the process (skip red flag? violate gate)?
- Does agent understand the intent (ask for clarification or rationalize)?
- Under pressure, does agent maintain discipline or shortcut?

**Example:** TDD red flag "code before test?"

```
Scenario: Agent asked to implement feature quickly (urgency pressure)
Expected: Agent writes test first despite "urgent" framing
If fails: Red flag text is insufficient; needs adversarial pressure test
```

### PR Checklist for Skill Modifications

Before approval:

- [ ] **Change Type:** Prose edit / behavior change / red flag addition / phase modification
- [ ] **If behavior change:** Eval results attached (before/after evals on 3+ scenarios)
- [ ] **If red flag/phase:** Adversarial test results (pressure, time urgency, competing goals)
- [ ] **Justification:** Why is this change better? What regressed in old version?
- [ ] **Scope:** Single skill only (not bundled with unrelated changes)

## Validation

**How we know this works:**
- Zero regressions in agent behavior from 2025-11 (evals/ launch) to present
- PRs that skip eval evidence are rejected without review
- Red flags and gates remain effective at preventing agent rationalization
- New harnesses integrate successfully (skills work consistently across harnesses)

**Signals of success:**
- High PR rejection rate maintained (94%)
- eval results show stable behavior across updates
- Agents trained on superpowers maintain discipline even under pressure

## Risk & Mitigation

| Risk | Probability | Mitigation |
|---|---|---|
| Maintainers approve changes that look good but have unintended side effects | Low | Eval requirement + adversarial testing catches most cases |
| Evals are incomplete and miss edge cases | Medium | Evals deliberately include pressure scenarios (time urgency, competing goals) |
| New harness causes skill behavior to diverge | Medium | Bootstrap autoload test is gated on accepting new harness (skill behavior validated before integration) |

## Related Decisions

- [[ADR-001-zero-dependency-core-design]] — Skills are markdown, no code libraries
- [[ADR-003-mandatory-gates]] — Process gates (TDD, debugging, brainstorming) are non-negotiable
- [[ADR-006-94-percent-rejection-rate]] — High PR rejection rate signals mature quality bar

## Future Reconsideration

This decision should be revisited if:
1. Skill behavior becomes inconsistent across harnesses despite matching text
2. Evals become unmaintainable (too many scenarios, too expensive to run)
3. A major architectural change requires bulk rewriting of multiple skills

**Likelihood of reconsideration:** Low (this decision is core to project maturity)

---

**Confidence:** 🟢 CONFIRMADO
