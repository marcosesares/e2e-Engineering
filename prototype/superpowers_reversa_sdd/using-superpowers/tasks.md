# Using Superpowers — Implementation Tasks

## Prerequisites

- [ ] Skill metadata is available at session start or through discovery. Confidence: 🟢
- [ ] The platform exposes a skill activation mechanism or readable skill files. Confidence: 🟡

## Tasks

- [ ] T-01, Implement pre-response skill applicability check
  - Origin in legacy: `skills/using-superpowers/SKILL.md`
  - Criteria done: Every user task is checked for matching skills before any response or action.
  - Confidence: 🟢

- [ ] T-02, Implement requested-skill activation
  - Origin in legacy: `skills/using-superpowers/SKILL.md`
  - Criteria done: Named skills are loaded immediately.
  - Confidence: 🟢

- [ ] T-03, Implement instruction-priority resolution
  - Origin in legacy: `skills/using-superpowers/SKILL.md`
  - Criteria done: User instructions override skill instructions on conflict.
  - Confidence: 🟢

- [ ] T-04, Implement platform activation adapter
  - Origin in legacy: `skills/using-superpowers/SKILL.md`
  - Criteria done: Claude, Copilot, Gemini, Codex, and generic environments use appropriate activation or file-loading behavior.
  - Confidence: 🟡

- [ ] T-05, Implement skill ordering
  - Origin in legacy: `skills/using-superpowers/SKILL.md`
  - Criteria done: Process skills are applied before implementation skills when both match.
  - Confidence: 🟢

- [ ] T-06, Implement checklist-to-todo handling
  - Origin in legacy: `skills/using-superpowers/SKILL.md`
  - Criteria done: Skill checklists are tracked when the platform has a todo mechanism.
  - Confidence: 🟢

## Test Tasks

- [ ] TT-01, Test that clarifying questions do not bypass skill activation.
- [ ] TT-02, Test that direct user skill requests are honored.
- [ ] TT-03, Test that user instructions override conflicting skill instructions.
- [ ] TT-04, Test process-before-implementation ordering.

## Pending Gaps (🔴)

- 🔴 Platform-specific skill APIs are not normalized by this skill.
