# Preset Management System — Design Técnico

> Unit: **preset**  
> **Generated**: 2026-05-16

## Interface

### Core Classes

| Classe | Método Chave | Assinatura | Retorno | Observação |
|--------|-------------|-----------|---------|------------|
| `PresetManifest` | `__init__` | `(manifest_path: Path)` | — | Carrega e valida YAML |
| — | `_validate()` | `()` | `None` (ou `PresetValidationError`) | Enforça schema v1.0 |
| — | `@property id` | `()` | `str` | ID do preset (regex `^[a-z0-9-]+$`) |
| — | `@property name` | `()` | `str` | Nome legível |
| — | `@property version` | `()` | `str` | Semantic version (PEP 440) |
| — | `@property requires_speckit_version` | `()` | `str` | Specifier (e.g., `">=0.8.0,<2.0.0"`) |
| — | `@property templates` | `()` | `List[Dict]` | Template definitions |
| `PresetRegistry` | `_load()` | `()` | `Dict` | Load `.registry` ou empty template |
| — | `_save()` | `()` | `None` | Persist to disk, cria parent dirs |
| — | `add(pack_id, metadata)` | `(str, Dict)` | `None` | Insert preset + timestamp |
| — | `update(pack_id, updates)` | `(str, Dict)` | `None` | Merge metadata, preserva `installed_at` |
| — | `remove(pack_id)` | `(str)` | `None` | Delete from registry |
| — | `get(pack_id)` | `(str)` | `Optional[Dict]` | Deep copy of metadata |
| — | `list()` | `()` | `Dict[str, Dict]` | Todos os presets registrados |
| — | `list_by_priority()` | `()` | `List[tuple]` | Sorted by priority (lower = higher) |
| `PresetManager` | `check_compatibility` | `(manifest, speckit_version)` | `bool` | Valida version specifier |
| — | `install` | `(preset_source, preset_id, options)` | `None` | Full install orchestration |
| — | `remove` | `(preset_id, keep_config)` | `None` | Uninstall com rollback |
| — | `get_preset` | `(preset_id)` | `Optional[PresetManifest]` | Load manifest do installed preset |
| — | `list_installed` | `()` | `List[Dict]` | Todos os presets com metadata |
| `PresetCatalog` | `get_active_catalogs()` | `()` | `List[PresetCatalogEntry]` | Filter enabled catalogs |
| — | `fetch_catalog` | `(force_refresh)` | `Dict` | Merged catalog, with cache |
| — | `get_preset_info` | `(preset_id)` | `Optional[Dict]` | Lookup single preset |
| — | `download_preset` | `(preset_id, target_dir)` | `Path` | Download ZIP file |
| — | `is_cache_valid()` | `()` | `bool` | Check TTL (1h) |
| — | `clear_cache()` | `()` | `None` | Purge cached catalogs |
| `PresetResolver` | `resolve` | `(template_name, template_type, skip_presets)` | `Optional[Path]` | Via 4-level priority stack |
| — | `resolve_content` | `(template_name, template_type)` | `Optional[str]` | Resolve & read content |
| — | `collect_all_layers` | `(template_name, template_type)` | `List[Dict]` | All layers (for composition) |
| — | `resolve_core` | `(template_name, template_type)` | `Optional[Path]` | Skip presets (core-only) |

### Exceptions

```python
PresetError                    # Base exception
PresetValidationError          # Manifest schema invalid
PresetCompatibilityError       # Version mismatch
```

## Fluxo Principal — Installation

```
1. User: specify preset install <preset-id>
   ↓
2. Fetch source (remote catalog or local dir)
   → PresetCatalog.fetch_catalog() [if remote]
   → URL validation (HTTPS-only)
   → Cache check (1h TTL)
   → If cache invalid: fetch + save
   → Merge multiple catalogs (priority-based)
   ↓
3. Load & validate manifest (preset.yml)
   → PresetManifest.__init__() + _load_yaml()
   → Validate required fields (schema_version, preset, requires, provides)
   → Validate ID format (regex ^[a-z0-9-]+$)
   → Validate version (PEP 440)
   → Validate templates (≥1, valid type/strategy)
   → If invalid: PresetValidationError
   ↓
4. Check compatibility
   → PresetManager.check_compatibility()
   → Compare speckit version vs preset.requires.speckit_version
   → If mismatch: PresetCompatibilityError
   ↓
5. Copy preset files
   → Download ZIP [if remote] via _open_url()
   → Extract to temp dir
   → shutil.copytree() → .specify/presets/{preset_id}/
   → Load .presetignore (if exists) + apply ignore function
   ↓
6. Compose non-replace templates
   → For each template with strategy ∈ {prepend, append, wrap}:
     • collect_all_layers(template_name)
     • Check if this preset is top-priority layer
     • resolve_content() + compose layers
     • Write to .composed/{name}
   ↓
7. Register commands with agents
   → CommandRegistrar.register_commands_for_all_agents()
   → Extract command templates from manifest
   → Filter: skip if extension not installed
   → Write to agent dirs
   ↓
8. Reconcile all command files (final composition)
   → For each command file in agent dirs:
     • resolve_content(final composition)
     • Overwrite with correct content
   ↓
9. Persist to registry
   → PresetRegistry.add()
   → Write to .specify/presets/.registry (JSON)
   ↓
10. ✅ Install complete

Rollback on error (any step):
   → Delete .specify/presets/{preset_id}/
   → Unregister agent commands
   → Fail with error message
```

