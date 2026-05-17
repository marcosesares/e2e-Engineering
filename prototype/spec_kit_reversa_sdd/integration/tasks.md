# AI Agent Integration Runtime — Tarefas de Implementação

> Unit: **integration**  
> **Generated**: 2026-05-16  
> **Source**: `src/specify_cli/integrations/` (base.py, manifest.py, catalog.py) + `integration_state.py`, `integration_runtime.py`

## Pré-requisitos

- [ ] PyYAML, `packaging.version` (PEP 440), `requests` ou `urllib` importáveis
- [ ] `pathlib.Path`, `json`, `datetime` disponíveis
- [ ] `.specify/` directory structure criado (init unit)
- [ ] HTTP client + timeout handling funcional
- [ ] Test fixtures: valid/invalid integration.yml samples, mock catalogs

---

## Tarefas

### Fase 1: IntegrationState (Persistence)

- [ ] **T-01: Load integration state from JSON**
  - Origem no legado: `src/specify_cli/integration_state.py`
  - Implementar: `IntegrationState.load(path: Path) -> IntegrationState` (static method)
  - Critério de pronto:
    - Lê `.specify/integration.json`
    - Retorna IntegrationState object com fields: selected_integration, integrations dict, metadata
    - Se arquivo não existe: retorna empty state (no integration selected)
  - Confiança: 🟢

- [ ] **T-02: Save integration state to JSON**
  - Origem no legado: `src/specify_cli/integration_state.py`
  - Implementar: `IntegrationState.save(path: Path) -> None`
  - Critério de pronto:
    - Escreve `_data` (dict) como JSON para `.specify/integration.json`
    - Cria parent dirs se não existem
    - Preserva formatting (readable JSON)
  - Confiança: 🟢

- [ ] **T-03: Select active integration**
  - Origem no legado: `src/specify_cli/integration_state.py`
  - Implementar: `IntegrationState.select_integration(integration_id: str) -> None`
  - Critério de pronto:
    - Sets `_data[selected_integration] = integration_id`
    - Doesn't call save() (caller decides persistence timing)
  - Confiança: 🟢

- [ ] **T-04: Get active integration**
  - Origem no legado: `src/specify_cli/integration_state.py`
  - Implementar: `IntegrationState.get_active_integration() -> Optional[str]`
  - Critério de pronto:
    - Retorna `_data[selected_integration]` ou None
  - Confiança: 🟢

- [ ] **T-05: Set options for integration**
  - Origem no legado: `src/specify_cli/integration_state.py`
  - Implementar: `IntegrationState.set_options(integration_id: str, options: Dict) -> None`
  - Critério de pronto:
    - Sets `_data[integrations][integration_id][options] = options`
    - Deep copies options (prevent mutation)
  - Confiança: 🟢

- [ ] **T-06: Get options for integration**
  - Origem no legado: `src/specify_cli/integration_state.py`
  - Implementar: `IntegrationState.get_options(integration_id: str) -> Dict`
  - Critério de pronto:
    - Retorna deep copy de `_data[integrations][integration_id][options]`
    - Retorna {} se não existe
  - Confiança: 🟢

---

### Fase 2: IntegrationManifest (Validation)

- [ ] **T-07: Load integration manifest from YAML**
  - Origem no legado: `src/specify_cli/integrations/manifest.py`
  - Implementar: `IntegrationManifest.__init__(manifest_path: Path)`
  - Critério de pronto:
    - Lê arquivo YAML de `manifest_path`
    - Retorna IntegrationManifest object com fields: _data (dict do YAML)
    - Lança ValidationError se arquivo não existe ou YAML inválido
  - Confiança: 🟢

- [ ] **T-08: Validate integration manifest schema**
  - Origem no legado: `src/specify_cli/integrations/manifest.py`
  - Implementar: `IntegrationManifest._validate()`
  - Critério de pronto:
    - Valida campos obrigatórios: `schema_version`, `id`, `name`, `version`, `requires`, `provides`
    - Valida `schema_version == "1.0"` exato
    - Valida `id` contra regex `^[a-z0-9-]+$`
    - Valida `version` é PEP 440 semver
    - Valida `requires.speckit_version` é specifier válido
    - Valida `provides` contém metadata (format, options_schema, etc.)
    - Lança ValidationError com mensagem descritiva em falha
  - Confiança: 🟢

