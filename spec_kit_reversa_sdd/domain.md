# Domain Model — Specify CLI

**Generated**: 2026-05-18 (Detective)  
**Project**: spec-kit  
**Modules Analyzed**: init, extension, preset, integration, workflow, agent, catalog, authentication, shared_infra

---

## Business Context

Specify CLI is a **Spec-Driven Development (SDD) framework** that bridges the gap between human intent (specifications) and AI agent execution. It orchestrates a composable ecosystem of **extensions**, **presets**, **workflows**, and **integrations** to enable automated specification-driven development workflows.

The system prioritizes:
1. **Composability** — Multiple layers (overrides, presets, extensions, core) can combine
2. **Security by default** — Authentication is opt-in, never automatic
3. **Extensibility** — Third-party extensions can add commands, templates, and workflows
4. **Multi-integration support** — Supports 30+ AI agents (Claude, Copilot, Cursor, Windsurf, etc.)

---

## Glossary

### Core Concepts

| Term | Definition | Confidence |
|------|-----------|-----------|
| **Specification (Spec)** | Machine-readable contract for AI agents, describing what software to build. SDD uses specs instead of traditional requirements docs. | 🟢 |
| **Spec-Driven Development (SDD)** | Workflow where specs are the source of truth; agents generate code, tests, and docs from specs. | 🟢 |
| **Constitution** | Master specification document defining project-wide rules, conventions, and guardrails for all agents. Versioned semantically. | 🟢 |
| **Template** | Reusable content (Markdown, scripts, commands) that agents consume to generate specs or artifacts. Templates are composable. | 🟢 |
| **Preset** | Collection of versioned templates grouped by purpose (e.g., "python-templates", "game-narrative-writing"). Can be layered. | 🟢 |
| **Extension** | Modular package adding commands and hooks to the CLI without bloating core. Can register commands with agents. | 🟢 |
| **Integration** | Connection to an AI agent (Claude, Copilot, Cursor, etc.). Translates CLI commands into agent-specific formats. | 🟢 |
| **Workflow** | DAG of steps (command, prompt, shell, control-flow) that orchestrate agent execution. Steps run sequentially or in parallel (fan-out/fan-in). | 🟢 |

### Registry & Persistence

| Term | Definition | Confidence |
|------|-----------|-----------|
| **Registry** | JSON file persisting installed preset/extension metadata. Includes version, priority, install timestamp, enabled status. | 🟢 |
| **Catalog** | Remote JSON file listing available presets/extensions. Multiple catalogs can be merged (priority stack). Official + community sources. | 🟢 |
| **Priority Stack** | Multi-layer template resolution: 1) Project overrides, 2) Installed presets (by priority), 3) Extensions, 4) Core templates. First match wins. | 🟢 |
| **Manifest** | YAML file defining a preset/extension (ID, version, dependencies, provided templates). Must declare schema version 1.0. | 🟢 |

### Templates & Composition

| Term | Definition | Confidence |
|------|-----------|-----------|
| **Template Type** | Category: `template` (artifact), `command` (CLI command), or `script` (executable). Determines valid composition strategies. | 🟢 |
| **Composition Strategy** | How multiple template layers combine: `replace` (override entirely), `prepend` (insert before), `append` (insert after), `wrap` (surround with placeholder). | 🟢 |
| **{CORE_TEMPLATE}** | Placeholder in preset commands allowing wrapping of core command. Resolved via fallback: override → extension manifest → core. | 🟡 |
| **Template Resolution** | 4-level priority lookup: finds template file path via priority stack. Skippable per type (core-only, extension-only, etc.). | 🟡 |

### Authentication & Security

| Term | Definition | Confidence |
|------|-----------|-----------|
| **Auth Config (auth.json)** | User-created file (`~/.specify/auth.json`) mapping hosts to authentication providers. Absence = opt-out (no auth). | 🟢 |
| **Provider** | Concrete auth mechanism (GitHub PAT, Azure AD service principal, HTTP basic, etc.). Each provider implements `AuthProvider` ABC. | 🟢 |
| **Auth Scheme** | How provider builds HTTP headers (e.g., `bearer`, `basic`). Provider declares supported schemes. | 🟢 |
| **Host Pattern** | Glob pattern in auth.json (`example.com`, `*.example.com` only). Rejects dangerous patterns like `*github.com`. | 🟢 |

