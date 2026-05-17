# Preset Management System — Tarefas de Implementação

> Unit: **preset**  
> **Generated**: 2026-05-16  
> **Source**: `src/specify_cli/presets.py` (linhas 1–3097)

## Pré-requisitos

- [ ] PyYAML + `packaging.version` (PEP 440) importáveis
- [ ] `pathlib.Path`, `shutil`, `json` disponíveis
- [ ] `CommandRegistrar` implementado (extensões unit)
- [ ] `.specify/` directory structure criado (init unit)
- [ ] HTTP client (`requests` ou `urllib`) disponível
- [ ] Variável de ambiente ou config para `.specify/` path
- [ ] Test fixtures: valid/invalid preset.yml samples, mock catalogs

---

## Tarefas

### Fase 1: PresetManifest (Schema Validation)

- [ ] **T-01: Load YAML manifest from disk**
  - Origem no legado: `src/specify_cli/presets.py:117–308`
  - Implementar: `PresetManifest.__init__(manifest_path: Path)`
  - Critério de pronto:
    - Lê arquivo YAML da `manifest_path`
    - Retorna `PresetManifest` object com fields: `_data` (dict do YAML)
    - Lança `PresetValidationError` se arquivo não existe ou YAML inválido
  - Confiança: 🟢

- [ ] **T-02: Validate manifest schema**
  - Origem no legado: `src/specify_cli/presets.py:117–308`
  - Implementar: `PresetManifest._validate()`
  - Critério de pronto:
    - Valida campos obrigatórios: `schema_version`, `preset`, `requires`, `provides`
    - Valida `schema_version == "1.0"` exato
    - Valida `preset.id` contra regex `^[a-z0-9-]+$`
    - Valida `preset.version` é PEP 440 semver
    - Valida `requires.speckit_version` é specifier válido
    - Valida `provides.templates` é non-empty list
    - Valida cada template: `name`, `type` (enum), `file`, `strategy` (enum)
    - Valida script strategies ⊆ {replace, wrap}
    - Lança `PresetValidationError` com mensagem descritiva em falha
  - Confiança: 🟢

- [ ] **T-03: Expose manifest properties**
  - Origem no legado: `src/specify_cli/presets.py:79–92`
  - Implementar: `@property id`, `@property name`, `@property version`, `@property requires_speckit_version`, `@property templates`
  - Critério de pronto:
    - Cada property retorna o valor correto do dict `_data`
    - Properties são read-only
  - Confiança: 🟢

---

### Fase 2: PresetRegistry (Persistence)

- [ ] **T-04: Load registry from disk or create empty**
  - Origem no legado: `src/specify_cli/presets.py:309–539`
  - Implementar: `PresetRegistry._load()`
  - Critério de pronto:
    - Se `.specify/presets/.registry` existe: parse JSON + retorna dict
    - Se não existe: retorna dict template vazio `{schema_version: "1.0", presets: {}}`
    - Trata JSON corrupto gracefully (log warning, usa template vazio)
  - Confiança: 🟢

- [ ] **T-05: Save registry to disk**
  - Origem no legado: `src/specify_cli/presets.py:309–539`
  - Implementar: `PresetRegistry._save()`
  - Critério de pronto:
    - Escreve `_data` (dict) como JSON para `.specify/presets/.registry`
    - Cria parent dirs se não existem
    - Trata erros de escrita (IOError, permissions)
  - Confiança: 🟢

- [ ] **T-06: Add preset to registry**
  - Origem no legado: `src/specify_cli/presets.py:309–539`
  - Implementar: `PresetRegistry.add(pack_id: str, metadata: Dict)`
  - Critério de pronto:
    - Insere `metadata` em `_data[presets][pack_id]`
    - Deep copies metadata (sem mutation)
    - Chama `_save()` para persistir
  - Confiança: 🟢

