# Using Superpowers — Requirements

## Overview

Using Superpowers establishes the mandatory skill-discovery and skill-activation discipline for every conversation. 🟢

The unit requires relevant or requested skills to be invoked before any response or action, including clarifying questions. 🟢

## Responsibilities

- Check for applicable skills before responding or acting. 🟢
- Invoke a skill when there is even a small chance it applies. 🟢
- Announce the skill and purpose after activation. 🟢
- Follow user instructions above skill instructions when they conflict. 🟢
- Prefer process skills before implementation skills when multiple skills apply. 🟢
- Skip this skill for dispatched subagents executing a specific task. 🟢

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| RF-01 | Perform skill applicability check first | Must | No response or action happens before checking skills |
| RF-02 | Invoke requested or relevant skills | Must | Any named or likely applicable skill is loaded before proceeding |
| RF-03 | Honor instruction priority | Must | User instructions override superpowers skills, which override default prompt behavior |
| RF-04 | Adapt to platform skill tools | Must | Claude, Copilot, Gemini, and other platforms use their respective activation mechanisms |
| RF-05 | Announce active skills | Should | Agent states "Using [skill] to [purpose]" or equivalent |
| RF-06 | Use process-skill priority | Should | Debugging, brainstorming, and similar process skills run before implementation-specific skills |
| RF-07 | Create todos when skills include checklists | Should | Checklist items become tracked todos where the platform supports it |

## Acceptance Criteria

```gherkin
Scenario: Skill applies before clarification
Given a user asks a task that might match a skill
When the agent needs more context
Then the relevant skill is invoked before asking the clarifying question
```

```gherkin
Scenario: User instruction conflicts with skill
Given AGENTS.md says not to use a workflow
And a skill says to use that workflow
When executing the task
Then the user instruction wins
```

```gherkin
Scenario: Multiple skills apply
Given both process and implementation skills apply
When choosing activation order
Then process skills are loaded first
```

## Code Traceability

| File | Section | Coverage |
|------|---------|----------|
| `skills/using-superpowers/SKILL.md` | Rule, Instruction Priority, Skill Priority, Red Flags | 🟢 |