## Fluxos Alternativos

### Remove Preset
```
1. User: specify preset remove <preset-id>
   ↓
2. Unregister commands (CommandRegistrar._unregister_commands)
   ↓
3. Delete preset directory (.specify/presets/{preset_id}/)
   ↓
4. Remove from registry (PresetRegistry.remove)
   ↓
5. [Opcional] Keep project config (keep_config=true)
   → Preserva .specify/overrides/ e custom manifests
   ↓
6. ✅ Removal complete
```

### Enable/Disable Preset
```
1. User: specify preset enable/disable <preset-id>
   ↓
2. PresetRegistry.update(preset_id, {enabled: true/false})
   ↓
3. Save to registry
   ↓
4. [Nota: Disabled presets skip template resolution via PresetResolver.resolve()]
```

### Template Resolution Failure
```
1. PresetResolver.resolve(template_name)
   ↓
2. Search Level 1: .specify/templates/overrides/
   → If found: return path (override wins)
   ↓
3. Search Level 2: .specify/presets/ (by priority order)
   → If found: return path
   ↓
4. Search Level 3: .specify/extensions/ (by priority order)
   → If found: return path
   ↓
5. Search Level 4: .specify/templates/ (core)
   → If found: return path
   ↓
6. Not found: return None
   → Caller decides: fail, use fallback, etc.
```

### Wrap Strategy with {CORE_TEMPLATE}
```
1. PresetResolver._substitute_core_template(body)
   ↓
2. Check if body contains {CORE_TEMPLATE} placeholder
   ↓
3. Resolve core template via fallback:
   → Try: resolve_core(cmd_name) [override or core-only]
   → Try: extension manifest lookup [for extension commands]
   → Try: core template with short name (e.g., specify.md)
   ↓
4. Parse core template frontmatter + extract body
   ↓
5. Replace {CORE_TEMPLATE} with core body
   ↓
6. Return composed body + core frontmatter
   ↓
7. If placeholder not found: PresetCompositionError
```

## Dependências

| Componente | Razão | Como Usa |
|-----------|-------|----------|
| `YAML parser` (PyYAML) | Manifest é YAML | `PresetManifest._load_yaml()` |
| `pathlib.Path` | File system abstraction | Paths para preset dirs, cache, registry |
| `shutil.copytree()` | Copy preset files recursively | `.specify/presets/{preset_id}/` |
| `requests` ou `urllib` | HTTP fetch para catalogs | `PresetCatalog._open_url()` |
| `json` | Registry + cache persistence | `.registry`, `.cache/catalog.json` |
| `packaging.version` | PEP 440 semver validation | `PresetManifest._validate()`, `check_compatibility()` |
| `CommandRegistrar` | Register command templates com agentes | `PresetManager._register_commands()` |
| `datetime` | Timestamps para cache TTL + install time | `is_cache_valid()`, registry metadata |
| `hashlib` (implícito) | Cache invalidation | Cache file naming (possivelmente) |
| `.specify/` directory structure | Config storage | Presets, registry, cache, extensions, templates |

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| **Priority-based resolution**: lower number = higher precedence | Lines 2329–3097, `list_by_priority()` sorts ascending | 🟢 |
| **4-level priority stack**: override → preset → extension → core | `PresetResolver.resolve()` hardcodes 4 levels | 🟢 |
| **Catalog cache TTL = 1h**: mais curto que extensions (24h) para atualização responsiva | Lines 1799–2328, `is_cache_valid()` check | 🟢 |
| **First preset ID wins** em merge multi-catalog | `fetch_catalog()` loop: `if preset_id not in merged: merged[preset_id] = ...` | 🟢 |
| **Scripts only support replace/wrap**: prepend/append inválido | Constants `VALID_SCRIPT_STRATEGIES = {"replace", "wrap"}` | 🟢 |
| **Manifest schema locked at 1.0**: sem forward compatibility | Validation: `schema_version == "1.0"` exato | 🟢 |
| **Installation rollback on any error**: cleanup integral | Error handlers 540–1798 em try/except | 🟢 |
| **Composition happens at install time**: não lazy resolution | `install()` pré-compõe templates non-replace | 🟡 |
| **Registry deep-copy semantics**: `get()` retorna cópia, não referência | `PresetRegistry.get()` implementa `copy.deepcopy()` | 🟢 |
| **Command reconciliation após registration**: garante composition final | Step 8 pós-install, itera todas as command files | 🟢 |

## Estado Interno

### Registry (`.specify/presets/.registry`)