### Agent & Workflow Execution

| Term | Definition | Confidence |
|------|-----------|-----------|
| **Step** | Atomic unit of workflow execution (command, prompt, shell, if/then, loop, fan-out, etc.). Each has status (pending, running, completed, failed, skipped, paused). | 🟢 |
| **Run** | Single workflow execution. Has status (created, running, paused, completed, failed, aborted). Contains step results. | 🟢 |
| **StepContext** | Execution context passed to each step: inputs, accumulated step results, fan-out item, fan-in aggregates, default integration/model. | 🟢 |
| **Integration Runtime** | Engine that translates workflow step commands into calls to specific AI agents (Claude, Copilot, etc.). Handles model selection, options, output parsing. | 🟡 |

---

## Core Business Rules

### Template Composition

| Rule | Enforcement | Confidence |
|------|------------|-----------|
| **Only one manifest per preset/extension** | Parser validates `preset.yml` / `extension.yml` schema once per install. | 🟢 |
| **Scripts cannot use prepend/append** | `VALID_SCRIPT_STRATEGIES = {"replace", "wrap"}` constant enforced at manifest validation. | 🟢 |
| **Templates must have ≥1 provider** | Manifest validation rejects empty `provides.templates` list. | 🟢 |
| **Manifest schema locked at 1.0** | `schema_version: "1.0"` exact match required. No forward compatibility. | 🟢 |
| **Priority ordering** | Lower numeric priority = higher precedence (e.g., priority 1 wins over priority 10). | 🟢 |

### Versioning & Compatibility

| Rule | Enforcement | Confidence |
|------|------------|-----------|
| **Presets use PEP 440 semantic versioning** | `PresetManifest` validates version via `packaging.version`. Pattern: `1.2.3`, `2.0.0a1`, etc. | 🟢 |
| **Extensions use PEP 440 semantic versioning** | Same as presets. | 🟢 |
| **Dependency specifiers** | `requires.speckit_version` and `requires.python_version` use PEP 440 specifiers (e.g., `">=0.8.0,<2.0.0"`). | 🟢 |
| **Compatibility check on install** | `PresetManager.check_compatibility()` rejects if speckit version doesn't match specifier. | 🟢 |

### Identifiers

| Rule | Enforcement | Confidence |
|------|------------|-----------|
| **Preset/extension IDs** | Regex `^[a-z0-9-]+$` (lowercase, alphanumeric, hyphens only). Enforced at manifest load. | 🟢 |
| **Core command names** | Loaded from bundled templates or fallback set: `analyze`, `checklist`, `clarify`, `constitution`, `implement`, `plan`, `specify`, `tasks`, `taskstoissues`. | 🟢 |
| **Extension command pattern** | Must match `speckit\.([a-z0-9-]+)\.([a-z0-9-]+)` (org.extension.command). Validated at registration. | 🟢 |

### Authentication & Host Security

| Rule | Enforcement | Confidence |
|------|------------|-----------|
| **Opt-in authentication** | No credentials sent unless explicitly configured in auth.json. Default = unauthenticated requests. | 🟢 |
| **Host patterns: exact or wildcard-suffix only** | `_is_valid_host_pattern()` rejects `*github.com` (would match `github.com.evil.com`). Accepts: `example.com`, `*.example.com` only. | 🟢 |
| **Auth config file permissions warning (POSIX)** | If `~/.specify/auth.json` is group/world-readable on Unix, CLI warns to `chmod 600`. Windows check skipped. | 🟡 |
| **Catalog HTTPS enforcement** | `PresetCatalog._validate_catalog_url()` requires HTTPS (or localhost HTTP for dev). | 🟢 |

### Workflow Execution

| Rule | Enforcement | Confidence |
|------|------------|-----------|
| **Steps execute sequentially by default** | `WorkflowEngine` processes step list in order unless control-flow (if/then, loop, fan-out) overrides. | 🟡 |
| **Fan-out spawns parallel iterations** | Each fan-out item creates independent execution context. Results aggregated in fan-in. | 🟡 |
| **Status transitions are unidirectional** | StepStatus/RunStatus enums define valid terminal states (COMPLETED, FAILED, ABORTED, SKIPPED). | 🟡 |
| **Paused runs can be resumed** | RunStatus.PAUSED is a transient state allowing external resume trigger. | 🟡 |

