# ADR-0010: Setup skills run without verify mode — idempotent by design

> Status: ACCEPTED
> Date: 2026-04-28 (`.out-of-scope/`, inferred)
> Confidence: 🟡 INFERIDO — from `.out-of-scope` entry and `setup-pre-commit` idempotency invariant in `SKILL.md`

---

## Context

Setup skills (`setup-matt-pocock-skills`, `setup-pre-commit`) create configuration files and install tooling in the user's repository. Two concerns arose:

1. **Re-running on an already-configured repo**: if setup runs twice, does it overwrite existing user customizations?
2. **Interactive confirmation prompts**: should setup ask "are you sure?" before writing files?

The `setup-pre-commit` skill explicitly addresses point 1 with an idempotency rule. The `no-verify` mode concern (point 2) applies to the question of whether setup skills should gate on user confirmation before each write.

## Decision

Setup skills are:
- **Idempotent**: running them twice must not overwrite existing user configuration. If a config file already exists (e.g., `.prettierrc`), the skill skips creating it. The rule is "only create if no config exists."
- **Non-interactive for file creation**: no confirmation prompt per file written. Setup is a deliberate user-invoked action; prompting for each file creates friction.
- **Declarative about what they will create**: the SKILL.md documents which files are created, allowing users to understand the effect before invocation.

## Alternatives considered

**Option A — Destructive setup (overwrite unconditionally)**: Simpler logic. Rejected: destroys user customizations on re-run.

**Option B — Interactive per-file confirmation**: Maximum safety. Rejected: friction; setup skills are already opt-in by invocation.

**Option C — Diff-and-merge**: Check existing config, merge new values. Rejected: too complex for natural-language skill implementation; merging config files requires structured parsing.

**Option D — Current approach (skip if exists, no per-file prompt)**: Accepted. Balances safety and usability.

## Consequences

**Positive:**
- Safe to re-run without fear of data loss
- No friction after the initial invocation
- User can read the SKILL.md to know what will be created before running

**Negative:**
- If setup creates a broken config file on first run, re-running will not fix it (skip-if-exists means the broken file stays)
- Users who want to reset to defaults must manually delete the existing config before re-running