- [ ] **T-07: Update preset metadata in registry**
  - Origem no legado: `src/specify_cli/presets.py:309–539`
  - Implementar: `PresetRegistry.update(pack_id: str, updates: Dict)`
  - Critério de pronto:
    - Merges `updates` em `_data[presets][pack_id]`
    - Preserva `installed_at` timestamp (não sobrescreve)
    - Chama `_save()` para persistir
  - Confiança: 🟢

- [ ] **T-08: Remove preset from registry**
  - Origem no legado: `src/specify_cli/presets.py:309–539`
  - Implementar: `PresetRegistry.remove(pack_id: str)`
  - Critério de pronto:
    - Deleta `_data[presets][pack_id]`
    - Chama `_save()` para persistir
  - Confiança: 🟢

- [ ] **T-09: Get preset metadata (deep copy)**
  - Origem no legado: `src/specify_cli/presets.py:309–539`
  - Implementar: `PresetRegistry.get(pack_id: str) -> Optional[Dict]`
  - Critério de pronto:
    - Retorna deep copy de `_data[presets][pack_id]`
    - Retorna `None` se pack_id não existe
  - Confiança: 🟢

- [ ] **T-10: List all presets**
  - Origem no legado: `src/specify_cli/presets.py:309–539`
  - Implementar: `PresetRegistry.list() -> Dict[str, Dict]`
  - Critério de pronto:
    - Retorna cópia de `_data[presets]` (all installed presets)
  - Confiança: 🟢

- [ ] **T-11: List presets sorted by priority**
  - Origem no legado: `src/specify_cli/presets.py:309–539`
  - Implementar: `PresetRegistry.list_by_priority() -> List[tuple]`
  - Critério de pronto:
    - Retorna list de (preset_id, metadata) tuples
    - Sorted por `metadata[priority]` ascending (lower = higher)
    - Normaliza prioridades inválidas (fallback a 999)
  - Confiança: 🟢

---

### Fase 3: PresetCatalog (Discovery & Download)

- [ ] **T-12: Validate catalog URL (HTTPS-only, except localhost)**
  - Origem no legado: `src/specify_cli/presets.py:1799–2328`
  - Implementar: `PresetCatalog._validate_catalog_url(url: str) -> bool`
  - Critério de pronto:
    - Rejeita non-HTTPS URLs (except `http://localhost*`)
    - Rejeita dangerous patterns como `*github.com`
    - Retorna `True` se válido, `False` senão
  - Confiança: 🟡

- [ ] **T-13: Fetch catalog from remote URL with timeout**
  - Origem no legado: `src/specify_cli/presets.py:1799–2328`
  - Implementar: `PresetCatalog._open_url(url: str, timeout: int) -> file-like`
  - Critério de pronto:
    - Context manager (with statement support)
    - Faz GET request para `url` com timeout padrão (e.g., 30s)
    - Trata network errors gracefully (NetworkError)
    - Retorna file-like object com conteúdo JSON
  - Confiança: 🟡

- [ ] **T-14: Load catalog config from YAML**
  - Origem no legado: `src/specify_cli/presets.py:1799–2328`
  - Implementar: `PresetCatalog._load_catalog_config(config_path: Path)`
  - Critério de pronto:
    - Lê `.specify/preset-catalogs.yml`
    - Retorna list de `PresetCatalogEntry` (dataclass)
    - Valida cada entry: `url`, `name`, `priority`, `install_allowed`
  - Confiança: 🟡

- [ ] **T-15: Get active catalogs (enabled only)**
  - Origem no legado: `src/specify_cli/presets.py:1799–2328`
  - Implementar: `PresetCatalog.get_active_catalogs() -> List[PresetCatalogEntry]`
  - Critério de pronto:
    - Carrega config de `.specify/preset-catalogs.yml`
    - Filtra por `enabled=true`
    - Retorna sorted by priority
  - Confiança: 🟡

- [ ] **T-16: Check cache validity (1h TTL)**
  - Origem no legado: `src/specify_cli/presets.py:1799–2328`
  - Implementar: `PresetCatalog.is_cache_valid() -> bool`
  - Critério de pronto:
    - Lê `.specify/presets/.cache/catalog-metadata.json`
    - Compara timestamp vs agora
    - Retorna `True` se (agora - timestamp) < 1 hora, senão `False`
  - Confiança: 🟢

