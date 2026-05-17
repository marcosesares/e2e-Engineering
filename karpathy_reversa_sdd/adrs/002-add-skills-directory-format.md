# ADR-002 — Add Skills Directory Format

> Type: Retroactive · Date: 2026-01-27 · Confidence: 🟢 CONFIRMADO  
> Source: Commit `0b53cbc` (Jiayuan Zhang) — 7 minutes after ADR-001

---

## Context

The initial CLAUDE.md approach (ADR-001) required manual copying into every project. Claude Code also supports a `.claude/skills/` directory where skill files are discoverable across sessions.

## Decision

Add a parallel version of the guidelines at `.claude/skills/karpathy-guidelines.md` for users who prefer the skills directory approach over modifying CLAUDE.md.

## Rationale

Immediately recognized after the initial commit that a skills directory format provides broader reach — a single installation covers all projects using that Claude Code installation, rather than per-project copies.

## Alternatives Considered

- **Replace CLAUDE.md with the skills format**: Not chosen — CLAUDE.md remains the per-project option; both formats serve different use cases.
- **Wait for the plugin system**: Not chosen at this point — the plugin system wasn't yet part of the plan.

## Consequences

**Positive:**
- One installation covers all projects for a given user
- Cleaner than modifying each project's CLAUDE.md

**Negative:**
- Two formats to maintain in sync (CLAUDE.md and the skills file)
- The skills file format was later superseded by `skills/<name>/SKILL.md` with frontmatter (ADR-003)

**Subsequent evolution:** Community PR #3 restructured this into `skills/karpathy-guidelines/SKILL.md` with YAML frontmatter for skills.sh compatibility (ADR-003).
