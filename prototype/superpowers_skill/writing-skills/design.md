# Writing Skills — Technical Design

## Interface

| Input | Type | Required | Description | Confidence |
|-------|------|----------|-------------|------------|
| Skill idea or edit request | User request/spec | Yes | Trigger for creation, edit, or verification | 🟢 |
| Pressure scenarios | Test prompts for agents | Yes | Baseline and compliance tests | 🟢 |
| Baseline behavior | Verbatim agent failures and rationalizations | Yes | Drives minimal skill content | 🟢 |
| Skill files | `SKILL.md` plus optional supporting files | Yes | Production artifact for process documentation | 🟢 |

| Output | Description | Confidence |
|--------|-------------|------------|
| Tested skill | Skill content verified against pressure scenarios | 🟢 |
| Rationalization counters | Explicit red flags and tables for discipline skills | 🟢 |
| Deployment-ready package | Skill with metadata, discovery terms, examples, and checks complete | 🟢 |

## Main Flow

1. Confirm TDD background and classify the skill type: discipline, technique, pattern, or reference. 🟢
2. Create pressure scenarios suited to the skill type. 🟢
3. Run scenarios without the skill and document baseline failures verbatim. 🟢
4. Identify rationalization patterns and instruction gaps. 🟢
5. Write minimal `SKILL.md` content addressing those failures. 🟢
6. Verify agents now comply with the skill. 🟢
7. Refactor content to close newly discovered loopholes and retest. 🟢
8. Check frontmatter, CSO, naming, examples, flowcharts, supporting files, and token efficiency. 🟢
9. Complete deployment checklist for the current skill before starting another. 🟢

## Dependencies

- `superpowers:test-driven-development` is required background. 🟢
- Scripted prompt fixtures are the portable baseline for pressure testing; actual subagents should run the same fixtures where the host supports dispatch. 🟢
- Agent Skills specification informs frontmatter rules. 🟢
- Referenced files such as `anthropic-best-practices.md`, `testing-skills-with-subagents.md`, and rendering tools may be present as supporting files in the skill directory. 🟡

## Design Decisions Identified

| Decision | Evidence | Confidence |
|----------|----------|------------|
| Skill writing is TDD for documentation | `skills/writing-skills/SKILL.md` | 🟢 |
| Description must describe triggers, not workflow | `skills/writing-skills/SKILL.md` | 🟢 |
| Discipline skills need rationalization counters | `skills/writing-skills/SKILL.md` | 🟢 |
| One skill must be verified and deployed before moving to another | `skills/writing-skills/SKILL.md` | 🟢 |

## Risks and Gaps

- 🟢 Reimplementation should use scripted prompt fixtures as the portable pressure-test harness, with optional actual subagent execution where supported.
- 🟡 External Agent Skills specification details may change over time.
- 🟡 Token targets depend on whether a skill is frequently loaded.

## Reviewer Validation Addendum

- Question 10 answered: pressure testing should be implemented with scripted prompt fixtures as the baseline. For engines without subagent APIs, run the same fixtures as scripted conversations or documented manual review.
