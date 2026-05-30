# Code Analysis — Specify CLI

**Generated**: 2026-05-17 (Updated 2026-05-18)  
**Project**: spec-kit  
**Document Level**: Complete  
**Analyzed Modules**: 9 (init, extension, preset, integration, workflow, agent, catalog, authentication, shared_infra)  
**Last Updated**: integration, workflow, agent, catalog, authentication, shared_infra

---

## Module: `preset` — Preset Management System

The **preset module** (`src/specify_cli/presets.py`) implements a composable template system for Specify CLI. Presets are self-contained, versioned collections of artifact, command, and script templates that customize the Spec-Driven Development workflow. Unlike extensions (commands + hooks), presets specialize in **template composition**: allowing multiple presets to layer templates via prepend/append/wrap strategies.

Key capabilities:
- **Manifest validation** (preset.yml structure with template definitions)
- **Lifecycle management** (install, remove, update, enable/disable presets)
- **Template composition** (multi-layer override: replace, prepend, append, wrap)
- **Catalog management** (fetch, cache, merge from multiple sources)
- **Template resolution** (4-level priority stack with extension support)
- **Command registration** (preset command templates override core commands)

---

## 1. Core Classes & Responsibilities

| Class | Lines | Purpose |
|-------|-------|---------|
| **PresetManifest** | 117–308 | Loads & validates `preset.yml` manifests |
| **PresetRegistry** | 309–539 | Persists installed preset metadata to `.registry` (JSON) |
| **PresetManager** | 540–1798 | Orchestrates install/remove/update lifecycle, handles composition |
| **PresetCatalog** | 1799–2328 | Fetches, caches, merges presets from remote catalogs |
| **PresetResolver** | 2329–3097 | Resolves template names via 4-level priority stack |

Plus utility classes/functions:
- `PresetCatalogEntry` (dataclass) — catalog stack entry
- `_substitute_core_template()` — replaces {CORE_TEMPLATE} placeholder in preset commands
- Exception types: `PresetError`, `PresetValidationError`, `PresetCompatibilityError`

---

## 2. PresetManifest — Validation Layer

**Responsibility**: Load YAML manifest, validate schema, enforce template constraints.

### Key Methods

| Method | Purpose |
|--------|---------|
| `__init__(manifest_path: Path)` | Load & validate manifest from disk |
| `_load_yaml(path: Path)` → `dict` | Safe YAML load with error handling |
| `_validate()` | Enforce manifest schema and constraints |

### Validation Rules

**Schema Version**: Must be `"1.0"` (fixed constant)

**Required Fields**: `schema_version`, `preset`, `requires`, `provides`

**Preset Metadata**:
- `id`: lowercase alphanumeric + hyphens (regex: `^[a-z0-9-]+$`)
- `name`: any string
- `version`: semantic version (PEP 440)
- `description`: any string

**Requires Section**:
- `speckit_version`: version specifier (e.g., `">=0.8.0,<2.0.0"`)

**Provides Section**:
- `templates` (required list): each template has:
  - `name` (string): template identifier
  - `type` (enum): `"template"`, `"command"`, or `"script"`
  - `strategy` (enum, default: `"replace"`): `"replace"`, `"prepend"`, `"append"`, or `"wrap"`
  - `file` (string): path within preset dir
  - `description` (string, optional)

**Constraint**: Must have ≥1 template (cannot be empty).

### Properties (read-only)

```python
@property
def id(self) -> str: ...
@property
def name(self) -> str: ...
@property
def version(self) -> str: ...
@property
def requires_speckit_version(self) -> str: ...
@property
def templates(self) -> List[Dict]: ...  # Returns template definitions
```

---

## 3. PresetRegistry — Persistence

**Responsibility**: Load/save preset metadata to `.specify/presets/.registry` (JSON).

### Schema (`.registry`)

```json
{
  "schema_version": "1.0",
  "presets": {
    "preset-id": {
      "version": "1.2.3",
      "priority": 10,
      "installed_at": "2026-05-16T12:00:00Z",
      ...other metadata
    }
  }
}
```

