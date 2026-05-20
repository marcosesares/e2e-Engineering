# ADR-003: Multi-Integration AI Agent Support with Provider Abstraction

**Status**: Accepted  
**Decided**: 2026-Q1+ (evolution from v0.1 to v0.8.x; latest integrations added as extensions)  
**Confidence**: 🟡 INFERRED (code structure, multiple integrations, INTEGRATION_REGISTRY pattern)

---

## Context

Specify CLI runs on developer machines and must interact with various AI agents to execute workflows. Agents differ in:
- **API protocols** (REST, CLI, WebSocket)
- **Command format** (Markdown, YAML, JSON)
- **Authentication** (OAuth, API keys, service principals)
- **Models** (Claude, Copilot, Cursor, Windsurf, Devin, etc.)
- **Capabilities** (code generation, planning, testing, review)

**Problem**:
- How to support 30+ agents without hard-coding each one?
- How to add new integrations without core CLI changes?
- How to let users switch agents without changing workflows?
- How to translate a generic workflow into agent-specific format?

**Constraints**:
- Workflow is agent-agnostic (declarative, portable)
- Each agent has different CLI/API conventions
- Some agents are built-in (Claude, Copilot), others community-provided
- Performance: agent selection happens per workflow

---

## Decision

**Adopt a provider-abstraction model with pluggable integrations**:

### Core Design

1. **INTEGRATION_REGISTRY** — Single registry mapping integration keys to integration classes
2. **Base.Integration** ABC — Every integration implements standard interface
3. **Workflow-level defaults** — Workflow specifies default integration + model
4. **Step-level override** — Individual steps can override default agent
5. **Lazy instantiation** — Integrations loaded only when used
6. **Command translation** — Each integration implements format-specific command generation

### Integration Interface

```python
class Integration(ABC):
    key: str                     # e.g., "claude", "copilot", "cursor"
    human_name: str             # Display name
    invoke_separator: str        # "." or "-" (determines CLI command prefix)
    registrar_config: dict       # CommandRegistrar config for this agent
    
    @abstractmethod
    def run_command(self, cmd_name: str, args: dict, model: str) -> dict:
        """Execute a command in this agent."""
        
    @abstractmethod
    def get_models(self) -> list[str]:
        """List available models for this agent."""
```

### Built-In Integrations

| Key | Name | Type | Models | Commands |
|-----|------|------|--------|----------|
| **claude** | Claude | SkillsIntegration | opus-4.7, sonnet-4.6, haiku-4.5 | Markdown (`.specify/` skills) |
| **copilot** | GitHub Copilot | SkillsIntegration | gpt-4-turbo, gpt-4o | YAML (`.copilot/commands/`) |
| **cursor** | Cursor | SkillsIntegration | claude-3.5-sonnet | Cursor-specific format |
| **windsurf** | Windsurf | SkillsIntegration | claude-3.5-sonnet | Windsurf-specific format |
| **devin** | Devin | RestIntegration | devin-v1 | REST API |

### Community Integrations

30+ additional integrations available as extensions or in catalog:
- **Code assistants**: Cursor, Windsurf, CodeBuddy, Codex, Tabnine, Codeium
- **LLM providers**: Gemini, Qwen, Kimi, DeepSeek
- **Specialized agents**: Devin (coding), Roo (DevOps), Shai (security)
- **Internal tools**: AGY, AMP, Bob, Forge, Junie, KiloCode, Kiro-CLI
- **Community**: OpenCode, Generic (user-defined)

---

## Rationale

### Why Provider Abstraction?

**Decoupling**:
- Workflows are agent-agnostic; same workflow runs on Claude, Copilot, Devin, etc.
- Integrations are pluggable; new agents added via extensions without core changes
- Command format is encapsulated; each integration handles its own syntax

**Benefits**:
- Users can switch agents by changing config (not rewriting workflows)
- Team can standardize on one agent per project but override per workflow
- Open ecosystem: 3rd parties can build integrations without forking

### Why INTEGRATION_REGISTRY?

**Single source of truth**:
- Registry loads all available integrations at startup
- Fast lookup by key
- Enables validation (workflow references unknown integration → error)

**Extensibility**:
- Extensions can register new integrations at load time
- No build-time coupling to specific agents

### Why Separate Model Selection?

**Flexibility**:
- Different workflows may use different model versions
- Users can choose budget (cheaper Haiku vs faster Opus)
- Model lifecycle (deprecations, new releases) handled per integration

### Why Command Translation?

**Each agent speaks differently**:
- Claude uses Markdown files in `.specify/` directory
- Copilot uses YAML in `.copilot/commands/`
- Devin uses REST API calls
- Cursor has custom manifest format

Translation layer ensures portable workflows.

---

## Consequences

### Positive

✅ **Portability**: Workflows are agent-agnostic  
✅ **Flexibility**: Users choose agents per workflow or per step  
✅ **Open ecosystem**: Community can build integrations  
✅ **Future-proof**: New agents added without core changes  
✅ **Performance**: Lazy loading (unused integrations don't load)  
✅ **Isolation**: Integration bugs don't affect core CLI

### Negative

⚠️ **Complexity**: Each integration needs full implementation (test, docs, maintenance)  
⚠️ **Integration burden**: 3rd-party integration developers must implement ABC  
⚠️ **Inconsistency**: Different agents have different command formats (not fully portable)  
⚠️ **Version management**: Integrations may lag behind agent updates  
⚠️ **Testing**: Each integration needs integration tests (can't mock)

---

## Alternatives Considered

### A1: Single-Agent CLI
- **Pros**: Simple; no abstraction overhead
- **Cons**: Locks users into one agent; not flexible
- **Rejected**: Too limiting

### A2: Wrapper Script Shell-Outs
- **Pros**: No language coupling
- **Cons**: Slow; hard to capture output; agent-specific logic still needed
- **Rejected**: Doesn't solve abstraction problem

### A3: Declarative Agent Definition (YAML)
- **Pros**: No code needed; configuration-driven
- **Cons**: Can't express complex translation logic; hard to test
- **Rejected**: Too limited for diverse agent APIs

---

## Implementation Checklist

- [x] Design Integration ABC and registry pattern
- [x] Implement SkillsIntegration base for Claude-like agents
- [x] Implement RestIntegration base for API-based agents
- [x] Add CommandRegistrar support for agent-specific formats
- [x] Implement built-in integrations (claude, copilot, cursor, windsurf, etc.)
- [x] Add workflow-level default integration + model
- [x] Add step-level integration override
- [x] Implement integration validation (check available models, auth)
- [x] Add integration discovery in extensions
- [x] Test multi-agent workflows and integration switching

---

## Related Decisions

- **ADR-001**: Opt-in authentication (applies per integration's API endpoint)
- **ADR-002**: Composable presets (commands are templates registered per integration)
- **ADR-004** (inferred): Workflow DAG execution model

---

## Open Questions

- [ ] How to handle integration-specific failures gracefully?
- [ ] How to version integrations independently of core CLI?
- [ ] How to notify users when integration is deprecated?
- [ ] How to handle model availability changes (new models, deprecated models)?
- [ ] Should integrations have priorities (preferred agent if multiple available)?

---

## References

- **Files**:
  - `src/specify_cli/integrations/base.py` (Integration ABC, SkillsIntegration, RestIntegration)
  - `src/specify_cli/integrations/__init__.py` (INTEGRATION_REGISTRY)
  - `src/specify_cli/agents.py` (CommandRegistrar, agent-specific command formats)
  - Multiple integration implementations: `integrations/{key}/__init__.py`
