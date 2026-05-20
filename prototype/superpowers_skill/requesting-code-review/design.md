# Requesting Code Review, Design

> Technical design for independent review dispatch and feedback triage.

## Interface

**Input:** Completed code change or task checkpoint, plus plan/requirements context. 🟢

**Output:** Reviewer findings grouped into Strengths, Critical, Important, Minor, Recommendations, and merge readiness assessment. 🟢

## Execution Flow

### 1. Trigger Detection

Review is required when:
- a subagent-driven development task completes. 🟢
- a major feature completes. 🟢
- work is ready to merge to main. 🟢

Review is optional but useful when the agent is stuck, before refactoring, or after a complex bug fix. 🟢

### 2. Scope Capture

```bash
BASE_SHA=$(git rev-parse HEAD~1)
HEAD_SHA=$(git rev-parse HEAD)
```

The base SHA may be adjusted to `origin/main` or the commit that started the task. The head SHA identifies the completed work. 🟢

### 3. Reviewer Prompt Assembly

The dispatcher fills the `code-reviewer.md` template:

```text
DESCRIPTION = brief summary of implemented work
PLAN_OR_REQUIREMENTS = path or text describing expected behavior
BASE_SHA = starting commit
HEAD_SHA = ending commit
```

The reviewer prompt instructs the reviewer to inspect `git diff --stat` and `git diff` over the range, then evaluate plan alignment, code quality, architecture, testing, and production readiness. 🟢

### 4. Independent Review

The reviewer returns:
- Strengths.
- Critical issues.
- Important issues.
- Minor issues.
- Recommendations.
- Ready-to-merge verdict. 🟢

The reviewer is intentionally not given the implementer's session history, so the assessment is based on artifacts and diff evidence. 🟢

### 5. Feedback Triage

| Severity | Required Action |
|----------|-----------------|
| Critical | Fix immediately before proceeding |
| Important | Fix before next task or merge |
| Minor | Note or fix opportunistically |
| Wrong feedback | Push back with technical evidence |

This triage integrates with `receiving-code-review`, which governs how to evaluate and respond to returned findings. 🟢

## Internal State

- `base_sha` — review starting point. 🟢
- `head_sha` — review ending point. 🟢
- `description` — summary of implemented work. 🟢
- `plan_or_requirements` — expected behavior source. 🟢
- `review_findings` — structured reviewer response. 🟡
- `readiness_verdict` — Yes, No, or With fixes. 🟢

## Dependencies

- Git for SHA and diff range inspection. 🟢
- Harness subagent/task dispatch facility, mapped through a capability adapter where available. 🟡
- `skills/requesting-code-review/code-reviewer.md` template. 🟢
- `receiving-code-review` behavior for acting on feedback. 🟡

## Design Decisions

| Decision | Evidence | Confidence |
|----------|----------|------------|
| Review gets focused work-product context only | `Requesting Code Review` core principle | 🟢 |
| Git SHAs define review range | `How to Request` section | 🟢 |
| Review after each subagent-driven task | Mandatory trigger list | 🟢 |
| Critical and Important findings block progress | `Act on feedback` section | 🟢 |
| Reviewer output uses calibrated severity categories | `code-reviewer.md` template | 🟢 |

## Observability

Useful trace messages:
- `Code review requested for range BASE..HEAD`
- `Reviewer context: description + plan/requirements attached`
- `Review returned: C critical, I important, M minor`
- `Blocking review findings fixed before proceeding`
- `Reviewer feedback rejected with evidence: ...`

## Risks & Lacunas

- 🟡 `HEAD~1` is only a default; multi-commit tasks or branch ranges may require `origin/main` or a recorded task-start SHA.
- 🟡 Subagent dispatch API differs by harness, so the template is portable but invocation mechanism varies.
- 🟡 The exact reviewer model or agent type is host-specific. A portable reimplementation should define shared concepts (`review_agent`, isolated context, result status) and map them per host, falling back to inline/manual review where subagents are unavailable.

## Reviewer Validation Addendum

- Question 6 answered: all listed engines are first-class targets for skill loading and workflow semantics, but subagent dispatch requires a capability adapter. Do not assume a single-engine contract.
