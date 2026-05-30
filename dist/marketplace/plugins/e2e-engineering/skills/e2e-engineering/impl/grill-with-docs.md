# grill-with-docs — pre-impl brainstorm + language reconcile (brownfield only)

Runs in pre-implementation, brownfield only, AFTER map-codebase. Reconciles the brainstorm direction + codebase-map "existing language" (section 4) against the CONTEXT.md glossary. Gates whether research / prototype fire next. Output feeds to [to-prd](./pre-impl/to-prd.md). (The standalone grill-with-docs skill at repo root covers the general technique; this is its fixed placement in e2e-engineering.)

## What to do
- Brainstorm the feature/bugfix/refactor direction (like grill-me, but informed by existing codebase + docs).
- Compare the terms being discussed, the terms the code already uses (codebase-map §4), and the CONTEXT.md glossary.
- Surface every conflict immediately: "Glossary defines X as A, but the code uses it as B — which?"
- Sharpen fuzzy/overloaded terms to one canonical term.
- Update CONTEXT.md inline as terms resolve (it is a glossary, not a spec — no implementation detail).
- Offer an ADR only when the decision is hard-to-reverse AND surprising AND a real trade-off.
- Decide and record: research? prototype?

## Exit
Shared brainstorm direction + conflict-free language. Hand off caveman:ultra notes to [to-prd](./pre-impl/to-prd.md).

## Red flags (stop)
- Running this during implementation (it's pre-impl only, brownfield).
- Running grill-me AND grill-with-docs (choose by task type: grill-me for greenfield, grill-with-docs for brownfield).
- Letting a term conflict survive into to-prd (the PRD would inherit the ambiguity; every slice after would too).
- Writing implementation detail into CONTEXT.md.