```json
{
  "schema_version": "1.0",
  "presets": {
    "preset-id-1": {
      "version": "1.2.3",
      "priority": 10,
      "installed_at": "2026-05-16T12:00:00Z",
      "enabled": true,
      "custom_field_1": "..."
    },
    "preset-id-2": { ... }
  }
}
```

**Ciclo de vida**:
- Criado vazio em primeira instalação
- Cada preset adicionado via `PresetRegistry.add()`
- Metadata atualizado via `update()`
- Preset removido via `remove()`
- Carregado em cada sessão via `_load()`

### Cache (`.specify/presets/.cache/`)

```
catalog.json                    # Merged catalog JSON
catalog-metadata.json           # Timestamp + TTL info
```

**Ciclo de vida**:
- Criado em primeira `fetch_catalog()`
- Carregado se TTL válido (< 1h)
- Refetch se TTL expirado ou `force_refresh=true`
- Clearable via `clear_cache()`

### Composed Templates (`.composed/`)

```
{template-name}.md              # Pre-composed template (non-replace strategy)
```

**Ciclo de vida**:
- Criado durante install se template strategy ∈ {prepend, append, wrap}
- Usado via CommandRegistrar para agent registration
- Preservado entre sessões (não é cache, é output)

## Observabilidade

### Logs esperados

| Evento | Nível | Evidência |
|--------|-------|-----------|
| Manifest load success | DEBUG | `PresetManifest.__init__()` completed |
| Validation failure | ERROR | `PresetValidationError` raised |
| Network fetch | INFO | `PresetCatalog._open_url()` called |
| Cache hit | DEBUG | `is_cache_valid()` returns True |
| Compatibility check | DEBUG | Version specifier validation |
| Install success | INFO | Registry.add() completed |
| Install failure with rollback | ERROR | Exception + cleanup |
| Preset enable/disable | INFO | Registry.update() |

### Métricas sugeridas

- `preset_install_duration_ms` — tempo total de install
- `catalog_fetch_duration_ms` — tempo de fetch (rede vs cache)
- `template_resolution_latency_ms` — tempo de resolve()
- `composition_layer_count` — quantas camadas foram compostas
- `registry_size_presets` — número de presets instalados

### Traces distribuídas

- Install flow: entrada → saída com passos numerados (como no Fluxo Principal)
- Catalog fetch: request → response com cache status
- Template resolution: input name → path resolved (com nível/source)

## Riscos e Lacunas

- 🟢 **Composition with multiple wraps**: Se preset A wrap-compõe template T, e preset B também wrap-compõe T, ambos **coexistem aninhados por prioridade**: preset com priority maior (número menor) fica como wrapper mais externo. Não há conflito, todos são aplicados. Sem detecção de wrap loops — placeholder ausente em layer wrap dispara `PresetValidationError` em tempo de composição (presets.py:3046).

- 🟢 **{CORE_TEMPLATE} escaping**: {CORE_TEMPLATE} é palavra reservada nos bodies de presets. Não escapável (sem mecanismo `\{` ou `{{`). Se literal aparecer em conteúdo legítimo (docs sobre o sistema de presets), será indevidamente substituído. Mitigation: workaround textual (`{ CORE_TEMPLATE }` com espaços) ou code fence.

- 🟡 **Parallel install race condition**: Se dois processos simultâneos tentam instalar presets/registrar no mesmo projeto, registry/cache podem corromper. Código não tem lock/mutex. Behavior indefinido. **Design boundary: single-process tool. Usuários devem serializar invocações.** Implementação futura de filelock: T-shirt M/L.

- 🟡 **Rollback API não-utilizado**: `PresetRegistry.restore()` (presets.py:417) é API pública pareada a `ExtensionRegistry.restore()`, mas sem caller interno. Dead-code candidate OU ponto de extensão para rollback automático futuro de presets. Hoje, rollback de preset não é automatizado (contraste: extensão tem backup/rollback flow).

- 🟡 **Network timeout handling**: `_open_url()` timeout não está explícito no código lido. Requer validação.

- 🟡 **Catalog URL injection**: `_validate_catalog_url()` bloqueia `*github.com`, mas a whitelist completa não foi vista. Requer validação.

- 🟡 **Zip bomb protection**: `download_preset()` não valida tamanho máximo de ZIP. Requer validação.

- 🟡 **Script execution in wrap**: Se preset wrap-compõe um script via {CORE_TEMPLATE}, o substitution pode gerar código inválido. Requer validação.

- 🟡 **Cache invalidation strategy**: TTL é simples (1h). Sem versioning. Se preset mudar no catálogo remoto durante a sessão, usuário não vê atualização. Comportamento esperado?

- 🟡 **Extension dependency resolution**: Se preset depende de extensão não instalada, o filtering em `_register_commands()` silenciosamente pula. Comportamento é graciosa degradação ou erro? Requer validação.

- 🟡 **Preset ID collision**: Se dois presets têm mesmo ID, qual win? First-install-wins ou last-wins? Código sugere last-wins (update overwrites), mas requer validação.

- 🔴 **{CORE_TEMPLATE} escaping**: Se core template body contém literal `{CORE_TEMPLATE}`, será substituído. Sem escaping. Requer validação.
