# init — Tarefas de Implementação

> **Unit**: init  
> **Language**: English

---

## Pré-requisitos

- [ ] INTEGRATION_REGISTRY fully populated with agent metadata (claude, copilot, cursor, etc.)
- [ ] PresetManager implementation complete with install(), resolve(), and error handling
- [ ] SharedInfra module provides `_install_shared_infra_or_exit()` function
- [ ] WorkflowRegistry supports register() and persist() methods
- [ ] StepTracker UI component renders Live() panels with 8 fps refresh
- [ ] Environment: Python ≥3.11, git CLI (optional), agent CLI as needed (optional with --ignore-agent-tools)

---

## Tarefas de Implementação

### Phase 1: Argument Validation

- [ ] T-01: Implement argument parser for init command
  - Origin: `src/specify_cli/__init__.py:446–510`
  - Criteria: `--integration` and `--ai` are mutually exclusive; `--ai-commands-dir` requires generic; `--ai-skills` requires `--integration`
  - Confidence: 🟢

- [ ] T-02: Validate branch numbering strategy
  - Origin: `src/specify_cli/__init__.py:500–510`
  - Criteria: Accepts only `sequential` or `timestamp`; raises error for invalid values
  - Confidence: 🟢

- [ ] T-03: Handle deprecated --ai flag aliasing
  - Origin: `src/specify_cli/__init__.py:470–480`
  - Criteria: `--ai <agent>` maps to `--integration` via AI_ASSISTANT_ALIASES; show deprecation warning
  - Confidence: 🟢

### Phase 2: Directory Resolution & Creation

- [ ] T-04: Resolve project directory path
  - Origin: `src/specify_cli/__init__.py:600–610`
  - Criteria: `--here` uses CWD; else use project_name as relative/absolute path
  - Confidence: 🟢

- [ ] T-05: Check for directory conflicts
  - Origin: `src/specify_cli/__init__.py:611–625`
  - Criteria: If directory exists (and not `--here`): show conflict panel; require `--force` or user confirmation; if user declines, exit(0) gracefully
  - Confidence: 🟢

- [ ] T-06: Handle non-empty directory in --here mode
  - Origin: `src/specify_cli/__init__.py:628–642`
  - Criteria: Detect non-empty directory; prompt user or require `--force` to confirm merge
  - Confidence: 🟢

### Phase 3: Integration Resolution

- [ ] T-07: Resolve integration from --integration or --ai flag
  - Origin: `src/specify_cli/__init__.py:644–662`
  - Criteria: Look up in INTEGRATION_REGISTRY; exit(1) if not found; show list of available agents
  - Confidence: 🟢

- [ ] T-08: Interactive integration selection (if no flag provided)
  - Origin: `src/specify_cli/__init__.py:664–671`
  - Criteria: Detect interactive stdin; show Rich menu of agents; use DEFAULT_INIT_INTEGRATION as default; in non-interactive mode, use default without prompting
  - Confidence: 🟡

- [ ] T-09: Validate generic integration requirements
  - Origin: `src/specify_cli/__init__.py:652–658`
  - Criteria: If integration is `generic`, require either `--ai-commands-dir` or `--integration-options`; exit(1) if missing
  - Confidence: 🟡

### Phase 4: Tool Availability Check

- [ ] T-10: Implement `--ignore-agent-tools` bypass
  - Origin: `src/specify_cli/__init__.py:690–698`
  - Criteria: If flag set, skip all tool validation; otherwise proceed to next step
  - Confidence: 🟢

- [ ] T-11: Check for agent CLI if integration.requires_cli
  - Origin: `src/specify_cli/__init__.py:700–722`
  - Criteria: Call `check_tool()` (which, where) to validate agent CLI; if not found and not `--ignore-agent-tools`, show install panel with install command, exit(1)
  - Confidence: 🟡

### Phase 5: Script Type Selection

- [ ] T-12: Resolve script type from --script flag or defaults
  - Origin: `src/specify_cli/__init__.py:734–759`
  - Criteria: If `--script` provided, validate (sh or ps); else if interactive, show menu with OS-default; else use OS-default
  - Confidence: 🟢

- [ ] T-13: Validate script type value
  - Origin: `src/specify_cli/__init__.py:745–755`
  - Criteria: Only `sh` or `ps` allowed; exit(1) for invalid values
  - Confidence: 🟢

### Phase 6: Setup Panel & User Confirmation

- [ ] T-14: Display setup summary panel
  - Origin: `src/specify_cli/__init__.py:762–763`
  - Criteria: Show project path, AI agent, script type, preset (if provided), branch numbering strategy in Rich panel format
  - Confidence: 🟡

