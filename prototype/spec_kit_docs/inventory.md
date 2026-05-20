# Project Inventory — specify-cli

**Project**: spec-kit  
**Generated**: 2026-05-16  
**CLI Name**: `specify`  
**Primary Language**: Python 3.11+  
**Framework**: Typer (CLI Framework)  
**Build System**: Hatchling  

---

## Directory Structure

```
spec-kit/
├── src/specify_cli/          # Main application source (139 Python files)
│   ├── __init__.py           # Main entry point, CLI app definition
│   ├── agents.py             # Agent management logic
│   ├── authentication/       # Authentication subsystem
│   ├── catalogs.py           # Catalog management
│   ├── extensions.py         # Extension system (116KB module)
│   ├── integration_runtime.py # Integration execution runtime
│   ├── integration_state.py   # Integration state management
│   ├── integrations/         # 30+ integrations (AGY, AMP, Claude, Codex, Copilot, Cursor, Devin, etc.)
│   ├── presets.py            # Preset management (128KB module)
│   ├── shared_infra.py       # Shared infrastructure utilities
│   ├── workflows/            # Workflow system
│   │   └── steps/            # Workflow step definitions
│   ├── _assets.py            # Asset location and bundling
│   ├── _console.py           # Rich console UI utilities
│   ├── _github_http.py       # GitHub API HTTP client
│   ├── _utils.py             # General utilities
│   └── _version.py           # Version management and self-upgrade
│
├── tests/                    # Test suite (63 test files)
│   ├── extensions/           # Extension system tests
│   ├── hooks/                # Hook system tests
│   ├── integrations/         # Integration tests
│   └── test_*.py             # Individual test modules
│
├── templates/                # Built-in templates (bundled in wheel)
│   ├── checklist-template.md
│   ├── constitution-template.md
│   ├── plan-template.md
│   ├── spec-template.md
│   ├── tasks-template.md
│   ├── commands/             # Command templates
│   └── vscode-settings.json
│
├── extensions/               # Extension system documentation and templates
│   ├── catalog.json          # Official extension catalog
│   ├── catalog.community.json # Community extensions catalog
│   ├── EXTENSION-API-REFERENCE.md
│   ├── EXTENSION-DEVELOPMENT-GUIDE.md
│   ├── EXTENSION-PUBLISHING-GUIDE.md
│   ├── git/                  # Built-in Git extension
│   └── template/             # Extension template
│
├── integrations/             # Integration system documentation
│   ├── catalog.json          # Official integration catalog
│   ├── catalog.community.json # Community integration catalog
│   └── README.md             # Integration guidelines
│
├── presets/                  # Preset system
│   ├── catalog.json          # Official presets catalog
│   ├── catalog.community.json # Community presets catalog
│   ├── lean/                 # Built-in "Lean" preset
│   └── PUBLISHING.md         # Publishing guide
│
├── workflows/                # Built-in workflows
│   └── speckit/              # Default Spec Kit workflow
│
├── scripts/                  # Helper scripts
│   ├── bash/                 # Bash utility scripts
│   └── powershell/           # PowerShell utility scripts
│
├── docs/                     # Documentation (113 files total)
│   ├── concepts/             # SDD concepts
│   ├── install/              # Installation guides
│   ├── reference/            # API reference
│   ├── community/            # Community extensions/presets
│   ├── docfx.json            # DocFx configuration
│   └── README.md
│
├── .github/                  # GitHub configuration
│   ├── workflows/            # CI/CD pipelines (8 workflows)
│   └── ISSUE_TEMPLATE/       # Issue templates
│
├── .devcontainer/            # Dev container configuration
├── pyproject.toml            # Python project metadata and dependencies
├── CONTRIBUTING.md           # Contribution guidelines
├── DEVELOPMENT.md            # Developer documentation
├── CODE_OF_CONDUCT.md        # Community code of conduct
└── CHANGELOG.md              # Release notes
```

---

## Languages & File Distribution

| Language | File Count | Purpose |
|----------|-----------|---------|
| Python | 139 | Application code |
| Markdown | 50+ | Documentation |
| JSON | 20+ | Configuration, catalogs |
| YAML | 20+ | CI/CD, configuration |
| Other | 13 | Misc config |

**Total**: 312+ files (excluding .git, node_modules, .reversa, _reversa_sdd)

