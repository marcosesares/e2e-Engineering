# ADR-0008: Only mainstream issue trackers receive first-class support

> Status: ACCEPTED
> Date: 2026-04-29 (`.out-of-scope/mainstream-issue-trackers-only.md`, issue #99)
> Confidence: 🟢 CONFIRMED — explicit `.out-of-scope` entry; first-class trackers listed in `triage/SKILL.md`

---

## Context

The skills `to-issues`, `to-prd`, and `triage` must interact with an issue tracker (creating issues, applying labels, posting comments). As the library grew, requests arrived for support of niche trackers: Linear, Notion databases, Shortcut, Plane, and others.

Each tracker integration requires:
- Unique API interaction patterns
- Distinct label/field schemas
- Ongoing maintenance as tracker APIs evolve
- Test coverage (which this project lacks — see domain.md gaps)

Supporting every requested tracker would fragment the skill logic and impose an unbounded maintenance burden.

## Decision

Only **mainstream** issue trackers receive first-class support:
- **GitHub Issues** — primary; all skill examples use GitHub
- **GitLab Issues** — added as first-class in commit `4369256` (issue #98)
- **Local markdown** — for offline/air-gapped workflows

Escape hatches for non-mainstream trackers:
- User selects "other/custom" during setup
- Describes their workflow as prose
- Skills adapt to the prose description instead of using structured API calls

The criterion for "mainstream" is: "a typical engineer would recognise the tool name without explanation."

## Alternatives considered

**Option A — Support any tracker via community plugins**: Allow contributors to add tracker integrations. Rejected: no plugin infrastructure exists; would require a significant architectural investment not justified by current usage patterns.

**Option B — First-class support for all requested trackers**: Add Linear, Shortcut, Notion, etc. Rejected: maintenance cost grows with each addition; each tracker adds conditional branching to already complex skill logic.

**Option C — Current approach (GitHub + GitLab + local; prose escape hatch for others)**: Accepted. Low maintenance, covers the majority of real-world use cases.

## Consequences

**Positive:**
- Skill logic stays clean — no combinatorial branching per tracker
- Maintenance burden bounded to 3 backends
- Prose escape hatch ensures users on niche trackers are not blocked

**Negative:**
- Users on Linear, Shortcut, Notion etc. get a degraded "prose mode" experience
- Escape hatch instructions are less precise than structured API calls
- Criterion for "mainstream" is subjective — could be challenged over time as newer tools gain adoption
