# Writing Plans — Technical Design

## Interface

| Input | Type | Required | Description | Confidence |
|-------|------|----------|-------------|------------|
| Spec or requirements | Markdown or conversation context | Yes | Source of implementation intent | 🟢 |
| Existing codebase patterns | Files, tests, docs | Yes | Basis for file structure and commands | 🟢 |
| User plan-location preference | Instruction | Optional | Overrides default save path | 🟢 |

| Output | Description | Confidence |
|--------|-------------|------------|
| Implementation plan | Markdown plan with task checkboxes and exact steps | 🟢 |
| Self-review result | Coverage, placeholder, and consistency checks | 🟢 |
| Execution handoff | Choice between subagent-driven and inline execution | 🟢 |

## Main Flow

1. Announce use of the skill. 🟢
2. Check whether the spec spans multiple independent subsystems and suggest splitting if needed. 🟢
3. Inspect codebase patterns enough to map files and responsibilities. 🟢
4. Write the required plan header. 🟢
5. Decompose work into small tasks with create/modify/test file lists. 🟢
6. For each behavior, include TDD steps: failing test, command to verify red, minimal implementation, command to verify green, commit. 🟢
7. Include exact code and commands; avoid placeholders. 🟢
8. Self-review for spec coverage, placeholder text, and type/name consistency. 🟢
9. Save the plan and offer execution mode. 🟢

## Dependencies

- `superpowers:using-git-worktrees` is relevant at execution time when isolated work is needed. 🟢
- `superpowers:subagent-driven-development` or `superpowers:executing-plans` is required for execution handoff. 🟢
- Exact test commands and code examples depend on the target project. 🟡

## Design Decisions Identified

| Decision | Evidence | Confidence |
|----------|----------|------------|
| Plan must be executable by low-context workers | `skills/writing-plans/SKILL.md` | 🟢 |
| File structure is decided before tasks | `skills/writing-plans/SKILL.md` | 🟢 |
| Placeholder text is a plan failure | `skills/writing-plans/SKILL.md` | 🟢 |
| Self-review is performed inline, not delegated | `skills/writing-plans/SKILL.md` | 🟢 |

## Risks and Gaps

- 🟢 Reimplementation should include an automated placeholder lint/check script while preserving manual reviewer judgment as the final semantic quality gate.
- 🟡 Overly large specs require human agreement to split if scope is ambiguous.

## Reviewer Validation Addendum

- Question 9 answered: add automated linting for explicit placeholder patterns such as `TBD`, `TODO`, `fill in`, `implement later`, `similar to`, and missing concrete commands/code in task steps. Manual review remains necessary for semantic placeholders that regex cannot reliably detect.