- [ ] **T-17: Fetch single catalog with cache**
  - Origem no legado: `src/specify_cli/presets.py:1799–2328`
  - Implementar: `PresetCatalog._fetch_single_catalog(entry: PresetCatalogEntry, force_refresh: bool) -> Dict`
  - Critério de pronto:
    - Se `force_refresh=false` e cache válido: load from cache
    - Senão: fetch via `_open_url()`, parse JSON
    - Valida schema: `schema_version` + `presets` present
    - Salva em `.specify/presets/.cache/catalog.json` + metadata
    - Trata erros gracefully (retorna empty dict com warning)
  - Confiança: 🟡

- [ ] **T-18: Fetch and merge multiple catalogs**
  - Origem no legado: `src/specify_cli/presets.py:1799–2328`
  - Implementar: `PresetCatalog.fetch_catalog(force_refresh: bool) -> Dict`
  - Critério de pronto:
    - Chama `get_active_catalogs()` para ler configuração
    - Para cada catalog (by priority order):
      - `_fetch_single_catalog()` com cache
      - Merge into result: first preset_id wins
    - Anota cada preset com `_catalog_name` e `_install_allowed`
    - Lança error se all catalogs fail
  - Confiança: 🟡

- [ ] **T-19: Lookup single preset in catalog**
  - Origem no legado: `src/specify_cli/presets.py:1799–2328`
  - Implementar: `PresetCatalog.get_preset_info(preset_id: str) -> Optional[Dict]`
  - Critério de pronto:
    - `fetch_catalog()` → busca `preset_id` na merged result
    - Retorna preset metadata ou `None`
  - Confiança: 🟡

- [ ] **T-20: Download preset as ZIP**
  - Origem no legado: `src/specify_cli/presets.py:1799–2328`
  - Implementar: `PresetCatalog.download_preset(preset_id: str, target_dir: Path) -> Path`
  - Critério de pronto:
    - `get_preset_info()` para buscar URL de download
    - `_open_url()` para baixar ZIP
    - Extrai para `target_dir`
    - Retorna path do preset extraído
    - Trata erros (InvalidURL, network, zip corruption)
  - Confiança: 🟡

- [ ] **T-21: Clear catalog cache**
  - Origem no legado: `src/specify_cli/presets.py:1799–2328`
  - Implementar: `PresetCatalog.clear_cache()`
  - Critério de pronto:
    - Deleta `.specify/presets/.cache/catalog.json` e metadata
  - Confiança: 🟢

---

### Fase 4: PresetManager (Orchestration)

- [ ] **T-22: Check compatibility of preset with current speckit version**
  - Origem no legado: `src/specify_cli/presets.py:540–1798`
  - Implementar: `PresetManager.check_compatibility(manifest: PresetManifest, speckit_version: str) -> bool`
  - Critério de pronto:
    - `required = manifest.requires_speckit_version` (specifier string)
    - Parse specifier via `packaging.specifiers.SpecifierSet`
    - Checa `speckit_version in specifier`
    - Retorna `True` se compatible, `False` senão
    - Lança `PresetCompatibilityError` se specifier inválido
  - Confiança: 🟢

- [ ] **T-23: Copy preset files from source**
  - Origem no legado: `src/specify_cli/presets.py:540–1798`
  - Implementar: `PresetManager._copy_preset_files(source: Path, preset_id: str, target_base: Path)`
  - Critério de pronto:
    - `target_base` é `.specify/presets/`
    - `target = target_base / preset_id`
    - Cria parent dir se não existe
    - Se source é URL: download ZIP, extract to temp, copytree from temp
    - Se source é local dir: copytree diretamente
    - Carrega `.presetignore` (se existe) e aplica ignore function
    - Trata erros (IOError, permissions, invalid URL)
  - Confiança: 🟡

