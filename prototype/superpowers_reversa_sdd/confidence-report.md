# Confidence Report — superpowers

> Updated by Reviewer on 2026-05-17 after processing 10 validation answers.

---

## General Summary

| Level | Count | Percent |
|-------|-------|---------|
| 🟢 CONFIRMED | 888 | 75.6% |
| 🟡 INFERRED / VALIDATED POLICY | 227 | 19.3% |
| 🔴 GAP | 60 | 5.1% |
| **Total** | 1175 | 100% |

**Overall confidence:** 85.2% using `(green + yellow * 0.5) / total`.

## Review Scope

- Units reviewed: 16 feature folders. 🟢
- Canonical files reviewed: 48 files (`requirements.md`, `design.md`, `tasks.md`). 🟢
- Global matrices reviewed: `traceability/code-spec-matrix.md`, `traceability/spec-impact-matrix.md`. 🟢
- Cross-review engine consulted: no; no external `codex:` tool was available in this session. 🟢
- User validation answers processed: 10/10. 🟢

## By Spec

| Spec | Status After Validation |
|------|-------------------------|
| `caveman/` | Auto-activation clarified as host skill-trigger behavior; `caveman-stats` remains 🔴 unsupported/incomplete in this repository. |
| `cavecrew/` | Context budget and compressed-output audience policy resolved. |
| `dispatching-parallel-agents/` | Timeout policy resolved to host default plus optional override. |
| `executing-plans/` | Partial failure policy resolved to diagnose and continue from partial state by default. |
| `finishing-a-development-branch/` | Merge strategy policy resolved to repository/user/platform default. |
| `requesting-code-review/` | Subagent dispatch clarified as host capability adapter with graceful fallback. |
| `subagent-driven-development/` | Cross-engine dispatch clarified as capability adapter; final review remediation and task tracker replacement remain open. |
| `systematic-debugging/` | Evidence persistence target resolved to file-backed evidence/checkpoint model; project-specific diagnostics remain open. |
| `test-driven-development/` | Red/green evidence persistence target resolved; project-specific commands remain open. |
| `verification-before-completion/` | Verification evidence persistence target resolved. |
| `using-git-worktrees/` | Native worktree tools clarified as opportunistic runtime detection with `git worktree` fallback. |
| `writing-plans/` | Automated placeholder lint/check script added to reimplementation contract. |
| `writing-skills/` | Scripted prompt fixtures added as portable pressure-test baseline. |

## Remaining Gaps 🔴

- **`caveman-stats` token accounting is not implemented in this repository.**
  - Affected specs: `caveman`, `caveman-stats`
  - Evidence: answered `questions.md#question-1`; referenced hook files are absent.

- **Project-specific commands and diagnostics remain target-dependent.**
  - Affected specs: `systematic-debugging`, `test-driven-development`, `verification-before-completion`, `finishing-a-development-branch`
  - Evidence: legacy skills do not encode project-specific test commands, instrumentation libraries, or full verification scopes.

- **Final implementation-wide review remediation loop remains underspecified.**
  - Affected spec: `subagent-driven-development`
  - Evidence: legacy text requires final review but does not fully define broad-remediation flow after all per-task gates pass.

- **Cross-engine task tracker replacement remains underspecified.**
  - Affected spec: `subagent-driven-development`
  - Evidence: `TodoWrite` is named, but equivalent behavior for engines without that tracker needs adapter policy.

## Recommendations

- [ ] Implement a small file-backed evidence/checkpoint schema before rebuilding debugging, TDD, and verification workflows.
- [ ] Add a host capability adapter for subagent dispatch, reviewer dispatch, worktree tooling, and task tracking.
- [ ] Treat `caveman-stats` as unsupported until hook files or a host contract are supplied.
- [ ] Add placeholder linting and scripted prompt fixtures as portable quality gates.

## Reclassification History

| From | To | Statement | Evidence |
|------|----|-----------|----------|
| 🔴 | 🟡 | Caveman auto-activation is host skill-trigger behavior, not repository hook behavior. | `questions.md#question-1` |
| 🔴 | 🟢 | Cavecrew compressed output audience is the controller agent; human-facing output should be paraphrased. | `questions.md#question-2` |
| 🔴 | 🟡 | Parallel-agent waits use host default behavior with optional per-task timeout override. | `questions.md#question-3` |
| 🔴 | 🟢 | Plan execution continues from partial state after failed verification unless destructive rollback/broad rewrite is needed. | `questions.md#question-4` |
| 🔴 | 🟢 | Merge strategy is outside the skill default and belongs to repository/user/platform policy. | `questions.md#question-5` |
| 🔴 | 🟡 | Subagent semantics target all listed engines through a host capability adapter. | `questions.md#question-6` |
| 🔴 | 🟢 | Debugging/TDD/verification evidence should persist to a file-backed evidence/checkpoint model. | `questions.md#question-7` |
| 🔴 | 🟡 | Native worktree support is detected opportunistically with `git worktree` fallback. | `questions.md#question-8` |
| 🔴 | 🟢 | Reimplementation should include automated placeholder linting. | `questions.md#question-9` |
| 🔴 | 🟢 | Skill pressure testing should use scripted prompt fixtures as the portable baseline. | `questions.md#question-10` |