### Phase 7: Orchestration

- [ ] T-15: Initialize StepTracker and begin orchestration
  - Origin: `src/specify_cli/__init__.py:764–790`
  - Criteria: Create StepTracker instance, enter `Live()` context, set up error handling for all steps
  - Confidence: 🟢

- [ ] T-16: Step 1 — Integration Setup
  - Origin: `src/specify_cli/__init__.py:791–820`
  - Criteria: Load IntegrationManifest, call `integration.setup()`, save metadata to `.specify/init-options.json`, update tracker status
  - Confidence: 🟡

- [ ] T-17: Step 2 — Shared Infrastructure Installation
  - Origin: `src/specify_cli/__init__.py:822–835`
  - Criteria: Call `_install_shared_infra_or_exit()`, ensure constitution.md exists in `.specify/`, handle errors gracefully
  - Confidence: 🟢

- [ ] T-18: Step 3 — Git Repository Initialization
  - Origin: `src/specify_cli/__init__.py:837–887`
  - Criteria: Unless `--no-git`, check for existing `.git/`; if missing, call `git init`; install git extension; handle git not found (warn, continue)
  - Confidence: 🟢

- [ ] T-19: Step 4 — Workflow Installation
  - Origin: `src/specify_cli/__init__.py:889–921`
  - Criteria: Locate bundled `speckit` workflow, copy to `.specify/workflows/speckit/`, register in WorkflowRegistry, handle missing bundled workflow
  - Confidence: 🟡

- [ ] T-20: Step 5 — Fix Script Permissions
  - Origin: `src/specify_cli/__init__.py:923–924`
  - Criteria: Call `ensure_executable_scripts()` to chmod +x all scripts in `.specify/` on Unix; no-op on Windows
  - Confidence: 🟡

- [ ] T-21: Step 6 — Persist Init Options
  - Origin: `src/specify_cli/__init__.py:926–942`
  - Criteria: Write `.specify/init-options.json` with fields: `ai`, `integration`, `script`, `preset`, `branch_numbering`, `initialized_at`, `speckit_version`, `python_version`
  - Confidence: 🟢

- [ ] T-22: Step 7 — Preset Installation (optional)
  - Origin: `src/specify_cli/__init__.py:944–982`
  - Criteria: If `--preset` provided, call `PresetManager.install()` with fallback chain: local → bundled → catalog lookup (with embedded remote download via `download_url`); catch errors, warn user (non-fatal), continue. Note: "remote" is not separate — it is the download phase within catalog.
  - Confidence: 🟢

### Phase 8: Post-Init Messages & Completion

- [ ] T-23: Display post-init messages
  - Origin: `src/specify_cli/__init__.py:1000–1089`
  - Criteria: Show agent folder security notice, deprecation warnings (if `--ai` used), git extension default notice, next steps panel
  - Confidence: 🟡

- [ ] T-24: Exit with success
  - Origin: `src/specify_cli/__init__.py:1086–1089`
  - Criteria: Close StepTracker Live context, exit(0)
  - Confidence: 🟢

### Error Handling

- [ ] T-25: Implement error handler for orchestration exceptions
  - Origin: `src/specify_cli/__init__.py:1024–1050`
  - Criteria: Catch exceptions during steps 1–7; call Tracker.error(), show error panel with details, cleanup new project directory (if created), exit(1)
  - Confidence: 🟢

- [ ] T-26: Validate argument combinations before execution
  - Origin: `src/specify_cli/__init__.py:506–599`
  - Criteria: All validation happens in Phase 1; no bad argument combinations reach orchestration phase
  - Confidence: 🟢

---

## Tarefas de Teste

### Happy Path

- [ ] TT-01: Test `specify init my-project --integration claude`
  - Criteria: Creates `./my-project/` with `.specify/` structure, git repo, constitution, workflow, exit(0)
  - Evidence: requirements.md Scenario 1

- [ ] TT-02: Test `specify init --here --integration copilot`
  - Criteria: Initializes in CWD, preserves existing files, exit(0)
  - Evidence: requirements.md Scenario 2

- [ ] TT-03: Test `specify init --here --force --integration claude --preset healthcare-compliance`
  - Criteria: Initializes in non-empty CWD without prompting, installs preset, exit(0)
  - Evidence: requirements.md Scenario 6

### Error Cases

- [ ] TT-04: Test invalid integration specified
  - Criteria: Shows available integrations list, exit(1)
  - Evidence: requirements.md Scenario 5

- [ ] TT-05: Test --ai-skills without --integration
  - Criteria: Error message, exit(1)
  - Evidence: design.md Alt-Form

