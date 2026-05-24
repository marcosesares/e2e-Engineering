# adopt — one-time onboarding of ship-it into an in-progress project

Invoked via `/ship-it adopt`. ONE-TIME, separate from the per-task flow. Splits onboarding into two halves of very different blast radius: DOCS conform now (under human review), CODE conforms over time (one human-chosen refactor at a time). Code is NEVER auto-refactored. See ADR 0011.

## Half 1 — DOCS (auto-DRAFT, human review)
Auto-DRAFT the standards scaffolding from existing code + docs, present for human review/edit — do NOT silently commit.
- **CONTEXT.md** — draft a glossary from the domain language already in the code.
- **constitution.md** — draft coding + testing standards reflecting how the project already works (seed from the karpathy + qa defaults, adjust to observed reality).
- **ADRs** — draft `docs/adr/*` capturing the load-bearing decisions already embedded in the code.

Present each for human review/edit. Reason for the human gate: an incorrect glossary or constitution gets injected into EVERY future subagent, propagating wrong domain language everywhere. Documentation conforms immediately — but only after review.

## Half 2 — CODE (map → backlog → triage, human picks)
- Run [map-codebase](./pre-impl/map-codebase.md) REPO-WIDE (the one time it's not change-scoped) to produce a prioritized refactor BACKLOG.
- Route candidates through [triage](./impl/triage.md) → issues.
- The HUMAN picks which become refactor Tasks. Each conforms incrementally through the normal gated flow: full PRD → HARD GATE 1 → slices + TDD → mandatory e2e → review → human-QA. Refactor Tasks run the FULL flow (ADR 0012).
- Code is NEVER automatically rewritten to standards.

## Net
Docs conform now (human-reviewed). Code conforms over time, one human-chosen refactor at a time.

## Red flags (stop)
- Auto-committing the drafted standards docs without human review.
- Auto-refactoring the whole codebase to standards (maximal blast radius — forbidden by README + constitution scope-discipline).
- Treating adopt as a per-task flow (it's one-time onboarding).
