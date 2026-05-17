# ADR-0002: `github-triage` renamed to `triage` (tracker-agnostic abstraction)

> Status: ACCEPTED
> Date: 2026-04-28 (commit `7afa86d`)
> Confidence: 🟢 CONFIRMED — commit message references issues #88, #89

---

## Context

The original skill was named `github-triage` and was tightly coupled to GitHub Issues — it used GitHub-specific API calls, label names, and URL patterns. When issue tracker support was expanded to include GitLab (issue #98) and local-markdown workflows, the GitHub-specific naming became misleading and the skill needed to handle multiple backends.

Commit `7afa86d` simultaneously:
- Renamed `github-triage` → `triage`
- Added GitLab as a first-class issue tracker
- Introduced the `triage-labels.md` mapping layer to decouple label strings from tracker implementation
- Introduced the hard/soft dependency split (see ADR-0001)

## Decision

Rename the skill to `triage` and abstract all issue-tracker specifics behind a configuration layer (`triage-labels.md`) seeded by `/setup-matt-pocock-skills`. The skill operates identically regardless of whether the tracker is GitHub, GitLab, or local markdown.

## Alternatives considered

**Option A — Keep `github-triage`, add `gitlab-triage`**: Separate skills per tracker. Rejected: duplicated state-machine logic, divergent invariants over time, harder maintenance.

**Option B — Keep `github-triage` name, expand internally**: Add GitLab support under the old name. Rejected: misleading to users on GitLab or local-markdown workflows.

**Option C — Current approach (tracker-agnostic `triage`)**: Single skill with a mapping layer. Accepted.

## Consequences

**Positive:**
- Skill name reflects function, not implementation substrate
- GitLab and local-markdown users first-class citizens
- Single state machine to maintain

**Negative:**
- Existing users of `github-triage` need to update their invocations (breaking rename — no backwards-compat shim)
- The mapping layer (`triage-labels.md`) must be present for the skill to work — adds a hard dependency on setup
