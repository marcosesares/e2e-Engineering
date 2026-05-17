# workflow — Tarefas de Implementação

> **Unit**: workflow  
> **Language**: English

---

## Pré-requisitos

- [ ] StepBase abstract class with execute() contract defined
- [ ] Step registry infrastructure (registration, lookup, validation)
- [ ] IntegrationRuntime available for prompt step dispatch
- [ ] JSON state file schema designed
- [ ] Async/threading primitives available for fan-out

---

## Phase 1: Core Engine & Step Base

- [ ] T-01: Implement StepBase abstract class
  - Origin: `src/specify_cli/workflows/base.py:1–150`
  - Criteria: `execute(context: StepContext) → StepResult` contract; subclasses for each type
  - Confidence: 🟢

- [ ] T-02: Implement WorkflowDefinition dataclass
  - Origin: `src/specify_cli/workflows/engine.py:1–100`
  - Criteria: Parse YAML; validate schema (name, steps required); load into dataclass
  - Confidence: 🟢

- [ ] T-03: Implement StepContext and StepResult
  - Origin: `src/specify_cli/workflows/engine.py:100–150`
  - Criteria: StepContext immutable for inputs, mutable for results; StepResult with all fields
  - Confidence: 🟢

- [x] T-04: Step type registry (implemented)
  - Real location: `src/specify_cli/workflows/__init__.py:20–66`
  - Registry: `STEP_REGISTRY: dict[str, StepBase]` defined at line 20
  - Registration: `_register_builtin_steps()` at line 43–66 (auto-executes on import)
  - Lookup: `get_step_type(type_key)` at line 36–38
  - Types registered (10): `command`, `shell`, `prompt`, `gate`, `if`, `switch`, `while`, `do-while`, `fan-out`, `fan-in`
  - Confidence: 🟢

---

## Phase 2: Basic Step Types

- [x] T-05: CommandStep (implemented)
  - Real location: `src/specify_cli/workflows/steps/command/__init__.py`
  - Criteria: Execute shell command, capture stdout/stderr, return status code + output
  - Confidence: 🟢

- [x] T-06: ShellStep (implemented)
  - Real location: `src/specify_cli/workflows/steps/shell/__init__.py`
  - Criteria: Wrap script in bash/ps; OS-appropriate; set executable bit on Unix
  - Confidence: 🟢

- [x] T-07: PromptStep (implemented)
  - Real location: `src/specify_cli/workflows/steps/prompt/__init__.py`
  - Criteria: Send prompt to IntegrationRuntime; resolve model/integration from context or config
  - Confidence: 🟢

- [x] T-08: GateStep (implemented)
  - Real location: `src/specify_cli/workflows/steps/gate/__init__.py`
  - Criteria: Display message, wait for user input (yes/no); return result as boolean
  - Confidence: 🟢

---

## Phase 3: Control Flow Steps

- [x] T-09: IfStep (implemented)
  - Real location: `src/specify_cli/workflows/steps/if_then/__init__.py`
  - Criteria: Evaluate condition expression; execute then/else branch; return branch result
  - Confidence: 🟢

- [x] T-10: SwitchStep (implemented)
  - Real location: `src/specify_cli/workflows/steps/switch/__init__.py`
  - Criteria: Evaluate selector; match against cases dict; execute matching branch
  - Confidence: 🟢

- [x] T-11: WhileStep (implemented)
  - Real location: `src/specify_cli/workflows/steps/while_loop/__init__.py` + `src/specify_cli/workflows/steps/do_while/__init__.py`
  - Criteria: Repeat body while condition true; limit iterations (default 1000) to prevent infinite loops
  - Confidence: 🟢

---

## Phase 4: Parallel & Aggregation

- [x] T-12: FanOutStep (implemented)
  - Real location: `src/specify_cli/workflows/steps/fan_out/__init__.py`
  - Criteria: Evaluate items expression → list; spawn step per item (async/threading); collect StepResult per item
  - Confidence: 🟢

- [x] T-13: FanInStep (implemented)
  - Real location: `src/specify_cli/workflows/steps/fan_in/__init__.py`
  - Criteria: Collect all pending fan-out results; aggregate (list or dict by item); return aggregated result
  - Confidence: 🟢

---

## Phase 5: Execution Engine & State

- [ ] T-14: Implement WorkflowEngine executor
  - Origin: `src/specify_cli/workflows/engine.py:200–500`
  - Criteria: Load workflow; initialize run; execute step loop; handle control-flow; persist state; return final result
  - Confidence: 🟢

- [ ] T-15: Implement state persistence
  - Origin: `src/specify_cli/workflows/engine.py:500–650`
  - Criteria: Save state file after each step; include context snapshot; support resume from state file
  - Confidence: 🟡

- [ ] T-16: Implement resume functionality
  - Origin: `src/specify_cli/workflows/engine.py:650–750`
  - Criteria: Load state file; restore context; continue from next step
  - Confidence: 🟡

---

## Phase 6: Integration & CLI

- [ ] T-17: Implement workflow command (CLI entry point)
  - Origin: `src/specify_cli/__init__.py:workflow_command()`
  - Criteria: `specify workflow run <file>`, `specify workflow resume <run_id>`, `specify workflow list`
  - Confidence: 🟡

- [ ] T-18: Implement error handling & logging
  - Origin: `src/specify_cli/workflows/engine.py:100–200`
  - Criteria: Log step name, inputs, outputs, status; capture errors; show helpful messages
  - Confidence: 🟡
