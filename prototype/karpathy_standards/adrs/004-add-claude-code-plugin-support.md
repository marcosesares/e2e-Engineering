# ADR-004 — Add Claude Code Plugin Support

> Type: Retroactive · Date: 2026-01-30 · Confidence: 🟢 CONFIRMADO  
> Source: Commit `82467fa` (Shehab Tarek — community PR #13)

---

## Context

Claude Code introduced a plugin system allowing skills to be distributed and installed from GitHub repositories via `/plugin install`. This enables users to install a skill once and have it available across all Claude Code sessions without copying files.

The existing install methods (CLAUDE.md copy, skills directory) required manual steps per user or per project.

## Decision

Add a `plugin.json` manifest at the repository root to declare this project as a Claude Code plugin, enabling installation via:
```
claude plugins add https://github.com/jiayuan7/andrej-karpathy-skills
```

## Rationale

The plugin system is the intended canonical distribution mechanism for Claude Code skills. It solves the update problem (plugins can be updated centrally) and the per-project friction (install once, available everywhere).

## Alternatives Considered

- **Continue with only CLAUDE.md and skills.sh**: Not chosen — the plugin system provides a significantly better install UX and auto-discoverability.
- **Wait for the official Claude Code marketplace**: Not chosen — the community PR added plugin support without waiting for the marketplace step (which came later in ADR-006).

## Consequences

**Positive:**
- Single install command covers all projects
- Enables future auto-update via the plugin system
- Community-driven adoption — the plugin format is the most prominent install method in the README after this point

**Negative:**
- `plugin.json` was placed at the repository root — this turned out to be incorrect (Claude Code requires `.claude-plugin/plugin.json`, not `plugin.json` at root). Required two follow-up fixes (ADR-005, ADR-006).
- Added a co-author attribution to `Claude Opus 4.5` in the commit, indicating the plugin manifest was AI-generated — potential quality risk for schema compliance.

**Subsequent evolution:** Required two breaking structural fixes in the same day (ADR-005) and the next day (ADR-006).