- [ ] **T-24: Compose templates with non-replace strategies**
  - Origem no legado: `src/specify_cli/presets.py:540–1798`
  - Implementar: `PresetManager._compose_templates(manifest: PresetManifest, preset_dir: Path, resolver: PresetResolver)`
  - Critério de pronto:
    - Para cada template em `manifest.templates`:
      - Se strategy == "replace": skip
      - Senão: `resolver.collect_all_layers(template_name, template_type)`
      - Checa se preset é top-priority layer
      - Se sim: `resolver.resolve_content()`, compose layers, write to `.composed/{name}`
      - Se não: skip (lower layer, não precisa precompor)
    - Trata erros (missing base layer, composition failure)
  - Confiança: 🟡

- [ ] **T-25: Register command templates with agents**
  - Origem no legado: `src/specify_cli/presets.py:540–1798`
  - Implementar: `PresetManager._register_commands(manifest: PresetManifest, preset_dir: Path)`
  - Critério de pronto:
    - Extrai templates com `type == "command"` do manifest
    - Para cada comando: se extensão requerida não está instalada, skip (graceful degradation)
    - Chama `CommandRegistrar.register_commands_for_all_agents()` com command list
    - Trata erros (IOError, registration failure)
  - Confiança: 🟡

- [ ] **T-26: Reconcile all command files with final composition**
  - Origem no legado: `src/specify_cli/presets.py:540–1798`
  - Implementar: `PresetManager._reconcile_commands(resolver: PresetResolver)`
  - Critério de pronto:
    - Itera todos os command files em agent directories
    - Para cada file: `resolver.resolve_content(command_name)`
    - Aplica final composition (todas as layers)
    - Sobrescreve file com resultado
    - Trata erros
  - Confiança: 🟡

- [ ] **T-27: Install preset (full orchestration with rollback)**
  - Origem no legado: `src/specify_cli/presets.py:540–1798`
  - Implementar: `PresetManager.install(preset_source: str, preset_id: str, options: Dict)`
  - Critério de pronto:
    - Chama cada step em sequência: fetch → validate → compat check → copy → compose → register → reconcile → persist
    - Se qualquer step falha:
      - Delete `.specify/presets/{preset_id}/`
      - Unregister agent commands
      - Raise exception com erro descritivo
    - Se todos steps succedem: retorna success
  - Confiança: 🟡

- [ ] **T-28: Remove preset**
  - Origem no legado: `src/specify_cli/presets.py:540–1798`
  - Implementar: `PresetManager.remove(preset_id: str, keep_config: bool)`
  - Critério de pronto:
    - Unregister commands via `CommandRegistrar._unregister_commands()`
    - Delete `.specify/presets/{preset_id}/`
    - Se `keep_config=false`: também deleta related config
    - Remove do registry
    - Retorna success
  - Confiança: 🟢

- [ ] **T-29: List installed presets**
  - Origem no legado: `src/specify_cli/presets.py:540–1798`
  - Implementar: `PresetManager.list_installed() -> List[Dict]`
  - Critério de pronto:
    - `PresetRegistry.list_by_priority()` para get list
    - Enriquece com additional metadata (enabled status, location)
    - Retorna sorted by priority
  - Confiança: 🟢

- [ ] **T-30: Get preset manifest (for installed preset)**
  - Origem no legado: `src/specify_cli/presets.py:540–1798`
  - Implementar: `PresetManager.get_preset(preset_id: str) -> Optional[PresetManifest]`
  - Critério de pronto:
    - Carrega `preset.yml` de `.specify/presets/{preset_id}/`
    - Retorna `PresetManifest` ou `None` se não existe
  - Confiança: 🟢

---

### Fase 5: PresetResolver (Template Resolution & Composition)

- [ ] **T-31: Resolve template via 4-level priority stack**
  - Origem no legado: `src/specify_cli/presets.py:2329–3097`
  - Implementar: `PresetResolver.resolve(template_name: str, template_type: str, skip_presets: bool) -> Optional[Path]`
  - Critério de pronto:
    - Level 1: `.specify/templates/overrides/{template_name}.*`
    - Level 2 (se skip_presets=false): `.specify/presets/` (by priority) para `{template_name}.*`
    - Level 3: `.specify/extensions/` (by priority) para `templates/{template_name}.*`
    - Level 4: `.specify/templates/{template_name}.*`
    - Retorna path do primeiro match ou `None`
  - Confiança: 🟢

