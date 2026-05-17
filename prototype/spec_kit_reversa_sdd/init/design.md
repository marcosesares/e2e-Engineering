# init — Design Técnico

> **Unit**: init  
> **Type**: Feature  
> **Language**: English

---

## Interface

### Parameters

| Parameter | Type | Default | Required | Notes |
|-----------|------|---------|----------|-------|
| `project_name` | string | none | Conditional | Name of project directory; omitted with `--here` |
| `--here` | flag | False | No | Use current directory instead of creating new |
| `--force` | flag | False | No | Skip confirmation when merging into non-empty directory |
| `--integration` | string | None | No | AI agent ID (claude, copilot, cursor, etc.); preferred over `--ai` |
| `--ai` | string | None | No | Deprecated alias for `--integration` |
| `--ai-commands-dir` | string | None | No | Custom command directory for generic integration |
| `--integration-options` | string | None | No | Custom options for generic integration |
| `--preset` | string | None | No | Preset ID to install during initialization |
| `--script` | string | OS-default | No | Script type: `sh` or `ps` (PowerShell); defaults to OS-appropriate |
| `--no-git` | flag | False | No | Skip git repository initialization |
| `--ignore-agent-tools` | flag | False | No | Skip CLI tool validation for selected agent |
| `--branch-numbering` | string | sequential | No | Branch numbering strategy: `sequential` or `timestamp` |
| `--ai-skills` | list | [] | No | AI skills to register (requires `--integration` to be set) |

### Return Type

| Field | Type | Notes |
|-------|------|-------|
| Exit Code | int | 0 = success/cancelled, 1 = error |
| Output | stdout/stderr | User-facing messages, error details |
| Side Effects | filesystem | `.specify/` directory created, git initialized, workflows installed |

---

## Fluxo Principal

1. **Validation Phase** (`src/specify_cli/__init__.py:506–599`)
   - Verify mutual exclusivity: `--integration` XOR `--ai` (not both)
   - Verify `--ai-commands-dir` provided if integration is `generic`
   - Verify `--branch-numbering` is valid (`sequential` or `timestamp`)
   - Verify `--ai-skills` requires `--integration` to be set
   - 🟢 CONFIRMADO: Code validates all flags before proceeding

2. **Directory Resolution** (`src/specify_cli/__init__.py:600–642`)
   - If `--here`: use current working directory
   - Else: resolve `project_name` as relative or absolute path
   - Check if directory exists:
     - If exists and not `--here`: show conflict panel, require `--force` or user confirmation
     - If exists and `--here`: check if empty; if not, require `--force` or confirmation
     - If doesn't exist: mark for creation in orchestration step

3. **Integration Resolution** (`src/specify_cli/__init__.py:644–678`)
   - If `--integration` or `--ai` provided: resolve from INTEGRATION_REGISTRY
   - Else if interactive stdin: show menu of available agents, default to DEFAULT_INIT_INTEGRATION
   - Else: use DEFAULT_INIT_INTEGRATION
   - If integration not found: show available options, exit(1)
   - If integration == `generic`: verify `--ai-commands-dir` or `--integration-options` provided

4. **Tool Availability Check** (`src/specify_cli/__init__.py:680–732`)
   - If `--ignore-agent-tools`: skip
   - Else if integration.requires_cli: validate agent CLI installed (e.g., `claude --version`, `git`)
   - Show tool status in setup panel

5. **Script Type Selection** (`src/specify_cli/__init__.py:734–759`)
   - If `--script` provided: validate (sh or ps), use
   - Else if interactive stdin: show menu, default OS-appropriate (Windows → ps, Unix → sh)
   - Else: use OS default

6. **Setup Panel Display**
   - Display summary: Project path, Agent, Script type, Preset (if provided)
   - Allow user to review before orchestration starts

7. **Orchestration Phase** (`src/specify_cli/__init__.py:764–975`)
   - **Step 1: Integration Setup** → Load integration manifest, call `integration.setup()`, save metadata to `.specify/init-options.json`
   - **Step 2: Shared Infrastructure** → Call `_install_shared_infra_or_exit()`, ensures constitution template exists
   - **Step 3: Git Setup** (unless `--no-git`) → Check if repo exists, initialize if needed, install git extension
   - **Step 4: Workflow Installation** → Locate bundled `speckit` workflow, copy to `.specify/workflows/`, register in WorkflowRegistry
   - **Step 5: Fix Permissions** → Call `ensure_executable_scripts()` to chmod +x scripts on Unix
   - **Step 6: Persist Init Options** → Save selected agent, script, preset, branch numbering to `.specify/init-options.json`
   - **Step 7: Preset Installation** (if `--preset`) → Try local → bundled → catalog → remote download; warn on failure (non-fatal)