- [ ] TT-06: Test generic integration without --ai-commands-dir
  - Criteria: Error message requiring --ai-commands-dir, exit(1)
  - Evidence: design.md Error-6

- [ ] TT-07: Test agent CLI not installed (without --ignore-agent-tools)
  - Criteria: Shows install panel, exit(1)
  - Evidence: design.md Error-2

- [ ] TT-08: Test directory conflict (no --force)
  - Criteria: Shows conflict panel, user declines, exit(0) gracefully
  - Evidence: design.md Error-3

- [ ] TT-09: Test preset not found (with --preset)
  - Criteria: Warns user, initializes project without preset, exit(0)
  - Evidence: design.md Alt-5

### Edge Cases

- [ ] TT-10: Test git not found (with --no-git)
  - Criteria: Skips git init, project still valid, exit(0)
  - Evidence: flowchart error handling

- [ ] TT-11: Test non-interactive mode (piped input, no tty)
  - Criteria: Uses defaults (DEFAULT_INIT_INTEGRATION, OS-appropriate script), no prompts, exit(0)
  - Evidence: flowchart Alt-4

- [ ] TT-12: Test --ignore-agent-tools (agent CLI missing)
  - Criteria: Skips tool check, initializes anyway, exit(0)
  - Evidence: design.md Alt-3

- [ ] TT-13: Test branch numbering persistence
  - Criteria: init.json contains chosen strategy, can be read by future branch command
  - Evidence: design.md "State Internal"

---

## Tarefas de Integração

- [ ] TI-01: Verify IntegrationManifest schema matches all 30+ agents
  - Criteria: All agents can be loaded without validation errors
  - Confidence: 🟡

- [ ] TI-02: Test PresetManager installation chain with all 3 fallback sources
  - Criteria: Local → bundled → catalog → remote tested separately
  - Confidence: 🟡

- [ ] TI-03: Verify SharedInfra bundled assets are present in wheel distribution
  - Criteria: constitution.md, templates, scripts all available post-install
  - Confidence: 🟡

- [ ] TI-04: Verify WorkflowRegistry integration with speckit bundled workflow
  - Criteria: Workflow registered and discoverable after init
  - Confidence: 🟡

---

## Ordem Sugerida

1. **T-01 to T-03** (Phase 1: Validation) — Must complete before any path/integration operations
2. **T-04 to T-06** (Phase 2: Directory) — Unblocks orchestration phase
3. **T-07 to T-09** (Phase 3: Integration) — Blocks tool check and script selection
4. **T-10 to T-11** (Phase 4: Tools) — Blocks orchestration
5. **T-12 to T-13** (Phase 5: Script) — Blocks orchestration
6. **T-14** (Phase 6: Panel) — User confirmation before orchestration
7. **T-15 to T-24** (Phase 7 & 8: Orchestration & Completion) — Execute sequentially; each step is dependency of next
8. **T-25 to T-26** (Error Handling) — Integrate throughout all phases

### Blockers

- T-15 (StepTracker) blocks T-16 through T-24
- T-16 (Integration setup) must complete before T-17 (shared infra assumes integration registered)
- T-17 (Shared infra) must complete before T-18 (git setup may depend on templates)
- T-18 (Git) must complete before T-19 (workflow installation assumes `.specify/` structure)
- T-22 (Preset install) is independent of T-16 to T-21 but runs after them

---

## Lacunas Pendentes (🔴)

1. **Integration-specific setup hooks** — Does `IntegrationManifest.setup()` handle agent-specific initialization beyond metadata save? (e.g., Claude skill registration, Copilot config) Needs ADR or implementation spec.

2. **Preset rollback on partial failure** — If preset installation fails after orchestration steps complete, is the project in a valid/consistent state? Should failed preset installation trigger cleanup?

3. **Custom --integration-options format** — Exact format of `--integration-options` string? Is it key=value pairs, JSON, quoted shell args? Needs documentation or example.

4. **Branch numbering application** — init.json persists the choice, but where is it actually **used** by the branch command? Link to branch command implementation.

5. **Agent tool detection specifics** — Which tools are checked per agent? (e.g., Claude = `anthropic-cli` or `claude`? OpenAI = `openai`?) Define in AGENT_CONFIG or separate tool registry.

6. **Git extension auto-install safety** — What if git extension install fails? Is it fatal or non-fatal? How does it interact with `--no-git`?

7. **StepTracker error panel design** — Exact error panel layout & messages shown to user on orchestration failure? Reference UI specs or examples.

8. **Non-interactive stdin detection mechanism** — Exact Python code to detect interactive vs non-interactive? (tty check via `sys.stdin.isatty()`?) Verify once implementation is available.
