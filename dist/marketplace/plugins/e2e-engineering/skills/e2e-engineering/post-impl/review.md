# review — post-impl fresh-context full-diff audit

Fresh-context, full-diff, cross-slice audit by a clean reviewer with NO impl-loop baggage. Targets what per-slice review structurally can't see: cross-slice architecture, seams, whole-feature spec/standards compliance. Provenance: superpowers requesting/receiving-code-review.

## What to do
- Start clean: review the FULL diff of the task against baseBranch, not story-by-story.
- Audit against the PRD (does the whole feature meet intent?) and the [constitution](../constitution.md) (coding + testing principles).
- Look for cross-slice issues invisible to per-slice review: inconsistent abstractions across slices, duplicated logic between stories, seam leaks, architectural drift, integration gaps the E2E didn't catch.
- Rank findings by severity (blocker / major / minor). Be specific: `path:line — problem — fix`.

## Distinction
- **Per-slice review** = orchestrator, in-loop, summary vs spec+constitution, cheap, catches slice-level drift early.
- **This** = fresh context, whole diff, cross-slice arch. Different lens — run both.

## Outcome
- Blockers/majors → back into the implementation loop (new slice or fix) before human-QA.
- Clean → proceed to [human-qa](./human-qa.md).

## Red flags (stop)
- Reviewing slice-by-slice (you'd reproduce per-slice review and miss cross-slice issues).
- Carrying impl-loop assumptions in (the point is fresh eyes).
- Praise/scope-creep instead of severity-tagged findings.
