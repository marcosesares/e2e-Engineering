# shared_infra — Design Técnico

> **Unit**: shared_infra  
> **Type**: Feature  
> **Language**: English

---

## Interface

### SharedInfraManager (Orchestrator)

| Method | Signature | Returns | Notes |
|--------|-----------|---------|-------|
| `install_defaults()` | project_path: str, force: bool | list[Path] | Install bundled templates |
| `install_file()` | src: Path, dst: Path, force: bool | Path or None | Copy with conflict handling |
| `load_manifest()` | — | dict | Load manifest with fallbacks |
| `validate_path()` | path: str | bool | Check for traversal/escape |

### Path Safety

| Method | Signature | Notes |
|--------|-----------|-------|
| `is_safe_path()` | path: str | Reject `../`, `~`, absolute paths outside project |
| `resolve_safe()` | path: str | Normalize and validate path |
| `prevent_symlink_follow()` | path: Path | Use `follow_symlinks=False` in all ops |

---

## Core Workflow

1. **Validate Destination** (`src/specify_cli/shared_infra.py:100–200`)
   - Check project_path exists and is writable
   - Create .specify/ directory (safe, non-following)
   - Verify .specify not a symlink
   - 🟢 CONFIRMADO

2. **Load Manifest** (`shared_infra.py:200–300`)
   - Try core_pack/manifest.yaml
   - Fallback to repo root/manifest.yaml
   - Fallback to builtin defaults
   - Return manifest dict (templates, scripts list)
   - 🟡 INFERIDO

3. **Iterate Files** (`shared_infra.py:300–400`)
   - For each template/script in manifest:
     - Validate path (no traversal)
     - Copy from source to .specify/
     - Check for conflict; prompt or `--force`
     - Set executable bit (Unix only)
   - 🟢 CONFIRMADO

4. **Handle Conflicts** (`shared_infra.py:400–500`)
   - If dst exists:
     - If `--force`: overwrite
     - Else: prompt user (y/n)
     - If 'n': skip file
   - Log decision
   - 🟡 INFERIDO

5. **Finalize** (`shared_infra.py:500–550`)
   - Log all operations
   - Return list of installed paths
   - If any failed: warn; don't fail whole operation
   - 🟡 INFERIDO

---

## Path Validation Rules

| Rule | Accept | Reject |
|------|--------|--------|
| Traversal | `templates/spec.md` | `../../../etc/passwd` |
| Absolute | — | `/etc/passwd`, `C:\\Windows\\` |
| Home | — | `~/credentials.txt` |
| Symlink | `file` (real file) | `link` (symlink to file) |
| Dotfiles | `.specify/` | `..`, `.`, `/` |

---

## Manifest Schema

```yaml
version: "1.0"
templates:
  - name: "constitution"
    source: "templates/constitution.md"
    dest: ".specify/constitution.md"
    required: true
  - name: "spec"
    source: "templates/spec.md"
    dest: ".specify/spec.md"
    required: true
scripts:
  - name: "install.sh"
    source: "scripts/install.sh"
    dest: ".specify/scripts/install.sh"
    executable: true
```

---

## Error Handling

- **Path traversal detected**: Error, abort
- **Permission denied**: Log warning, skip file
- **Manifest not found**: Use builtin defaults
- **Conflict + no --force**: Prompt user; skip if declined
- **Symlink detected**: Skip with warning (don't follow)

---

## Diagram: Installation Flow

```
[install_defaults(project_path, force)]
    ↓
[Validate project_path]
    ↓
[Create .specify/ directory]
    ↓
[Load manifest (with fallbacks)]
    ↓
[Iterate files]
    ├─ Validate path
    ├─ Check conflict
    ├─ Copy file
    ├─ Set executable (Unix)
    └─ Log operation
    ↓
[Return list of installed paths]
```

---

## Bundled Assets Locator (Dual-Mode Resolution)

**Source**: `src/specify_cli/_assets.py:13–101` (source of truth).

Specify CLI supports **two installation modes** with different asset locations:

### Mode 1: Wheel Install (Production)

When installed via `pip install specify-cli`, assets bundled by hatchling `force-include`:
```
specify_cli/
  core_pack/
    extensions/
    workflows/
    presets/
  templates/
  scripts/
```

**Locator**: `_locate_core_pack()` (`_assets.py:13–27`) returns `Path(__file__).parent / "core_pack"`.

### Mode 2: Source Checkout / Editable Install (Development)

When installed via `pip install -e .` or cloned from repo:
```
<repo_root>/
  extensions/
  workflows/
  presets/
  templates/
  scripts/
  src/specify_cli/
    _assets.py
```

**Locator**: `_locate_core_pack()` returns `None`. Helpers fall back to `_repo_root() / <type> / <id>` (lines 35, 58, 81).

### Asset Lookup Helpers

| Helper | Wheel Path | Source Path | Returns |
|--------|-----------|-------------|---------|
| `_locate_bundled_extension(ext_id)` (line 35) | `core_pack/extensions/<ext_id>/` | `<repo_root>/extensions/<ext_id>/` | `Path` or `None` |
| `_locate_bundled_workflow(wf_id)` (line 58) | `core_pack/workflows/<wf_id>/` | `<repo_root>/workflows/<wf_id>/` | `Path` or `None` |
| `_locate_bundled_preset(preset_id)` (line 81) | `core_pack/presets/<preset_id>/` | `<repo_root>/presets/<preset_id>/` | `Path` or `None` |

Each validates **marker file** (`extension.yml`, `workflow.yml`, `preset.yml`) before returning.

### Version Resolution

**Function**: `get_speckit_version()` (`_assets.py:104–110`)
- Tries `importlib.metadata.version('specify-cli')` (wheel install)
- Falls back to parsing `pyproject.toml` (source checkout)

---
