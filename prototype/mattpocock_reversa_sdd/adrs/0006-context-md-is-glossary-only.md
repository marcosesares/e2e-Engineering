# ADR-0006: `CONTEXT.md` is a glossary only — no implementation details

> Status: ACCEPTED
> Date: 2026-05-13 (commit `e74f006`)
> Confidence: 🟢 CONFIRMED — commit message explicitly states rationale; reinforced in `domain.md`

---

## Context

`CONTEXT.md` is a per-repository file seeded by `/setup-matt-pocock-skills`. Over time, contributors and skills began writing implementation details, specs, and architectural decisions into `CONTEXT.md` — turning it into a growing catch-all document. This caused several problems:

- Skills that read `CONTEXT.md` received implementation noise alongside glossary terms
- The file grew large, consuming tokens when included in skill contexts
- Duplication appeared between `CONTEXT.md` entries and ADRs in `docs/adr/`

Commit `e74f006` (May 13 2026) explicitly corrected this scope and updated all related documentation.

## Decision

`CONTEXT.md` is a glossary only:
- Allowed: term definitions, canonical naming, usage guidance ("avoid X, use Y instead")
- Forbidden: implementation specs, architectural decisions, system behavior descriptions, procedural instructions

All architectural decisions go into `docs/adr/`. Implementation details belong in skill files or supporting documentation.

`CONTEXT.md` is also created lazily — only when the first term is resolved that requires a glossary entry. It is not pre-populated by `/setup-matt-pocock-skills`.

## Alternatives considered

**Option A — Keep `CONTEXT.md` as general purpose**: Allow any project context. Rejected: scope creep already observed; token cost grows unboundedly; forces skills to parse noise.

**Option B — Rename to `GLOSSARY.md`**: More explicit naming. Considered but not adopted — `CONTEXT.md` is already established in multiple skill references and user muscle memory.

**Option C — Current approach (strict glossary invariant + lazy creation)**: Accepted in commit `e74f006`.

## Consequences

**Positive:**
- `CONTEXT.md` stays small and token-efficient
- Clear rule: if it's a decision, it goes to ADR; if it's a term, it goes to CONTEXT
- Skills that read `CONTEXT.md` get clean signal

**Negative:**
- Requires discipline — no automated enforcement prevents implementation details from creeping back in
- The lazy-creation rule means some repos will have no `CONTEXT.md` at all, which can confuse contributors expecting the file to exist
