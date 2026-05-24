# map-codebase — brownfield, conditional

Fires only on brownfield (task targets existing code). Skipped for greenfield. Produces `.e2e-engineering/codebase-map.md` SCOPED to *this* change — NOT a global C4/ERD/NxN matrix. Sprint-lifetime, may rot. See ADR 0009. Schema: [codebase-map](../schemas/codebase-map.md).

## What to do

Explore only the blast radius of the planned change. Fill the five sections:

1. **Blast-radius modules** — modules/files this change touches or ripples into. Scoped.
2. **Seams** — where tests attach: adapters, interfaces, injection points, boundaries.
3. **Local impact** — concrete call sites / consumers affected.
4. **Existing language** — terms the code already uses for this domain. → feeds grill-with-docs.
5. **Refactor candidates [NOT THIS TASK]** — shallow modules, missing seams, duplicated rules you notice while mapping.

## The wall (enforce)
Section 5 is SURFACE-ONLY and WALLED:
- Tag every candidate `NOT THIS TASK`.
- Route them to NEW issues via [triage](../impl/triage.md) → human-gated into their own refactor Task.
- EXCLUDE them from slice-subagent context. The orchestrator enforces this.
- Never action them in this task. Protects scope discipline (constitution testing principle 4).

## Outputs feed
- Section 4 → [grill-with-docs](../impl/grill-with-docs.md) (language reconciliation).
- Sections 1-3 → [to-issues](../impl/to-issues.md) (slices respect existing seams).

## Red flags (stop)
- Producing global reverse-engineering artifacts (full C4 context/container/component, ERD, spec-impact matrix). Too heavy, rots fast — forbidden.
- Mapping the whole repo instead of the change's blast radius.
- Actioning a refactor candidate in this task.