- [ ] **T-32: Resolve template content (read file)**
  - Origem no legado: `src/specify_cli/presets.py:2329–3097`
  - Implementar: `PresetResolver.resolve_content(template_name: str, template_type: str) -> Optional[str]`
  - Critério de pronto:
    - Chama `resolve()` para get path
    - Se found: read file content, return string
    - Se not found: return None
  - Confiança: 🟢

- [ ] **T-33: Collect all layers for template composition**
  - Origem no legado: `src/specify_cli/presets.py:2329–3097`
  - Implementar: `PresetResolver.collect_all_layers(template_name: str, template_type: str) -> List[Dict]`
  - Critério de pronto:
    - Retorna list de {path, source, strategy, content}
    - Order: override first (highest priority) → preset → extension → core (lowest)
    - Para cada layer, inclui a strategy declarada no manifest (ou "replace" padrão)
  - Confiança: 🟡

- [ ] **T-34: Compose template layers based on strategy**
  - Origem no legado: `src/specify_cli/presets.py:2329–3097`
  - Implementar: `PresetResolver._compose_layers(layers: List[Dict]) -> str`
  - Critério de pronto:
    - Inicia com `layers[0].content`
    - Para cada layer from index 1 to end:
      - strategy == "replace": skip (layer 0 wins)
      - strategy == "prepend": content = layer.content + content
      - strategy == "append": content = content + layer.content
      - strategy == "wrap": replace {CORE_TEMPLATE} em layer.content com content (da seção anterior)
    - Retorna composed content
    - Valida wrap: se placeholder não encontrado, raise error
  - Confiança: 🟡

- [ ] **T-35: Substitute {CORE_TEMPLATE} placeholder**
  - Origem no legado: `src/specify_cli/presets.py:2329–3097`
  - Implementar: `PresetResolver._substitute_core_template(body: str, cmd_name: str) -> str`
  - Critério de pronto:
    - Checa se body contém `{CORE_TEMPLATE}`
    - Se não: retorna body unchanged
    - Se sim: resolve core template via fallback:
      1. Try: `resolve_core(cmd_name)` [override or core-only]
      2. Try: extension manifest lookup [for extension commands]
      3. Try: core template com short name (e.g., `specify.md`)
    - Parse core template frontmatter
    - Replace {CORE_TEMPLATE} com core body
    - Retorna composed body + core frontmatter
  - Confiança: 🟡

- [ ] **T-36: Resolve core-only template (skip presets/extensions)**
  - Origem no legado: `src/specify_cli/presets.py:2329–3097`
  - Implementar: `PresetResolver.resolve_core(template_name: str, template_type: str) -> Optional[Path]`
  - Critério de pronto:
    - Like `resolve()` mas pula Levels 2 e 3 (presets + extensions)
    - Procura apenas: override → core
  - Confiança: 🟢

---

### Fase 6: Utility Functions & Exceptions

- [ ] **T-37: Define exception types**
  - Origem no legado: `src/specify_cli/presets.py`
  - Implementar: `PresetError`, `PresetValidationError`, `PresetCompatibilityError`
  - Critério de pronto:
    - Base class `PresetError(Exception)`
    - Subclasses com mensagens descritivas
    - Suportam `str(exception)` legível
  - Confiança: 🟢

- [ ] **T-38: Define PresetCatalogEntry dataclass**
  - Origem no legado: `src/specify_cli/presets.py:282–293`
  - Implementar: `@dataclass PresetCatalogEntry`
  - Critério de pronto:
    - Fields: `url`, `name`, `priority`, `install_allowed`, `description` (optional)
    - Immutable (frozen=True)
  - Confiança: 🟢

---

## Tarefas de Teste

