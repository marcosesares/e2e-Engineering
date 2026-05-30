# ADR-0015: `<what-to-do>` and `<supporting-info>` XML sections separate instructions from context

> Status: ACCEPTED
> Date: 2026-04-28 (commit `b843cb5`)
> Confidence: 🟢 CONFIRMED — pattern present in `writing-*` skills, `grill-with-docs`, and confirmed in `domain.md`

---

## Context

As SKILL.md files grew more complex, a structural problem emerged: imperative instructions (what the agent must do) were mixed with background context (why it works that way, definitions, examples). Agents parsing a long SKILL.md had to distinguish between "do this" and "understand this" by reading prose — error-prone and inefficient.

Two structural approaches were evaluated:
1. Use Markdown headers to separate sections (e.g., `## Instructions` / `## Background`)
2. Use XML-style wrapper tags (`<what-to-do>` / `<supporting-info>`)

The XML approach was adopted in `writing-beats`, `writing-fragments`, `writing-shape`, and `grill-with-docs` starting with commit `b843cb5`.

## Decision

Complex SKILL.md files use two XML wrapper sections:
- `<what-to-do>`: imperative instructions the agent executes — step-by-step, mandatory, behavioral
- `<supporting-info>`: background context, definitions, examples, rationale — informational, not mandatory to execute

This separation allows an agent to scan `<what-to-do>` for its action list and treat `<supporting-info>` as reference material.

## Alternatives considered

**Option A — Markdown headers only (`## Instructions`, `## Background`)**: Standard markdown. Rejected: headers are visually distinct but semantically equivalent — an agent cannot programmatically distinguish a `## Instructions` section from a `## Background` section without reading content.

**Option B — Separate files (e.g., `SKILL.md` for instructions, `CONTEXT.md` for background)**: Maximum separation. Rejected: fragments the skill across multiple files; increases the overhead of writing and maintaining skills.

**Option C — Prose only (no structural separation)**: Simple, no convention to learn. Rejected: already producing mixed-content SKILL.md files that are hard to parse.

**Option D — Current approach (`<what-to-do>` + `<supporting-info>` XML tags)**: Accepted. XML tags are semantically distinct and visible without requiring content analysis.

## Consequences

**Positive:**
- Agents can prioritize `<what-to-do>` content over `<supporting-info>` without content analysis
- Clear structural contract: if it's imperative, it belongs in `<what-to-do>`
- Supporting material can be verbose without polluting the action list

**Negative:**
- XML tags are unusual in a Markdown file — contributors unfamiliar with the convention may find them surprising
- Not enforced across all skills — older simpler skills use neither section, creating inconsistency
- Pattern is 🟡 INFERIDO to apply only to complex skills (no stated threshold for "complex enough to need this split")