8. **Post-Init Messages** (`src/specify_cli/__init__.py:998–1089`)
   - Display security notice: agent folder should not be shared
   - Display deprecation warnings (e.g., `--ai` flag)
   - Display git extension default notice
   - Display next steps panel

9. **Success** → exit(0)

---

## Fluxos Alternativos

### Alt-1: Force Merge into Non-Empty Directory
- **Trigger**: `--here` + non-empty directory without `--force`
- **Behavior**: Prompt user for confirmation. If declined, exit(0) (success, no changes). If accepted or `--force` provided, skip merge confirmation.
- **Code**: `src/specify_cli/__init__.py:619–642`
- **Confidence**: 🟢 CONFIRMADO

### Alt-2: Interactive Agent Selection
- **Trigger**: No `--integration` or `--ai` provided, interactive stdin detected
- **Behavior**: Show menu of available agents, user selects, continue with selected
- **Code**: `src/specify_cli/__init__.py:666–671`
- **Confidence**: 🟡 INFERIDO (code suggests Rich prompt, but exact implementation unverified)

### Alt-3: Agent Tool Check Bypass
- **Trigger**: `--ignore-agent-tools` flag provided
- **Behavior**: Skip CLI validation for selected agent (e.g., skip Claude CLI check)
- **Code**: `src/specify_cli/__init__.py:690–698`
- **Confidence**: 🟢 CONFIRMADO

### Alt-4: Non-Interactive Mode (CI/CD)
- **Trigger**: No interactive stdin (piped input, GitHub Actions, etc.)
- **Behavior**: Use defaults: DEFAULT_INIT_INTEGRATION, OS-appropriate script, no prompts
- **Code**: `src/specify_cli/__init__.py:668–678`
- **Confidence**: 🟡 INFERIDO

### Alt-5: Preset Installation Failure
- **Trigger**: `--preset` provided, but preset not found locally, bundled, or in catalog
- **Behavior**: Warn user, continue without preset (non-fatal); project initializes normally
- **Code**: `src/specify_cli/__init__.py:929–975`
- **Confidence**: 🟢 CONFIRMADO

### Alt-6: Generic Integration with Custom Commands
- **Trigger**: `--integration generic --ai-commands-dir /path/to/commands`
- **Behavior**: Skip agent-specific validation, use custom command directory
- **Code**: `src/specify_cli/__init__.py:652–658`
- **Confidence**: 🟡 INFERIDO

### Error-1: Integration Not Found
- **Trigger**: Provided integration ID not in INTEGRATION_REGISTRY
- **Behavior**: Show list of available integrations, exit(1)
- **Code**: `src/specify_cli/__init__.py:676–678`
- **Confidence**: 🟢 CONFIRMADO

### Error-2: Agent CLI Not Installed
- **Trigger**: Integration requires_cli=True, but CLI not found
- **Behavior**: Show install panel (e.g., "Install Claude via `pipx install anthropic`"), exit(1)
- **Code**: `src/specify_cli/__init__.py:704–722`
- **Confidence**: 🟡 INFERIDO

### Error-3: Directory Conflict Without Force
- **Trigger**: Directory exists, not `--here`, no `--force`
- **Behavior**: Show conflict panel, user declines, exit(1)
- **Code**: `src/specify_cli/__init__.py:611–618`
- **Confidence**: 🟢 CONFIRMADO

### Error-4: Orchestration Exception
- **Trigger**: Exception raised during steps 1–7
- **Behavior**: Tracker.error(), show error panel, cleanup project path (if new dir created), exit(1)
- **Code**: `src/specify_cli/__init__.py:1024–1050`
- **Confidence**: 🟢 CONFIRMADO

---

## Dependências

| Componente | Motivo | Como Usa |
|-----------|--------|----------|
| **INTEGRATION_REGISTRY** | Resolve selected AI agent metadata | Lookup by key, validate requires_cli |
| **PresetManager** | Install preset if `--preset` provided | Call `install()` after orchestration; handle failures gracefully |
| **SharedInfra** | Install constitution, templates, scripts | Call `_install_shared_infra_or_exit()` in Step 2 |
| **WorkflowRegistry** | Register bundled `speckit` workflow | Call registry methods to persist workflow metadata |
| **StepTracker** | Display orchestration progress | Live UI with 8 fps refresh, error/success panels |
| **Git CLI** | Initialize repository (unless `--no-git`) | Subprocess call: `git init`, `git extension install` |
| **Agent CLI** (e.g., Claude, Copilot) | Validate tool availability | Subprocess call: `<agent> --version` or equivalent |

