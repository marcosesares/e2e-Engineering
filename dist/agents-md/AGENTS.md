# Agents

Codex routing block. Trigger phrases → skill entry points.

| Trigger | Skill |
|---------|-------|
| "e2e-engineering", "e2e-eng", "ship-it", "implement feature", "build this end to end", "run the full flow" | `.agents/skills/e2e-engineering/SKILL.md` |
| "e2e-flight", "flight", "drain the queue", "implement the selected tasks" | `.agents/skills/e2e-flight/SKILL.md` |
| "grill-with-docs", "stress-test my plan", "challenge this plan" | `.agents/skills/grill-with-docs/SKILL.md` |

**Note:** e2e-flight requires worker fan-out capability and branch-visible worker changes. Emits `<e2e-stall reason="fanout-unavailable" />` or `<e2e-stall reason="worker-changes-unavailable" />` if unavailable; never falls back to inline slice work (ADR 0023).