### Key Methods

| Method | Purpose | Resilience |
|--------|---------|-----------|
| `_load()` → `dict` | Load registry or empty template | Handles corrupted JSON, missing fields |
| `_save()` | Persist to disk | Creates parent dirs on first write |
| `add(pack_id, metadata)` | Insert new preset + timestamp | Deep copies to prevent mutation |
| `update(pack_id, updates)` | Merge metadata, preserve `installed_at` | Merges with existing |
| `restore(pack_id, metadata)` | Restore exact metadata (rollback) | For rollback scenarios |
| `remove(pack_id)` | Delete preset from registry | |
| `get(pack_id)` → `Optional[dict]` | Retrieve preset metadata | Returns deep copy |
| `list()` → `Dict[str, dict]` | All registered presets | |
| `list_by_priority()` → `List[tuple]` | Sort by priority (lower = higher) | Normalizes invalid priorities |

---

## 4. PresetManager — Lifecycle Orchestration

**Responsibility**: Install, remove, update, enable/disable presets; orchestrate validation, compatibility, composition.

### Installation Flow (Simplified)

```
1. Validate manifest (PresetManifest)
2. Check compatibility (version, dependencies)
3. Copy preset source to .specify/presets/{preset_id}
4. Resolve composed content (for non-replace templates)
5. Register command templates with agents (CommandRegistrar)
6. Add to registry (PresetRegistry)
7. Reconcile all command files (resolve final composition layer)
```

### Key Methods

| Method | Purpose |
|--------|---------|
| `check_compatibility(manifest, speckit_version)` | Validate version specifier |
| `_register_commands(manifest, preset_dir)` | Write commands to agent dirs |
| `_unregister_commands(registered_commands)` | Remove previously registered commands |
| `install(preset_source, preset_id, options)` | Full install orchestration |
| `remove(preset_id, keep_config)` | Uninstall with rollback |
| `list_installed()` | Get all installed presets with metadata |
| `get_preset(preset_id)` → `Optional[PresetManifest]` | Load manifest for installed preset |

### Composition Strategy Logic

**Template strategies** determine how multiple presets layer templates:

- **replace**: Override lower-priority template entirely (default)
- **prepend**: Insert before lower-priority template content
- **append**: Insert after lower-priority template content
- **wrap**: Wrap lower-priority content (requires `{CORE_TEMPLATE}` placeholder)

