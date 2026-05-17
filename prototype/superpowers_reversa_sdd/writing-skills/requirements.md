# Writing Skills — Requirements

## Overview

Writing Skills applies test-driven development to process documentation: pressure-test agent behavior first, write or edit the skill, verify compliance, then refactor to close loopholes. 🟢

The unit governs new skills, skill edits, and pre-deployment verification. 🟢

## Responsibilities

- Require understanding of `superpowers:test-driven-development` before use. 🟢
- Run baseline pressure scenarios before writing or editing a skill. 🟢
- Document exact rationalizations and failures from baseline behavior. 🟢
- Write minimal skill content that addresses observed failures. 🟢
- Verify agents comply with the skill after writing. 🟢
- Refactor the skill to close new loopholes while preserving compliance. 🟢
- Enforce frontmatter, naming, description, keyword, organization, and token-efficiency rules. 🟢
- Stop after each skill and complete deployment before moving to another skill. 🟢

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| RF-01 | Require TDD background | Must | Skill creation references TDD red-green-refactor discipline |
| RF-02 | Run failing baseline scenarios first | Must | Agent behavior without the skill is observed and documented |
| RF-03 | Write minimal skill content | Must | Content targets baseline failures instead of speculative additions |
| RF-04 | Verify compliance with skill present | Must | Same scenarios pass after skill content is added |
| RF-05 | Close rationalization loopholes | Must | New excuses become explicit counters and are retested |
| RF-06 | Enforce metadata rules | Must | `name` and `description` exist; name is hyphen-safe; description starts with "Use when..." |
| RF-07 | Optimize discovery | Should | Description and body include concrete triggers, symptoms, synonyms, and tool terms |
| RF-08 | Keep content token-efficient | Should | Heavy references and reusable tools move to supporting files |
| RF-09 | Validate flowcharts and examples | Should | Flowcharts are used only for non-obvious decisions; examples are complete and reusable |
| RF-10 | Complete deployment per skill | Must | No batching multiple untested skills before deployment checklist is done |

## Acceptance Criteria

```gherkin
Scenario: New skill has failing test first
Given a new skill is being created
When no baseline pressure scenario has been run
Then the skill document is not written
And the baseline agent failure is captured first
```

```gherkin
Scenario: Description avoids workflow summary
Given a skill frontmatter description
When it summarizes the process instead of triggers
Then the description is rejected
And it is rewritten as "Use when..." triggering conditions
```

```gherkin
Scenario: Skill edit requires retest
Given an existing skill is modified
When the change has not been pressure-tested
Then deployment is blocked
```

## Code Traceability

| File | Section | Coverage |
|------|---------|----------|
| `skills/writing-skills/SKILL.md` | TDD Mapping, CSO, RED-GREEN-REFACTOR, Checklist | 🟢 |
