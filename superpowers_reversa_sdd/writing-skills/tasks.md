# Writing Skills — Implementation Tasks

## Prerequisites

- [ ] The agent understands `superpowers:test-driven-development`. Confidence: 🟢
- [ ] Scripted prompt fixtures exist to run or simulate independent agent pressure scenarios. Confidence: 🟢
- [ ] The target skill directory and naming convention are known. Confidence: 🟢

## Tasks

- [ ] T-01, Classify the skill request
  - Origin in legacy: `skills/writing-skills/SKILL.md`
  - Criteria done: The request is classified as new skill, edit, or verification, and as discipline, technique, pattern, or reference.
  - Confidence: 🟢

- [ ] T-02, Create baseline pressure scenarios
  - Origin in legacy: `skills/writing-skills/SKILL.md`
  - Criteria done: Scenarios target the exact behavior the skill must teach or enforce.
  - Confidence: 🟢

- [ ] T-03, Run RED baseline
  - Origin in legacy: `skills/writing-skills/SKILL.md`
  - Criteria done: Agent failure without the skill is observed and rationalizations are documented verbatim.
  - Confidence: 🟢

- [ ] T-04, Write minimal `SKILL.md`
  - Origin in legacy: `skills/writing-skills/SKILL.md`
  - Criteria done: Skill content addresses observed failures with required metadata, overview, triggers, quick reference, and examples.
  - Confidence: 🟢

- [ ] T-05, Optimize discovery metadata
  - Origin in legacy: `skills/writing-skills/SKILL.md`
  - Criteria done: Name is valid, description starts with "Use when...", and description contains triggers without workflow summary.
  - Confidence: 🟢

- [ ] T-06, Run GREEN compliance tests
  - Origin in legacy: `skills/writing-skills/SKILL.md`
  - Criteria done: Same scenarios pass with the skill present.
  - Confidence: 🟢

- [ ] T-07, Refactor to close loopholes
  - Origin in legacy: `skills/writing-skills/SKILL.md`
  - Criteria done: New rationalizations become explicit counters and are retested.
  - Confidence: 🟢

- [ ] T-08, Complete quality and deployment checklist
  - Origin in legacy: `skills/writing-skills/SKILL.md`
  - Criteria done: Flowcharts, examples, supporting files, token efficiency, commit, and deployment steps are checked before starting another skill.
  - Confidence: 🟢

## Test Tasks

- [ ] TT-01, Test that skill creation is blocked before RED baseline.
- [ ] TT-02, Test that workflow-summary descriptions are rejected.
- [ ] TT-03, Test that an agent complies under pressure after the skill is loaded.
- [ ] TT-04, Test that edits to existing skills require retesting.

## Pending Gaps (🔴)

- 🟢 Reimplementation should provide scripted prompt fixtures as the universal pressure-test baseline, with actual subagent execution where available.
- 🟡 External skill specification references may require version verification.
