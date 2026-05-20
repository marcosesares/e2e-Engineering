# Using Git Worktrees — Implementation Tasks

## Prerequisites

- [ ] Git is available. Confidence: 🟢
- [ ] The agent can run shell commands in the repository. Confidence: 🟢
- [ ] User preference or consent is known before new worktree creation. Confidence: 🟢

## Tasks

- [ ] T-01, Add activation announcement
  - Origin in legacy: `skills/using-git-worktrees/SKILL.md`
  - Criteria done: The agent states it is using this skill before workspace setup.
  - Confidence: 🟢

- [ ] T-02, Implement worktree and submodule detection
  - Origin in legacy: `skills/using-git-worktrees/SKILL.md`
  - Criteria done: `GIT_DIR`, `GIT_COMMON`, current branch, and superproject path classify the checkout correctly.
  - Confidence: 🟢

- [ ] T-03, Implement consent and preference handling
  - Origin in legacy: `skills/using-git-worktrees/SKILL.md`
  - Criteria done: Worktree creation respects existing preference or explicit consent.
  - Confidence: 🟢

- [ ] T-04, Implement native-tool-first creation path
  - Origin in legacy: `skills/using-git-worktrees/SKILL.md`
  - Criteria done: Native harness tools are used when available and manual git fallback is skipped.
  - Confidence: 🟢

- [ ] T-05, Implement fallback directory selection and ignore verification
  - Origin in legacy: `skills/using-git-worktrees/SKILL.md`
  - Criteria done: Directory priority and `git check-ignore` rules are enforced.
  - Confidence: 🟢

- [ ] T-06, Implement fallback `git worktree add`
  - Origin in legacy: `skills/using-git-worktrees/SKILL.md`
  - Criteria done: A branch-specific worktree is created only after safety checks pass.
  - Confidence: 🟢

- [ ] T-07, Implement setup and baseline verification
  - Origin in legacy: `skills/using-git-worktrees/SKILL.md`
  - Criteria done: Setup runs based on manifests and tests are run before feature implementation.
  - Confidence: 🟢

## Test Tasks

- [ ] TT-01, Test linked worktree detection skips creation.
- [ ] TT-02, Test submodule detection does not classify as worktree.
- [ ] TT-03, Test unignored project-local directory blocks fallback creation.
- [ ] TT-04, Test failing baseline causes report and pause.

## Data Migration Tasks

- [ ] TM-01, No data migration is required. Confidence: 🟢

## Pending Gaps (🔴)

- 🔴 Native worktree tool names vary by engine.
- 🟡 Baseline test command discovery depends on project conventions.
