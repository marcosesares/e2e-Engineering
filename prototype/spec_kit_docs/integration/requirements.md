# AI Agent Integration Runtime

> Unit: **integration**  
> **Generated**: 2026-05-16  
> **Confidence**: Extracted from code analysis, domain model

## Overview

The **integration module** provides a runtime layer for connecting Specify CLI to 30+ AI agents (Claude, Copilot, Codex, Tabnine, Gemini, Qwen, etc.). This unit manages integration state (`.specify/integration.json`), loads and validates integration manifests, resolves integration options (raw → parsed → stored), builds slash-command strings for each agent, discovers new integrations via remote catalogs, and validates safe co-installation of multiple integrations. The module acts as an adapter between Specify's internal commands and agent-specific protocols (Markdown, TOML, JSON).

## Responsabilidades

- **Integration Base Classes** — Provide abstract IntegrationBase + concrete subclasses (MarkdownIntegration, TomlIntegration, YamlIntegration, SkillsIntegration) for different agent formats. YamlIntegration used by Goose agent.
- **State Management** — Load/parse/normalize `.specify/integration.json` (selected integration, options, metadata)
- **Option Resolution** — Raw options → parsed options → stored in integration state
- **Command Invocation** — Build slash-command strings for agents (e.g., `/claude-code workflow run`)
- **Manifest Loading** — Load and validate `integration.yml` files (ID, version, metadata, options schema)
- **Catalog Discovery** — Fetch integration metadata from remote catalogs; cache with 1h TTL
- **Multi-Installation Support** — Validate that multiple integrations can coexist safely

## Regras de Negócio

- **30 supported integrations** by default: agy, amp, auggie, bob, claude, codebuddy, codex, copilot, cursor_agent, devin, forge, gemini, generic, goose, iflow, junie, kilocode, kimi, kiro_cli, lingma, opencode, pi, qodercli, qwen, roo, shai, tabnine, trae, vibe, windsurf 🟢
- **Integration state file** `.specify/integration.json` persists: selected integration, parsed options, invoke_separator, script_type 🟢
- **Integration format base classes**:
  - MarkdownIntegration: for Markdown-format agents (Claude, Copilot) 🟢
  - TomlIntegration: for TOML-format agents (Gemini, Tabnine) 🟢
  - SkillsIntegration: for skill-based agents (Claude, Codex) 🟢
