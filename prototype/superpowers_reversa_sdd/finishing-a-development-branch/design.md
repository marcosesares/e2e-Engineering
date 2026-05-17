# Finishing a Development Branch, Design

> Technical design for branch completion and final disposition.

## Interface

**Input:** Current branch context (git status, tests, PR status)

**Output:** Menu with options

```
✅ Branch ready to finish.
  - Tests: PASSING
  - Uncommitted changes: none
  - Branch ahead of main: 3 commits

Choose your action:

1. Merge to main (squash strategy, cleaner history)
2. Create PR (request review before merge)
3. Discard branch (experimental work, not ready)

Type 1, 2, or 3:
```

## Execution Flow

### 1. Readiness Check

```
Steps:
  1. Run `git diff --name-only` (uncommitted changes)
  2. Run `git status --porcelain` (staged/unstaged)
  3. If ≥1 file: FAIL "Uncommitted changes. Stage or commit first."
  
  4. Run test suite (npm test / pytest / framework-detected)
  5. If tests fail: FAIL "Tests failing. Fix before merge."
  
  6. Run `git log main..HEAD --oneline` (commits ahead of main)
  7. If 0 commits: WARN "Branch is identical to main. Any changes to merge?"
  
  8. Check for existing PR: `gh pr list --head $(git rev-parse --abbrev-ref HEAD)`
  9. If PR exists: OFFER "PR already open. Merge directly or continue review?"
```

### 2. Disposition Menu

```
If readiness check passes:
  Show menu with 3 options:
  
  1. Merge to main
     Strategy: repository/host default unless user or project policy specifies squash, rebase, or merge-commit
     Action: git merge by default, or user/project-selected strategy
     After merge: offer to delete remote branch
  
  2. Create PR
     Fetch branch name from git
     Generate PR title (heuristic: branch name → title)
     Offer to populate description from commits
     Execute: gh pr create --title "..." --body "..." --draft (optional)
  
  3. Discard branch
     Confirmation: "Delete branch-name? Cannot undo."
     Execute: git branch -D (local) + git push origin --delete (remote)
     Verify: branch no longer in `git branch -a`
```

### 3. Merge Execution

```
User chooses "Merge to main":
  1. Confirm strategy (repository/host default unless user or project policy overrides)
  2. Stash any uncommitted work (shouldn't exist, but safety)
  3. Checkout main: `git checkout main`
  4. Pull latest: `git pull origin main`
  5. Merge: `git merge [branch-name]` by default, or selected project strategy
  6. Commit: `git commit -m "Merge [branch-name] (feature)"`
  7. Push: `git push origin main`
  8. Report: "Merged. 3 commits squashed into 1."
  9. Offer delete remote: `git push origin --delete [branch-name]`?
  10. Delete local: `git branch -D [branch-name]`
```

### 4. PR Creation

```
User chooses "Create PR":
  1. Fetch current branch name: `git rev-parse --abbrev-ref HEAD`
  2. Title: auto-generate from branch name or prompt user
  3. Body: extract commit messages as bullets
  4. Execute: `gh pr create --title "..." --body "..." --head [branch]`
  5. Fetch PR URL from output
  6. Report: "PR created: https://..."
  7. Option: auto-request reviews (if team configured)
```

### 5. Branch Discard

```
User chooses "Discard branch":
  1. Confirm: "Delete [branch-name]? This cannot be undone."
  2. Delete local: `git branch -D [branch-name]`
  3. Delete remote: `git push origin --delete [branch-name]`?
  4. Verify deleted: `git branch -a` should not show branch
  5. Report: "Branch discarded."
```

## Dependencies

- **Git:** Must be installed and accessible
- **GitHub CLI (gh):** Required for PR creation and PR status checks (optional if PR skipped)
- **Test framework:** npm test / pytest / cargo test / etc., auto-detected

## Design Decisions

| Decision | Evidence | Confidence |
|----------|----------|-----------|
| Leave merge strategy to user/project/platform policy | Skill offers workflow options but does not mandate squash, rebase, or merge commits | 🟢 |
| Confirm before delete | Destructive action safety | 🟢 |
| Check tests before merge | Prevent broken main | 🟢 |
| Refuse on uncommitted | Staged work should be committed | 🟢 |

## Internal State

**Session State:**
- `branch_name: string` — current branch
- `readiness_check: { tests_pass, no_uncommitted, ahead_of_main }`
- `merge_strategy: "repository-default" | "squash" | "rebase" | "merge-commit"`
- `pr_exists: boolean`
- `pr_url: string | null`

## Observability

**Log Signals:**
- "Branch readiness check: tests PASSING, no uncommitted changes, 3 commits ahead"
- "User chose: Merge to main (squash strategy)"
- "Merged successfully. 3 commits squashed."
- "PR created: https://github.com/..."

## Risks & Lacunas

- 🟡 Test detection: Heuristic (package.json scripts, pytest.ini) may fail for unusual setups
- 🟢 Merge strategy: Default belongs to repository/host policy. For local merge, use normal `git merge` unless the user or project policy specifies otherwise. For PRs, the platform/maintainer chooses squash, rebase, or merge at merge time.
- 🟡 Branch name → PR title: Auto-generation from branch names can produce awkward titles (e.g., "fix-typo-in-auth-middleware" → "Fix Typo In Auth Middleware")
- 🟡 Remote branch deletion: Assumes user has push permission; may fail on protected branches

## Reviewer Validation Addendum

- Question 5 answered: merge strategy is outside the skill by default. The skill should present finishing options, not mandate squash, rebase, or merge commits.
