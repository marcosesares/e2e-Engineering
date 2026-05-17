# ADR-005 — Move Plugin Manifest to `.claude-plugin/` Directory

> Type: Retroactive · Date: 2026-01-31 · Confidence: 🟢 CONFIRMADO  
> Source: Commits `579a5e3`, `b26f4c3`, `3cf049f` (Shehab Tarek — community PR #17)

---

## Context

After ADR-004 placed `plugin.json` at the repository root, Claude Code's plugin discovery failed. The Claude Code plugin specification requires the manifest to be located at `.claude-plugin/plugin.json`, not at the repository root.

Additionally, the initial implementation pointed to a forked repository URL (`jiayuan7/andrej-karpathy-skills`) instead of the canonical repository (`forrestchang/andrej-karpathy-skills`).

## Decision

Move `plugin.json` to `.claude-plugin/plugin.json`. Fix repository URL to point to the canonical owner. Add `marketplace.json` alongside it for marketplace discoverability.

## Rationale

Claude Code's plugin loader uses `.claude-plugin/` as the required discovery path. This was a compliance fix, not a design choice.

## Alternatives Considered

- **Symlink `plugin.json` to `.claude-plugin/plugin.json`**: Not chosen — symlinks are not reliably supported across all OS and git configurations.
- **Keep root `plugin.json` and add `.claude-plugin/plugin.json` as a duplicate**: Not chosen — would create maintenance burden keeping two files in sync.

## Consequences

**Positive:**
- Plugin installation now works correctly with Claude Code
- Canonical repository URL is now correct
- `.claude-plugin/` directory establishes a clear separation between plugin metadata and skill content

**Negative:**
- The root `plugin.json` became orphaned (not referenced by anything) — 🔴 LACUNA: whether it was cleaned up is not confirmed in the available history
- Three commits were needed to fully stabilize the plugin structure (579a5e3, b26f4c3, 3cf049f), suggesting the fix was iterative rather than planned

**Subsequent evolution:** ADR-006 fixed remaining schema validation errors in the newly located manifest.
