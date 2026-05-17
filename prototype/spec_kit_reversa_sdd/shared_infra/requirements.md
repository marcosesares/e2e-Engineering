# shared_infra — Shared Infrastructure Installation

> **Unit**: shared_infra  
> **Type**: Feature  
> **Language**: English

---

## Overview

The `shared_infra` module handles safe installation of bundled templates, scripts, and shared files across the Specify ecosystem. It provides path safety (preventing symlink traversal and path escapes), loads manifests with fallbacks, resolves sources (bundled core_pack vs repo root), and manages template/script copying with merge conflict handling.

---

## Responsibilities

- Validate file paths to prevent symlink traversal and escape attempts
- Load shared IntegrationManifest with fallback mechanisms
- Resolve source locations (bundled core_pack vs repo root)
- Copy templates and scripts safely with conflict detection
- Set executable bits on Unix systems
- Create directories safely without following symlinks

---

## Business Rules

- **Path safety** — All operations validate paths; symlink traversal rejected. 🟢
- **Bundled assets default** — All scaffolding prefers bundled templates (no network required). 🟢
- **Manifest fallbacks** — Try manifest locations in order: core_pack, repo root, builtin defaults. 🟡
- **Merge conflicts** — On file exist: prompt user or use `--force` to overwrite. 🟡
- **Executable bit** — Unix systems: chmod +x on copied scripts; Windows: skip. 🟢

---

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criterion |
|----|-----------|----------|-------------------|
| RF-01 | System copies bundled templates to project | Must | Constitution, spec, checklist, tasks templates installed |
| RF-02 | System sets executable bit on scripts (Unix) | Should | `chmod +x` applied to `*.sh` files; no-op on Windows |
| RF-03 | System creates .specify directory safely | Must | Created without following symlinks; safe parent creation |
| RF-04 | System detects and handles file conflicts | Should | If file exists: prompt user or require `--force` to overwrite |
| RF-05 | System validates paths (prevent traversal) | Must | Reject paths like `../../../etc/passwd`, `~/.ssh/`; allow safe paths |
| RF-06 | System loads manifest with fallbacks | Should | Try core_pack, then repo root, then builtin defaults |
| RF-07 | System resolves source (bundled vs repo) | Should | Bundled core_pack preferred; fallback to source repo if available |
| RF-08 | System preserves file permissions | Could | Copy preserves umask and executable bits from source |
| RF-09 | System logs all file operations | Should | Log copy, skip, overwrite, error; useful for debugging |
| RF-10 | System supports dry-run mode | Could | `--dry-run` shows what would be installed without modifying |

---

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-----------|----------|-----------|
| Security | Symlink traversal prevented | Path validation in code | 🟢 |
| Safety | No partial installations | Atomic operation or rollback | 🟡 |
| Performance | Installation <2s (bundled, no network) | No I/O overhead | 🟢 |
| Debuggability | Detailed logs for each file operation | Logging at debug level | 🟡 |

---

## Acceptance Criteria

```gherkin
Scenario: Install bundled templates safely
  Given bundled core_pack with templates
  When initialization runs
  Then constitution.md, spec.md, checklist.md copied to .specify/
  And all files readable/writable
  And execution succeeds without errors

Scenario: Detect and handle file conflict
  Given file already exists at .specify/constitution.md
  When installation attempts to copy template
  Then user prompted: "File exists. Overwrite? (y/n)"
  And if 'n': skipped; if 'y' or `--force`: overwritten

Scenario: Reject path traversal
  Given path `../../../etc/passwd` in manifest
  When validation runs
  Then error: "Path traversal detected"
  And installation aborted

Scenario: Set executable bit on Unix
  Given script file `setup.sh` in bundled templates
  When copied to Unix system
  Then `chmod +x` applied
  And script executable

Scenario: Fallback manifest resolution
  Given no manifest in core_pack
  When manifest requested
  Then repo root checked
  Then builtin defaults loaded
```

---

## Scope & Scale

- **Bundled templates**: 5–10 files (constitution, spec, checklist, tasks, etc.)
- **Scripts**: 5–10 shell/PowerShell scripts
- **Installation time**: <2 seconds (no network)
- **Conflict frequency**: Low (first install mostly)