- [ ] **T-09: Expose manifest properties**
  - Origem no legado: `src/specify_cli/integrations/manifest.py`
  - Implementar: `@property id`, `@property name`, `@property version`, `@property requires_speckit_version`, `@property options_schema`
  - Critério de pronto:
    - Cada property retorna valor correto do dict `_data`
    - Properties são read-only
  - Confiança: 🟢

- [ ] **T-10: Check integration compatibility**
  - Origem no legado: `src/specify_cli/integrations/manifest.py`
  - Implementar: `check_compatibility(manifest: IntegrationManifest, speckit_version: str) -> bool`
  - Critério de pronto:
    - `required = manifest.requires_speckit_version`
    - Parse specifier via `packaging.specifiers.SpecifierSet`
    - Checa `speckit_version in specifier`
    - Retorna True se compatible, raises CompatibilityError senão
  - Confiança: 🟢

---

### Fase 3: IntegrationBase & Subclasses

- [ ] **T-11: Define IntegrationBase abstract class**
  - Origem no legado: `src/specify_cli/integrations/base.py`
  - Implementar: `IntegrationBase` com virtual methods
  - Critério de pronto:
    - Abstract methods: `invoke_command(action, args) -> str`, `resolve_options(raw_options) -> Dict`
    - Concrete method: `get_metadata() -> Dict`
    - Subclasses must implement all abstract methods
  - Confiança: 🟢

- [ ] **T-12: Implement MarkdownIntegration subclass**
  - Origem no legado: `src/specify_cli/integrations/base.py`
  - Implementar: `MarkdownIntegration(IntegrationBase)`
  - Critério de pronto:
    - `invoke_command(action, args)` retorna f"/{id} {action} {' '.join(args)}" (com quoting)
    - `resolve_options(raw_options)` merges: CLI args > env vars > manifest defaults
  - Confiança: 🟡

- [ ] **T-13: Implement TomlIntegration subclass**
  - Origem no legado: `src/specify_cli/integrations/base.py`
  - Implementar: `TomlIntegration(IntegrationBase)`
  - Critério de pronto:
    - `invoke_command(action, args)` retorna comando em formato TOML
    - Format específico a ser determinado via código legado
  - Confiança: 🟡

- [ ] **T-14: Implement SkillsIntegration subclass**
  - Origem no legado: `src/specify_cli/integrations/base.py`
  - Implementar: `SkillsIntegration(IntegrationBase)`
  - Critério de pronto:
    - `invoke_command(action, args)` retorna skill invocation string
    - Format específico a ser determinado via código legado
  - Confiança: 🟡

---

### Fase 4: IntegrationCatalog (Discovery)

- [ ] **T-15: Validate catalog URL (HTTPS-only)**
  - Origem no legado: `src/specify_cli/integrations/catalog.py`
  - Implementar: `IntegrationCatalog._validate_catalog_url(url: str) -> bool`
  - Critério de pronto:
    - Rejeita non-HTTPS URLs (except `http://localhost*`)
    - Rejeita dangerous patterns
    - Retorna True se válido, False senão
  - Confiança: 🟡

- [ ] **T-16: Fetch integration catalog from remote URL**
  - Origem no legado: `src/specify_cli/integrations/catalog.py`
  - Implementar: `IntegrationCatalog._open_url(url: str, timeout: int) -> file-like`
  - Critério de pronto:
    - Context manager (with statement support)
    - GET request com timeout padrão
    - Trata network errors gracefully
  - Confiança: 🟡

- [ ] **T-17: Load catalog config**
  - Origem no legado: `src/specify_cli/integrations/catalog.py`
  - Implementar: `IntegrationCatalog._load_catalog_config(config_path: Path)`
  - Critério de pronto:
    - Lê `.specify/integration-catalogs.yml` (ou similar)
    - Retorna list de CatalogEntry objects
  - Confiança: 🟡