- **Manifest schema version** — `integration.yml` must declare `schema_version: "1.0"` 🟢
- **Integration ID format** — Lowercase alphanumeric + hyphens (regex `^[a-z0-9-]+$`) 🟢
- **PEP 440 semantic versioning** — All integrations use `major.minor.patch` format 🟢
- **Dependency specifiers** — `requires.speckit_version` uses PEP 440 specifiers (e.g., `">=0.8.0,<2.0.0"`) 🟢
- **Options schema validation** — Options declared in manifest with type, default, required flags 🟡
- **Option precedence** — CLI args > env vars > manifest defaults > hardcoded defaults 🟡
- **Catalog cache TTL** — 1 hour (shorter than extensions' 24h for responsive updates) 🟢
- **Priority ordering** — Lower numeric priority = higher precedence in multi-catalog merge 🟢
- **Graceful degradation** — If integration not available, fallback to generic integration 🟡

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Load integration state from `.specify/integration.json` | Must | Parse JSON, return IntegrationState object with selected integration, options |
| RF-02 | Save/persist integration state to disk | Must | Write IntegrationState to `.specify/integration.json`, handle missing file gracefully |
| RF-03 | Validate integration manifest (integration.yml) | Must | Check required fields (schema_version, id, name, version, provides), raise ValidationError if invalid |
| RF-04 | Resolve integration options (raw → parsed → stored) | Should | Merge CLI args, env vars, manifest defaults; type-coerce based on schema |
| RF-05 | Build slash-command string for agent invocation | Must | Generate `/integration-id action arg1 arg2` with proper quoting/escaping |
| RF-06 | Select active integration from installed list | Should | User chooses integration, persist to state file, used for future commands |
| RF-07 | Check compatibility of integration with current speckit version | Must | Validate speckit version matches `requires.speckit_version` specifier |
| RF-08 | Fetch integration catalog from remote sources | Must | HTTPS request to catalog URL, parse JSON, validate schema |
| RF-09 | Cache catalog fetch with 1h TTL | Must | Store to `.specify/integrations/.cache/catalog.json` + metadata |
| RF-10 | Merge multiple integration catalogs by priority | Must | First integration ID wins; later catalogs skipped if duplicate |
| RF-11 | Discover available integrations from catalogs | Should | List all available integrations with metadata (name, version, description) |
| RF-12 | Support dynamic agent format detection | Should | Detect if agent requires Markdown, TOML, or JSON format; select appropriate subclass |
| RF-13 | Validate multi-integration coexistence | Won't (current) / Could (future) | Check that multiple installed integrations don't conflict (no shared resource locks). Not implemented. **Design boundary: single-process, user must serialize invocations.** 🟡 |
| RF-14 | Get integration metadata (name, version, options schema) | Should | Load integration manifest for introspection |
| RF-15 | List installed integrations | Should | Return all integrations in registry with enabled status, selected marker |
| RF-16 | Enable/disable integrations without removal | Could | Toggle enabled flag in state; disabled integrations skip command dispatch |
| RF-17 | Remove integration from state | Should | Delete from state file, unregister commands if applicable |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Catalog fetch with cache avoids network on cache hit | `IntegrationCatalog.fetch()` with `is_cache_valid()` check | 🟡 |
| Performance | Integration selection is O(1) lookup via state file | State stores only one active integration ID | 🟢 |
| Segurança | HTTPS required for catalog URLs | `_validate_catalog_url()` enforces HTTPS (localhost HTTP allowed) | 🟢 |
| Segurança | Options schema enforces type validation | Manifest declares option types; parser validates before storing | 🟡 |
| Confiabilidade | Graceful fallback to generic integration | If specific integration unavailable, use `generic` integration | 🟡 |
| Confiabilidade | Resilient catalog fetch with fallback | If catalog fails, use cached version or skip | 🟡 |
| Usabilidade | Clear error messages on validation failures | Validation errors include field name + expected format | 🟡 |
| Manutenibilidade | State + manifest stored as JSON/YAML | Portable, human-readable, version-independent | 🟢 |

> Inferido a partir do código. Validar com equipe de operações.

## Critérios de Aceitação

```gherkin
Scenario: Select active integration
  Dado o usuário tem múltiplas integrations disponíveis
  Quando executa `specify integration select claude`
  Então a integração `claude` é salva em `.specify/integration.json`
  E futuros comandos usam claude para dispatch

Scenario: Resolve integration options
  Dado manifest declara option `model` com default "claude-opus"
  E CLI arg `--model claude-sonnet` é passado
  Quando opções são resolvidas
  Então `model` = "claude-sonnet" (CLI arg vence)

Scenario: Build slash-command for agent
  Dado integration = "claude", action = "workflow run", args = ["plan.md"]
  Quando comando é buildado
  Então string = "/claude workflow run plan.md"
  E quoting é aplicado se args contêm espaços

Scenario: Validate integration manifest
  Dado invalid manifest (missing required field)
  Quando manifest é loadado
  Então ValidationError é raised com field name

Scenario: Fetch integration catalog with cache
  Dado primeira fetch às 14:00
  Quando segunda fetch tentada às 14:30
  Então resultado vem do cache (sem network request)

Scenario: Handle missing integration gracefully
  Dado integration "foo" não existe
  Quando workflow tenta usar "foo"
  Então fallback para "generic" integration com warning
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Load/save integration state | Must | Caminho crítico; without state, no integration selected |
| Build slash-command | Must | Caminho crítico; without this, agents can't receive commands |
| Validate manifest | Must | Segurança; prevents corrupted integrations |
| Check compatibility | Must | Segurança; prevents incompatible integrations |
| Fetch catalogs | Must | Caminho crítico; users discover integrations via catalogs |
| Cache with TTL | Should | Melhora performance; fallback sem cache ainda funciona |
| Resolve options | Should | Nice-to-have; users can hardcode options |
| Select active integration | Should | Convenience; but CLI could pass integration per command |
| List/discover integrations | Should | Debugging/discovery; not critical path |
| Enable/disable | Could | Raro; users can remove and reinstall |
| Dynamic format detection | Could | Nice-to-have; but format can be hardcoded per integration |

> Prioridade inferida por frequência de chamada e posição na cadeia de dependências.

## Rastreabilidade de Código

| Arquivo | Classe / Função | Cobertura |
|---------|-----------------|-----------|
| `src/specify_cli/integrations/base.py` | `IntegrationBase` | RF-05, RF-12 |
| `src/specify_cli/integrations/base.py` | `MarkdownIntegration`, `TomlIntegration`, `SkillsIntegration` | RF-12 |
| `src/specify_cli/integration_state.py` | `IntegrationState` (load/save) | RF-01, RF-02 |
| `src/specify_cli/integrations/manifest.py` | `IntegrationManifest` | RF-03, RF-04, RF-07 |
| `src/specify_cli/integrations/catalog.py` | `IntegrationCatalog` | RF-08, RF-09, RF-10, RF-11 |
| `src/specify_cli/integration_runtime.py` | Integration dispatch logic | RF-05, RF-06, RF-16, RF-17 |
