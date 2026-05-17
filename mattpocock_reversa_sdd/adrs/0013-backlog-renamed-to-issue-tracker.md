# ADR-0013: Term "backlog" replaced with "issue tracker" across all files

> Status: ACCEPTED
> Date: 2026-04-28 (commit `179a14e`)
> Confidence: 🟢 CONFIRMED — commit message explicitly describes the language precision milestone; `domain.md` documents the historical note

---

## Context

The term "backlog" was used throughout skill files to refer to the tool that hosts issues (GitHub Issues, GitLab Issues, etc.). This created two problems:

1. **Semantic imprecision**: "backlog" refers to the collection of work items, not the tool that hosts them. Using it as a noun for the tool (e.g., "post to the backlog") was ambiguous — does "post to the backlog" mean add an issue, or add to the prioritised queue?

2. **Tracker-agnostic refactor mismatch**: when `github-triage` was renamed to `triage` (ADR-0002) and GitLab was added as first-class, the concept of "backlog" became even less meaningful — GitLab doesn't always use the term "backlog" for its issue list, and the local-markdown workflow has no backlog concept at all.

## Decision

Replace all occurrences of "backlog" (as a noun for the hosting tool) with "issue tracker" across:
- All `SKILL.md` files
- `CONTEXT.md`
- `README.md` files
- Supporting documentation

The term "backlog" is now reserved only when quoting a specific external system that uses that term (e.g., a Jira or Azure Boards workflow the user describes).

## Alternatives considered

**Option A — Keep "backlog" for familiarity**: Widely understood term in Agile contexts. Rejected: already causing ambiguity in skill instructions; the tracker-abstraction refactor made precision more important.

**Option B — Use "issue board" or "issue list"**: More neutral alternatives. Rejected: "issue tracker" is the most standard term in developer tooling contexts (GitHub calls itself an issue tracker, GitLab likewise).

**Option C — Current approach ("issue tracker" as the canonical term)**: Accepted. Formalized in `CONTEXT.md` with a historical note.

## Consequences

**Positive:**
- Unambiguous distinction between the tool and the collection of work
- Consistent with tracker-agnostic refactor (ADR-0002)
- Reduced cognitive load when reading skill instructions

**Negative:**
- Breaking change for any documentation or external tooling that references the old term
- Contributors accustomed to "backlog" may accidentally use the old term — no automated lint to catch it
