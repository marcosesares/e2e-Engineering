# AI Agent Integration Runtime — Design Técnico

> Unit: **integration**  
> **Generated**: 2026-05-16

## Interface

### Core Classes

| Classe | Método Chave | Assinatura | Retorno | Observação |
|--------|-------------|-----------|---------|------------|
| `IntegrationBase` | `invoke_command` | `(action: str, args: List[str])` | `str` | Build slash-command, virtual method |
| — | `resolve_options` | `(raw_options: Dict)` | `Dict` | Parse options, virtual method |
| — | `get_metadata` | `()` | `Dict` | Return name, version, description |
| `MarkdownIntegration` | `invoke_command` | `(action: str, args: List[str])` | `str` | Build `/id action args` format |
| `TomlIntegration` | `invoke_command` | `(action: str, args: List[str])` | `str` | Build TOML-style command |
| `SkillsIntegration` | `invoke_command` | `(action: str, args: List[str])` | `str` | Build skill invocation string |
| `IntegrationState` | `load()` | `(path: Path)` | `IntegrationState` | Load from JSON, static method |
| — | `save()` | `(path: Path)` | `None` | Persist to JSON |
| — | `select_integration` | `(integration_id: str)` | `None` | Set active integration |
| — | `get_active_integration` | `()` | `Optional[str]` | Return currently selected integration ID |
| — | `set_options` | `(integration_id: str, options: Dict)` | `None` | Store options for integration |
| — | `get_options` | `(integration_id: str)` | `Dict` | Retrieve stored options |
| `IntegrationManifest` | `__init__` | `(manifest_path: Path)` | — | Load & validate integration.yml |
| — | `_validate()` | `()` | `None` (ou error) | Enforce schema v1.0 |
| — | `@property id` | `()` | `str` | Integration ID |
| — | `@property name` | `()` | `str` | Human-readable name |
| — | `@property version` | `()` | `str` | Semantic version |
| — | `@property requires_speckit_version` | `()` | `str` | Version specifier |
| — | `@property options_schema` | `()` | `Dict` | Options type definitions |
| `IntegrationCatalog` | `fetch_catalog` | `(force_refresh: bool)` | `Dict` | Merged catalog with cache |
| — | `get_integration_info` | `(integration_id: str)` | `Optional[Dict]` | Lookup single integration |
| — | `download_integration` | `(integration_id: str, target_dir: Path)` | `Path` | Download ZIP file |
| — | `is_cache_valid()` | `()` | `bool` | Check TTL (1h) |
| — | `clear_cache()` | `()` | `None` | Purge cached catalog |

## Fluxo Principal — Select Integration

```
1. User: specify integration select claude
   ↓
2. Load current state (IntegrationState.load())
   → Read .specify/integration.json
   → Parse selected integration, options, metadata
   ↓
3. Fetch integration metadata (if not cached)
   → IntegrationCatalog.fetch_catalog()
   → Lookup "claude" in merged catalog
   ↓
4. Load integration manifest
   → IntegrationManifest.__init__()
   → Validate schema_version, id, required fields
   → Validate speckit version compatibility
   ↓
5. Resolve integration options
   → CLI args override env vars override manifest defaults
   → Validate option types via schema
   → Store in state
   ↓
6. Set active integration
   → IntegrationState.select_integration("claude")
   → Save to .specify/integration.json
   ↓
7. ✅ Selection complete
```

## Fluxo Principal — Invoke Command

```
1. Workflow/CLI: invoke_command(integration_id, action, args)
   ↓
2. Load integration state
   → Get currently selected integration or use specified
   ↓
3. Load integration manifest
   → Get metadata, options schema, format type
   ↓
4. Instantiate appropriate IntegrationBase subclass
   → MarkdownIntegration, TomlIntegration, or SkillsIntegration
   → Based on integration format
   ↓
5. Build slash-command string
   → IntegrationBase.invoke_command(action, args)
   → Format: "/integration action arg1 arg2" (with quoting)
   ↓
6. Return command string
   → Agent receives and executes
```

## Fluxos Alternativos

### Handle Integration Not Found
```
1. Integration requested (e.g., "foo") not found
   ↓
2. Check if "generic" integration available
   ↓
3. Fallback: use "generic" + warning log
   ↓
4. Continue with fallback integration
```

### Validate Multi-Integration Coexistence
```
1. User installs integration B (already have A)
   ↓
2. Check if A and B can coexist:
   - No shared resource locks
   - No conflicting env vars
   - No command name collisions
   ↓
3. If conflict detected: warn or block install
```

### Resolve Options with Precedence
```
1. Manifest declares: option "model" with default "claude-opus"
   ↓
2. User: specify integration select claude --model claude-sonnet
   ↓
3. Precedence order:
   1. CLI arg "--model claude-sonnet" (highest)
   2. Env var SPECIFY_MODEL
   3. Manifest default "claude-opus"
   4. Hardcoded default
   ↓
4. Result: model = "claude-sonnet"
   ↓
5. Store in IntegrationState
```

