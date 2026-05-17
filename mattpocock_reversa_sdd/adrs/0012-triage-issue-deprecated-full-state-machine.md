# ADR-0012: `triage-issue` deprecated in favour of `triage` with full state machine

> Status: ACCEPTED
> Date: 2026-04-28 (commit `a32ebfb`)
> Confidence: 🟢 CONFIRMED — `triage-issue` in `deprecated/`; `triage` implements state machine explicitly

---

## Context

`triage-issue` was the original triage skill. It triaged a single issue in isolation — read the issue, apply a label, post a comment if needed. It had no notion of state machine, no concept of category roles vs state roles, and no `.out-of-scope` integration.

As the project's triage needs matured, the single-issue isolated approach showed limitations:
- No structural guarantee of exactly 1 state role + exactly 1 category role
- No explicit transition diagram — contributors were inconsistent about valid state transitions
- No side-effect model (Agent Brief on `ready-for-agent`, Triage Notes on `needs-info`)
- No integration with `.out-of-scope` for rejected enhancements

## Decision

Replace `triage-issue` with `triage`, which implements:
- An explicit 5-state machine (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix)
- Invariant: exactly 1 state role + exactly 1 category role per issue
- Explicit side effects documented per transition
- `.out-of-scope` integration for rejected enhancements
- Tracker-agnostic via the `triage-labels.md` mapping layer (see ADR-0002)

## Alternatives considered

**Option A — Patch `triage-issue` in place**: Add state machine to the existing skill. Rejected: the name `triage-issue` (singular) implies single-issue scope; the new skill operates at the workflow level, not the individual-issue level.

**Option B — Keep `triage-issue` for simple cases, add `triage` for complex**: Two tiers. Rejected: users would not know which to use; skill discovery becomes a problem.

**Option C — Current approach (deprecate, replace with `triage`)**: Accepted.

## Consequences

**Positive:**
- Structural invariants enforced by the skill instructions
- Predictable side effects (Agent Brief, Triage Notes) at each transition
- Single triage workflow regardless of issue complexity

**Negative:**
- Breaking change: users of `triage-issue` must migrate to `triage`
- The state machine adds cognitive overhead for simple issues that only need a label applied
- More instructions in SKILL.md — risk of the 100-line guideline being exceeded
