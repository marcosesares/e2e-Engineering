# ADR-0005: `handoff` generates a structured document, not a passthrough summary

> Status: ACCEPTED
> Date: 2026-05-01 (inferred from commit `c63fd97`)
> Confidence: 🟢 CONFIRMED — explicit design constraint in `handoff/SKILL.md`

---

## Context

The `handoff` skill addresses a real problem: when an AI agent session ends mid-task, the next agent (or the next session of the same agent) starts with no context. Two approaches were considered:

1. **Passthrough**: copy the current session's context/conversation history into the next agent's context
2. **Structured document**: generate a purpose-built handoff document that a fresh agent can read to reconstruct necessary context

The passthrough approach is mechanically simpler but produces noisy context — the next agent must sift through conversation history to find what matters. It also exposes internal deliberation artifacts (failed attempts, abandoned approaches) that can confuse the fresh agent.

## Decision

`handoff` generates a structured document with explicit sections:
- Current state of work
- Next immediate action
- Blockers and open questions
- Relevant file paths and line numbers

The document is designed to be the only thing the next agent reads — it should be self-contained enough that the fresh agent does not need to inspect the original conversation.

## Alternatives considered

**Option A — Passthrough / context copy**: Simpler. Rejected: noisy, exposes internal deliberation, relies on the next agent to filter relevant information (which it may not do correctly).

**Option B — Bullet-point summary**: Less structured than a full document but more structured than passthrough. Rejected: no standard format makes downstream parsing fragile.

**Option C — Current approach (structured document with defined sections)**: Accepted.

## Consequences

**Positive:**
- Fresh agent starts with clean, focused context
- Document is human-readable — useful for developer review
- Standardized format makes handoffs predictable

**Negative:**
- The outgoing agent must summarize accurately — a bad summary produces a bad handoff (no automated verification)
- Adds a skill invocation step that developers might skip under time pressure
- File-path and line-number references in the handoff document decay as code changes
