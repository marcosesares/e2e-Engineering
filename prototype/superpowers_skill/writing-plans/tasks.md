# Writing Plans — Implementation Tasks

## Prerequisites

- [ ] A spec or clear requirements exist. Confidence: 🟢
- [ ] The agent can inspect relevant codebase files before planning. Confidence: 🟢

## Tasks

- [ ] T-01, Implement planning activation and announcement
  - Origin in legacy: `skills/writing-plans/SKILL.md`
  - Criteria done: Multi-step specs trigger planning before code edits.
  - Confidence: 🟢

- [ ] T-02, Implement scope check
  - Origin in legacy: `skills/writing-plans/SKILL.md`
  - Criteria done: Independent subsystems are identified and split or flagged.
  - Confidence: 🟢

- [ ] T-03, Implement file-structure mapping section
  - Origin in legacy: `skills/writing-plans/SKILL.md`
  - Criteria done: Files to create, modify, and test are listed with responsibilities.
  - Confidence: 🟢

- [ ] T-04, Generate required plan header
  - Origin in legacy: `skills/writing-plans/SKILL.md`
  - Criteria done: Header includes required sub-skill, goal, architecture, and tech stack.
  - Confidence: 🟢

- [ ] T-05, Generate bite-sized TDD task steps
  - Origin in legacy: `skills/writing-plans/SKILL.md`
  - Criteria done: Each task includes failing test code, red command, minimal implementation, green command, and commit.
  - Confidence: 🟢

- [ ] T-06, Add placeholder and consistency self-review
  - Origin in legacy: `skills/writing-plans/SKILL.md`
  - Criteria done: Placeholder patterns, missing spec coverage, and inconsistent names are corrected before handoff.
  - Confidence: 🟢

- [ ] T-07, Implement execution handoff prompt
  - Origin in legacy: `skills/writing-plans/SKILL.md`
  - Criteria done: Saved plan offers subagent-driven or inline execution choices.
  - Confidence: 🟢

## Test Tasks

- [ ] TT-01, Test that code edits are blocked until plan is written.
- [ ] TT-02, Test that placeholders are detected and replaced.
- [ ] TT-03, Test that every spec requirement maps to a task.
- [ ] TT-04, Test that task code references defined symbols.

## Pending Gaps (🔴)

- 🟢 Reimplementation should include an automated placeholder scanner for explicit placeholder patterns, with manual review as the semantic quality gate.
