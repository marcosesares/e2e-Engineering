# Extension Module — Design

## Core Classes

| Class | Purpose | Key Responsibility |
|-------|---------|---------------------|
| **ExtensionManifest** | Parse & validate `extension.yml` | Schema validation, metadata extraction, error reporting |
| **ExtensionRegistry** | Persist installed extension metadata | JSON storage in `.specify/extensions/.registry`, add/remove/query operations |
| **ExtensionManager** | Orchestrate install/remove/update workflows | Coordinate manifest validation, file copy, command registration, hooks, rollback |
| **CommandRegistrar** | Register extension commands with agents | Write command files to `.claude/`, `.copilot/`, etc. with metadata injected |
| **ExtensionCatalog** | Discover & cache extensions from remote sources | Multi-catalog fetch, merge by priority, 24-hour TTL caching |
| **ConfigManager** | Resolve extension configuration from 4 layers | Merge defaults (manifest) → project file → local file → env vars |
| **HookExecutor** | Execute lifecycle hooks | Store/read hooks in `.specify/init.json`, trigger on CLI events |

## Interface

### ExtensionManager API

| Method | Signature | Returns | Notes |
|--------|-----------|---------|-------|
| `install(source, ext_id, options)` | `(str/Path, str, Dict) → ExtensionManifest` | Manifest of installed extension | Full orchestration: validate → copy → register → persist |
| `remove(ext_id, keep_config)` | `(str, bool) → bool` | True if success | Rollback on error: delete dir, unregister commands/hooks |
| `update(ext_id, new_version)` | `(str, str) → ExtensionManifest` | Updated manifest | Calls remove + install atomically |
| `list_installed()` | `() → Dict[str, dict]` | Registry contents | All extensions with metadata |
| `get_extension(ext_id)` | `(str) → Optional[ExtensionManifest]` | Manifest or None | Reload from installed dir |
| `check_compatibility(manifest, speckit_version)` | `(ExtensionManifest, str) → bool` | True if compatible | Validates version specifier match |

### ExtensionManifest Properties

```python
@property
def id(self) -> str: ...              # Extension ID (e.g., "auth-tools")
@property
def name(self) -> str: ...            # Display name
@property
def version(self) -> str: ...         # Semantic version (PEP 440)
@property
def requires_speckit_version(self) -> str: ...  # Version specifier (e.g., ">=1.0.0,<2.0.0")
@property
def commands(self) -> List[Dict]: ... # Provided commands
@property
def hooks(self) -> Dict: ...          # Provided hooks
```

## Main Workflows

### Installation Flow (High-Level)

```
INPUT: source (remote URL or local path), ext_id, options

1. VALIDATE
   ├─ Resolve source → manifest.yml location
   ├─ Load & validate ExtensionManifest
   ├─ Check version compatibility (speckit_version specifier)
   └─ Detect command name collisions against existing registry

2. FETCH/COPY
   ├─ If remote: download ZIP (HTTPS only), extract to temp
   ├─ If local: use directory as-is
   └─ Copy to .specify/extensions/{ext_id}

3. REGISTER COMMANDS
   ├─ Detect installed agents (.claude, .copilot, .codex, ...)
   ├─ For each agent:
   │  ├─ Load command files from manifest
   │  ├─ Inject extension metadata comment
   │  └─ Write to agent command directory
   └─ Track registered file paths

4. REGISTER HOOKS
   ├─ Load hooks from manifest
   ├─ Add to .specify/init.json with execution config
   └─ Merge with existing hooks (no override)

5. PERSIST
   ├─ ExtensionRegistry.add(ext_id, metadata)
   ├─ Save registry to .registry JSON
   └─ Return success

ERROR HANDLING (step ≥2 fails):
   ├─ Delete copied extension directory
   ├─ Unregister all commands from agents
   ├─ Remove hooks from init.json
   └─ Remove from registry
```

### Removal Flow

```
INPUT: ext_id

1. Load from registry (get manifest, file paths)
2. Unregister commands:
   ├─ Find all agent dirs with this ext's commands
   ├─ Delete command files by stored path
3. Unregister hooks:
   ├─ Remove hooks from .specify/init.json
4. Delete extension directory
5. Remove from registry
6. Return success or error
```

## Manifest Schema (extension.yml)

```yaml
schema_version: "1.0"

extension:
  id: auth-tools              # Must match ^[a-z0-9-]+$
  name: Authentication Tools  # Display name
  version: 1.2.3              # Semantic version (PEP 440)
  description: "..."

requires:
  speckit_version: ">=1.0.0,<2.0.0"  # PEP 440 specifier
  python_version: ">=3.9"             # Optional

provides:
  commands:
    - name: speckit.auth.check        # Pattern: speckit.{ext_id}.{cmd}
      file: commands/check.md
      aliases: [speckit.auth.verify]  # Optional
    - name: speckit.auth.login
      file: commands/login.md

hooks:
  post-install:
    command: "echo 'Auth tools installed'"  # Shell command or path
  pre-build:
    command: "auth-validate.sh"
```

