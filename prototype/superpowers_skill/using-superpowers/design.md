# Using Superpowers — Technical Design

## Interface

| Input | Type | Required | Description | Confidence |
|-------|------|----------|-------------|------------|
| User message | Conversation turn | Yes | Trigger for skill applicability check | 🟢 |
| Available skills | Skill metadata and activation mechanism | Yes | Candidate workflows to invoke | 🟢 |
| User instructions | AGENTS, CLAUDE, GEMINI, direct request | Yes | Highest-priority constraints | 🟢 |
| Platform | Claude Code, Codex, Gemini, Copilot, other | Yes | Determines how a skill is loaded | 🟢 |

| Output | Description | Confidence |
|--------|-------------|------------|
| Activated skills | Relevant skills loaded before action | 🟢 |
| Announced workflow | User-visible statement of skill use and purpose | 🟢 |
| Ordered execution approach | Process skills before implementation skills | 🟢 |

## Main Flow

1. On every user message, check whether any skill may apply. 🟢
2. If a skill is requested by name, activate it. 🟢
3. If a skill may apply, activate it before responding or asking questions. 🟢
4. Announce the skill and purpose. 🟢
5. If the skill has a checklist and the platform supports todos, create tracked items. 🟢
6. Follow the skill exactly unless user instructions conflict. 🟢
7. If multiple skills apply, activate process skills before implementation skills. 🟢

## Dependencies

- Platform-specific skill activation tool is required. 🟢
- Codex, Claude, Gemini, Copilot, and other platforms differ in tool naming. 🟢
- `references/copilot-tools.md` and `references/codex-tools.md` are referenced for mappings but may not exist in every install. 🟡

## Design Decisions Identified

| Decision | Evidence | Confidence |
|----------|----------|------------|
| Skills are mandatory when applicable | `skills/using-superpowers/SKILL.md` | 🟢 |
| Skill check precedes clarifying questions | `skills/using-superpowers/SKILL.md` | 🟢 |
| User instructions outrank skills | `skills/using-superpowers/SKILL.md` | 🟢 |
| Subagents executing assigned tasks skip this skill | `skills/using-superpowers/SKILL.md` | 🟢 |

## Risks and Gaps

- 🔴 The skill relies on platform skill tooling; fallback behavior depends on each agent runtime.
- 🟡 The "1% chance" threshold is intentionally conservative and judgment-based.
