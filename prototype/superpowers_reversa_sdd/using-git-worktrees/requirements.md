# Using Git Worktrees — Requirements

## Overview

Using Git Worktrees ensures feature work starts in an isolated workspace when isolation is needed, while respecting any isolation already provided by the agent harness. 🟢

The unit prioritizes existing linked worktrees, native worktree tools, and only then manual `git worktree` fallback. 🟢

## Responsibilities

- Detect whether the current checkout is already an isolated linked worktree. 🟢
- Distinguish linked worktrees from git submodules. 🟢
- Ask for consent before creating a worktree unless a user preference already exists. 🟢
- Prefer native harness worktree tools over manual git commands. 🟢
- Verify project-local worktree directories are ignored before creating worktrees. 🟢
- Run project setup and baseline tests before implementation. 🟢
- Report and ask before proceeding when baseline tests fail. 🟢

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| RF-01 | Announce use of the worktree skill | Must | Agent states that it is setting up an isolated workspace |
| RF-02 | Detect existing isolation | Must | `git rev-parse --git-dir` and `--git-common-dir` are compared before creation |
| RF-03 | Guard submodules | Must | `git rev-parse --show-superproject-working-tree` prevents submodules from being misclassified |
| RF-04 | Respect user consent and preference | Must | Worktree creation occurs only with prior preference or explicit consent |
| RF-05 | Prefer native tooling | Must | Harness worktree tools are used before `git worktree add` |
| RF-06 | Select directory by priority | Must | Explicit preference, `.worktrees`, `worktrees`, global legacy path, then `.worktrees` default |
| RF-07 | Verify ignore rules | Must | Project-local worktree folder is ignored before creation |
| RF-08 | Create fallback git worktree | Should | Manual worktree is created only when no native tool exists |
| RF-09 | Run dependency setup | Should | Known manifests trigger install/build/download commands |
| RF-10 | Verify baseline | Must | Project-appropriate tests are run before implementation proceeds |

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-------------|----------|------------|
| Safety | Do not create nested or duplicate worktrees | `skills/using-git-worktrees/SKILL.md` | 🟢 |
| Compatibility | Prefer harness-native tools | `skills/using-git-worktrees/SKILL.md` | 🟢 |
| Repository hygiene | Worktree folders must not be accidentally tracked | `skills/using-git-worktrees/SKILL.md` | 🟢 |
| Reliability | Baseline tests distinguish pre-existing failures from new regressions | `skills/using-git-worktrees/SKILL.md` | 🟢 |

## Acceptance Criteria

```gherkin
Scenario: Existing linked worktree is detected
Given the git directory differs from the common git directory
And the repository is not a submodule
When the workflow starts
Then no new worktree is created
And the agent reports the current path and branch state
```

```gherkin
Scenario: Project-local fallback is safe
Given no native worktree tool exists
When a project-local worktree directory is selected
Then the directory is verified as ignored before `git worktree add` runs
```

```gherkin
Scenario: Baseline tests fail
Given setup completed
When baseline tests fail
Then the failures are reported
And the agent asks before proceeding with implementation
```

## Code Traceability

| File | Section | Coverage |
|------|---------|----------|
| `skills/using-git-worktrees/SKILL.md` | Step 0 through Step 4, Quick Reference, Red Flags | 🟢 |
| `_reversa_sdd/flowcharts/using-git-worktrees.md` | Worktree flow summary | 🟢 |
