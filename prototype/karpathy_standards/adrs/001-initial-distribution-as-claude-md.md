# ADR-001 — Initial Distribution as CLAUDE.md Only

> Type: Retroactive · Date: 2026-01-27 · Confidence: 🟢 CONFIRMADO  
> Source: Commit `8462496` (Jiayuan Zhang)

---

## Context

The project was created to address LLM coding pitfalls identified by Andrej Karpathy. The initial decision was how to distribute the behavioral guidelines to Claude Code users.

## Decision

Ship the guidelines as a single `CLAUDE.md` file that users copy into their project root. Claude Code automatically reads `CLAUDE.md` and injects it into the LLM context.

## Rationale

The simplest possible distribution mechanism. No tooling, no install step, no dependencies. Users can inspect and modify the file directly.

## Alternatives Considered

- **Shipping as a Claude Code skill directly**: Not chosen because the skills directory format and Claude Code plugin system were either nascent or not yet known to the author at this point.
- **Publishing to a package registry (npm, PyPI)**: Not chosen — no code to execute, overkill for a text file.

## Consequences

**Positive:**
- Zero setup friction — one `curl` command installs it
- Fully transparent — users see exactly what the LLM is instructed to do
- Works across all Claude Code versions

**Negative:**
- Per-project only — must be repeated for every new project
- Drift risk — copied files diverge from upstream over time
- No auto-update mechanism

**Subsequent evolution:** 7 minutes later, a `.claude/skills/` version was added (ADR-002) to address the per-project limitation.