- [ ] **T-18: Get active catalogs**
  - Origem no legado: `src/specify_cli/integrations/catalog.py`
  - Implementar: `IntegrationCatalog.get_active_catalogs() -> List[CatalogEntry]`
  - Critério de pronto:
    - Filtra por `enabled=true`
    - Sorted by priority
  - Confiança: 🟡

- [ ] **T-19: Check cache validity**
  - Origem no legado: `src/specify_cli/integrations/catalog.py`
  - Implementar: `IntegrationCatalog.is_cache_valid() -> bool`
  - Critério de pronto:
    - Checa TTL de `.cache/catalog-metadata.json`
    - Retorna True se < 1 hora, False senão
  - Confiança: 🟢

- [ ] **T-20: Fetch single catalog with cache**
  - Origem no legado: `src/specify_cli/integrations/catalog.py`
  - Implementar: `IntegrationCatalog._fetch_single_catalog(entry: CatalogEntry, force_refresh: bool) -> Dict`
  - Critério de pronto:
    - Se cache válido e `force_refresh=false`: load from cache
    - Senão: fetch, validate schema, save cache
    - Trata erros gracefully
  - Confiança: 🟡

- [ ] **T-21: Fetch and merge multiple catalogs**
  - Origem no legado: `src/specify_cli/integrations/catalog.py`
  - Implementar: `IntegrationCatalog.fetch_catalog(force_refresh: bool) -> Dict`
  - Critério de pronto:
    - Para cada catalog (by priority): `_fetch_single_catalog()`
    - Merge: first integration ID wins
    - Lança error se all catalogs fail
  - Confiança: 🟡

- [ ] **T-22: Lookup integration in catalog**
  - Origem no legado: `src/specify_cli/integrations/catalog.py`
  - Implementar: `IntegrationCatalog.get_integration_info(integration_id: str) -> Optional[Dict]`
  - Critério de pronto:
    - `fetch_catalog()` → lookup `integration_id`
    - Retorna metadata ou None
  - Confiança: 🟡

- [ ] **T-23: Download integration**
  - Origem no legado: `src/specify_cli/integrations/catalog.py`
  - Implementar: `IntegrationCatalog.download_integration(integration_id: str, target_dir: Path) -> Path`
  - Critério de pronto:
    - `get_integration_info()` para get URL
    - Download ZIP, extract to `target_dir`
    - Retorna path
  - Confiança: 🟡

- [ ] **T-24: Clear catalog cache**
  - Origem no legado: `src/specify_cli/integrations/catalog.py`
  - Implementar: `IntegrationCatalog.clear_cache()`
  - Critério de pronto:
    - Deleta `.cache/catalog.json` e metadata
  - Confiança: 🟢

---

### Fase 5: Integration Runtime & Invocation

- [ ] **T-25: Select integration (with validation)**
  - Origem no legado: `src/specify_cli/integration_runtime.py`
  - Implementar: `select_integration(integration_id: str, options: Dict) -> None`
  - Critério de pronto:
    - Load manifest, validate compatibility
    - Resolve options (CLI > env > manifest defaults)
    - `IntegrationState.select_integration(integration_id)`
    - Save state to disk
  - Confiança: 🟡

- [ ] **T-26: Resolve integration options with precedence**
  - Origem no legado: `src/specify_cli/integration_runtime.py`
  - Implementar: `_resolve_options(raw_options: Dict, manifest_schema: Dict) -> Dict`
  - Critério de pronto:
    - Precedence: CLI args > env vars > manifest defaults > hardcoded
    - Type validation via manifest schema
    - Retorna parsed options dict
  - Confiança: 🟡

- [ ] **T-27: Build slash-command for agent**
  - Origem no legado: `src/specify_cli/integration_runtime.py`
  - Implementar: `invoke_command(integration_id: str, action: str, args: List[str]) -> str`
  - Critério de pronto:
    - Load integration manifest
    - Instantiate appropriate subclass (Markdown/TOML/Skills)
    - Call `subclass.invoke_command(action, args)`
    - Return command string
  - Confiança: 🟡

- [ ] **T-28: Fallback to generic integration**
  - Origem no legado: `src/specify_cli/integration_runtime.py`
  - Implementar: `_get_fallback_integration() -> str`
  - Critério de pronto:
    - Se integration requested não existe
    - Retorna "generic" integration ID
    - Log warning message
  - Confiança: 🟡

