# ship-it is a composition of independent sub-skills, not a monolithic skill file

ship-it sequences independently-invocable sub-skills (grill-me, grill-with-docs, tdd, e2e-loop, phase-transition, context-checkpoint) rather than encoding all logic in one SKILL.md. Each sub-skill is reusable outside the full flow — e.g. `e2e-loop` alone for adding tests to an existing feature, `grill-me` alone for brainstorming without a PRD. A monolith would prevent direct sub-skill invocation and make individual phases untestable in isolation.
