# Extension Module — Implementation Tasks

## Prerequisites

- [ ] pathspec library available (for `.extensionignore` pattern matching)
- [ ] pyyaml library available (for manifest parsing)
- [ ] packaging library available (for version specifier validation — PEP 440)
- [ ] agents.py module completed (for CommandRegistrar delegation)
- [ ] shared_infra.py module completed (for HookExecutor integration)
- [ ] .specify directory structure created (for extensions, registry, cache folders)

## Core Implementation Tasks

### Phase 1: Manifest & Registry

- [ ] **T-01** — Implement `ExtensionManifest` class
  - Origin: `src/specify_cli/extensions.py:119-365`
  - Responsible for: Load YAML, validate schema, enforce constraints
  - Criterion: Manifest loads, schema version checked, ID/version validated, commands/hooks parsed
  - Confidence: 🟢 (validation logic fully extracted from code)

- [ ] **T-02** — Implement `ExtensionRegistry` class
  - Origin: `src/specify_cli/extensions.py:366-602`
  - Responsible for: Load/save registry.json, add/remove/query extensions
  - Criterion: Registry persists to `.specify/extensions/.registry`, supports add/remove/list operations
  - Confidence: 🟢 (JSON schema and methods directly from code)

### Phase 2: Installation Orchestration

- [ ] **T-03** — Implement `ExtensionManager.install()` method
  - Origin: `src/specify_cli/extensions.py:603-1200` (estimated)
  - Responsible for: Validate → fetch/copy → register → persist with rollback
  - Criterion: Extension installs from remote/local, manifest validated, version checked, commands registered, hooks added, registry updated
  - Confidence: 🟢 (install flow extracted from code, error handling in cleanup block)

- [ ] **T-04** — Implement `ExtensionManager.remove()` method
  - Origin: `src/specify_cli/extensions.py:1200-1350` (estimated)
  - Responsible for: Unregister commands, delete dir, remove hooks, update registry
  - Criterion: Extension uninstalls, all commands removed from agents, hooks removed, registry updated
  - Confidence: 🟢 (removal flow mirrors install cleanup logic)

- [ ] **T-05** — Implement command conflict detection
  - Origin: `src/specify_cli/extensions.py:900-1000` (estimated, `_collect_manifest_command_names`, `_get_installed_command_name_map`)
  - Responsible for: Detect command name collisions before install
  - Criterion: Install fails if command name already registered; error lists conflicting extension
  - Confidence: 🟢 (collision check enforced at manifest validation)

### Phase 3: Command Registration

- [ ] **T-06** — Implement `CommandRegistrar.register_commands_for_agent()` method
  - Origin: `src/specify_cli/extensions.py:1579-1668` + delegation to agents.py
  - Responsible for: Write extension commands to agent command directories
  - Criterion: Command files written to `.claude/commands/`, `.copilot/commands/`, etc.; metadata comment injected
  - Confidence: 🟡 (orchestration clear, agent-specific details delegated to agents.py)

### Phase 4: Catalog & Discovery

- [ ] **T-07** — Implement `ExtensionCatalog.fetch_catalog()` method
  - Origin: `src/specify_cli/extensions.py:1669-2100` (estimated)
  - Responsible for: Multi-catalog fetch, merge by priority, 24h TTL caching
  - Criterion: Catalogs fetched from URLs, merged (priority-based), cached for 24h, stale cache refreshed on demand
  - Confidence: 🟢 (algorithm extracted from code, cache logic in `_fetch_single_catalog`)

- [ ] **T-08** — Implement catalog caching mechanism
  - Origin: `src/specify_cli/extensions.py:1800-1900` (estimated, `is_cache_valid`, cache TTL check)
  - Responsible for: Validate cache age, load from disk, save to disk
  - Criterion: Cache file `.specify/extensions/.cache/catalog.json` created/updated; TTL enforced (24h)
  - Confidence: 🟢 (cache file paths and TTL constants visible in code)

### Phase 5: Configuration

- [ ] **T-09** — Implement `ConfigManager` 4-layer resolution
  - Origin: `src/specify_cli/extensions.py:2206-2404` (estimated)
  - Responsible for: Merge defaults (manifest) → project file → local file → env vars
  - Criterion: Config resolved from all 4 layers, last-one-wins merge, env vars override all
  - Confidence: 🟡 (merge order inferred from code structure, not all path details visible)

- [ ] **T-10** — Implement environment variable parsing for config
  - Origin: `src/specify_cli/extensions.py:2300-2350` (estimated, `_get_env_config`)
  - Responsible for: Parse `SPECKIT_{EXT_ID_UPPER}_{KEY_UPPER}` format
  - Criterion: Env vars parsed correctly, keys converted to lowercase, values merged into config
  - Confidence: 🟡 (format inferred from pattern, parsing logic not fully visible)

### Phase 6: Hooks & Lifecycle

