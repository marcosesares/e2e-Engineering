# Extension Module — Requirements

## Overview

Extension module provides a modular package system that adds new commands and hooks to Specify CLI without bloating core. Extensions are self-contained, versioned bundles that register commands with multiple AI agents (Claude, Copilot, etc.) and execute custom hooks during CLI lifecycle events. Unlike presets (template composition), extensions specialize in **command registration** and **hook execution**.

## Responsibilities

- **Manifest validation** — Load and validate `extension.yml` structure, enforce schema constraints
- **Lifecycle management** — Install, remove, update, enable/disable extensions with rollback
- **Command registration** — Register extension commands with all available agents (.claude, .copilot, .codex, etc.)
- **Hook registration** — Register lifecycle hooks for execution on CLI events
- **Catalog management** — Fetch and cache extensions from remote catalogs with multi-source merge
- **Command resolution** — Resolve extension commands via manifest or registered files
- **Conflict detection** — Detect command name collisions before install to prevent shadowing

## Business Rules

| Rule | Enforcement | Confidence |
|------|------------|-----------|
| Only one manifest per extension | Parser validates `extension.yml` schema once per install | 🟢 |
| Extension IDs use lowercase alphanumeric + hyphens | Regex `^[a-z0-9-]+$` enforced at manifest load | 🟢 |
| Command names follow spec notation `speckit.{ext_id}.{cmd_name}` | Pattern enforced at manifest validation; auto-fix with warning | 🟡 |
| Command namespace must match extension ID | Validation rejects mismatch in manifest | 🟢 |
| Extensions use PEP 440 semantic versioning | `ExtensionManifest` validates via `packaging.version` | 🟢 |
| Must declare ≥1 command OR ≥1 hook | Manifest validation rejects empty extensions | 🟢 |
| Compatibility check on install | Version specifier in `requires.speckit_version` validated before install | 🟢 |
| No command shadowing allowed | Install fails if command name conflicts with installed extension | 🟢 |
| Catalog cache TTL = 24 hours | Shorter than presets (1h) to balance responsiveness vs. bandwidth | 🟡 |

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| RF-01 | Load & validate manifest from `extension.yml` | Must | Manifest loads, schema validated, errors reported with line numbers |
| RF-02 | Install extension from remote catalog | Must | Extension fetched, cached (24h TTL), manifest validated, commands registered, hooks saved |
| RF-03 | Detect and prevent command name collisions | Must | Install rejects if command name already in registry; error lists conflicting extension |
| RF-04 | Register extension commands with all available agents | Must | For each agent dir (.claude, .copilot, etc.), command files written with metadata comment |
| RF-05 | Register hooks in CLI lifecycle | Must | Hooks from manifest added to `.specify/init.json`, executed on matching CLI event |
| RF-06 | Multi-catalog discovery with priority merge | Must | Fetch from multiple catalog URLs, merge by priority (first wins), cache result |
| RF-07 | Uninstall extension with rollback | Must | Remove commands from agents, remove hooks, delete extension dir, restore registry |
| RF-08 | Load extension configuration from 4 layers | Should | Resolve: defaults (manifest) → project file → local file → env vars (last-one-wins) |
| RF-09 | List installed extensions with metadata | Should | Return version, priority, install date, enabled/disabled status |
| RF-10 | Enable/disable installed extension | Could | Toggle extension without uninstall; commands remain but disabled |

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-------------|----------|-----------|
| Performance | Extension install must complete in <5s for local/cached sources | `src/specify_cli/extensions.py:_download_extension()` timeout not explicit, inferred from UX | 🟡 |
| Security | Extension URLs must be HTTPS only (except localhost) | `extensions.py:_validate_catalog_url()` rejects HTTP | 🟢 |
| Security | Extension ZIP extraction must respect `.extensionignore` patterns | `extensions.py:_copy_extension()` creates ignore function | 🟡 |
| Availability | Extension install must rollback on any error after step 2 | `extensions.py:install()` cleanup branch deletes dir, unregisters commands | 🟢 |
| Reliability | Corrupt extension catalog cache must not crash CLI | `extensions.py:_fetch_single_catalog()` catches JSON decode errors | 🟡 |
| Compatibility | Extension `requires.speckit_version` specifier must prevent incompatible installs | `ExtensionManifest.check_compatibility()` validates version range | 🟢 |

## Acceptance Criteria

```gherkin
Scenario: Install extension from remote catalog
  Given no extension with this name is installed
  And the catalog is reachable
  When user runs `specify extension add {ext_id}`
  Then manifest is fetched and validated
  And commands are registered with all agents
  And hooks are saved to init.json
  And extension appears in registry

Scenario: Prevent command shadowing
  Given extension A with command `speckit.auth.login` is installed
  When user attempts to install extension B with command `speckit.auth.login`
  Then install fails with error "Command already provided by extension-a"

Scenario: Uninstall with rollback
  Given extension is installed
  When user runs `specify extension remove {ext_id}`
  Then commands are removed from all agents
  And hooks are removed from init.json
  And extension directory is deleted
  And registry is updated

Scenario: Multi-catalog merge with priority
  Given 2 catalogs configured (official priority=10, community priority=20)
  When catalog is fetched
  Then official catalog loaded first (cached if valid)
  And community catalog merged second (deduped by ext_id)
  And result cached for 24 hours
```

## Traceability

| Source File | Responsible Classes | Coverage |
|-------------|-------------------|----------|
| `src/specify_cli/extensions.py` | `ExtensionManifest`, `ExtensionRegistry`, `ExtensionManager`, `ExtensionCatalog`, `CommandRegistrar` | 🟢 Core install/remove/catalog |
| `src/specify_cli/agents.py` | `CommandRegistrar` (writes files to agent dirs) | 🟡 Cross-module integration |
| `src/specify_cli/__init__.py` | CLI commands calling `ExtensionManager` methods | 🟢 User-facing API |
| `.specify/init.json` | Hook persistence layer (read/write via HookExecutor) | 🟡 External state not fully analyzed |

---

**Document Generated**: 2026-05-16  
**Confidence**: 🟢 Core workflow, 🟡 Config layers and hooks (partial code visibility)  
**Next Step**: Read `design.md` for implementation details of each class
