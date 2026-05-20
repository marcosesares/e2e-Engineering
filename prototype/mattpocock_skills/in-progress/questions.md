# Open Questions: In-Progress Skills Bucket

> Identificador: `004-in-progress-skills`
> Data: `2026-05-15`
> Requer validação humana do mantenedor.
> Confidência: 🔴 LACUNA / DÚVIDA

---

## Q-01 — What are the graduation criteria for in-progress skills?

**Gap type**: 🔴 Undefined criteria
**Context**: All four skills (`review`, `writing-beats`, `writing-fragments`, `writing-shape`) live in `in-progress/` with no documented threshold for promotion to `engineering/` or `productivity/`. The `domain.md#gaps` section explicitly records this as a red gap.
**Question for maintainer**: What conditions must a skill meet to be promoted?
- Minimum usage count?
- Feature completeness relative to a spec?
- Maintainer review + approval?
- A formal graduation PR?
**Impact if unresolved**: Skills remain in `in-progress/` indefinitely — or are promoted inconsistently without documented rationale. New contributors have no guidance.
**Linked**: `tasks.md#T-05`, `domain.md#gaps`

---

## Q-02 — Which bucket should `review` graduate to?

**Gap type**: 🔴 Undefined destination
**Context**: `review` is a code-review tool — it fits the `engineering/` bucket by function. However, it has no hard dependencies on setup config (no `triage-labels.md` needed), so it would be a soft-dependency engineering skill.
**Question for maintainer**: Should `review` graduate to `engineering/`? Or is there a reason it has remained in `in-progress/` (e.g., the parallel sub-agent mechanism is not reliable enough on all runtimes)?
**Impact if unresolved**: `review` is not published and not discoverable by developers who would benefit from it.

---

## Q-03 — Which bucket should the writing skills graduate to?

**Gap type**: 🔴 Undefined destination
**Context**: `writing-beats`, `writing-fragments`, and `writing-shape` are writing-workflow tools — they do not fit neatly in `engineering/` (code work) or `productivity/` (non-code workflow). Writing could be either.
**Question for maintainer**: Is there a plan to create a `writing/` bucket? Or should these graduate to `productivity/`?
**Impact if unresolved**: Writing skills graduate to the wrong bucket (wrong audience, wrong README), or a new bucket is needed (which requires updating `CLAUDE.md` and `link-skills.sh`).

---

## Q-04 — Is the parallel sub-agent mechanism in `review` stable enough for production use?

**Gap type**: 🔴 Runtime dependency
**Context**: `review` spawns parallel sub-agents per file. This mechanism depends on the AI runtime supporting parallel agent invocation. Claude Code supports it; Codex and other runtimes may not.
**Question for maintainer**: Should `review` have a defined fallback for runtimes without parallel agent support? Or should it be documented as "Claude Code only"?
**Impact if unresolved**: `review` silently fails or produces partial output on non-Claude Code runtimes.
**Linked**: `edge-cases.md#EC-07`

---

## Q-05 — What is the "natural end" criterion for a `writing-beats` session?

**Gap type**: 🔴 Undefined termination condition
**Context**: The invariant is "end = natural end of journey, NOT empty pile." But "natural end of journey" is not defined algorithmically — it relies on AI judgment about narrative arc.
**Question for maintainer**: Should there be a defined signal the skill presents to the user when it detects a natural ending? E.g., "I think we've reached a natural ending point — the article covers X, Y, Z. Do you want to continue or wrap up?"
**Impact if unresolved**: Sessions may end prematurely (AI misjudges narrative arc) or run indefinitely (AI is too conservative about declaring natural end).
