# Schema — ARCHITECTURE.md

Durable, project-level reference: THIS project's structure + project-specific conventions. The "right route" map every slice subagent is steered by. Lives at repo root (sibling to CONTEXT.md), NOT under `.e2e-engineering/` — it outlives any single task. See ADR 0013.

## Boundary (no overlap with the other doc-types)

| Doc | Holds | Scope |
|-----|-------|-------|
| CONTEXT.md | glossary — terms only (ADR 0006 strict) | durable |
| constitution.md | **generic** engineering standards (karpathy + qa) — HOW to write any code | durable, cross-project |
| **ARCHITECTURE.md** | **project-specific** structure + conventions — WHERE code goes, WHAT owns what | durable, this-project |
| ADRs | one point-in-time decision + rationale | append-only log |
| codebase-map.md | this-change blast-radius snapshot | per-task, rots |

**Split rule:** a generic best practice ("write the test first") → constitution. A project-specific rule ("completion endpoints extend the domain resource, never a new class") → ARCHITECTURE.md. ARCHITECTURE.md is the synthesized *current* architecture; ADRs are the changelog behind it.

## Template (exactly five sections)

```markdown
# Architecture — <project name>

## 1. Layering / module boundaries
<the layers and what each owns. e.g. resource → service → repository; pages → components → api-client.>

## 2. Ownership rules
<which class/module/layer owns which concern or URL path family.>
<e.g. "EnrollmentResource owns /enrollment/** — completion endpoints live here, not a new class.">

## 3. Naming conventions
<per layer: files, classes, components, endpoints.>
<e.g. "pages: {Domain}Page.tsx (NOT Student{Domain}Page.tsx); resources: {Domain}Resource.java.">

## 4. Integration patterns
<API-client method shape (one backend endpoint → one client method, one key); i18n key scheme/prefixes; how a new endpoint/component plugs in.>

## 5. Anti-patterns / wrong routes
<explicit "don't X, do Y" list. The traps a fresh subagent would fall into.>
<e.g. "DON'T create a parallel resource class at an existing URL path — extend the owner.">
```

## Lifecycle
- **Lazy create** — born when the first structural decision crystallizes (greenfield), or seeded by `adopt` / `map-codebase` (brownfield). No empty-doc ceremony. Absent at impl entry → readers skip it (nothing to violate yet).
- **Writes are human-phase only** (ADR 0013): seeded/drafted in pre-impl (human-reviewed); amended at the post-impl human-QA gate. The implementation loop is READ-ONLY for this file — drift a subagent spots is PROPOSED in its summary and staged as a pending amendment, never written mid-loop.

## Read by
- Pre-impl (to-prd, map-codebase) — so a proposed feature doesn't take a wrong route.
- to-issues — pins each story's `integration` decision (ownership/seam) from sections 1-2.
- Fan-out — orchestrator injects the story's SCOPED slice (its layer's naming + ownership touching its blast radius + relevant anti-patterns), not the whole doc.
- Quality-check stage (per-slice review) — full doc, orchestrator-side, to catch ownership/naming/duplicate violations before merge.

## Rules
- Project-specific only. Generic standards belong in constitution.md; terms belong in CONTEXT.md.
- Synthesized current state — keep it the single readable map, not a pile of decisions (those are ADRs).
- Greenfield with no architecture decided yet → file may not exist; that is valid.
