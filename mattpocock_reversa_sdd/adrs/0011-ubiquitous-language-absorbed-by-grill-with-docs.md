# ADR-0011: `ubiquitous-language` and `domain-model` absorbed into `grill-with-docs`

> Status: ACCEPTED
> Date: 2026-04-28 (commit `62f43a1`)
> Confidence: 🟢 CONFIRMED — both skills appear in `deprecated/`; commit message documents the merge

---

## Context

Three separate skills existed for related but overlapping purposes:
- `ubiquitous-language`: extract domain vocabulary from a codebase and define canonical terms
- `domain-model`: build an entity-relationship model from code exploration
- `grill-with-docs`: conversational requirements elicitation using existing documentation

All three involved reading code/docs and producing structured domain knowledge through an interview-style process. Running them separately produced fragmented outputs that needed to be reconciled. Contributors began running all three sequentially before starting any feature work.

## Decision

Absorb `ubiquitous-language` and `domain-model` into `grill-with-docs`. The merged skill:
- Conducts conversational elicitation (from `grill-with-docs`)
- Extracts domain vocabulary and canonical terms (from `ubiquitous-language`)
- Builds entity models as a natural output of the grilling session (from `domain-model`)

Both predecessor skills are moved to `skills/deprecated/`.

## Alternatives considered

**Option A — Keep all three separate**: Maximum granularity. Rejected: sequential usage was de facto standard; combining saves users the orchestration overhead.

**Option B — Merge into `grill-me` instead**: `grill-me` is a simpler, no-docs variant of grilling. Rejected: `grill-with-docs` is the documentation-aware variant and is the natural home for vocabulary and model extraction.

**Option C — Current approach (merge into `grill-with-docs`, deprecate predecessors)**: Accepted.

## Consequences

**Positive:**
- Single skill for the full domain-knowledge extraction workflow
- No reconciliation step between separate outputs
- Reduced cognitive overhead for users

**Negative:**
- `grill-with-docs` SKILL.md is now doing more work — risk of exceeding the 100-line guideline
- Users who wanted only vocabulary (not full grilling) now get the full session
- Breaking change for users who scripted `ubiquitous-language` or `domain-model` by name
