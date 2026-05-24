# grill-with-docs — impl entry, language reconcile (ONCE)

Runs ONCE at Implementation entry, BEFORE to-issues. Reconciles PRD + (brownfield) codebase-map "existing language" (section 4) against the CONTEXT.md glossary. NOT per-slice — slices inherit shared language via CONTEXT + constitution. Per-slice gap-finding is the [slice gap-check](./tdd.md)'s job. (The standalone grill-with-docs skill at repo root covers the general technique; this is its fixed placement in ship-it.)

## What to do
- Compare the terms the PRD uses, the terms the code already uses (codebase-map §4), and the CONTEXT.md glossary.
- Surface every conflict immediately: "Glossary defines X as A, but the PRD/code uses it as B — which?"
- Sharpen fuzzy/overloaded terms to one canonical term.
- Update CONTEXT.md inline as terms resolve (it is a glossary, not a spec — no implementation detail).
- Offer an ADR only when the decision is hard-to-reverse AND surprising AND a real trade-off.

## Exit
Shared, conflict-free language for the whole implementation phase. Hand off to [to-issues](./to-issues.md).

## Red flags (stop)
- Running this per-slice (it's once, at entry).
- Letting a term conflict survive into to-issues (every slice would inherit the ambiguity).
- Writing implementation detail into CONTEXT.md.
