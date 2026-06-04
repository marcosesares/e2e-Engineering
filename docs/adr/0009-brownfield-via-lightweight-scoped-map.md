# e2e-engineering handles brownfield via a lightweight, change-scoped map-codebase step

e2e-engineering is not greenfield-only — it must support feature, bug-fix, and refactor work on existing codebases. For those, a conditional pre-implementation sub-skill `map-codebase` fires (skipped for greenfield). It produces a SCOPED artifact: the modules and seams within the blast radius of the current change, plus a local impact list. It feeds grill-with-docs (reconcile the ubiquitous language with what the code already says) and to-issues (vertical slices respect existing seams).

We deliberately reject the heavy reverse-engineering artifacts (global C4 context/container/component, ERD, NxN spec-impact matrix) that the prototype analyses themselves were built from. Those map an entire legacy codebase backward into specs and rot the moment code changes; maintaining them per slice is not worth it. The lighter forward-flow traceability already in e2e-engineering — depends_on DAG (impact graph), Automated/Manual disposition (coverage), story↔slice↔commit — covers the same needs. The README "de-slop" / architecture-improvement flow is treated as a refactor Task that uses map-codebase to surface candidates for a human to choose from, never an unattended whole-repo refactor.

---

## Amendment — gate 1 enforcement + flight stall (2026-06-04)

**Root cause:** `course-validation-error-messages` entered the queue without a `codebase-map.md` (pre-impl skipped / task manually added). Flight cold-read 10 source files to compensate — 21.8k orchestrator tokens (11% of budget).

**Decision:**

1. **Gate 1 (`/e2e-engineering`)** — before queuing a brownfield task, verify `tasks/<id>/codebase-map.md` exists. Missing → stall: `"Pre-impl incomplete — run map-codebase first."` Do not queue without it.
2. **Flight Step 2** — if brownfield and `tasks/<id>/codebase-map.md` missing → `<e2e-stall reason="codebase-map-missing — pre-impl incomplete, run /e2e-engineering">` + EXIT. No cold-read fallback.

No derived-map machinery, no parent-walk logic — the pre-impl sequence already produces the map. These two stalls enforce what was always required. A task in the queue without a map means pre-impl was skipped; the fix is to run pre-impl, not to generate a compensating map at flight time.