## Registry Schema (.specify/extensions/.registry)

```json
{
  "schema_version": "1.0",
  "extensions": {
    "auth-tools": {
      "version": "1.2.3",
      "priority": 10,
      "installed_at": "2026-05-16T12:00:00Z",
      "enabled": true,
      "registered_files": {
        ".claude/commands/auth-check.md": {},
        ".copilot/commands/auth-check.md": {}
      },
      "registered_hooks": ["post-install", "pre-build"]
    }
  }
}
```

## Configuration Resolution (4-Layer Stack)

1. **Defaults** — Extracted from manifest `config` section
2. **Project** — `.specify/extensions/{ext_id}-config.yml`
3. **Local** — `.specify/extensions/local-config.yml`
4. **Environment** — `SPECKIT_{EXT_ID_UPPER}_{KEY_UPPER}` env vars

**Resolution**: Layers merged (last-one-wins); final config is combination of all 4.

## Catalog Merging Algorithm

```
INPUT: list of CatalogEntry (with URL, name, priority)

1. Sort entries by priority (ascending, lower = higher)
2. For each catalog (in priority order):
   ├─ Check cache validity (24h TTL)
   ├─ If valid: load from cache
   ├─ If expired: fetch from network, save cache
   ├─ Merge into result: first ext_id wins (no override)
3. Return merged catalog dict
```

**Cache Location**: `.specify/extensions/.cache/catalog.json` + `.cache/catalog-metadata.json`

## Dependencies

- **pathspec** — `.extensionignore` pattern matching (respects gitignore-style patterns)
- **pyyaml** — Manifest parsing
- **packaging** — Version specifier validation (PEP 440)
- **agents.py** — CommandRegistrar for agent-specific command registration
- **extensions.py:2405–2932** — `HookExecutor` class for lifecycle hook management (NOT in shared_infra). Dispatcher lives inside ExtensionManager invocation chain.

## Design Decisions

| Decision | Evidence | Confidence |
|----------|----------|-----------|
| 24-hour cache TTL for catalogs | `extensions.py:_fetch_single_catalog()` sets 24h check | 🟢 |
| Command name pattern `speckit.{ext_id}.{cmd}` enforced | Manifest validation regex + namespace matching | 🟢 |
| Install fails on command collision, no shadowing allowed | `_collect_manifest_command_names()` checks intersection | 🟢 |
| Rollback on any error after file copy | Exception handling in `ExtensionManager.install()` cleanup block | 🟢 |
| Config resolution uses last-one-wins merge | `ConfigManager._merge_configs()` appends order | 🟡 |
| Hooks stored in separate `.specify/init.json` (not registry) | Registry only tracks registered files; hooks in init.json | 🟡 |

## State Management

**Persistence Points**:
- `.specify/extensions/.registry` — Extension metadata, installed version, priority, enabled flag
- `.specify/extensions/{ext_id}/` — Extension files and manifest
- `.specify/init.json` — Registered hooks

**Transient State**:
- Registry loaded in-memory during CLI session
- Config resolved dynamically (not cached)
- Catalog cached for 24h on disk

## Observabilidade

- Extension installation logs errors via ValidationError, CompatibilityError exceptions
- Registry save failures logged implicitly (I/O errors bubble up)
- Catalog fetch timeouts/network errors caught and cached state used as fallback
- No structured logging observed; errors are exception-based

## Risks & Lacunas

- 🔴 **Atomic install guarantee unclear** — If error occurs between registry write and cleanup, state may be inconsistent (partial install recoverable?)
- 🟢 **Hook execution context** — `HookExecutor` (extensions.py:2405–2932) manages dispatch: `get_hooks_for_event()`, `should_execute_hook()`, `execute_hook()`, and `_render_hook_invocation()` (line 2442). Events emitted by CLI commands in `__init__.py:4110, 4208, 4528, 4532, 4567, 4571`. Hooks stored in `extensions.yml` under `hooks: {<event_name>: [...]}`. Executor renders commands to agent-specific format (skill mode, slash, codex $ prefix) by reading `init-options.json`.
- 🟡 **Command precedence in multi-agent setup** — If same command registered to multiple agents, resolution order undocumented
- 🟡 **Concurrent access** — No locking observed; concurrent install/remove could cause race conditions on registry file

---

**Generated**: 2026-05-16  
**Confidence**: 🟢 Core classes & manifest schema, 🟡 Hooks & config layers (partial visibility)  
**File Structure**: `src/specify_cli/extensions.py` (~2500 LOC, 7 main classes)
