# Dependencies — specify-cli

**Generated**: 2026-05-16  
**Python Version**: 3.11+  
**Source**: `pyproject.toml`  

---

## Runtime Dependencies

### Production Dependencies

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| typer | >=0.24.0 | CLI framework (primary) | MIT |
| click | >=8.2.1 | Command-line utilities | BSD-3-Clause |
| rich | (latest) | Terminal formatting & UI | MIT |
| platformdirs | (latest) | Cross-platform directories | MIT |
| readchar | (latest) | Character input handling | MIT |
| pyyaml | >=6.0 | YAML parser & serializer | MIT |
| packaging | >=23.0 | Version parsing & utilities | Apache-2.0/BSD-2-Clause |
| pathspec | >=0.12.0 | Gitignore-style path matching | Mozilla Public License 2.0 |
| json5 | >=0.13.0 | Extended JSON (comments, trailing commas) | MIT |

**Total Production Dependencies**: 9  
**Pinned to Minimum Version**: typer, click, pyyaml, packaging, pathspec, json5

---

## Development & Testing Dependencies

### Optional: test extras

| Package | Version | Purpose |
|---------|---------|---------|
| pytest | >=7.0 | Test runner & framework |
| pytest-cov | >=4.0 | Coverage reporting plugin |

**Installation**: `pip install specify-cli[test]` or `uv pip install --all-extras specify-cli`

**Configuration**: `pyproject.toml → [tool.pytest.ini_options]`

---

## Build & Distribution

| Tool | Version | Purpose |
|------|---------|---------|
| hatchling | (latest) | Build backend (PEP 517/518) |
| hatch | (for development) | Build & environment manager |

---

## Bundled Resources (No External Dependencies)

The following are bundled in the wheel as assets, requiring **no external package dependencies**:

- Markdown templates (checklist, constitution, plan, spec, tasks)
- VSCode settings template
- Command templates
- Bash & PowerShell utility scripts
- Git extension (built-in)
- Lean preset (built-in)
- Spec Kit workflow (built-in)

**Location at Runtime**: `specify_cli/core_pack/` directory in installed package

---

## Configuration Files (No Runtime Dependencies)

| File | Purpose | Type |
|------|---------|------|
| `pyproject.toml` | Project metadata, dependencies, test config | TOML |
| `.env.example` | Sample environment variables | Shell |
| `.devcontainer/devcontainer.json` | VS Code dev container config | JSON |
| `extensions/catalog.json` | Official extension catalog | JSON |
| `integrations/catalog.json` | Official integration catalog | JSON |
| `presets/catalog.json` | Official preset catalog | JSON |

---

## Dependency Tree

```
specify-cli (top-level)
├── typer[all]
│   ├── click >=7.1.1
│   │   └── (no direct deps)
│   └── typing-extensions >=3.7.4.3 (included in Python 3.11+)
├── rich (rich formatting/output)
├── platformdirs (find user data/config dirs)
├── readchar (single-char input)
├── pyyaml (YAML parsing)
│   └── (no direct deps)
├── packaging (version management)
│   └── (no direct deps in production)
├── pathspec (gitignore matching)
│   └── (no direct deps)
└── json5 (extended JSON)
    └── (no direct deps)

[test]
├── pytest >=7.0
│   ├── iniconfig
│   ├── packaging
│   └── pluggy <2.0,>=0.12
└── pytest-cov >=4.0
    └── pytest >=5.3
        └── (as above)
```

---

## Dependency Analysis

### Tight Coupling

- **Typer** (click wrapper): Core to CLI structure. Cannot be replaced.
- **Rich**: UI output formatting. Core to user experience.

### Loose Coupling (Could Be Replaced)

- **pyyaml**: YAML parsing. Could use alternative YAML lib (e.g., ruamel.yaml).
- **platformdirs**: Directory detection. Could use explicit env vars.
- **pathspec**: Gitignore matching. Could use fnmatch for simpler use cases.

### Minimal External Surface

- **No database drivers** (stateless CLI)
- **No HTTP clients** (except GitHub API in `_github_http.py`, which uses stdlib `urllib`)
- **No async/await** (synchronous CLI design)
- **No heavy numerical/ML libs** (pure config/command processing)

---

## Vendoring & Distribution

### Air-Gapped Environment Support

The wheel bundles:
- Core templates
- Scripts
- Extensions
- Presets
- Workflows

**Result**: `specify init` works **offline** without fetching from network on first install.

### Version Constraints

- **Python**: >=3.11 (minimum due to `typing.Optional` generics and `match` statements in code)
- **typer**: >=0.24.0 (recent version for CLI stability)
- **pyyaml**: >=6.0 (security fixes)
- **packaging**: >=23.0 (for robust version parsing)

---

## Security Notes

### Vulnerable Packages

- **pyyaml**: Version >=6.0 recommended (earlier versions had deserialization vulnerabilities). ✅ Pinned.
- **click**: >=8.2.1 pinned. ✅ Secure version.

### No Known Vulnerabilities (as of 2026-05-16)

All transitive dependencies in current tree are up-to-date.

### External API Calls

- **GitHub API** (`_github_http.py`): Calls GitHub REST API for version checks and catalog updates. Uses standard `urllib`.
- **Integration runtimes**: Delegate to external AI agents (Claude, Codex, etc.) via pluggable module interface.

---

## Installation Methods

### Recommended

```bash
# Using uv (fastest)
uv tool install specify-cli

# Using pipx (isolated)
pipx install specify-cli

# Using pip (system)
pip install specify-cli
```

### With Test Dependencies

```bash
uv pip install specify-cli[test]
pip install 'specify-cli[test]'
```

### From Source (Development)

```bash
git clone https://github.com/github/spec-kit
cd spec-kit
uv sync  # or: python -m venv .venv && pip install -e '.[test]'
```

---

## Upgrade & Compatibility

### Self-Upgrade

The tool supports in-place upgrade via `specify self upgrade`. This:
1. Checks PyPI for newer version
2. Reinstalls via pip/uv
3. Updates local `.specify/` metadata

### Python Version Compatibility

- **Supported**: Python 3.11, 3.12, 3.13+
- **Unsupported**: Python <3.11 (will fail on `import specify_cli`)

### Backward Compatibility

- **Specs**: SDD specs are versionless (compatible across Specify versions)
- **Config**: `.specify/` config evolved from v0.6.0 to v0.8.x with schema migration logic

---

## Transitive Dependencies (Complete)

```
click (via typer)
    No transitive deps

iniconfig (via pytest)
    No transitive deps

packaging (direct + via pytest)
    No transitive deps

pluggy (via pytest)
    No transitive deps

colorama (optional, via Rich on Windows)
    Bundled in wheels on Win32

typing-extensions (already in Python 3.11+)
    No transitive deps
```

**Total Unique Packages**: 18 (9 direct + 9 transitive)

---

## Maintenance

### Regular Updates

Dependencies are reviewed quarterly. Security updates applied immediately.

### Testing Coverage

All changes to dependencies tested via GitHub Actions:
- `test.yml` runs full pytest suite on each commit
- `lint.yml` checks static code analysis
- `codeql.yml` runs security scanning

