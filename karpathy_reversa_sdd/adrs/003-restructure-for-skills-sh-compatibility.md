# ADR-003 — Restructure Repo for skills.sh Compatibility

> Type: Retroactive · Date: 2026-01-28 · Confidence: 🟢 CONFIRMADO  
> Source: Commit `64723a4` (Szymon Kocot — community PR #3)

---

## Context

The skills.sh community tool expected skills to follow a specific convention: a subdirectory under `skills/` named after the skill, with the content in a file named `SKILL.md` that includes YAML frontmatter (`name`, `description`, `license`).

The existing `.claude/skills/karpathy-guidelines.md` flat file was not compatible with this convention.

## Decision

Restructure the repository so the skill lives at `skills/karpathy-guidelines/SKILL.md` with YAML frontmatter. Update `README.md` to document both install methods.

## Rationale

Community contribution driven by skills.sh compatibility. The skills.sh ecosystem had gained traction and aligning with its convention enabled discovery and installation through that toolchain.

## Alternatives Considered

- **Keep the flat file, add a separate skills.sh-compatible copy**: Not chosen — would create a third format to maintain.
- **Reject the restructure, document skills.sh as unsupported**: Not chosen — the maintainer accepted the PR, prioritizing ecosystem compatibility.

## Consequences

**Positive:**
- Compatible with the skills.sh ecosystem
- The `SKILL.md` frontmatter format became the canonical skill definition
- Later enabled the Claude Code plugin system to reference `skills/karpathy-guidelines/` as a directory (ADR-005)

**Negative:**
- The `.claude/skills/karpathy-guidelines.md` flat file from ADR-002 became effectively orphaned (it was not immediately removed)
- Three formats now existed simultaneously: CLAUDE.md, flat skills file, skills/ directory

**Subsequent evolution:** This directory structure became the foundation for the plugin manifest (`plugin.json` → `skills: ["./skills/karpathy-guidelines"]`).
