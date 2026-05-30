# Finishing a Development Branch — Branch Completion Decision Tree

> Skill for deciding final disposition of completed feature branch: merge to main, open PR, or discard.

## Overview

Finishing a Development Branch guides the final step of feature development—deciding whether to merge code to main (squash/rebase/merge commit), request review via PR, or discard if work is incomplete or experimental. Enforces verification gates before merge. 🟢

## Responsibilities

- Check branch readiness (all tasks complete, tests green, uncommitted changes none)
- Display merge options (merge/PR/discard) with trade-offs
- Execute chosen disposition (git merge, gh pr create, git branch -D)
- Verify branch is merged/closed/deleted after action
- Handle PR review requirements (blocking vs. automerge)

## Business Rules

- **No-Uncommitted-Changes Rule:** Refuse merge if uncommitted files exist; user must stage/commit first. 🟢
- **Test-Green Rule:** Merge blocked if test suite fails; must fix before finishing. 🟢
- **PR-Open Rule:** If PR already open on branch, offer to proceed directly to merge (don't re-create). 🟡
- **Default Merge Strategy:** Squash commits on feature branch (cleaner history) unless user specifies otherwise. 🟡
- **Delete-Remote-Branch Rule:** After merge, offer to delete remote branch to reduce clutter. 🟡

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| RF-01 | Check branch readiness (tests, uncommitted, branch ahead of main) | Must | Refuse merge if tests red OR uncommitted changes exist |
| RF-02 | Display 3 options: Merge to main, Create PR, Discard branch | Must | User chooses action via menu or explicit command |
| RF-03 | Execute merge (squash/rebase/merge commit per strategy) | Must | `git merge --squash` or `git rebase --interactive` works correctly |
| RF-04 | Create PR if requested | Should | `gh pr create --title "Feature X" --body "..." ` succeeds |
| RF-05 | Discard branch safely (warn user, require confirmation) | Must | `git branch -D` after user confirms intent |
| RF-06 | Delete remote branch after merge (offer, not force) | Should | `git push origin --delete branch-name` on user approval |
| RF-07 | Report final status (merged/PR-created/discarded) | Must | Clear confirmation with branch SHA or PR URL |

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|------------|----------|-----------|
| Safety | No destructive action without user confirmation | Confirm before delete | 🟢 |
| Clarity | Merge/PR/discard options clearly explained | Menu with trade-offs | 🟡 |
| Git Compatibility | Works with squash, rebase, merge-commit strategies | All 3 supported | 🟡 |

## Acceptance Criteria

```gherkin
Scenario: Complete feature, merge to main
Given branch "feature/auth" with all tests passing, no uncommitted changes
When user chooses "Merge to main"
Then branch merged (squash strategy default), remote deleted on approval

Scenario: Tests failing, block merge
Given branch with failing tests
When user chooses "Merge to main"
Then merge refused: "Fix tests before merging"

Scenario: PR already open
Given branch with open PR
When user invokes finishing skill
Then offer: "PR already open (URL). Merge into main OR Continue PR?"

Scenario: Discard experimental work
Given branch with incomplete implementation
When user chooses "Discard branch"
Then confirm: "Delete branch-name? This cannot be undone."
Then branch deleted if confirmed
```

## Priority (MoSCoW)

| Requirement | MoSCoW | Justification |
|-------------|--------|---------------|
| Check readiness | Must | Prevents merging broken/incomplete work |
| Display 3 options | Must | User controls final disposition |
| Merge to main | Must | Happy path for complete features |
| Create PR | Should | Allows review before merge |
| Discard branch | Should | Clean up experimental work |
| Delete remote | Could | Hygiene, not blocking |

## Code Traceability

| File | Function / Section | Coverage |
|------|------------------|----------|
| `skills/finishing-a-development-branch/SKILL.md` | Main skill, decision tree, merge strategies | 🟢 |
