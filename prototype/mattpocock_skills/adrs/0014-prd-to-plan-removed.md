# ADR-0014: `prd-to-plan` removed entirely (not deprecated, deleted)

> Status: ACCEPTED
> Date: 2026-04-28 (commit `a77fa6e`)
> Confidence: 🟡 INFERIDO — `prd-to-plan` appears in deprecations table; commit `a77fa6e` attributed to removal; no surviving SKILL.md to confirm original purpose

---

## Context

`prd-to-plan` was a skill that presumably converted a PRD document into a project plan (task list, milestones, or similar). Unlike other deprecated skills that were moved to `skills/deprecated/`, `prd-to-plan` was removed from the repository entirely.

This is the only known case of a skill being fully deleted rather than deprecated. The `state-machines.md` deprecation table records this anomaly explicitly.

Based on the naming pattern and the successor landscape:
- `to-prd` converts requirements into a PRD document
- `to-issues` converts a PRD or requirements into GitHub/GitLab issues (vertical slices)
- `prd-to-plan` would have been a middle step between `to-prd` and `to-issues`

The gap between `to-prd` and `to-issues` is now bridged directly — `to-issues` accepts a PRD as input.

## Decision

Delete `prd-to-plan` entirely (no `deprecated/` preservation). Justification inferred: the skill's function was fully covered by the combined `to-prd` → `to-issues` pipeline, making it redundant rather than merely superseded.

Full deletion (vs. deprecation) was chosen because:
- No unique functionality to preserve
- No institutional knowledge in the skill not already captured by the successor pipeline
- Keeping a deleted-in-function skill in `deprecated/` would add noise

## Alternatives considered

**Option A — Move to `deprecated/`**: Standard procedure (see ADR-0007). Apparently rejected: if functionality is fully covered, preserving the artifact adds noise without benefit.

**Option B — Merge into `to-issues`**: Preserve the plan-generation step inside `to-issues`. Unclear if attempted; the resulting `to-issues` skill does generate vertical slices with enough structure to serve as a plan.

**Option C — Current approach (full deletion)**: Accepted, uniquely among all deprecated skills.

## Consequences

**Positive:**
- Repository cleaner — no artifacts of skills with zero unique value
- Users directed unambiguously to `to-prd` + `to-issues` pipeline

**Negative:**
- If `prd-to-plan` had unique behavior not captured by `to-issues`, that behavior is permanently lost
- No git-browseable artifact to understand what the skill originally did (the commit that deleted it is the only record)
- Sets a precedent for hard deletion that, if applied too broadly, could destroy institutional knowledge (see ADR-0007 rationale for why deprecation is preferred)
