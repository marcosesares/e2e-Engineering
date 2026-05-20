# Finishing a Development Branch, Tasks

> Implementation tasks for branch completion workflow.

## Prerequisites

- [ ] Git installed and repository initialized
- [ ] GitHub CLI (gh) installed (for PR creation)
- [ ] Test framework detected and working (npm test / pytest / etc.)

## Tasks

### Readiness Check

- [ ] T-01, Check for uncommitted changes (`git diff --name-only`, `git status`)
  - Origin: Skill definition — readiness gates
  - Acceptance: Detect all modified/staged/untracked files; block merge if any exist
  - Confidence: 🟢

- [ ] T-02, Run test suite to verify tests pass
  - Origin: Skill definition — test-green rule
  - Acceptance: Auto-detect framework (npm, pytest, cargo); run tests; fail merge if red
  - Confidence: 🟡

- [ ] T-03, Check commits ahead of main
  - Origin: Skill definition — branch status
  - Acceptance: `git log main..HEAD --oneline` shows N commits; warn if 0
  - Confidence: 🟢

- [ ] T-04, Check for existing PR on branch
  - Origin: Skill definition — PR-open rule
  - Acceptance: `gh pr list --head [branch]` detects open PR; offer to merge directly
  - Confidence: 🟡

### Merge to Main

- [ ] T-05, Display merge strategy options using repository/host default unless policy overrides
  - Origin: Skill definition — merge strategy
  - Acceptance: User chooses only when policy requires it; otherwise repository/host default applies
  - Confidence: 🟡

- [ ] T-06, Execute repository/host default merge strategy (or chosen strategy)
  - Origin: Skill definition — merge execution
  - Acceptance: Selected strategy completes and preserves the branch handoff policy chosen by the user/project/platform
  - Confidence: 🟢

- [ ] T-07, Commit merged code with message
  - Origin: Skill definition — merge workflow
  - Acceptance: `git commit -m "Merge [branch-name]"` succeeds
  - Confidence: 🟢

- [ ] T-08, Push to main
  - Origin: Skill definition — merge completion
  - Acceptance: `git push origin main` succeeds; PR not required (direct merge)
  - Confidence: 🟢

- [ ] T-09, Offer to delete remote branch
  - Origin: Skill definition — branch cleanup
  - Acceptance: Ask user; if yes, `git push origin --delete [branch-name]`
  - Confidence: 🟡

- [ ] T-10, Delete local branch
  - Origin: Skill definition — final cleanup
  - Acceptance: `git branch -D [branch-name]`
  - Confidence: 🟢

### Create PR

- [ ] T-11, Extract branch name and auto-generate PR title
  - Origin: Skill definition — PR creation
  - Acceptance: Branch "feature/auth-login" → Title "Auth Login" (or prompt user)
  - Confidence: 🟡

- [ ] T-12, Extract commit messages as PR body
  - Origin: Skill definition — PR body content
  - Acceptance: `git log main..HEAD --format=%B` → bullet list
  - Confidence: 🟢

- [ ] T-13, Create PR via GitHub CLI
  - Origin: Skill definition — PR execution
  - Acceptance: `gh pr create --title "..." --body "..." --head [branch]` succeeds
  - Confidence: 🟡

- [ ] T-14, Fetch PR URL and report to user
  - Origin: Skill definition — PR confirmation
  - Acceptance: Output "PR created: https://github.com/..."
  - Confidence: 🟢

### Discard Branch

- [ ] T-15, Confirm branch deletion with user
  - Origin: Skill definition — safety gate
  - Acceptance: Ask "Delete [branch-name]? This cannot be undone."
  - Confidence: 🟢

- [ ] T-16, Delete local branch
  - Origin: Skill definition — branch cleanup
  - Acceptance: `git branch -D [branch-name]` succeeds
  - Confidence: 🟢

- [ ] T-17, Delete remote branch
  - Origin: Skill definition — remote cleanup
  - Acceptance: `git push origin --delete [branch-name]` (if user approves)
  - Confidence: 🟡

- [ ] T-18, Verify branch is deleted
  - Origin: Skill definition — confirmation
  - Acceptance: `git branch -a` no longer shows branch
  - Confidence: 🟢

### Testing

- [ ] TT-01, Merge to main flow: ready branch → selected/default merge → push → delete
  - Verification: Branch merged, remote deleted, local deleted
  - Confidence: 🟡

- [ ] TT-02, Block merge: uncommitted changes present
  - Scenario: Stage changes, try merge → blocked
  - Verification: Merge refused; user instructed to commit
  - Confidence: 🟢

- [ ] TT-03, Block merge: failing tests
  - Scenario: Tests red, try merge → blocked
  - Verification: Merge refused; tests must pass first
  - Confidence: 🟢

- [ ] TT-04, PR creation: generate title, extract body
  - Verification: PR created with correct title and commit list in body
  - Confidence: 🟡

- [ ] TT-05, Discard branch: confirm and delete
  - Scenario: Discard experimental branch
  - Verification: Branch gone from `git branch -a`
  - Confidence: 🟢

- [ ] TT-06, Existing PR: offer merge or continue review
  - Scenario: PR already open on branch
  - Verification: User asked for action; can merge directly or leave PR open
  - Confidence: 🟡

## Implementation Order

1. **Readiness (T-01 to T-04):** Check branches readiness
2. **Merge path (T-05 to T-10):** Merge to main workflow
3. **PR path (T-11 to T-14):** Create PR workflow
4. **Discard path (T-15 to T-18):** Delete branch workflow
5. **Testing (TT-01 to TT-06):** Comprehensive coverage

**Critical Blockers:** None; paths are independent.

## Gaps Pending Validation (🔴)

- **Test framework detection:** Heuristic may fail for monorepos or unusual test setups.
- **PR title generation:** Auto-generated titles from branch names often need manual tweaking.
- **Protected main branch:** Assumes user has permission to push to main. Protected branches may require PR before merge.

## Reviewer Validation Addendum

- Question 5 answered: the skill should not mandate squash, rebase, or merge commits. Use repository/host default `git merge` locally unless the user or project policy specifies otherwise; PR merge strategy is chosen by the platform or maintainer.