- [ ] **T-11** — Implement `HookExecutor` hook registration
  - Origin: `src/specify_cli/extensions.py:2405-2500` (estimated) + shared_infra.py
  - Responsible for: Store hooks from manifest into `.specify/init.json`
  - Criterion: Hooks from manifest added to init.json, no override of existing hooks
  - Confidence: 🟡 (storage mechanism clear, execution trigger not fully visible in this module)

- [ ] **T-12** — Implement hook execution on CLI lifecycle events
  - Origin: shared_infra.py (HookExecutor) + init workflow
  - Responsible for: Trigger hooks on matching events (post-install, pre-build, etc.)
  - Criterion: Hooks execute on correct CLI events, results logged/reported
  - Confidence: 🔴 (execution context and event binding not visible in extension module; depends on shared_infra)

## Testing Tasks

- [ ] **TT-01** — Test happy path: remote catalog install
  - Scenario: User installs extension from remote catalog with valid manifest
  - Validation: Extension installed, commands registered, hooks persisted, registry updated
  - Confidence: 🟢

- [ ] **TT-02** — Test error path: command name collision
  - Scenario: User installs extension with command name already registered
  - Validation: Install fails, original extension untouched, error message lists conflicting extension
  - Confidence: 🟢

- [ ] **TT-03** — Test error path: invalid manifest
  - Scenario: User installs extension with malformed extension.yml
  - Validation: Install fails before any file copy, descriptive error with line number
  - Confidence: 🟢

- [ ] **TT-04** — Test multi-catalog merge
  - Scenario: Multiple catalogs configured, some cached, some expired
  - Validation: Catalogs merged by priority, expired cached refreshed, result cached 24h
  - Confidence: 🟡

- [ ] **TT-05** — Test config 4-layer resolution
  - Scenario: Extension config spread across manifest, project file, local file, env vars
  - Validation: All layers merged correctly, env vars override all, final config correct
  - Confidence: 🟡

- [ ] **TT-06** — Test removal with full rollback
  - Scenario: User uninstalls extension
  - Validation: Commands removed from all agents, hooks removed, dir deleted, registry updated
  - Confidence: 🟢

- [ ] **TT-07** — Test concurrent install/remove safety
  - Scenario: Two extensions installed/removed simultaneously
  - Validation: Registry remains consistent, no race conditions on file writes
  - Confidence: 🔴 (locking mechanism not visible in code; needs validation)

## Migration / Data Tasks

(None applicable — extension module is stateless, no data schema to migrate)

## Suggested Order

1. **T-01 (ExtensionManifest)** — Foundation; all other tasks depend on manifest parsing
2. **T-02 (ExtensionRegistry)** — Persistence layer; needed by install/remove orchestration
3. **T-03 (install)** → **T-05 (conflict detection)** — Core workflow; do together
4. **T-04 (remove)** — Mirrors install, lower priority but needed for full lifecycle
5. **T-06 (CommandRegistrar)** — Dependency of install; coordinate with agents.py
6. **T-07 (fetch_catalog)** → **T-08 (caching)** — Discovery; can proceed in parallel with install
7. **T-09 (ConfigManager)** → **T-10 (env vars)** — Configuration; optional for MVP
8. **T-11 (hook registration)** → **T-12 (hook execution)** — Hooks; blocked by shared_infra completion
9. **TT-01 through TT-07** — Testing; start after T-03 (install) complete

### Blocking Dependencies

- T-03 blocked by: T-01 ✅, T-02 ✅
- T-04 blocked by: T-01 ✅, T-02 ✅
- T-06 blocked by: agents.py completion
- T-12 blocked by: shared_infra.py (HookExecutor) completion

## Open Questions & Lacunas (🔴)

1. **Atomic install guarantee** — If error occurs between registry write (T-02) and cleanup (T-03 error path), is state recoverable? Needs clarification on idempotency.

2. **Hook execution context** — How are hooks triggered during CLI lifecycle? Requires investigation of init.json parsing and event dispatch (T-12 blocked).

3. **Concurrent access safety** — No file locking visible in code. Can concurrent install/remove cause race conditions on registry? Needs concurrency model definition.

4. **Command precedence in multi-agent** — If same command registered to multiple agents, what is resolution order if agents conflict? Undocumented.

5. **`.extensionignore` default behavior** — Should copy respect standard `.gitignore`? Inferred from pathspec usage, needs confirmation (T-03).

6. **Cache invalidation strategy** — 24h TTL hardcoded; is this correct? Should admin be able to force refresh? (T-08).

---

**Generated**: 2026-05-16  
**Total Tasks**: 12 core + 7 test  
**Confidence**: 🟢 Core workflow (install/remove), 🟡 Config & catalog, 🔴 Hooks & concurrency  
**Estimated Effort**: 40–60 hours (assuming agents.py & shared_infra.py already completed)