**Script constraints**: Scripts only support `replace` and `wrap` (prepend/append don't make semantic sense for executable code).

**Composition resolution**: When a non-replace strategy is used:
1. Collect all layers (overrides, presets, extensions, core) for the template
2. If preset is top-priority layer: compose layers and pre-write to `.composed/` dir
3. Register composed file instead of raw file
4. After registration, reconciliation runs to finalize output

---

## 5. PresetCatalog — Discovery & Download

**Responsibility**: Fetch preset catalogs from remote URLs, cache results, merge prioritized sources.

**Default Catalogs**:
- Official: `https://raw.githubusercontent.com/github/spec-kit/main/presets/catalog.json`
- Community: `https://raw.githubusercontent.com/github/spec-kit/main/presets/catalog.community.json`

### Key Methods

| Method | Purpose |
|--------|---------|
| `_validate_catalog_url(url)` | Check URL is HTTPS (localhost HTTP allowed) |
| `_make_request(url)` | Build HTTP request with auth headers |
| `_open_url(url, timeout)` → file-like | Context manager for URL download |
| `_load_catalog_config(config_path)` | Load `.specify/preset-catalogs.yml` |
| `get_active_catalogs()` → `List[PresetCatalogEntry]` | Filter enabled catalogs |
| `_fetch_single_catalog(entry, force_refresh)` → `Dict` | Fetch one catalog with cache |
| `fetch_catalog(force_refresh)` → `Dict` | Public API: merged catalog |
| `get_preset_info(preset_id)` → `Optional[Dict]` | Lookup single preset |
| `download_preset(preset_id, target_dir)` → `Path` | Download ZIP file |
| `is_cache_valid()` → `bool` | Check if cached catalog within TTL (1 hour) |
| `clear_cache()` | Purge all cached catalogs |

### Cache Mechanism

**Files**:
- `.specify/presets/.cache/catalog.json` — merged catalog
- `.specify/presets/.cache/catalog-metadata.json` — cache timestamp

**TTL**: 1 hour (shorter than extensions' 24h for more responsive updates)

**Multi-catalog merge**:
1. Load active catalogs from `.specify/preset-catalogs.yml`
2. For each catalog (in priority order):
   - Fetch & cache
   - Merge: first preset ID wins
3. Annotate with `_catalog_name`, `_install_allowed`

---

## 6. PresetResolver — Template Resolution

**Responsibility**: Resolve template names via 4-level priority stack.

### Resolution Order (Precedence)

1. **Level 1 (Highest)**: Project overrides — `.specify/templates/overrides/`
2. **Level 2**: Installed presets — `.specify/presets/` (ordered by priority)
3. **Level 3**: Extension templates — `.specify/extensions/{ext_id}/templates/`
4. **Level 4 (Lowest)**: Core templates — `.specify/templates/`

### Key Methods

| Method | Purpose |
|--------|---------|
| `resolve(template_name, template_type, skip_presets)` → `Optional[Path]` | Resolve to file path using priority stack |
| `resolve_content(template_name, template_type)` → `Optional[str]` | Resolve & read template content |
| `collect_all_layers(template_name, template_type)` → `List[Dict]` | Get all layers (for composition) |
| `resolve_core(template_name, template_type)` → `Optional[Path]` | Resolve skipping presets (core-only) |
| `resolve_extension_command_via_manifest(cmd_name)` → `Optional[Path]` | Resolve extension command via manifest |
| `_get_manifest(pack_dir)` → `Optional[PresetManifest]` | Load preset manifest (cached) |
| `_get_all_extensions_by_priority()` → `List[tuple]` | Get extensions sorted by priority |

### Template Name Patterns

- **Core commands**: `speckit.specify`, `speckit.git.feature` (mapped to `specify.md`, `git_feature.md`)
- **Extension commands**: `speckit.auth.check`, `speckit.audit.scan` (from extension manifests)
- **Artifact templates**: `example-spec`, `data-model`, `api-docs` (free-form names)
- **Script templates**: `deploy`, `test-setup`, `validate` (free-form names)

---

## 7. Utility Functions & Constants

### _substitute_core_template()

**Purpose**: Replace `{CORE_TEMPLATE}` placeholder in preset command with core command body.

**Algorithm**:
1. Check if body contains `{CORE_TEMPLATE}` placeholder
2. Resolve core template via multi-step fallback:
   - Project override (via `resolve_core(cmd_name)`)
   - Extension manifest lookup (for extension commands)
   - Core template with short name (e.g., `specify.md`)
3. Parse core template frontmatter
4. Replace placeholder with core body
5. Return composed body + core frontmatter

**Used by**: Preset command composition (wrap strategy).

### Constants

| Name | Type | Value | Purpose |
|------|------|-------|---------|
| `VALID_PRESET_TEMPLATE_TYPES` | `set[str]` | `{"template", "command", "script"}` | Enum for template types |
| `VALID_PRESET_STRATEGIES` | `set[str]` | `{"replace", "prepend", "append", "wrap"}` | Enum for composition strategies |
| `VALID_SCRIPT_STRATEGIES` | `set[str]` | `{"replace", "wrap"}` | Subset for scripts (no prepend/append) |

---

## 8. Data Structures

### PresetCatalogEntry (dataclass)

```python
@dataclass
class PresetCatalogEntry:
    url: str              # Remote catalog URL
    name: str             # Display name
    priority: int         # Lower = higher priority
    install_allowed: bool # Whether installations allowed
    description: str = "" # Optional description
```

### Template Object (in Manifest)

```python
{
    "name": "template-name",
    "type": "command" | "template" | "script",
    "strategy": "replace" | "prepend" | "append" | "wrap",
    "file": "path/to/file.md",
    "description": "Human-readable description"
}
```

---

## 9. Error Handling

### Exception Types

```
PresetError (base)
├─ PresetValidationError — manifest/data validation failed
└─ PresetCompatibilityError — version mismatch or incompatible environment
```

### Validation Rules Summary

| Item | Rule | Raises |
|------|------|--------|
| Schema version | Must be exactly `"1.0"` | PresetValidationError |
| Preset ID | Lowercase alphanumeric + hyphens | PresetValidationError |
| Preset version | Valid semantic version | PresetValidationError |
| Template type | One of {template, command, script} | PresetValidationError |
| Template strategy | Appropriate for type (scripts: no prepend/append) | PresetValidationError |
| ≥1 template | Must provide at least one template | PresetValidationError |
| speckit_version compatibility | Current version in specifier range | PresetCompatibilityError |
| Composition base | Non-replace strategy requires lower-priority layer | PresetValidationError |

---

## 10. Control Flow — Install Preset

```
INPUT: preset_source, preset_id

1. VALIDATE
   ├─ Load manifest (PresetManifest._validate)
   └─ Check compatibility (PresetManager.check_compatibility)

2. COPY
   ├─ Copy preset to .specify/presets/{preset_id}
   └─ Respect .presetignore patterns (if present)

3. COMPOSE (if non-replace templates)
   ├─ For each non-replace template:
   │  ├─ Collect all layers (PresetResolver.collect_all_layers)
   │  ├─ If preset is top: compose layers → .composed/{name}
   │  └─ Otherwise: register raw file
   └─ Pre-write composed files

4. REGISTER COMMANDS
   ├─ Extract command templates
   ├─ For each detected agent: register via CommandRegistrar
   └─ Track registered files

5. RECONCILE
   ├─ Run post-install reconciliation
   ├─ Resolve final composition for all command files
   └─ Write correct content to agent dirs

6. PERSIST
   ├─ registry.add(preset_id, metadata)
   └─ Save to .registry

7. ERROR HANDLING
   ├─ If step ≥ 2 fails:
   │  ├─ Delete copied preset dir
   │  ├─ Unregister commands
   │  └─ Remove from registry
   └─ Return error
```

---

## 11. Confidence Annotations

| Item | Confidence | Note |
|------|-----------|------|
| Manifest validation rules | 🟢 CONFIRMED | Extracted directly from code |
| Registry persistence | 🟢 CONFIRMED | Clear structure in `_load()` / `_save()` |
| Catalog merging algorithm | 🟢 CONFIRMED | Priority-based in `_fetch_single_catalog()` |
| Template resolution stack | 🟢 CONFIRMED | 4-level hierarchy in `resolve()` |
| Composition strategies | 🟡 INFERRED | Strategy logic inferred from `_register_commands()` and reconciliation hints |
| Command registration details | 🟡 INFERRED | Delegated to `agents.py`; this file wraps it |

---

## Summary

Module `preset` provides a **composable template system** with:
- **Strict manifest validation** to prevent errors
- **Multi-layer template resolution** with override hierarchy
- **Strategy-based composition** (replace/prepend/append/wrap)
- **Catalog-based discovery** with 1-hour caching
- **Compatibility checking** for version safety
- **Command registration** with agent coordination

Total lines: ~3100  
Classes: 5  
Methods: 90+  
Algorithms: Manifest validation, template composition, multi-catalog merge, 4-level resolution

Compared to `extension` module: presets focus on **template composition** while extensions focus on **modular functionality** (commands + hooks).

---

## Module: `integration` — AI Agent Integration Runtime

The **integration module** (`src/specify_cli/integration_runtime.py`, `integration_state.py`, `integrations/base.py`, `integrations/manifest.py`, `integrations/catalog.py`) implements the runtime layer for 30+ AI agent integrations (Claude, Copilot, Codex, Tabnine, Gemini, Qwen, etc.).

**Key responsibilities:**
- **Integration base classes** (IntegrationBase, MarkdownIntegration, TomlIntegration, SkillsIntegration)
- **State management** (.specify/integration.json parsing & normalization)
- **Option resolution** (raw options → parsed options → stored state)
- **Command invocation** (build slash-command strings for agents)
- **Manifest loading** (integration.yml validation & registration)
- **Catalog management** (discover integrations from remote registries)
- **Multi-install support** (safe co-installation validation)

**Core classes:**
| Class | Purpose |
|-------|---------|
| IntegrationBase | Abstract base; every integration subclasses this |
| MarkdownIntegration | Concrete base for Markdown-format agents (Claude, Copilot) |
| TomlIntegration | Concrete base for TOML-format agents (Gemini, Tabnine) |
| SkillsIntegration | Concrete base for skill-based agents (Claude, Codex) |
| IntegrationManifest | Load & validate integration.yml |
| IntegrationCatalog | Fetch integrations from remote registries |

**30 supported integrations:**
agy, amp, auggie, bob, claude, codebuddy, codex, copilot, cursor_agent, devin, forge, gemini, generic, goose, iflow, junie, kilocode, kimi, kiro_cli, lingma, opencode, pi, qodercli, qwen, roo, shai, tabnine, trae, vibe, windsurf

**State file:** `.specify/integration.json` (selected integration, parsed options, invoke_separator, script_type)

**Confidence:** 🟢 CONFIRMED (manifest structure, state schema, base classes direct from code)

---

## Module: `workflow` — Workflow Engine & Step Types

The **workflow module** (`src/specify_cli/workflows/engine.py`, `base.py`, `catalog.py`, `steps/`) implements a complete workflow engine for multi-step AI automation tasks.

**Key responsibilities:**
- **Workflow definition parsing** (YAML → WorkflowDefinition)
- **Step type registry** (command, shell, prompt, gate, if/then, switch, loops, fan-out/fan-in)
- **Execution engine** (sequential + control-flow dispatch)
- **State persistence** (resume capability across sessions)
- **Input/output handling** (workflow inputs, step context, result aggregation)
- **Control flow** (branching, loops, parallel fan-out with fan-in aggregation)

**Core classes:**
| Class | Purpose |
|-------|---------|
| WorkflowDefinition | Parsed workflow YAML (metadata + steps) |
| WorkflowEngine | Executes workflows step-by-step |
| StepBase | Abstract base for all step types |
| StepContext | Execution context (inputs, step results, state) |
| StepResult | Return value from step (status, output, next_steps) |
| WorkflowRegistry | Loads workflows from disk/remote |
| WorkflowCatalog | Discovers workflows from catalogs |

**Step types (from registry):**
- command: Execute local shell command
- shell: Shell wrapper (bash/ps)
- prompt: Dispatch to AI agent
- gate: Human approval gate
- if/then: Conditional branching
- switch: Multi-branch selection
- while/do-while: Loop constructs
- fan-out: Parallel iteration
- fan-in: Aggregation from fan-out

**State file:** Workflow run state persisted for resume (run_id, current_step, context snapshots)

**Confidence:** 🟢 CONFIRMED (WorkflowDefinition, StepBase direct from code; step registry pattern clear)

---

## Module: `agent` — Command Registrar for AI Agents

The **agent module** (`src/specify_cli/agents.py`) provides centralized command registration with 30+ AI agents.

**Key responsibilities:**
- **Agent metadata registry** (AGENT_CONFIGS derived from INTEGRATION_REGISTRY)
- **Command file generation** (Markdown .md or TOML .toml)
- **Frontmatter parsing/rendering** (YAML frontmatter for metadata)
- **Script path rewriting** (repo-relative → .specify-relative)
- **Multi-format output** (Markdown, TOML, JSON, YAML frontmatter)
- **Context marker management** (<!-- SPECKIT START/END --> boundaries)

**Key classes/functions:**
- CommandRegistrar: Central command writer
- parse_frontmatter(): Extract YAML from .md
- render_frontmatter(): Convert dict → YAML block
- rewrite_project_relative_paths(): Normalize script locations
- _build_agent_configs(): Lazy load from INTEGRATION_REGISTRY

**Supported formats:**
- Markdown (.md) with YAML frontmatter (Claude, Copilot, most agents)
- TOML (.toml) format (Gemini, Tabnine, others)
- JSON metadata with inline scripts

**Confidence:** 🟢 CONFIRMED (frontmatter parsing, agent dispatch pattern direct from code)

---

## Module: `catalog` — Shared Catalog Stack Infrastructure

The **catalog module** (`src/specify_cli/catalogs.py`) provides base primitives for catalog-backed features (extensions, presets, workflows, integrations).

**Key responsibilities:**
- **CatalogEntry** (dataclass: url, name, priority, install_allowed)
- **CatalogStackBase** (abstract; orchestrates catalog fetch/cache/merge)
- **URL validation** (HTTPS enforcement; localhost exception for dev)
- **Config file loading** (YAML → CatalogEntry list)
- **Priority ordering** (lower number = higher precedence)

**Shared across:**
- ExtensionCatalog (24h cache, remote extension discovery)
- PresetCatalog (1h cache, template preset discovery)
- WorkflowCatalog (15m cache, workflow discovery)
- IntegrationCatalog (1h cache, new integration discovery)

**Config file format (catalogs.yml / preset-catalogs.yml / etc.):**
```yaml
catalogs:
  - url: https://registry.example.com/extensions.json
    name: "Official Registry"
    priority: 1
    install_allowed: true
  - url: https://community.example.com/extensions.json
    name: "Community Registry"
    priority: 2
    install_allowed: false
```

**Confidence:** 🟢 CONFIRMED (CatalogEntry, URL validation, config schema direct from code)

---

## Module: `authentication` — Multi-Provider Auth Framework

The **authentication module** (`src/specify_cli/authentication/base.py`, `github.py`, `azure_devops.py`, `http.py`, `config.py`) provides pluggable authentication for external integrations.

**Key responsibilities:**
- **AuthProvider** (abstract base; every auth scheme implements this)
- **Token resolution** (from entry.token or entry.token_env)
- **Auth header generation** (build Authorization header)
- **Dynamic token acquisition** (override for azure-cli, oauth flows)
- **Config management** (AuthConfigEntry: token, token_env, auth_scheme)

**Supported auth schemes:**
- bearer (GitHub, generic HTTP APIs)
- basic (HTTP Basic Auth)
- azure-cli (Azure DevOps with local CLI)
- custom schemes (extensible)

**Providers implemented:**
- GitHubAuthProvider
- AzureDevOpsAuthProvider
- HttpBasicAuthProvider
- GenericBearerAuthProvider

**Config entry shape:**
```yaml
auth:
  - provider: "github"
    scheme: "bearer"
    token: "ghp_xxx" | null
    token_env: "GITHUB_TOKEN"
```

**Confidence:** 🟢 CONFIRMED (AuthProvider base, token resolution logic direct from code)

---

## Module: `shared_infra` — Shared Infrastructure Installation

The **shared_infra module** (`src/specify_cli/shared_infra.py`) handles safe installation of bundled templates, scripts, and shared files.

**Key responsibilities:**
- **Path safety** (prevent symlink traversal, path escapes)
- **Manifest loading** (load shared IntegrationManifest with fallbacks)
- **Source resolution** (bundled core_pack vs repo root)
- **Template/script copying** (with merge conflict handling)
- **Executable bit setting** (chmod +x on Unix)
- **Directory creation** (safe, non-following parents)

**Core functions:**
- load_speckit_manifest(): Load/merge shared IntegrationManifest
- shared_templates_source(): Resolve bundled vs repo templates
- shared_scripts_source(): Resolve bundled vs repo scripts
- _ensure_safe_shared_directory(): Create dirs without following symlinks
- _validate_safe_shared_directory(): Check existing paths
- _ensure_safe_shared_destination(): Refuse escapes/symlinks

**Safety checks:**
1. Path must not escape project root
2. Path components must not be symlinks
3. Resolved path must remain under project root
4. Parent directories checked before creation

**Confidence:** 🟢 CONFIRMED (safety logic, manifest loading direct from code)