### Catalog & Registry Management

| Rule | Enforcement | Confidence |
|------|------------|-----------|
| **Catalog cache TTL: 1 hour** | `PresetCatalog.is_cache_valid()` checks timestamp of `.cache/catalog-metadata.json`. Shorter than extensions' 24h for faster updates. | 🟢 |
| **First preset ID wins in merged catalog** | When multiple catalogs provide same preset, first in priority order wins (no override). | 🟢 |
| **Registry deep-copy on get()** | `PresetRegistry.get()` returns deep copy to prevent external mutation. | 🟡 |
| **Registry timestamp preservation on update** | `PresetRegistry.update()` preserves `installed_at` timestamp; only updates specified fields. | 🟡 |

---

## Implicit Business Rules

### Design Assumptions

| Assumption | Evidence | Confidence |
|-----------|----------|-----------|
| **Multiple catalog sources should be mergeable** | `PresetCatalog` supports array of enabled catalogs; official + community split suggests multi-source vision. | 🟡 |
| **Preset composition is load-bearing** | `PresetManager` implements full composition pipeline (resolve, collect layers, compose, pre-write); indicates core to templating strategy. | 🟡 |
| **Workflow state is externally observable** | `StepContext` includes `run_id` for tracking; `RunStatus` includes observable states (PAUSED, RUNNING). | 🟡 |
| **Integration selection is runtime** | `default_integration` in `StepContext` + workflow-level fallback suggests dynamic agent selection. | 🟡 |
| **Commands can override core behavior** | Preset command templates with wrap strategy + `{CORE_TEMPLATE}` placeholder. Core is not immutable. | 🟡 |

### Safety & Resilience

| Assumption | Evidence | Confidence |
|-----------|----------|-----------|
| **Corrupted registry should not crash** | `PresetRegistry._load()` handles missing/invalid JSON with defaults; `normalize_priority()` clamps invalid values. | 🟢 |
| **Broken manifests should fail loud** | All manifest loaders raise `ValidationError` / `CompatibilityError` on schema/version/dependency issues. | 🟢 |
| **Extension discovery is resilient to missing files** | Core command names fallback to baked-in set if wheel/source templates unavailable. | 🟡 |
| **HTTP download failures should degrade gracefully** | `_open_url()` context manager + catalog caching means stale cache is better than failure. | 🟡 |

---

## Data Model Summary

### Preset Lifecycle

```
Discovered (in catalog)
    ↓
Installed (copied to .specify/presets/{id}, added to registry)
    ↓
Enabled/Disabled (toggle in registry, affects template resolution)
    ↓
Removed (uninstalled, unregistered, files deleted, keep_config optional)
```

### Extension Lifecycle

```
Discovered (in catalog)
    ↓
Installed (validated, commands registered, added to registry)
    ↓
Enabled/Disabled (affects command availability)
    ↓
Removed (commands unregistered, files deleted)
```

### Workflow Lifecycle

```
Created → Running → (Paused ↔ Running) → Completed/Failed/Aborted
                         ↓
                      Steps accumulate results
```

### Step Status Hierarchy

```
Pending → Running → Completed
                 ↘ Failed
                 ↘ Skipped
                 ↘ Paused (blocking)
```

---

## Open Questions & Gaps

| Gap | Impact | Confidence |
|-----|--------|-----------|
| **Preset rollback semantics** | `PresetRegistry.restore()` exists but caller not found in codebase. Rollback strategy unclear. | 🔴 |
| **Conflict resolution in multi-preset composition** | When two presets provide same template with different strategies, which wins? Not documented. | 🔴 |
| **Workflow pause/resume implementation** | StepStatus.PAUSED exists but resume trigger (signal, webhook?) not clear from code. | 🔴 |
| **Extension hook system** | Extensions can add hooks (mentioned in docs) but hook execution order/ordering not detailed. | 🔴 |
| **Agent-specific command format translation** | Integration runtime translates to agent format, but mapping rules (CLI flags → agent args) not in this module. | 🔴 |

---

## Related Specs

- Code Analysis: `_reversa_sdd/code-analysis.md`
- Data Dictionary: `_reversa_sdd/data-dictionary.md`
- Workflows: `_reversa_sdd/flowcharts/workflow.md`
- Extensions: `_reversa_sdd/flowcharts/extension.md`