- [ ] **T-29: Validate multi-installation coexistence**
  - Origem no legado: `src/specify_cli/integration_runtime.py`
  - Implementar: `check_coexistence(integration_a: str, integration_b: str) -> bool`
  - Critério de pronto:
    - Load manifests para both integrations
    - Checa: no shared resource locks, no conflicting env vars, no command collision
    - Retorna True se coexistem, False/error senão
  - Confiança: 🟡

- [ ] **T-30: List installed integrations**
  - Origem no legado: `src/specify_cli/integration_runtime.py`
  - Implementar: `list_installed() -> List[Dict]`
  - Critério de pronto:
    - Carrega IntegrationState
    - Retorna list de integrations com selected marker
  - Confiança: 🟢

---

## Tarefas de Teste

- [ ] **TT-01: Happy path — select integration**
  - Scenario: Integration válido em catálogo, especificação OK
  - Validar: Integration selecionada, state persistido, options armazenadas
  - Confiança: 🟢

- [ ] **TT-02: Validation error — invalid manifest**
  - Scenario: Manifest YAML malformed
  - Validar: ValidationError raised, state unchanged
  - Confiança: 🟢

- [ ] **TT-03: Compatibility error**
  - Scenario: Integration requer speckit >=2.0, instalado é 1.5
  - Validar: CompatibilityError raised, selection blocked
  - Confiança: 🟢

- [ ] **TT-04: Build slash-command — Markdown format**
  - Scenario: MarkdownIntegration, action="workflow", args=["run", "plan.md"]
  - Validar: Command = "/integration workflow run plan.md"
  - Confiança: 🟡

- [ ] **TT-05: Resolve options with CLI override**
  - Scenario: Manifest default "claude-opus", CLI arg "--model claude-sonnet"
  - Validar: Resolved option = "claude-sonnet"
  - Confiança: 🟡

- [ ] **TT-06: Catalog fetch with cache**
  - Scenario: Primeira fetch às 14:00, segunda às 14:30
  - Validar: Primeira faz request, segunda usa cache
  - Confiança: 🟡

- [ ] **TT-07: Fallback to generic**
  - Scenario: Integration "foo" não existe
  - Validar: Fallback a "generic", warning logged
  - Confiança: 🟡

- [ ] **TT-08: Multi-catalog merge**
  - Scenario: 2 catalogs com integrations sobrepostos
  - Validar: Priority-based merge, first wins
  - Confiança: 🟡

- [ ] **TT-09: State persistence**
  - Scenario: Select → Save → Load em nova sessão
  - Validar: Integration + options preserved
  - Confiança: 🟢

- [ ] **TT-10: Coexistence validation**
  - Scenario: Install integration B quando A já instalado
  - Validar: Check runs, conflitos detectados, install permitido/bloqueado apropriadamente
  - Confiança: 🟡

---

## Ordem Sugerida

1. **Fase 1 (IntegrationState)** — Core persistence, no external deps
2. **Fase 2 (IntegrationManifest)** — Schema validation, can be standalone
3. **Fase 3 (IntegrationBase subclasses)** — Format handlers, parallel work
4. **Fase 4 (IntegrationCatalog)** — Discovery, depends on manifest
5. **Fase 5 (Runtime + Invocation)** — Orquestra tudo, por último

## Blockers

- `select_integration()` bloqueia em:
  - T-10 (compatibility check)
  - T-26 (option resolution)
  - T-02 (state persistence)

- `invoke_command()` depende de:
  - T-12/T-13/T-14 (subclasses implementadas)
  - T-01 (state loading)

## Lacunas Pendentes (🔴)

1. **Option validation schema format** — Como são definidas regras de tipo? OpenAPI schema? JSON Schema?
2. **Command quoting/escaping** — Qual é a estratégia? Varia por agente?
3. **Coexistence validation details** — Quais condições bloqueiam multi-install?
4. **ZIP bomb protection** — Tamanho máximo de download?
5. **Cache invalidation versioning** — TTL simples sem versionamento. Comportamento esperado?