- [ ] **TT-01: Happy path — install valid preset from remote**
  - Scenario: Valid preset no catálogo, URL válida, especificação de versão OK
  - Validar: Preset copiado para `.specify/presets/`, commands registrados, registry atualizado
  - Confiança: 🟢

- [ ] **TT-02: Validation error — invalid manifest**
  - Scenario: Manifest YAML malformed ou schema inválido
  - Validar: `PresetValidationError` raised, nada instalado, registry unchanged
  - Confiança: 🟢

- [ ] **TT-03: Compatibility error — version mismatch**
  - Scenario: Preset requer speckit >=2.0, instalado é 1.5
  - Validar: Install blocked, `PresetCompatibilityError` raised
  - Confiança: 🟢

- [ ] **TT-04: Remove preset**
  - Scenario: Preset instalado existe
  - Validar: Preset dir deletado, commands unregistered, registry updated
  - Confiança: 🟢

- [ ] **TT-05: Template resolution — 4-level stack**
  - Scenario: Mesmo template em override, preset, extension, core
  - Validar: Override retornado (highest priority)
  - Confiança: 🟢

- [ ] **TT-06: Template composition — wrap strategy**
  - Scenario: Preset com template strategy="wrap", placeholder `{CORE_TEMPLATE}`
  - Validar: Placeholder substituído, composed result correto
  - Confiança: 🟡

- [ ] **TT-07: Catalog fetch with cache**
  - Scenario: Primeira fetch (network), segunda fetch (< 1h depois)
  - Validar: Primeira faz request, segunda usa cache, TTL respeitado
  - Confiança: 🟡

- [ ] **TT-08: Multi-catalog merge**
  - Scenario: 2 catalogs com presets sobrepostos
  - Validar: Priority-based merge, first wins
  - Confiança: 🟡

- [ ] **TT-09: Rollback on install error**
  - Scenario: Install falha em step 5 (compose)
  - Validar: Cleanup executado, preset dir deletado, commands unregistered
  - Confiança: 🟡

- [ ] **TT-10: Registry persistence**
  - Scenario: Add → Save → Load em nova sessão
  - Validar: Metadata preserved, timestamps preserved
  - Confiança: 🟢

---

## Ordem Sugerida

1. **Fases 1–2 (PresetManifest + PresetRegistry)** — Não dependem de nada externo, core data structures
2. **Fase 3 (PresetCatalog)** — Pode ser desenvolvida em paralelo, test com mock HTTP
3. **Fase 5 (PresetResolver)** — Depende de PresetRegistry estar funcional
4. **Fase 4 (PresetManager)** — Orquestra tudo, por último
5. **Fase 6 (Utilities + Tests)** — No final, após integração

## Blockers e Dependências

- `PresetManager.install()` bloqueia em:
  - T-22 (compatibility check)
  - T-23 (copy files)
  - T-24 (compose)
  - T-25 (register commands)
  - T-26 (reconcile)

- `PresetCatalog.fetch_catalog()` depende de:
  - Configuração de catalogs (`.specify/preset-catalogs.yml`)
  - HTTP client disponível

- `PresetResolver` depende de:
  - `PresetRegistry` funcional
  - `CommandRegistrar` para extension lookup

## Lacunas Pendentes (🔴)

1. **Composition recursion handling** — Se preset A wrap-compõe template T, e preset B também wrap-compõe T, qual prevalece? Código não valida.

2. **Parallel install race condition** — Dois processos instalando simultaneamente podem corromper registry + cache. Sem lock/mutex.

3. **Zip bomb protection** — `download_preset()` não valida tamanho máximo de ZIP.

4. **{CORE_TEMPLATE} escaping** — Se core template body contém literal `{CORE_TEMPLATE}`, será indevidamente substituído. Sem escaping.

5. **Network timeout handling** — Qual é o timeout padrão para `_open_url()`? 30s? Configurável?

6. **Extension dependency resolution** — Se preset depende de extensão, o silenciosamente skipping é comportamento esperado?

7. **Cache invalidation versioning** — TTL simples (1h). Se preset muda no catálogo remoto durante a sessão, usuário não vê. Documentar ou mudar?
