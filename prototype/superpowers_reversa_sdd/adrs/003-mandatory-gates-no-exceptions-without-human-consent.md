# ADR-003: Mandatory Gates — No Exceptions Without Human Consent

**Status:** ACCEPTED  
**Date:** 2025-01 (estimated from TDD skill maturity)  
**Updated:** 2026-05-16 (systematic debugging skill refinement)

---

## Context

Early agent deployments without mandatory gates showed a clear pattern: agents would rationalize skipping process steps when under time pressure or complexity. For example:

- "This is a simple fix, let me skip the test phase"
- "I'll write the test after, to speed up implementation"
- "We're in an emergency, no time for debugging phases"
- "Just this once, I'll commit without review"

These rationalizations resulted in subtle bugs, missed edge cases, and technical debt that took longer to fix downstream.

**Question:** How can the system enforce process discipline without being percieved as rigid?

## Decision

**Some process gates are mandatory and cannot be skipped without explicit human consent.**

Mandatory hard gates:

1. **TDD Red Phase:** Test must fail before production code is written
   - Violation: "Code before test? Delete & restart."
   - Consequence: If agent wrote code first, all new code is deleted; test must be written first

2. **Brainstorming Approval:** Design doc must be approved by human before implementation plan is written
   - Violation: Cannot invoke writing-plans skill until brainstorming user approval checkpoint is reached
   - Consequence: Agent cannot unilaterally move from design to planning

3. **Debugging Phase Sequence:** Phases 1, 2, 3, 4 must execute in order (investigation → pattern → hypothesis → implementation)
   - Violation: Cannot skip Phase 1 investigation or jump to Phase 4 fix
   - Consequence: Red flags trigger if agent tries to guess or apply multiple fixes at once

4. **Worktree Consent:** If user preference not stated, agent must ask consent before creating worktree
   - Violation: Cannot create isolated workspace without user awareness
   - Consequence: Agent asks; respects user decline or approval

**Soft Gates** (can be overridden with justification):
- Test coverage thresholds
- Code review completeness
- Documentation detail level
- Performance optimization scope

## Alternatives Considered

### A. Soft Enforcement (Red Flags, No Block)

**Description:** Use red flags to warn agents about skipping gates, but allow them to proceed anyway.

**Why Rejected:** Agents rationalize past red flags when under pressure. Empirical testing showed this approach fails: agents say "I understand the risk" and skip anyway. Hard gates are required to maintain discipline.

### B. Always Ask Human Permission

**Description:** Before any significant action (code write, test run, branch creation), ask human permission.

**Why Rejected:** Creates unbearable friction. Session becomes "agent asks permission for every keystroke." Humans stop supervising actively because permissions become background noise.

### C. No Gates; Trust Agents to Self-Regulate

**Description:** Remove all gates. Let agents decide what process to follow.

**Why Rejected:** Agent behavior degrades immediately. Empirical data from early superpowers versions showed agents skip phases when unsupervised. Skill content alone is insufficient; gates are behavioral constraints.

## How This Decision Shapes the System

### 1. Agent Behavior Is Disciplined by Constraint

Agents cannot rationalize past mandatory gates because the skill explicitly states:
- "No exceptions without your human partner's permission"
- "If you violate this, [consequence]"
- "This is non-negotiable"

The constraint is not soft ("you should do this") but absolute ("you cannot proceed without this").

### 2. Human Consent Is the Override Valve

If human says "skip TDD for this task" or "proceed without design doc," the agent can proceed. But the override must be explicit and recorded (in session transcript).

**Why This Works:**
- Maintains discipline for normal cases
- Allows pragmatic exceptions in genuinely unusual situations
- Creates accountability (exceptions are visible in transcript)
- Prevents habitual gate-skipping (requires human to state it explicitly each time)

### 3. Skill Red Flags Become More Important

Red flags are the enforcement mechanism within gates. For example, TDD red flags:

```
🔴 RED FLAGS — If you see any of these, STOP.

- Code before test? Delete & restart.
- Test passes immediately? Return to RED (test is trivial).
- "I'll test after"? Create the test first. No exceptions.
- Multiple changes at once? Revert; make one change per RED-GREEN cycle.
- "Just this once"? No. Never use this rationalization.
```