---

## Decisões de Design Identificadas

| Decisão | Evidência no Código | Confiança |
|---------|---------------------|-----------|
| Sequential step execution with live UI | `StepTracker` in `Live()` context, 8 refreshes/sec | 🟢 |
| Integration metadata in `.specify/init-options.json` | `save_init_options()` writes dict to JSON | 🟢 |
| Bundled templates default (no network on init) | `_install_shared_infra_or_exit()` copies from wheel | 🟢 |
| Preset installation is non-fatal | Error handler catches exception, warns, continues | 🟢 |
| Opt-in agent tool validation | `--ignore-agent-tools` flag bypasses check | 🟢 |
| Default integration fallback | DEFAULT_INIT_INTEGRATION used if no selection | 🟡 |
| Git extension auto-install | Step 3 calls `git extension install` if git successful | 🟡 |
| Branch numbering strategy persistence | Persisted in init.json for future branch commands | 🟡 |

---

## Estado Interno

### .specify/ Directory Structure

Post-initialization, the project directory contains:

```
project-dir/
├── .specify/
│   ├── init.json          # Persisted init options (agent, script, preset, branch_numbering)
│   ├── constitution.md    # Master spec (bundled template)
│   ├── workflows/
│   │   └── speckit/       # Bundled workflow for SDD
│   ├── presets/
│   │   └── .registry      # Registry of installed presets (if any)
│   ├── extensions/
│   │   └── .registry      # Registry of installed extensions (git by default)
│   ├── .cache/
│   │   └── catalog-metadata.json  # Cached catalog (if presets used)
│   └── auth.json          # (Optional) User-created auth config
├── .git/                  # Git repository (unless --no-git)
├── spec.md                # Bundled spec template (if bundled assets present)
├── checklist.md           # Bundled checklist template
├── tasks.md               # Bundled tasks template
└── <user files>           # Existing files (in --here case)
```

### Key State Fields in init.json

```json
{
  "ai": "claude",
  "integration": "claude",
  "script": "sh",
  "preset": "healthcare-compliance",
  "branch_numbering": "sequential",
  "initialized_at": "2026-05-16T10:30:00Z",
  "speckit_version": "1.0.0",
  "python_version": "3.11.5"
}
```

---

## Observabilidade

### Logs Emitted

| Event | Level | Message |
|-------|-------|---------|
| Validation start | INFO | "Validating arguments..." |
| Directory created | INFO | "Creating project directory: {path}" |
| Integration resolved | INFO | "Using integration: {integration_id}" |
| Tool check passed | INFO | "Agent CLI found: {path}" |
| Tool check failed | ERROR | "Agent CLI not found. Install via {install_cmd}" |
| Step 1 complete | INFO | "Integration setup complete" |
| Step 2 complete | INFO | "Shared infrastructure installed" |
| Step 3 complete | INFO | "Git repository initialized" |
| Step 4 complete | INFO | "Workflow installed" |
| Step 7 (preset) failed | WARNING | "Preset {id} not found. Project initialized without preset" |
| Final success | INFO | "Project ready at {path}" |

### Metrics

- `init_duration_seconds` — Total time from start to completion (tracked by StepTracker)
- `step_durations` — Per-step breakdown (e.g., git_init_ms, workflow_install_ms)

---

## Riscos e Lacunas

- 🔴 **Preset rollback behavior** — If preset installation fails after orchestration steps complete, does the project remain in valid state? Needs clarification.
- 🔴 **Integration-specific hooks** — Do integrations (e.g., Claude) have setup hooks beyond manifest.save()? Not documented.
- 🟡 **Branch numbering strategy application** — Where is strategy actually used (branch command implementation)? init.json only persists the choice.
- 🟡 **Agent tool detection specifics** — Which exact tools are checked per agent? (e.g., Claude = `anthropic-cli`? `claude`?) Needs documentation.
- 🟡 **Non-interactive stdin detection** — Exact mechanism to detect interactive vs. non-interactive (tty check? env var?)? Inferred from code pattern.
- 🟡 **Custom integration commands directory** — Does `--ai-commands-dir` validation check if directory exists and is readable?
