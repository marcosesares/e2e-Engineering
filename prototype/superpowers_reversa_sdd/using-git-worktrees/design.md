# Using Git Worktrees — Technical Design

## Interface

| Input | Type | Required | Description | Confidence |
|-------|------|----------|-------------|------------|
| Git repository | Local checkout | Yes | Source repository where work may happen | 🟢 |
| User preference or consent | Instruction or answer | Conditional | Required before creating a new worktree | 🟢 |
| Native worktree tool | Harness capability | Optional | Preferred creation mechanism | 🟢 |
| Project manifests | Files such as `package.json`, `Cargo.toml`, `go.mod` | Optional | Drive setup command selection | 🟢 |

| Output | Description | Confidence |
|--------|-------------|------------|
| Isolated workspace decision | Existing, native-created, git-created, or work-in-place | 🟢 |
| Setup result | Dependency setup status | 🟢 |
| Baseline verification | Test pass/fail evidence before feature work | 🟢 |

## Main Flow

1. Announce use of the skill. 🟢
2. Resolve `GIT_DIR`, `GIT_COMMON`, and branch name. 🟢
3. Check whether the repository is a submodule before treating `GIT_DIR != GIT_COMMON` as linked-worktree evidence. 🟢
4. If already isolated, skip creation and proceed to setup. 🟢
5. If not isolated, honor existing user preference or ask for consent. 🟢
6. Use native worktree tooling when available. 🟢
7. If native tooling is unavailable, select the fallback directory by priority and verify ignore rules for project-local directories. 🟢
8. Create the fallback git worktree or work in place if creation is blocked by sandbox permissions. 🟢
9. Run detected dependency setup and baseline tests. 🟢
10. Report ready only when baseline tests pass; otherwise ask how to proceed. 🟢

## Alternative Flows

- **Detached HEAD:** Report detached state and note branch creation may be needed at finish time. 🟢
- **Submodule:** Treat as normal repository checkout rather than linked worktree. 🟢
- **User declines worktree:** Work in place and still run setup and baseline tests. 🟢
- **Sandbox denial:** Report the block and fall back to current directory. 🟢

## Dependencies

- Git CLI is required for detection and fallback creation. 🟢
- Native worktree tools may exist in specific harnesses; detect exposed capability names at runtime and otherwise use `git worktree` fallback. 🟡
- Package manager setup commands are inferred from manifest files. 🟢
- Exact baseline test command is project-specific. 🟡

## Design Decisions Identified

| Decision | Evidence | Confidence |
|----------|----------|------------|
| Existing isolation is checked before creation | `skills/using-git-worktrees/SKILL.md` | 🟢 |
| Native harness tooling outranks manual git worktrees | `skills/using-git-worktrees/SKILL.md` | 🟢 |
| Project-local worktree folders must be ignored | `skills/using-git-worktrees/SKILL.md` | 🟢 |
| Failing baseline tests require user input | `skills/using-git-worktrees/SKILL.md` | 🟢 |

## Risks and Gaps

- 🟡 The exact native worktree API names are not standardized across harnesses. Recognize native support opportunistically (`EnterWorktree` or equivalent in Claude Code, managed workspaces/worktrees in Codex App when exposed) and otherwise use `git worktree`.
- 🟡 The correct test command must be inferred from the project.
- 🟡 Adding `.gitignore` and committing it may conflict with workflows where the user does not want commits during setup.

## Reviewer Validation Addendum

- Question 8 answered: native worktree support should be recognized opportunistically, not assumed for every engine. Codex CLI, Cursor, OpenCode, Gemini CLI, Factory Droid, and GitHub Copilot CLI should fall back to `git worktree` unless a native capability is detected.
