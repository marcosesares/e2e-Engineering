# shared_infra — Tarefas de Implementação

> **Unit**: shared_infra  
> **Language**: English

---

## Pré-requisitos

- [ ] pathlib (stdlib) for safe path handling
- [ ] Builtin manifests (templates, scripts in core_pack)
- [ ] File I/O utilities (atomic copy, permission handling)

---

## Phase 1: Path Safety

- [ ] T-01: Implement is_safe_path() validation
  - Origin: `src/specify_cli/shared_infra.py:1–100`
  - Criteria: Reject `../`, `~`, absolute paths, symlinks; allow relative safe paths
  - Confidence: 🟢

- [ ] T-02: Implement resolve_safe() normalization
  - Origin: `src/specify_cli/shared_infra.py:100–150`
  - Criteria: Normalize path; validate against traversal; return safe path or error
  - Confidence: 🟢

- [ ] T-03: Implement symlink detection
  - Origin: `src/specify_cli/shared_infra.py:150–200`
  - Criteria: Check if path is symlink; reject or warn; use `follow_symlinks=False`
  - Confidence: 🟢

---

## Phase 2: Manifest Loading

- [ ] T-04: Implement manifest loading with fallbacks
  - Origin: `src/specify_cli/shared_infra.py:200–300`
  - Criteria: Try core_pack/manifest.yaml → repo root/manifest.yaml → builtin defaults
  - Confidence: 🟡

- [ ] T-05: Implement manifest schema validation
  - Origin: `src/specify_cli/shared_infra.py:300–350`
  - Criteria: Validate YAML schema; required fields; return dict
  - Confidence: 🟡

---

## Phase 3: File Operations

- [ ] T-06: Implement safe directory creation
  - Origin: `src/specify_cli/shared_infra.py:350–400`
  - Criteria: Create .specify/; verify not symlink; parents created safely
  - Confidence: 🟢

- [ ] T-07: Implement file copy with conflict detection
  - Origin: `src/specify_cli/shared_infra.py:400–500`
  - Criteria: Copy source → dest; if dest exists: prompt or require `--force`
  - Confidence: 🟡

- [ ] T-08: Implement executable bit setting
  - Origin: `src/specify_cli/shared_infra.py:500–550`
  - Criteria: Unix only: `chmod +x` on scripts; Windows: skip gracefully
  - Confidence: 🟢

---

## Phase 4: Orchestration & Error Handling

- [ ] T-09: Implement SharedInfraManager orchestrator
  - Origin: `src/specify_cli/shared_infra.py:550–700`
  - Criteria: install_defaults(), load_manifest(), install_file() orchestration
  - Confidence: 🟡

- [ ] T-10: Implement conflict handling (prompt or force)
  - Origin: `src/specify_cli/shared_infra.py:700–800`
  - Criteria: If file exists and not `--force`: prompt user; respect answer
  - Confidence: 🟡

- [ ] T-11: Implement comprehensive logging
  - Origin: `src/specify_cli/shared_infra.py:800–850`
  - Criteria: Log all file operations (copy, skip, overwrite, error)
  - Confidence: 🟡

---

## Phase 5: Integration & Testing

- [ ] T-12: Integrate into init command
  - Origin: `src/specify_cli/__init__.py:init_command()`
  - Criteria: Call `shared_infra.install_defaults()` during initialization
  - Confidence: 🟡

- [ ] T-13: Implement dry-run mode
  - Origin: `src/specify_cli/shared_infra.py:850–900`
  - Criteria: `--dry-run` shows what would be installed without modifying filesystem
  - Confidence: 🟡
