# ADR-0003: Skill names are action-oriented (`to-issues`, `to-prd`, not `issue-generator`)

> Status: ACCEPTED
> Date: 2026-04-28 (inferred from commit `8868f54` and `62f43a1`)
> Confidence: 🟡 INFERIDO — no explicit commit message; inferred from naming pattern across all skills

---

## Context

As skills multiplied, an implicit naming convention emerged. Skills that transform input into a specific output artifact were named with a `to-` prefix (e.g., `to-issues`, `to-prd`). Skills that perform an ongoing action or analysis were named with a verb or gerund (e.g., `diagnose`, `triage`, `grill-me`, `prototype`).

This contrasts with an alternative naming style that would be noun-first: `issue-generator`, `prd-writer`, `codebase-analyser`. The action-oriented names are shorter, more memorable, and reflect the invocation metaphor: you "run triage" or "run to-prd", not "activate the PRDWriter".

## Decision

Name skills using action-oriented verbs and `to-` prefixes for transformation skills. Avoid noun-first names that describe the agent rather than the action.

Pattern:
- **Transformation** (input → artifact): `to-<artifact>` (e.g., `to-issues`, `to-prd`)
- **Ongoing process / analysis**: imperative verb or noun (e.g., `diagnose`, `triage`, `prototype`, `grill-me`, `handoff`)
- **Setup / configuration**: `setup-<scope>` (e.g., `setup-pre-commit`, `setup-matt-pocock-skills`)
- **Migration / conversion**: `migrate-to-<target>` (e.g., `migrate-to-shoehorn`)

## Alternatives considered

**Option A — Noun-first naming** (`issue-generator`, `prd-writer`): More searchable as a tool category. Rejected: longer, less memorable, doesn't match how developers talk about the workflows ("I'll triage this", "convert this to issues").

**Option B — Free-form naming**: No convention. Rejected: the skill library grows over time and discoverability degrades without a naming pattern.

## Consequences

**Positive:**
- Consistent naming pattern across 28 skills
- Invocation reads naturally in prose: "run `/to-prd` on this PRD"
- Differentiates transformation skills from process skills semantically

**Negative:**
- New contributors must learn the convention; it is not written down in a CONTRIBUTING guide
- The `to-` prefix is not universal — `scaffold-exercises` and `improve-codebase-architecture` are long and hyphenated, breaking the brevity of the pattern
