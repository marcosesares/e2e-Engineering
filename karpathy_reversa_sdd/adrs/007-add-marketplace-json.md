# ADR-007 — Add marketplace.json for Marketplace Discoverability

> Type: Retroactive · Date: 2026-01-31 · Confidence: 🟢 CONFIRMADO  
> Source: Commit `3cf049f` (Shehab Tarek)

---

## Context

Claude Code's plugin marketplace (distinct from direct GitHub installation) requires a `marketplace.json` file alongside `plugin.json` in `.claude-plugin/`. Without it, the plugin can be installed via direct URL but is not discoverable through `/plugin marketplace add`.

## Decision

Add `.claude-plugin/marketplace.json` describing the plugin's marketplace identity: `name`, `id`, `owner`, `metadata`, and a `plugins` array with category classification (`"workflow"`).

## Rationale

Marketplace discoverability significantly increases adoption potential. Users browsing the marketplace find the skill without needing to know the GitHub URL. The `"workflow"` category correctly classifies the skill as a behavioral/process enhancement rather than a tool integration.

## Alternatives Considered

- **Rely only on direct GitHub URL installation**: Not chosen — marketplace discoverability is a significantly lower-friction acquisition path.
- **Use a different category**: `"workflow"` was chosen over alternatives. 🔴 LACUNA: the full set of valid category values is not documented in this repository.

## Consequences

**Positive:**
- Plugin is discoverable via: `/plugin marketplace add forrestchang/andrej-karpathy-skills`
- The marketplace listing provides a separate description and version display from `plugin.json`

**Negative:**
- `marketplace.json` and `plugin.json` now contain redundant fields (`name`, `description`, `version`, `author`, `keywords`) that must be kept in sync manually
- 🔴 LACUNA: no documented process for updating the marketplace listing when the plugin version changes
