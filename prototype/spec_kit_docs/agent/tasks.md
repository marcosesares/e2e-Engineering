# agent — Tarefas de Implementação

> **Unit**: agent  
> **Language**: English

---

## Pré-requisitos

- [ ] INTEGRATION_REGISTRY fully populated in integrations.py
- [ ] AgentConfig dataclass defined
- [ ] File I/O utilities (atomic write, safe path handling)

---

## Phase 1: Core Registrar

- [ ] T-01: Implement CommandRegistrar class
  - Origin: `src/specify_cli/agents.py:1–150`
  - Criteria: Init loads INTEGRATION_REGISTRY; provides register_for_agent(), register_all()
  - Confidence: 🟢

- [ ] T-02: Implement agent config loading
  - Origin: `src/specify_cli/agents.py:150–250`
  - Criteria: Lazy-load INTEGRATION_REGISTRY; build AgentConfig list; cache results
  - Confidence: 🟢

- [ ] T-03: Implement format detection
  - Origin: `src/specify_cli/agents.py:250–300`
  - Criteria: Default Markdown; check agent.preferred_format for override; handle Gemini/Tabnine special cases
  - Confidence: 🟡

---

## Phase 2: Content Generation

- [ ] T-04: Implement parse_frontmatter()
  - Origin: `src/specify_cli/agents.py:300–400`
  - Criteria: Extract YAML from .md; return dict; handle missing frontmatter gracefully
  - Confidence: 🟢

- [ ] T-05: Implement render_frontmatter()
  - Origin: `src/specify_cli/agents.py:400–450`
  - Criteria: Convert dict → YAML; include metadata (agent, generated_at, format)
  - Confidence: 🟢

- [ ] T-06: Implement command content generation
  - Origin: `src/specify_cli/agents.py:450–550`
  - Criteria: Build command list; format per type (Markdown table, TOML array, JSON object)
  - Confidence: 🟡

---

## Phase 3: Path Rewriting

- [ ] T-07: Implement path rewriting for Markdown
  - Origin: `src/specify_cli/agents.py:550–650`
  - Criteria: Regex: `scripts/` → `.specify/scripts/`; preserve inline code blocks
  - Confidence: 🟢

- [ ] T-08: Implement path rewriting for TOML
  - Origin: `src/specify_cli/agents.py:650–700`
  - Criteria: Same regex but TOML-safe; handle string escaping
  - Confidence: 🟡

- [ ] T-09: Implement path rewriting for JSON
  - Origin: `src/specify_cli/agents.py:700–750`
  - Criteria: Parse JSON; rewrite in dict; serialize back
  - Confidence: 🟡

---

## Phase 4: Safe Updates & Context Boundaries

- [ ] T-10: Implement context boundary parsing
  - Origin: `src/specify_cli/agents.py:750–850`
  - Criteria: Find `<!-- SPECKIT START --> ... <!-- SPECKIT END -->` blocks; preserve outside content
  - Confidence: 🟡

- [ ] T-11: Implement atomic file write
  - Origin: `src/specify_cli/agents.py:850–900`
  - Criteria: Write to temp file; atomic rename (no partial writes); preserve permissions
  - Confidence: 🟢

---

## Phase 5: CLI Integration

- [ ] T-12: Implement 'specify agent register' command
  - Origin: `src/specify_cli/__init__.py:agent_command()`
  - Criteria: `specify agent register [--agent <id>]`; supports all/single agent
  - Confidence: 🟡

- [ ] T-13: Implement hook integration
  - Origin: `src/specify_cli/extensions.py:hook_dispatcher()`
  - Criteria: Fire `on_agent_register` hook; allow extensions to inject commands
  - Confidence: 🟡
