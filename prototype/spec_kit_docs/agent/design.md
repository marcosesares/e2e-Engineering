# agent — Design Técnico

> **Unit**: agent  
> **Type**: Feature  
> **Language**: English

---

## Interface

### CommandRegistrar (Main Orchestrator)

| Method | Signature | Returns | Notes |
|--------|-----------|---------|-------|
| `__init__()` | — | CommandRegistrar | Lazy-load INTEGRATION_REGISTRY |
| `register_for_agent()` | `agent_id: str, format: str = "md"` | Path | Generate & save command file |
| `register_all()` | — | list[Path] | Register all integrations |
| `get_agent_configs()` | — | list[AgentConfig] | Return all agent metadata |

### FrontmatterOps

| Function | Input | Output | Notes |
|----------|-------|--------|-------|
| `parse_frontmatter()` | file_path | dict | Extract YAML from .md start |
| `render_frontmatter()` | dict | str | Convert dict → YAML block |
| `update_frontmatter()` | file_path, dict | None | Update metadata in place |

### PathRewriting

| Function | Input | Output | Notes |
|----------|-------|--------|-------|
| `rewrite_project_relative()` | file_path, content | str | `scripts/` → `.specify/scripts/` |
| `rewrite_for_format()` | format, path | str | Format-specific path syntax |

---

## Frontmatter Schema (Markdown)

```yaml
---
agent: "claude"
agent_name: "Claude"
agent_description: "Anthropic's Claude AI"
format: "markdown"
speckit_version: ">=0.8.0"
generated_at: "2026-05-16T00:00:00Z"
commands:
  - name: "analyze"
    description: "Analyze codebase"
  - name: "specify"
    description: "Generate specifications"
---
```

---

## Core Workflow

1. **Load Agent Configs** (`src/specify_cli/agents.py:100–200`)
   - Read INTEGRATION_REGISTRY (lazy-loaded from integrations.py)
   - Build list of AgentConfig objects
   - 🟢 CONFIRMADO

2. **Determine Format** (`agents.py:200–250`)
   - Default: Markdown (.md)
   - Override by format flag or agent preferences
   - For Gemini/Tabnine: TOML; for generic: JSON
   - 🟡 INFERIDO

3. **Generate Content** (`agents.py:250–400`)
   - Build frontmatter dict from AgentConfig
   - Render YAML block
   - Add command listings
   - Rewrite script paths via regex
   - 🟢 CONFIRMADO

4. **Manage Context Boundaries** (`agents.py:400–500`)
   - If file exists: parse frontmatter
   - Preserve content outside `<!-- SPECKIT START/END -->` markers
   - Update only marked section
   - Write file atomically
   - 🟡 INFERIDO

5. **Register All** (`agents.py:500–600`)
   - Iterate over all agents in registry
   - Generate one file per agent
   - Return list of created paths
   - 🟡 INFERIDO

---

## TOML Format (Alternative)

```toml
[agent]
name = "claude"
description = "Anthropic's Claude"

[[commands]]
name = "analyze"
description = "Analyze codebase"

[[commands]]
name = "specify"
description = "Generate specifications"
```

---

## Error Handling

- **Missing INTEGRATION_REGISTRY**: Fall back to hardcoded agent list
- **File write conflict**: Use atomic rename (write to temp file, then move)
- **Invalid frontmatter**: Log warning, regenerate
- **Path rewrite failure**: Log error, use original path

---

## Diagram: Execution Flow

```
[register_for_agent(agent_id)]
    ↓
[Load AgentConfig from registry]
    ↓
[Determine format (md/toml/json)]
    ↓
[Generate content + rewrite paths]
    ↓
[If file exists: parse & preserve boundaries]
    ↓
[Write atomically]
    ↓
[Return file path]
```
