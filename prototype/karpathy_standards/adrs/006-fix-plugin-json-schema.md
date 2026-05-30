# ADR-006 — Fix plugin.json Schema Validation Errors

> Type: Retroactive · Date: 2026-01-31 · Confidence: 🟢 CONFIRMADO  
> Source: Commit `68b67a5` (Shehab Tarek)

---

## Context

After moving the manifest to `.claude-plugin/plugin.json` (ADR-005), Claude Code's plugin schema validation still failed. Three specific errors were identified:

1. `author` was a plain string (`"forrestchang"`) — Claude Code's schema requires an object with a `name` property (`{ "name": "forrestchang" }`)
2. `displayName` was present as a field — not a valid field in the schema
3. `skills` pointed to a file (`"./skills/karpathy-guidelines/SKILL.md"`) — should point to the directory (`"./skills/karpathy-guidelines"`) for auto-discovery

## Decision

Fix all three schema violations:
- Change `author` from `string` → `{ "name": "string" }`
- Remove the `displayName` field
- Change `skills` entry from file path to directory path

## Rationale

Schema compliance fixes — no design choice involved, these are constraints imposed by Claude Code's plugin loader.

## Alternatives Considered

- **Keep `displayName` as a non-standard extension**: Not chosen — schema validation rejects unknown fields.
- **Keep skills pointing to file**: Not chosen — directory-based auto-discovery is the required format; pointing to a file breaks skill loading.

## Consequences

**Positive:**
- Plugin installation works correctly end-to-end after this fix
- The `skills` field now uses directory auto-discovery — if additional files are added to `skills/karpathy-guidelines/`, they are picked up automatically

**Negative:**
- The three-commit fix sequence (ADR-004 → ADR-005 → ADR-006) represents an iterative, trial-and-error stabilization. The Claude Code plugin schema was apparently not well-documented or the documentation was not consulted before ADR-004.

**Lesson captured:** 🟡 INFERIDO — The plugin schema should be consulted before authoring `plugin.json`. The schema is enforced by the Claude Code runtime, not by linting at authoring time.
