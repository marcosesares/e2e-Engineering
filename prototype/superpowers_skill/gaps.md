# Gaps — superpowers

> Updated by Reviewer on 2026-05-17 after processing 10 validation answers.
> Documentation level: detailed.

## Resolved by User Validation

- 🟢 **Cavecrew audience and context-budget policy resolved.**
  - Affected: `cavecrew`
  - Decision: compressed output targets the controller agent; human-facing output should be paraphrased. Context/delegation budgets are advisory by default.
  - Source: `questions.md#question-2`

- 🟢 **Parallel-agent timeout policy resolved.**
  - Affected: `dispatching-parallel-agents`
  - Decision: use host default wait behavior, with optional per-task timeout override only when exposed by the host. Incomplete states are `pending`, `timed_out`, or `returned_partial`.
  - Source: `questions.md#question-3`

- 🟢 **Partial failure recovery policy resolved.**
  - Affected: `executing-plans`
  - Decision: continue from partial state after diagnosing failed verification; ask the user only for destructive rollback, broad rewrite, or materially wrong plans.
  - Source: `questions.md#question-4`

- 🟢 **Merge strategy policy resolved.**
  - Affected: `finishing-a-development-branch`
  - Decision: leave merge strategy to repository/user/platform policy. Local merge uses repository/host default unless overridden.
  - Source: `questions.md#question-5`

- 🟢 **Evidence persistence target resolved for reimplementation.**
  - Affected: `systematic-debugging`, `test-driven-development`, `verification-before-completion`
  - Decision: persist evidence to a project-local file-backed evidence/checkpoint model.
  - Source: `questions.md#question-7`

- 🟢 **Placeholder lint policy resolved.**
  - Affected: `writing-plans`
  - Decision: include automated placeholder linting for explicit patterns while keeping manual semantic review.
  - Source: `questions.md#question-9`

- 🟢 **Skill pressure-test baseline resolved.**
  - Affected: `writing-skills`
  - Decision: scripted prompt fixtures are the portable baseline; actual subagents run those fixtures where supported.
  - Source: `questions.md#question-10`

## Remaining Critical

- 🔴 **`caveman-stats` token accounting is not implemented in this repository.**
  - Affected: `caveman`, `caveman-stats`
  - Impact: Stats behavior must remain unsupported/incomplete until hook files or an equivalent host contract are added.
  - Source: `questions.md#question-1`

## Remaining Moderate

- 🟡 **Subagent dispatch requires per-host capability mapping.**
  - Affected: `requesting-code-review`, `subagent-driven-development`, `dispatching-parallel-agents`, `writing-skills`
  - Impact: Reimplementation can target all listed engines, but exact spawn/isolation/model behavior must be adapted per host or degraded to inline/manual workflows.
  - Source: `questions.md#question-6`, `questions.md#question-10`

- 🟡 **Native worktree support is opportunistic.**
  - Affected: `using-git-worktrees`
  - Impact: Implementation should detect native worktree capabilities when exposed and use `git worktree` fallback otherwise.
  - Source: `questions.md#question-8`

- 🔴 **Project-specific commands and diagnostics remain outside the legacy skills.**
  - Affected: `systematic-debugging`, `test-driven-development`, `verification-before-completion`, `finishing-a-development-branch`
  - Impact: Reimplementation must discover test commands, instrumentation libraries, and verification scopes per target project.

- 🔴 **Final implementation-wide review remediation loop remains underspecified.**
  - Affected: `subagent-driven-development`
  - Impact: The legacy text requires final review but does not fully define the loop if broad integration issues are found after all per-task gates pass.

- 🔴 **Cross-engine task tracker replacement remains underspecified.**
  - Affected: `subagent-driven-development`
  - Impact: `TodoWrite` is named, but substitute behavior for engines without that tracker needs adapter policy.

## Matrix Findings

- 🟢 All 16 feature units identified by the configured `feature` organization have canonical `requirements.md`, `design.md`, and `tasks.md`.
- 🟢 `traceability/code-spec-matrix.md` exists and maps major skill files to feature units.
- 🟡 Harness packaging files are covered by architecture/deployment artifacts, not feature-level units.
- 🟢 No OpenAPI artifact is required because no HTTP/RPC API surface was detected.
