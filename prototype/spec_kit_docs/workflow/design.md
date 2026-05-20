# workflow — Design Técnico

> **Unit**: workflow  
> **Type**: Feature  
> **Language**: English

---

## Interface

### WorkflowDefinition (Parsed YAML)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Yes | Human-readable workflow name |
| `version` | string | No | Semantic version (default: "1.0.0") |
| `description` | string | No | Workflow purpose |
| `inputs` | dict | No | Input parameters (default: empty) |
| `steps` | list[Step] | Yes | Step definitions (≥1 required) |

### Step Structure

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Yes | Unique within workflow |
| `type` | string | Yes | "command", "shell", "prompt", "gate", "if", "switch", "while", "fan-out", "fan-in" |
| `config` | dict | Type-dependent | Step-specific settings |

### StepContext (Execution Context)

| Field | Type | Notes |
|-------|------|-------|
| `workflow_id` | string | Workflow identifier |
| `run_id` | string | Unique execution run |
| `inputs` | dict | Workflow inputs (immutable) |
| `step_results` | dict | Results from previous steps (key = step name) |
| `fan_out_item` | any | Current item if inside fan-out (null otherwise) |
| `fan_out_index` | int | Current iteration index in fan-out |
| `default_integration` | string | Default AI agent for prompts |
| `default_model` | string | Default model for prompts |

### StepResult

| Field | Type | Notes |
|-------|------|-------|
| `status` | enum | "pending", "running", "completed", "failed", "skipped", "paused" |
| `output` | any | Step output (string for command/shell/prompt, dict for aggregations) |
| `error` | string | Error message if failed |
| `next_steps` | list[str] | Optional override for next steps (for branching) |
| `duration_ms` | int | Execution time in milliseconds |

---

## Core Execution Flow

1. **Load Workflow** (`src/specify_cli/workflows/engine.py:100–150`)
   - Read YAML from file/remote
   - Parse into WorkflowDefinition via schema validation
   - Register all steps in step type registry
   - 🟢 CONFIRMADO

2. **Initialize Run** (`engine.py:150–200`)
   - Create run_id (timestamp + random suffix)
   - Create initial StepContext with inputs
   - Create state file at `.specify/runs/<run_id>.json`
   - 🟢 CONFIRMADO

3. **Execute Step Loop** (`engine.py:200–350`)
   - Iterate over steps (unless overridden by control-flow)
   - For each step:
     - Instantiate StepBase subclass
     - Call `step.execute(context)`
     - Capture result (status, output, error)
     - Update context.step_results[step.name]
     - Persist state to resume file
     - Check if step overrides next_steps (for branching)
   - 🟢 CONFIRMADO

4. **Control Flow Dispatch** (`engine.py:350–450`)
   - If/Then: Evaluate condition, execute then or else branch
   - Switch: Evaluate selector, execute matching branch
   - While: Repeat body until condition false
   - Fan-out: Spawn parallel tasks (via async/threading)
   - Fan-in: Collect all results, aggregate
   - 🟡 INFERIDO

5. **Finalize Run** (`engine.py:450–500`)
   - Mark final status (completed/failed)
   - Save final state
   - Return aggregated workflow result
   - 🟢 CONFIRMADO

---

## Step Types Registry

| Type | Handler Class | Parameters | Output |
|------|---------------|-----------|--------|
| command | CommandStep | cmd (string) | stdout (string) |
| shell | ShellStep | script (string), interpreter ("bash" or "ps") | stdout |
| prompt | PromptStep | prompt (string), model (string, optional), integration (string, optional) | agent response |
| gate | GateStep | message (string, optional) | approval (boolean) |
| if | IfStep | condition (expression), then (step), else (step, optional) | result from branch |
| switch | SwitchStep | selector (expression), cases (dict: value → step) | result from case |
| while | WhileStep | condition (expression), body (step) | last body result |
| fan-out | FanOutStep | items (expression → list), body (step) | list of results |
| fan-in | FanInStep | none (aggregates pending fan-out) | aggregated results |

---

## State Persistence

**File location**: `.specify/runs/<run_id>.json`

**Schema**:
```json
{
  "run_id": "...",
  "workflow_id": "...",
  "status": "running|completed|failed|paused",
  "current_step": "step-name",
  "step_results": { "step-name": {...} },
  "context_snapshot": {...},
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "duration_ms": 0
}
```

**Resume**: Load state file, restore context, continue from `current_step + 1`.

---

## Error Handling

- **Invalid YAML**: Schema validation error at parse time → exit(1)
- **Step type not found**: Unknown type → log warning, skip step, continue
- **Step execution fails**: Log error, set status = "failed", check `on_error` policy (fail-fast vs continue)
- **Condition evaluation fails**: Log error, treat as false
- **Context missing variable**: Use null or default value

---

## Diagram: Execution Lifecycle

```
[Start] → Load YAML → Validate → Initialize Run → [Step Loop]
                                                       ↓
                                        Execute Step → Update Context
                                              ↓         ↓
                                        Persist State ← [Check Next]
                                              ↓
                                        More steps? → Yes → [Step Loop]
                                              ↓
                                              No
                                              ↓
                                        Finalize → [End]
```
