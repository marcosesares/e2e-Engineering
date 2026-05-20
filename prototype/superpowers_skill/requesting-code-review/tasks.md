# Requesting Code Review, Tasks

> Implementation tasks for review dispatch and feedback handling.

## Prerequisites

- [ ] Completed work exists in git.
- [ ] Requirements, plan, or task text is available.
- [ ] Harness can dispatch a reviewer subagent or equivalent review worker.

## Tasks

### Review Preparation

- [ ] T-01, Determine whether review is mandatory or optional
  - Origin: `skills/requesting-code-review/SKILL.md` — When to Request Review
  - Acceptance: Review is requested after mandatory checkpoints
  - Confidence: 🟢

- [ ] T-02, Capture `BASE_SHA`
  - Origin: `skills/requesting-code-review/SKILL.md` — Get git SHAs
  - Acceptance: Base commit identifies the start of the reviewed change
  - Confidence: 🟢

- [ ] T-03, Capture `HEAD_SHA`
  - Origin: `skills/requesting-code-review/SKILL.md` — Get git SHAs
  - Acceptance: Head commit identifies the completed reviewed change
  - Confidence: 🟢

- [ ] T-04, Prepare implementation description
  - Origin: `skills/requesting-code-review/SKILL.md` — Template placeholders
  - Acceptance: Reviewer receives a concise summary of what was built
  - Confidence: 🟢

- [ ] T-05, Attach plan or requirements context
  - Origin: `skills/requesting-code-review/SKILL.md` — Template placeholders
  - Acceptance: Reviewer can check whether implementation matches expected behavior
  - Confidence: 🟢

### Dispatch

- [ ] T-06, Fill `code-reviewer.md` prompt template
  - Origin: `skills/requesting-code-review/code-reviewer.md`
  - Acceptance: Prompt contains description, requirements/plan, base SHA, and head SHA
  - Confidence: 🟢

- [ ] T-07, Dispatch independent reviewer
  - Origin: `skills/requesting-code-review/SKILL.md` — Dispatch code reviewer subagent
  - Acceptance: Reviewer receives focused context and does not inherit full session history
  - Confidence: 🟢

- [ ] T-08, Require reviewer to inspect diff and evaluate readiness
  - Origin: `skills/requesting-code-review/code-reviewer.md` — What to Check and Output Format
  - Acceptance: Output includes Strengths, Issues by severity, Recommendations, and Assessment
  - Confidence: 🟢

### Feedback Handling

- [ ] T-09, Fix Critical findings immediately
  - Origin: `skills/requesting-code-review/SKILL.md` — Act on feedback
  - Acceptance: No further work proceeds with unresolved Critical issues
  - Confidence: 🟢

- [ ] T-10, Fix Important findings before proceeding
  - Origin: `skills/requesting-code-review/SKILL.md` — Act on feedback
  - Acceptance: Important findings are resolved before next task or merge
  - Confidence: 🟢

- [ ] T-11, Record or defer Minor findings
  - Origin: `skills/requesting-code-review/SKILL.md` — Act on feedback
  - Acceptance: Minor findings are tracked or explicitly left for later
  - Confidence: 🟢

- [ ] T-12, Push back on incorrect review feedback with evidence
  - Origin: `skills/requesting-code-review/SKILL.md` — If reviewer wrong
  - Acceptance: Response cites code/tests or requirements showing why feedback is wrong
  - Confidence: 🟢

### Testing

- [ ] TT-01, Mandatory review after subagent task
  - Verification: Completed task triggers review dispatch with git range
  - Confidence: 🟢

- [ ] TT-02, Major feature review before merge
  - Verification: Review occurs before finishing/merge decision
  - Confidence: 🟢

- [ ] TT-03, Reviewer prompt includes all placeholders
  - Verification: Description, requirements, base SHA, and head SHA are non-empty
  - Confidence: 🟢

- [ ] TT-04, Critical finding blocks progress
  - Verification: Agent fixes Critical finding before continuing
  - Confidence: 🟢

- [ ] TT-05, Wrong reviewer claim receives technical pushback
  - Verification: Agent cites code or tests and does not blindly implement
  - Confidence: 🟢

## Implementation Order

1. Detect review checkpoint.
2. Capture git range.
3. Assemble reviewer prompt from template.
4. Dispatch reviewer.
5. Triage findings.
6. Fix blocking findings or push back with evidence.

## Gaps Pending Validation (🔴)

- 🟡 Exact subagent dispatch mechanism depends on the harness; reimplementation should use a capability adapter and degrade to inline/manual review where subagents are unavailable.
- Exact base SHA selection may require task-start checkpoint data rather than `HEAD~1`.
