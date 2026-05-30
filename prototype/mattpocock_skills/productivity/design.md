# Design: Productivity Skills Bucket

> Identificador: `002-productivity-skills`
> Data: `2026-05-15`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

---

## 1. Componentes e responsabilidades

| Component | Primary responsibility | State |
|-----------|----------------------|-------|
| `caveman` | Toggle response-compression mode on/off for the session | Stateful (toggle persists across turns) |
| `grill-me` | Open-ended conversational elicitation without pre-existing docs | Stateless per invocation |
| `handoff` | Generate a structured context-transfer document | Stateless per invocation |
| `write-a-skill` | Scaffold a new SKILL.md and update the registry | Stateless per invocation |

---

## 2. Fluxo de controle — `caveman`

```
Session starts → state = INACTIVE
  │
  ├─ Trigger received ("caveman mode" / "less tokens" / "be brief" / /caveman)
  │   └─ state = ACTIVE
  │         ├─ sub-state = COMPRESSING (default)
  │         │
  │         └─ Exception trigger detected:
  │               (security warning | irreversible action | multi-step risk | user confusion / repetition)
  │               └─ sub-state = EXCEPTION
  │                     └─ clear section complete → sub-state = COMPRESSING
  │
  └─ Deactivation received ("stop caveman" / "normal mode")
      └─ state = INACTIVE
```

### Compression rules (COMPRESSING sub-state)

| Content type | Rule |
|-------------|------|
| Prose explanations | Compress: remove filler, shorten sentences, use fragments |
| Code blocks | Verbatim always — no compression |
| Exact error quotes | Verbatim always — no compression |
| Lists | Abbreviate labels; remove redundant items |
| Step-by-step instructions | Compress to imperative verb phrases |

### Exception triggers (→ EXCEPTION sub-state)

| Trigger | Example |
|---------|---------|
| Security warning | "This will expose credentials" |
| Irreversible action | `git reset --hard`, `DROP TABLE`, file deletion |
| Multi-step sequence risk | Complex operation where missing a step causes data loss |
| User confusion / repetition | User asks the same question twice; user appears confused |

---

## 3. Fluxo de controle — `grill-me`

```
/grill-me invoked with intent
  │
  ├─ READ: codebase (if accessible) — answer from code before asking
  │
  LOOP:
  ├─ IDENTIFY: next most important unknown
  ├─ FORMULATE: exactly one question (no batching)
  ├─ ASK
  ├─ RECORD answer
  └─ ASSESS: is output spec complete and unambiguous?
       ├─ YES → produce structured output
       └─ NO  → continue loop (no cap)
```

**Key difference from `grill-with-docs`**: `grill-me` has no pre-existing documentation to read — it relies entirely on the user's answers and any directly accessible codebase. Output is simpler and faster to produce.

---

## 4. Fluxo de controle — `handoff`

```
/handoff invoked
  │
  ├─ ASSESS current session state:
  │   ├─ What was the task?
  │   ├─ What has been done?
  │   ├─ What is the next concrete action?
  │   ├─ What are the blockers?
  │   ├─ What are the open questions?
  │   └─ Which file paths and line numbers are relevant?
  │
  └─ GENERATE structured handoff document:
      ┌────────────────────────────────────────┐
      │ # Handoff — <task description>         │
      │                                        │
      │ ## Current state                       │
      │ <what has been accomplished>           │
      │                                        │
      │ ## Next action                         │
      │ <first thing the next agent should do> │
      │                                        │
      │ ## Blockers                            │
      │ <list of blockers>                     │
      │                                        │
      │ ## Open questions                      │
      │ <unresolved questions>                 │
      │                                        │
      │ ## Relevant files                      │
      │ <file paths + line numbers>            │
      └────────────────────────────────────────┘
```

**Design constraint** (ADR-0005): The document is NOT a passthrough of conversation history. It is a synthesised summary optimised for a fresh agent with no prior context.

**Decay warning** 🟡: File paths and line numbers in the handoff document decay as code changes. The handoff is designed for immediate use, not long-term storage.

---

## 5. Fluxo de controle — `write-a-skill`

```
/write-a-skill invoked
  │
  ├─ INTERVIEW: (one question at a time)
  │   ├─ Skill name (kebab-case)
  │   ├─ Skill purpose and trigger
  │   ├─ Target bucket (engineering | productivity | misc | in-progress | personal)
  │   └─ Any supporting files needed?
  │
  ├─ SCAFFOLD:
  │   ├─ Create skills/<bucket>/<name>/ directory
  │   ├─ Write SKILL.md with frontmatter:
  │   │   ├─ name: <name>
  │   │   ├─ description: ≤ 1024 chars, includes "Use when [trigger]"
  │   │   ├─ license: MIT
  │   │   └─ compatibility: Claude Code, Codex, ...
  │   └─ Write body (imperative instructions, ≤ 100 lines total)
  │
  ├─ IF bucket = engineering OR productivity:
  │   ├─ UPDATE .claude-plugin/plugin.json → add entry
  │   ├─ UPDATE top-level README.md → add linked entry
  │   └─ UPDATE skills/<bucket>/README.md → add one-line description
  │
  └─ IF bucket = misc, in-progress, personal, deprecated:
      └─ DO NOT update plugin.json or README.md
```

---

## 6. Estruturas de dados

### Handoff document schema (🟢)

Source: tutorial Part 11 (enriched from skill SKILL.md).

```markdown
# Handoff — <task description>
> Created: <ISO date>

## Current goal
<what are we trying to accomplish? — the "why">

## Current state
<what has been decided or built in this session>

## Important artifacts
- PRD: <link or path>
- Issues: <links>
- context.md: <path>
- ADRs: <paths>
- Prototypes / branches: <links>

## Domain language
<terms the next agent must understand to continue correctly>
- <term>: <definition>

## Constraints
<what must not change? hard invariants the next agent must not violate>

## Blockers and open questions
- <blocker or unresolved question>

## Relevant files
- `<path/to/file.ts>` — lines <N>-<M>: <why relevant>

## Recommended next action
<the first concrete thing the next agent should do>

## Suggested skill
<grill-with-docs | prototype | tdd | review | triage | etc.>
```

**Design notes** (🟢):
- "Domain language" section prevents the fresh agent from using wrong terminology that conflicts with CONTEXT.md
- "Suggested skill" section closes the loop — the outgoing agent recommends which skill the incoming agent should invoke first
- "Important artifacts" uses links/paths rather than copying content — keeps the document small and avoids stale embedded data

### SKILL.md frontmatter schema (🟢)

```yaml
---
name: <kebab-case-name>
description: "<≤1024 chars. Use when [specific trigger]. ...>"
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI
metadata:
  author: <author>
  version: "<semver>"
---
```

---

## 7. Invariantes de design

| Invariant | Applies to | Source |
|-----------|-----------|--------|
| ACTIVE persists across ALL turns; never auto-deactivates | caveman | `state-machines.md#2` 🟢 |
| EXCEPTION is temporary; COMPRESSING resumes after | caveman | `state-machines.md#2` 🟢 |
| Code blocks and error quotes: verbatim always | caveman | `state-machines.md#2` 🟢 |
| One question per turn; no cap | grill-me | `domain.md#grilling-rules` 🟢 |
| Handoff is a synthesised document, not passthrough | handoff | `adrs/0005` 🟢 |
| plugin.json + README.md: updated for engineering + productivity only | write-a-skill | `CLAUDE.md` 🟢 |
| SKILL.md ≤ 100 lines; description ≤ 1024 chars | write-a-skill | `domain.md#skill-authoring-rules` 🟢 |
