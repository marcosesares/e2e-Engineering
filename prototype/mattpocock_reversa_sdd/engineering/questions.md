# Open Questions: Engineering Skills Bucket

> Identificador: `001-engineering-skills`
> Data: `2026-05-15`
> Requer validação humana do mantenedor.
> Confidência: 🔴 LACUNA / DÚVIDA

---

## Q-01 — What is the exact schema validation protocol for `triage-labels.md`?

**Gap type**: 🔴 Undefined behaviour
**Context**: The idempotency rule means `setup-matt-pocock-skills` skips creating `triage-labels.md` if it already exists. If the existing file has an outdated or incomplete schema, hard-dependency skills (`triage`, `to-issues`, `to-prd`) will silently use wrong values.
**Question for maintainer**: Should hard-dependency skills validate `triage-labels.md` schema on every invocation and report missing keys? Or should `setup-matt-pocock-skills` include a `--validate` mode?
**Impact if unresolved**: Silent structural errors in triage and issue creation — incorrect labels applied to real issues.
**Linked**: `edge-cases.md#EC-06`

---

## Q-02 — What is the concept-similarity threshold for `.out-of-scope/` matching?

**Gap type**: 🔴 Undefined algorithm
**Context**: `domain.md#triage-rules` states `.out-of-scope/` matching uses "concept similarity, not keyword matching." The algorithm for determining similarity is entirely AI judgment — no threshold, no examples, no fuzzy-match definition.
**Question for maintainer**: Should a set of examples be documented in `.out-of-scope/` or in the `triage` SKILL.md to calibrate the AI's similarity judgment? E.g., "these two requests are the same concept even though worded differently."
**Impact if unresolved**: Inconsistent matching — sometimes similar concepts are flagged, sometimes they are not.
**Linked**: `edge-cases.md#EC-03`, `domain.md#triage-rules`

---

## Q-03 — Is there a CI hook or pre-commit check for plugin.json / README.md consistency?

**Gap type**: 🔴 No automated governance
**Context**: `CLAUDE.md` requires every skill in `engineering/`, `productivity/`, or `misc/` to appear in both `plugin.json` and `README.md`. There is no automated check enforcing this. Manual discipline only.
**Question for maintainer**: Should a pre-commit hook (e.g., via `setup-pre-commit`) validate that all active-bucket skills are registered? Or a CI workflow?
**Impact if unresolved**: Skills can be added or deprecated without updating the registry — the published skill set drifts from the actual skill set.
**Linked**: `architecture.md#technical-debts`, `tasks.md#T-11`

---

## Q-04 — What is the threshold for a skill to require the `<what-to-do>` / `<supporting-info>` XML split?

**Gap type**: 🔴 Undefined criteria
**Context**: ADR-0015 documents the XML split pattern but does not define when a skill is "complex enough" to require it. Currently only `writing-*`, `grill-with-docs`, and a few others use it.
**Question for maintainer**: Is the rule "any skill exceeding N lines" or "any skill with 2+ distinct operating modes" or something else?
**Impact if unresolved**: New skill authors must guess whether to apply the pattern — inconsistency across the skill library.
**Linked**: `adrs/0015-what-to-do-supporting-info-xml-sections.md`, `tasks.md#T-13`

---

## Q-05 — What happens when `diagnose` Phase 2 (reproduce) fails permanently?

**Gap type**: 🔴 Undefined termination condition
**Context**: The 6-phase loop requires a confirmed repro before proceeding to Phase 3. If the bug cannot be reproduced despite multiple attempts, the loop has no defined exit.
**Question for maintainer**: Should `diagnose` define a maximum reproduction-attempt count, or a "non-reproducible" exit state with a specific output format?
**Impact if unresolved**: Skill loops indefinitely on non-reproducible bugs or exits abruptly without a structured output.
**Linked**: `edge-cases.md#EC-11`

---

## Q-06 — What is the full behaviour of tracker skills for the `local-markdown` escape hatch?

**Gap type**: 🔴 Underspecified
**Context**: `triage`, `to-issues`, and `to-prd` support "local-markdown" as an escape hatch for non-mainstream trackers. The exact behaviour (frontmatter labels? section-based comments? file naming conventions?) is not specified in any SKILL.md or supporting file.
**Question for maintainer**: Should a `local-markdown` behaviour spec be added to `triage/SKILL.md` or as a supporting file? The current prose is too vague to ensure consistent behaviour.
**Impact if unresolved**: Different AI agent sessions will implement local-markdown support differently — no consistent output format.
**Linked**: `edge-cases.md#EC-12`, `adrs/0008-issue-trackers-mainstream-only.md`
