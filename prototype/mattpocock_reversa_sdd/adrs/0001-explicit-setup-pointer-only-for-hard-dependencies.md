# ADR-0001: Explicit `/setup-matt-pocock-skills` pointer only for hard-dependency skills

> Status: ACCEPTED
> Date: 2026-04-28 (inferred from git history, commit `7afa86d`)
> Confidence: 🟢 CONFIRMED — documented in `docs/adr/0001-explicit-setup-pointer-only-for-hard-dependencies.md`

---

## Context

Engineering skills depend on per-repo configuration (issue tracker URL, triage label vocabulary, domain doc layout) seeded by the `/setup-matt-pocock-skills` skill. As the skill library grew, every engineering skill was accumulating a copy of the setup pointer: _"run `/setup-matt-pocock-skills` if you haven't already."_

Two categories of dependency emerged:
- Skills that **cannot function correctly** without the configuration (wrong output, not just fuzzy output)
- Skills that use the configuration to sharpen output but **degrade gracefully** without it

Cargo-culting the setup pointer into soft-dependency skills added token cost and friction without delivering correctness guarantees.

## Decision

Split engineering skills into two explicit categories:

- **Hard dependency** (`to-issues`, `to-prd`, `triage`): include the explicit one-liner setup pointer. Without the issue-tracker mapping, output is structurally wrong.
- **Soft dependency** (`diagnose`, `tdd`, `improve-codebase-architecture`, `zoom-out`): reference "the project's domain glossary" and "ADRs in the area you're touching" in vague prose only. No explicit setup pointer.

## Alternatives considered

**Option A — Pointer in all skills**: Uniformly require setup in every engineering skill. Rejected: adds unnecessary tokens and friction to skills that work without config.

**Option B — No pointer anywhere; let users discover it**: Rejected: hard-dependency skills silently produce wrong issue-tracker URLs or wrong label strings, creating hidden defects that surface only in production issue trackers.

**Option C — Runtime detection inside each skill**: Have the skill check whether config exists and conditionally surface the pointer. Rejected: natural language skills cannot execute runtime checks; the AI interprets SKILL.md at invocation time, not at runtime.

## Consequences

**Positive:**
- Token-light soft-dependency skills
- No cargo-culted boilerplate in 4 out of 7 engineering skills
- Clear conceptual model: hard = structural requirement, soft = quality enhancement

**Negative:**
- The hard/soft distinction must be maintained manually when new skills are added — there is no automated enforcement.
- A skill can silently drift from soft to hard dependency if its implementation starts requiring issue-tracker specifics without the SKILL.md pointer being updated.
