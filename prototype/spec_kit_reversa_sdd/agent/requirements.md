# agent — Command Registrar for AI Agents

> **Unit**: agent  
> **Type**: Feature  
> **Language**: English

---

## Overview

The `agent` module provides centralized command registration with 30+ AI agents (Claude, Copilot, Cursor, Windsurf, Gemini, etc.). It generates agent-specific command files (Markdown with YAML frontmatter, TOML, JSON), parses/renders frontmatter metadata, and manages script path rewriting to ensure commands work across environments.

---

## Responsibilities

- Maintain metadata registry for 30+ AI agents (derived from INTEGRATION_REGISTRY)
- Generate command files in multiple formats (Markdown, TOML, JSON)
- Parse and render YAML frontmatter in Markdown files
- Rewrite script paths from repo-relative to .specify-relative
- Manage context boundaries (<!-- SPECKIT START/END -->) for safe updates
- Support multi-format output (agent-specific optimization)

---

## Business Rules

- **Agent registry is derived from INTEGRATION_REGISTRY** — No separate definition; read from integrations module. 🟢
- **Frontmatter is YAML** — Standard `---\n...\n---\n` format, not custom syntax. 🟢
- **Script paths are rewritten** — `scripts/` becomes `.specify/scripts/` or equivalent. 🟢
- **Context markers prevent overwrites** — `<!-- SPECKIT START -->...<!-- SPECKIT END -->` boundaries preserve external edits. 🟢
- **Format selection is agent-aware** — Markdown for Claude/Copilot, TOML for Gemini, etc. 🟡

---

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criterion |
|----|-----------|----------|-------------------|
| RF-01 | System generates command files for each installed agent | Must | One file per integration in `<agent-dir>/.specify/commands/` |
| RF-02 | Markdown format includes YAML frontmatter | Must | File starts with `---`, metadata section, `---`, then content |
| RF-03 | System parses frontmatter from existing .md files | Should | `parse_frontmatter()` returns dict with all metadata |
| RF-04 | System renders dict → YAML frontmatter | Should | `render_frontmatter()` produces valid YAML block |
| RF-05 | Script paths are rewritten to .specify-relative | Must | `scripts/foo.sh` → `.specify/scripts/foo.sh` in generated file |
| RF-06 | Context boundaries protect custom edits | Should | `<!-- SPECKIT START/END -->` block preserved; external edits outside survive updates |
| RF-07 | TOML format supported for agents | Should | Generate `.toml` file for agents requiring it (Gemini, Tabnine) |
| RF-08 | JSON metadata supported | Could | Generate `.json` file with inline command definitions |
| RF-09 | User can register custom agent commands | Could | Hook `on_agent_register` allows extension plugins to add commands |
| RF-10 | Command file generation is idempotent | Must | Running twice produces identical output |

---

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-----------|----------|-----------|
| Performance | Command file generation <500ms for 30+ agents | Direct templating, no I/O loops | 🟡 |
| Maintainability | Agent configs defined once (INTEGRATION_REGISTRY) | Single source of truth | 🟢 |
| Extensibility | New agents added by extending INTEGRATION_REGISTRY | No hardcoded agent list | 🟢 |
| Safety | Script path rewriting is bulletproof | Regex-based, tested per format | 🟡 |

---

## Acceptance Criteria

```gherkin
Scenario: Generate command file for Claude
  Given integration "claude" in INTEGRATION_REGISTRY
  When user runs 'specify init --integration claude'
  Then .specify/commands/claude.md created
  And frontmatter includes agent metadata (name, description, etc.)
  And command scripts listed in content

Scenario: Parse frontmatter from existing file
  Given .md file with YAML frontmatter and custom content
  When parse_frontmatter() called
  Then dict returned with all metadata keys
  And original content preserved

Scenario: Rewrite script paths
  Given command file with "scripts/test.sh"
  When file generated
  Then path rewritten to ".specify/scripts/test.sh"
  And all script references updated

Scenario: Preserve custom edits outside boundaries
  Given existing .md file with custom section outside SPECKIT markers
  When file regenerated
  Then custom section preserved
  And SPECKIT section updated
```

---

## Scope & Scale

- **Agent count**: 30+ integrations supported
- **Formats**: Markdown (primary), TOML, JSON (secondary)
- **File size**: 1–5 KB per agent (depends on command count)
- **Update frequency**: On `specify init`, manual `specify agent register`, or extension hooks