## Dependências

| Componente | Razão | Como Usa |
|-----------|-------|----------|
| YAML parser | Manifest é YAML | `IntegrationManifest._load_yaml()` |
| `pathlib.Path` | File system abstraction | Paths para manifests, state, cache |
| `json` | State + cache persistence | `.specify/integration.json`, catalog cache |
| `packaging.version` | PEP 440 semver validation | `IntegrationManifest._validate()` |
| `requests` ou `urllib` | HTTP fetch para catalogs | `IntegrationCatalog._open_url()` |
| `datetime` | Timestamps para cache TTL | `is_cache_valid()`, state metadata |
| `.specify/` directory | Config storage | Integration state, cache, manifests |

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| **4 format subclasses**: Markdown, TOML, YAML, Skills | Concrete classes: `MarkdownIntegration` (line 833), `TomlIntegration` (line 919), `YamlIntegration` (line 1126 — used by Goose), `SkillsIntegration` (line 1332) | 🟢 |
| **State file approach**: Single selected integration per session | `IntegrationState` stores one `selected_integration` ID | 🟢 |
| **Catalog cache TTL = 1h**: More responsive than extensions (24h) | Config suggests separate cache timing | 🟢 |
| **Option precedence**: CLI > env > manifest > hardcoded | Common SDD pattern; args override defaults | 🟡 |
| **Graceful fallback**: Use "generic" if integration missing | Resilience pattern for widely-used system | 🟡 |
| **Multi-installation validation**: Check coexistence before install | Safety pattern; prevents resource contention | 🟡 |
| **Manifest schema v1.0**: No forward compatibility | Same as preset/extension for consistency | 🟢 |

## Estado Interno

### Integration State (`.specify/integration.json`)

```json
{
  "schema_version": "1.0",
  "selected_integration": "claude",
  "integrations": {
    "claude": {
      "version": "1.2.3",
      "installed_at": "2026-05-16T12:00:00Z",
      "enabled": true,
      "options": {
        "model": "claude-sonnet",
        "timeout": 30
      }
    },
    "copilot": { ... }
  }
}
```

### Cache (`.specify/integrations/.cache/`)

```
catalog.json                    # Merged integration catalog
catalog-metadata.json           # Timestamp + TTL info
```

## Observabilidade

### Logs esperados

| Evento | Nível | Evidência |
|--------|-------|-----------|
| Integration loaded | DEBUG | `IntegrationManifest.__init__()` completed |
| Validation failure | ERROR | `ValidationError` raised |
| Catalog fetch | INFO | `IntegrationCatalog._open_url()` called |
| Cache hit | DEBUG | `is_cache_valid()` returns True |
| Compatibility check | DEBUG | Version specifier validation |
| Option resolution | DEBUG | Precedence applied (CLI > env > manifest) |
| Integration selected | INFO | `select_integration()` completed |
| Fallback to generic | WARNING | Integration not found, using generic |

### Métricas sugeridas

- `integration_selection_latency_ms` — tempo para select
- `catalog_fetch_duration_ms` — tempo de fetch (rede vs cache)
- `option_resolution_duration_ms` — tempo para resolve options
- `command_invocation_latency_ms` — tempo para build slash-command
- `integration_availability_pct` — % de integrations working

## Riscos e Lacunas

- 🔴 **Multi-installation race condition**: Dois processos selecionando integrations simultaneamente podem corromper state file. Sem lock/mutex.

- 🟡 **Option validation schema**: Como são definidas as regras de tipo? Conforme OpenAPI schema? JSON Schema? Requer validação.

- 🟡 **Command quoting/escaping**: Como argumentos com espaços ou caracteres especiais são escapados? Varia por agente? Requer validação.

- 🟡 **Fallback integration behavior**: Se integration A não disponível e fallback a "generic" ocorre, qual error handling? Silencioso ou warning? Requer validação.

- 🟡 **Extension command registration**: Se extensão tenta registrar comando com agente desconhecido, como falha? Requer validação.

- 🔴 **Catalog URL injection**: `_validate_catalog_url()` enforcement de HTTPS + pattern. Whitelist completa?

- 🔴 **ZIP bomb protection**: `download_integration()` não valida tamanho máximo.

- 🟡 **Cache invalidation strategy**: TTL é simples (1h). Sem versioning. Se integration muda no catálogo remoto, usuário não vê atualização na mesma sessão.

- 🟡 **Coexistence validation not implemented**: Não há validação runtime de coexistência entre integrations. RF-13 (validate multi-integration coexistence) marcado como Won't / Future. Cenários não cobertos: duas integrations declarando mesmo folder, conflito de env var, hooks em modo skill quando integração não está ativa. **Design boundary: usuários devem serializar invocações de integrations paralelas.** Implementação futura (se desejado): adicionar `_validate_no_conflict(self, installed_keys)` em `IntegrationBase`. Custo estimado: T-shirt M.