These are not suggestions; they are hard stops.

### 4. Escalation Triggers Are Defined

Certain situations trigger escalation to human:

**Debugging Escalation:**
- Fix #3+ fails in different location than Fix #1 or #2
- Signal: Not hypothesis failure, but architectural problem
- Action: Stop and discuss with human before Fix #4

**Plan Escalation:**
- Dependency cycle detected (Task A blocks B, B blocks A)
- Action: Cannot execute plan; must redesign

### 5. Gates Enable Skill Composition

Because gates are mandatory, agents can trust that work completed under a gate met that standard. For example:

- When "writing-plans" invokes "using-git-worktrees," it knows the worktree is isolated (mandatory gate in using-git-worktrees Step 0)
- When "writing-plans" proceeds, it knows brainstorming approval happened (mandatory gate in brainstorming)
- No defensive programming needed; gates guarantee preconditions

## Implementation Details

### Mandatory Gate Invocation

**Hard Gate Pattern:**

```markdown
## [Step/Phase X]: [Mandatory Gate Name]

This is a HARD GATE. You cannot proceed without this.

### Check

[condition to verify]

### If Condition Not Met

[consequences / escalation path]

### If Condition Met

[proceed to next step]
```

**Example (TDD Red Phase):**

```markdown
## Phase RED: Write Failing Test

This is a HARD GATE. Code cannot be written before this test.

### Check
- Is the test file created? ✓
- Does the test fail? ✓ (verify failure message)
- Does it fail because the feature is missing (not because of typo)? ✓

### If Test Passes Immediately
STOP. The test is trivial or already implemented.
Return to RED and write a more specific test.

### If Code Written Before Test
Delete the code. Start with test RED phase.
Exception: Human says "skip TDD for this task" — record in transcript.

### If Condition Met
Proceed to VERIFY_RED.
```

### Exceptions (Recorded Explicitly)

When human authorizes exception:

```
[Agent]: "Normally I would write a test first. However, you said 'skip TDD 
for this emergency fix,' so I'm implementing directly. Recording this 
in the transcript for audit purposes."

[Human]: "Yes, do it. But tests must be added within 24 hours."
```

Exception is visible in transcript and creates accountability.

## Validation

**How we know this works:**
- Agent behavior under pressure (time urgency, competing goals) remains disciplined
- Evals show agents explaining red flags when they encounter them ("I see the red flag: code before test; I'll write the test first")
- Gates prevent the "quick fix that created technical debt" pattern
- Exception overrides are rare (< 5% of sessions) and visible in transcript

**Signals of success:**
- Consistent code quality across projects
- No increase in post-merge bugs attributed to skipped gates
- Agents proactively ask humans for gate override rather than trying to sneak past gates
- New team members report superpowers feels "constraining but safe"

## Risk & Mitigation

| Risk | Probability | Mitigation |
|---|---|---|
| Gates become too rigid; block legitimate edge cases | Medium | Human override valve exists; exceptions recorded for audit. Revisit gate conditions annually. |
| Agents find workarounds to bypass gates (e.g., rename file to avoid TDD check) | Low | Red flags explicitly address common workarounds. Evals test for these. |
| New harness cannot enforce gate (missing tool support) | Low | Harness acceptance test validates bootstrap autoload; skills enforce gates at instruction level. |

## Related Decisions

- [[ADR-001-zero-dependency-core-design]] — Gates are implemented as markdown instruction, not code
- [[ADR-002-skill-content-is-code]] — Red flags are behavior-shaping content requiring eval evidence
- [[ADR-005-no-agent-slop]] — Gates prevent slop; high rejection rate depends on functioning gates

## Future Reconsideration

This decision should be revisited if:
1. Empirical data shows gates are being overridden frequently without improving outcomes
2. New class of tasks emerges that genuinely cannot be completed under gate constraints
3. Agent models improve such that discipline can be maintained without explicit gates

**Likelihood of reconsideration:** Low (gates are core to system behavior)

---

**Confidence:** 🟢 CONFIRMADO (hard gates explicit in skill definitions; red flags detailed)
