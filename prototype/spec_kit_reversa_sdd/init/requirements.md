# init — Project Initialization

> **Unit**: init  
> **Type**: Feature  
> **Language**: English

---

## Overview

The `init` command initializes a new Specify project by scaffolding directory structure, bundled templates, and optional git repository. It also configures integration with AI coding agents (Claude, Copilot, Cursor, etc.) and optionally installs presets to customize the workflow.

---

## Responsibilities

- Validate environment (optional tool checks: git, agent tools)
- Create or use existing project directory
- Scaffold bundled templates (SDD framework files: constitution, spec, checklist, etc.)
- Initialize git repository (unless `--no-git` or existing repo detected)
- Configure AI agent integration (resolves `--integration` or `--ai` options)
- Optionally install preset(s) during initialization
- Handle custom script type (sh or ps)
- Manage branch numbering strategy (sequential or timestamp-based)

---

## Business Rules

- **Opt-in authentication for integrations** — No credentials sent unless explicitly configured. 🟢
- **Bundled assets default** — All scaffolding uses bundled templates (no network downloads required). 🟢
- **Integration selection** — User chooses agent via `--integration` (preferred) or `--ai` (deprecated); mutually exclusive. 🟢
- **Directory creation logic** — Create new directory by name, use current dir with `--here`, or use `--here --force` to skip confirmation when non-empty. 🟢
- **Git initialization** — Automatic unless `--no-git` or repo already exists. 🟢
- **Preset installation** — Optional, specified by preset ID; installs during initialization. 🟡
- **Branch numbering** — Strategy defaults to `sequential` (001, 002, …, 1000, …) or `timestamp` (YYYYMMDD-HHMMSS). 🟡

---

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criterion |
|----|-----------|----------|-------------------|
| RF-01 | User can initialize project in new directory | Must | `specify init my-project` creates `./my-project/` with scaffolded files |
| RF-02 | User can initialize project in current directory | Must | `specify init --here` or `specify init .` uses CWD; `--force` skips confirmation |
| RF-03 | System validates or installs required tools (git, agent tools) | Should | `--ignore-agent-tools` bypasses agent tool checks |
| RF-04 | System scaffolds bundled templates | Must | Constitution, spec, checklist, tasks templates present post-init |
| RF-05 | System initializes git repository | Should | Automatic unless `--no-git` or existing `.git/` found |
| RF-06 | User selects AI agent integration | Must | `--integration <agent>` or interactive selection; resolves to valid INTEGRATION_REGISTRY entry |
| RF-07 | System configures agent integration commands | Should | Agent-specific command registration (e.g., Claude installs skills by default) |
| RF-08 | User optionally installs preset | Could | `--preset <id>` triggers preset installation during init |
| RF-09 | User specifies script type | Could | `--script sh` or `--script ps`; affects generated shell scripts |
| RF-10 | System supports custom AI agent directories | Could | `--integration generic --integration-options="--commands-dir .myagent/commands/"` |
| RF-11 | System resolves integration from legacy --ai flag | Should | `--ai <agent>` maps to INTEGRATION_REGISTRY via AI_ASSISTANT_ALIASES; deprecated but supported |
| RF-12 | System configures branch numbering strategy | Could | `--branch-numbering sequential` or `--branch-numbering timestamp` persists to project config |

---

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-----------|----------|-----------|
| Compatibility | Python ≥3.11 | `pyproject.toml` specifies minimum | 🟢 |
| Performance | Initialization completes within 10s (bundled assets, no downloads) | Bundled templates eliminate network overhead | 🟡 |
| Usability | Clear error messages for invalid agents, missing tools, directory conflicts | CLI prints available integrations, suggestions on flag parse errors | 🟢 |
| Safety | No prompts for already-valid config in non-interactive sessions | Defaults to Copilot if agent unresolved; `--force` skips prompts | 🟢 |
| Resilience | Graceful fallback if agent tool detection fails | `--ignore-agent-tools` allows override | 🟢 |

---

## Acceptance Criteria

```gherkin
Scenario: Initialize project in new directory with Claude integration
  Given user runs 'specify init my-project --integration claude'
  When scaffolding completes
  Then directory ./my-project/ is created with bundled templates
  And git repository is initialized
  And Claude integration is configured
  And command returns exit code 0

Scenario: Initialize in current directory with confirmation
  Given user runs 'specify init --here' in non-empty directory
  When user confirms the operation
  Then project is initialized in current directory
  And existing files are preserved
  And command returns exit code 0

Scenario: Initialize with preset
  Given user runs 'specify init --here --integration copilot --preset healthcare-compliance'
  When initialization completes
  Then preset healthcare-compliance is installed and applied
  And templates are composed with preset overrides
  And command returns exit code 0

Scenario: Skip git initialization
  Given user runs 'specify init my-project --integration claude --no-git'
  When initialization completes
  Then no .git/ directory is created
  And command returns exit code 0

Scenario: Invalid integration specified
  Given user runs 'specify init my-project --integration invalid-agent'
  When integration resolution fails
  Then error message lists available integrations
  And command returns exit code 1

Scenario: Force overwrite in current directory
  Given user runs 'specify init --here --force --integration claude'
  When directory is non-empty
  Then initialization proceeds without confirmation prompt
  And command returns exit code 0

Scenario: Directory creation with custom script type
  Given user runs 'specify init my-project --integration generic --script ps'
  When initialization completes
  Then scripts are generated as PowerShell (.ps1)
  And command returns exit code 0
```

---

## MoSCoW Priority

| Requirement | Priority | Justification |
|-----------|----------|---------------|
| Create project directory | Must | Foundational feature; core user need |
| Scaffold bundled templates | Must | Enables SDD workflow immediately post-init |
| Initialize git repository | Must | Standard practice for version control; expected by most workflows |
| Select AI agent integration | Must | Determines how project integrates with coding agents; critical to workflow |
| Override directory creation (--here) | Should | Common use case (initialize in existing repo); convenience feature |
| Install preset during init | Could | Enables customization but not blocking for basic workflow |
| Custom script type (--script) | Could | Advanced scenario; fallback to defaults acceptable |
| Branch numbering configuration | Could | Nice-to-have; both strategies work out-of-box |
| Skip TLS verification (deprecated) | Won't | Deprecated as of init(), never invoked |
| Offline mode (deprecated) | Won't | Deprecated; bundled assets now default |

---

## Traceability to Code

| File | Function / Class | Coverage | Confidence |
|------|------------------|----------|-----------|
| `src/specify_cli/__init__.py` | `def init(...)` (line 446) | Orchestration, argument parsing, integration resolution | 🟢 |
| `src/specify_cli/__init__.py` | `show_banner()` | Banner display | 🟢 |
| `src/specify_cli/integrations/__init__.py` | `INTEGRATION_REGISTRY`, `get_integration()` | Integration resolution | 🟢 |
| `src/specify_cli/__init__.py` | `AI_ASSISTANT_ALIASES` dict | Legacy --ai flag aliasing | 🟢 |
| `src/specify_cli/presets.py` (inferred) | `PresetManager.install()` | Preset installation during init | 🟡 |

---

## Open Questions 🔴

- **Preset installation error handling** — If preset install fails during init, does the project roll back or proceed partially?
- **Integration-specific initialization hooks** — Do integrations have their own init hooks (e.g., Claude registers agent skills)?
- **Branch numbering persistence** — Where is the chosen strategy persisted (project config file)?
- **Agent tools validation** — Which specific tools are checked and how (e.g., `git --version`, agent CLI paths)?
