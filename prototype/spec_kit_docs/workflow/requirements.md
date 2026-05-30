# workflow — Workflow Engine & Orchestration

> **Unit**: workflow  
> **Type**: Feature  
> **Language**: English

---

## Overview

The `workflow` module provides a complete execution engine for multi-step AI automation tasks. It parses workflow definitions (YAML), manages a registry of step types (command, shell, prompt, gate, branching, loops, fan-out/fan-in), executes workflows sequentially with control-flow dispatch, and persists execution state for resume across sessions.

---

## Responsibilities

- Parse workflow YAML definitions into WorkflowDefinition objects
- Manage step type registry (command, shell, prompt, gate, if/then, switch, loops, fan-out/fan-in)
- Execute workflows sequentially with full control-flow support
- Persist and resume workflow execution state across sessions
- Handle input/output and step context propagation
- Aggregate results from parallel fan-out/fan-in operations

---

## Business Rules

- **Step types are pluggable** — New step types can be registered via StepBase subclasses. 🟢
- **State persistence** — Workflow runs are resumable; state stored per run_id with snapshots at each step. 🟢
- **Sequential execution** — Steps execute in order unless control-flow redirects (branch, loop, fan-out). 🟢
- **Context propagation** — StepContext carries inputs, accumulated step results, and fan-out item context. 🟢
- **Fan-out/Fan-in** — Parallel iteration over items, aggregation via fan-in step collecting all results. 🟡

---

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criterion |
|----|-----------|----------|-------------------|
| RF-01 | User can define workflow in YAML (steps array, metadata) | Must | YAML loads without error; WorkflowDefinition created with all steps |
| RF-02 | Engine executes workflow steps sequentially | Must | Steps run in order; each step completes before next starts |
| RF-03 | Engine supports command step type (local shell command) | Must | `step.type == "command"` executes command; stdout/stderr captured |
| RF-04 | Engine supports shell step type (bash/PowerShell wrapper) | Must | `step.type == "shell"` wraps script in interpreter; OS-appropriate script runs |
| RF-05 | Engine supports prompt step type (AI agent dispatch) | Must | `step.type == "prompt"` sends to integration runtime; model/options resolved |
| RF-06 | Engine supports gate step type (human approval) | Should | `step.type == "gate"` pauses workflow; requires user input to resume |
| RF-07 | Engine supports if/then branching | Should | `step.type == "if"` evaluates condition; `then` step runs if true, `else` if provided |
| RF-08 | Engine supports switch (multi-branch) | Should | `step.type == "switch"` evaluates selector; routes to matching branch |
| RF-09 | Engine supports while loops | Should | `step.type == "while"` repeats body until condition false |
| RF-10 | Engine supports fan-out (parallel iteration) | Should | `step.type == "fan-out"` iterates over items; spawns step per item concurrently |
| RF-11 | Engine supports fan-in (aggregation) | Should | `step.type == "fan-in"` collects results from fan-out; aggregates into single result |
| RF-12 | Workflow state is persisted for resume | Should | State file saved after each step; resume via `workflow resume <run_id>` |
| RF-13 | StepContext carries inputs and prior results | Must | Context includes input vars, step_results dict, current fan-out item (if applicable) |
| RF-14 | Step result includes status, output, next_steps | Must | StepResult object contains status (pending/running/completed/failed/skipped), output, optional next_steps override |

---

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-----------|----------|-----------|
| Performance | Workflow execution completes with <100ms overhead per step | No polling loops; direct dispatch | 🟡 |
| Reliability | Workflow state recoverable from resume file | State persisted after each step | 🟢 |
| Debuggability | Execution logs step name, inputs, outputs, status | Rich output with step context | 🟡 |
| Extensibility | New step types added via StepBase subclass registration | Step registry pattern in code | 🟢 |

---

## Acceptance Criteria

```gherkin
Scenario: Execute workflow with command and prompt steps
  Given workflow YAML with 2 steps: "build" (command), "test" (prompt)
  When engine executes workflow
  Then "build" command runs and output captured
  And StepContext passed to "test" includes build output
  And final result has status "completed"

Scenario: Resume workflow from saved state
  Given workflow interrupted after step 2 of 5
  When user runs 'workflow resume <run_id>'
  Then engine loads state file
  And execution resumes from step 3
  And earlier step results restored in context

Scenario: Fan-out over list of items
  Given workflow with fan-out step iterating over 3 items
  When fan-out executes
  Then 3 parallel instances of child step spawn
  And fan-in collects 3 results
  And aggregated result has all 3 outputs
```

---

## Scope & Scale

- **Workflow complexity**: Up to 50 steps per workflow (sequential + branching)
- **Fan-out scale**: Up to 100 parallel items per fan-out
- **State file size**: <1 MB per run (estimated)
- **Execution timeout**: Configurable per step (no global limit)
