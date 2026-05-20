# ADR-0007: Deprecated skills excluded from `link-skills.sh` and `plugin.json` but kept in repo

> Status: ACCEPTED
> Date: 2026-04-28 (commits `51384f4`, `494e4b2`)
> Confidence: 🟢 CONFIRMED — explicitly coded in `link-skills.sh` exclusion logic; documented in `CLAUDE.md`

---

## Context

When a skill is no longer actively used, two options exist:
1. **Delete it from the repository**
2. **Move it to a `deprecated/` folder and exclude it from publication**

The deletion approach is clean but destroys institutional knowledge — the skill file, its rationale, and its implementation are gone. If a future contributor needs to understand why something was rejected, there is no record.

The `deprecated/` approach preserves the artifact while preventing it from appearing in the active skill registry or being symlinked into `~/.claude/skills/`.

## Decision

Deprecated skills are:
- Moved to `skills/deprecated/`
- Excluded from `link-skills.sh` (not symlinked into `~/.claude/skills/`)
- Excluded from `.claude-plugin/plugin.json` (not published as plugin)
- Excluded from the top-level `README.md` and bucket `README.md` listings
- Retained as browseable files in the repository

When a skill is deprecated as a result of an `enhancement` issue being closed as wontfix, an `.out-of-scope/<concept>.md` entry is also written.

## Alternatives considered

**Option A — Hard delete on deprecation**: Clean repository. Rejected: no institutional knowledge, no git-archaeology record of why something was tried and abandoned.

**Option B — Mark deprecated inline with a flag in frontmatter**: Keep in active folder but flag as deprecated. Rejected: skills still appear in search results and autocomplete; user confusion about whether to use them.

**Option C — Current approach (move to `deprecated/`, exclude from registry)**: Accepted. Balances discoverability (still in repo) with usability (not in active registry).

## Consequences

**Positive:**
- Institutional knowledge preserved — `deprecated/` is browseable
- No confusion in active skill listings
- Git history retains full context of why a skill existed

**Negative:**
- `deprecated/` folder grows indefinitely unless manually pruned
- Contributors might not discover deprecated skills when looking for prior art (browsing only the active buckets)
- Manual discipline required to update all three exclusion points (`link-skills.sh`, `plugin.json`, `README.md`) — no automated enforcement

---

### Known deprecations (from git history)

| Skill | Replaced by | Commit | Date |
|-------|------------|--------|------|
| `ubiquitous-language` | `grill-with-docs` (absorbed) | `62f43a1` | Apr 28 2026 |
| `triage-issue` | `triage` (full state machine) | `a32ebfb` | Apr 28 2026 |
| `github-triage` | `triage` (renamed + abstracted) | `7afa86d` | Apr 28 2026 |
| `domain-model` | Merged into `grill-with-docs` | `62f43a1` | Apr 28 2026 |
| `qa` | No direct successor | `62f43a1` | Apr 28 2026 |
| `request-refactor-plan` | No direct successor | `62f43a1` | Apr 28 2026 |
| `prd-to-plan` | Removed entirely | `a77fa6e` | — |
| `design-an-interface` | `prototype` (UI branch) | `62f43a1` | Apr 28 2026 |