---

## Frameworks & Dependencies

### Runtime Dependencies

| Dependency | Version | Purpose |
|-----------|---------|---------|
| typer | >=0.24.0 | CLI framework (main) |
| click | >=8.2.1 | Command-line library |
| rich | (latest) | Terminal formatting & UI |
| platformdirs | (latest) | Cross-platform directory detection |
| readchar | (latest) | Character input handling |
| pyyaml | >=6.0 | YAML parsing |
| packaging | >=23.0 | Version parsing |
| pathspec | >=0.12.0 | Path matching (gitignore-style) |
| json5 | >=0.13.0 | Extended JSON parsing |

### Development & Testing

| Dependency | Purpose |
|-----------|---------|
| pytest >=7.0 | Test framework |
| pytest-cov >=4.0 | Coverage reporting |
| hatchling | Build backend |

---

## Entry Points

| Path | Type | Description |
|------|------|-------------|
| `src/specify_cli/__init__.py:main()` | CLI entry | Typer app bootstrap and main command dispatcher |
| `src/specify_cli/__init__.py:app` | CLI app | Typer instance with all commands registered |
| `pyproject.toml:[project.scripts]` | Script | `specify = "specify_cli:main"` (registered as console script) |

**Invocation**: `specify <command> [options]`

---

## Configuration & CI/CD

### Environment Configuration

- `.env.example` — Sample environment variables
- `.devcontainer/devcontainer.json` — Dev container definition

### GitHub Workflows

| Workflow | Purpose | Trigger |
|----------|---------|---------|
| `test.yml` | Run pytest suite | Push, PR |
| `lint.yml` | Static analysis | Push, PR |
| `codeql.yml` | Security scanning | On schedule |
| `docs.yml` | Build documentation | Push to main |
| `release.yml` | Create release | Manual dispatch |
| `release-trigger.yml` | Auto-release setup | On push to main |
| `catalog-assign.yml` | Auto-assign PRs | PR opened |
| `stale.yml` | Close stale issues | On schedule |

---

## Testing

| Metric | Value |
|--------|-------|
| Test Framework | pytest |
| Test Count | 63 test files |
| Configuration | `pyproject.toml` `[tool.pytest.ini_options]` |
| Coverage | Reported via pytest-cov |
| Test Markers | Strict marker enforcement |
| Report Format | Short traceback mode |

**Entry**: `pytest tests/` (from repo root)

---

## Bundled Assets

The wheel distribution bundles the following as fallback assets (air-gapped environments):

- Core pack templates (markdown templates for specs)
- Command templates
- Bash & PowerShell utility scripts
- Git extension (built-in)
- Lean preset (built-in)
- Spec Kit workflow (built-in)

These are located in `specify_cli/core_pack/` at runtime.

---

## Package Distribution

- **PyPI Package**: `specify-cli`
- **Console Script**: `specify` (registered in `pyproject.toml`)
- **Version**: `0.8.12.dev0`
- **Python Requirement**: >=3.11
- **Build**: `uv tool install specify-cli` or `pipx install specify-cli`

---

## Database

**Status**: None. This is a stateless CLI tool with no persistent storage, database, or ORM.

Integration and extension state is stored in local JSON files (e.g., `integration.json`).

---

## External Integrations

The `integrations/` subsystem supports 30+ agent/IDE integrations:

- **AI Agents**: Claude, Codex, Cursor Agent, Devin, Copilot, Gemini, Goose, Kimi, OpenCode, Tabnine, Qwen, Roo, etc.
- **Editors**: VSCode (Windsurf), Cursor IDE, Kiro CLI, Qodercli, etc.
- **Generic**: Generic integration adapter for custom tools

Each integration is a separate module with custom runtime handlers.

---

## Key Characteristics

✅ **Monolithic CLI** — Single Typer app with all commands  
✅ **Command-oriented** — Organized by top-level commands (init, extension, integration, preset, workflow, agent, version)  
✅ **Plugin architecture** — Extensions and integrations loaded dynamically  
✅ **Bundled assets** — Works offline with built-in templates and extensions  
✅ **Multi-platform** — Cross-platform shell scripts (Bash, PowerShell)  
✅ **Spec-driven** — Designed to support Spec-Driven Development (SDD) workflows  

