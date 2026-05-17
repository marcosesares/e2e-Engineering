# C4 Components Diagram — Specify CLI

**System**: Specify CLI  
**Level**: 3 — Components (Selected Containers)  
**Generated**: 2026-05-18

---

## Component Diagram: Preset Manager

The **PresetManager** container is responsible for template composition, resolution, and lifecycle. It's the most algorithmically complex subsystem.

```mermaid
graph TB
    PresetMgr["PresetManager<br/>Orchestrator<br/><br/>install(preset_source, options)<br/>remove(preset_id)<br/>update(preset_id)<br/>list_installed()"]
    
    PsetManifest["PresetManifest<br/>Validation<br/><br/>Load & validate preset.yml<br/>Enforce schema v1.0<br/>Check template constraints<br/>Validate dependencies"]
    
    PsetRegistry["PresetRegistry<br/>Persistence<br/><br/>Load/save to .registry JSON<br/>Add/update/remove entries<br/>Resilient to corruption<br/>Normalize priorities"]
    
    PsetCatalog["PresetCatalog<br/>Discovery<br/><br/>Fetch remote catalogs<br/>Merge with priority ordering<br/>Cache (1h TTL)<br/>HTTPS validation"]
    
    PsetResolver["PresetResolver<br/>Template Resolution<br/><br/>4-level stack lookup<br/>resolve(template_name)<br/>collect_all_layers()<br/>priority ordering"]
    
    Composer["TemplateComposer<br/>Composition<br/><br/>Apply strategies<br/>replace (override)<br/>prepend (insert before)<br/>append (insert after)<br/>wrap (surround)"]
    
    CmdReg["CommandRegistrar<br/>Agent Registration<br/><br/>Register commands with agents<br/>Render frontmatter<br/>Handle composition"]
    
    %% Data flows
    PresetMgr -->|"Creates & validates"| PsetManifest
    PresetMgr -->|"Persists metadata"| PsetRegistry
    PresetMgr -->|"Discovers presets"| PsetCatalog
    PresetMgr -->|"Resolves templates"| PsetResolver
    PresetMgr -->|"Composes layers"| Composer
    PresetMgr -->|"Registers commands"| CmdReg
    
    PsetResolver -->|"Queries registry<br/>priority order"| PsetRegistry
    Composer -->|"Collects all layers"| PsetResolver
    CmdReg -->|"Gets composed<br/>template content"| Composer
    
    style PresetMgr fill:#F39C12,stroke:#8B6600,stroke-width:2px,color:#fff
    style PsetManifest fill:#F39C12,stroke:#8B6600,color:#fff
    style PsetRegistry fill:#34495E,stroke:#1C2833,color:#fff
    style PsetCatalog fill:#3498DB,stroke:#1C5E89,color:#fff
    style PsetResolver fill:#F39C12,stroke:#8B6600,color:#fff
    style Composer fill:#F39C12,stroke:#8B6600,color:#fff
    style CmdReg fill:#16A085,stroke:#0D5D47,color:#fff
```

### Preset Manager Components

| Component | Responsibility | Key Methods |
|-----------|----------------|-------------|
| **PresetManager** | Orchestrate install/remove/update; manage full lifecycle | `install()`, `remove()`, `update()`, `list_installed()`, `get_preset()` |
| **PresetManifest** | Load & validate `preset.yml` files | `__init__(path)`, `_validate()`, properties for id/name/version/templates |
| **PresetRegistry** | Persist preset metadata to `.registry` JSON | `_load()`, `_save()`, `add()`, `update()`, `remove()`, `list()` |
| **PresetCatalog** | Fetch remote catalogs, cache, merge prioritized sources | `_fetch_single_catalog()`, `fetch_catalog()`, `get_preset_info()`, `download_preset()` |
| **PresetResolver** | Resolve template names via 4-level priority stack | `resolve()`, `collect_all_layers()`, `_resolve_layer()` |
| **TemplateComposer** | Apply composition strategies (replace/prepend/append/wrap) | `compose()`, `_apply_strategy()`, `_substitute_placeholder()` |
| **CommandRegistrar** | Register preset commands with agents | `register_commands()`, `render_command()`, `_render_frontmatter()` |

### Key Algorithms

**4-Level Template Resolution**:
```
PresetResolver.resolve("example-spec")
  ↓ Level 1: .specify/templates/overrides/example-spec.md (highest)
  ↓ Level 2: .specify/presets/{preset_id}/example-spec.md (by priority)
  ↓ Level 3: .specify/extensions/{ext_id}/templates/example-spec.md
  ↓ Level 4: .specify/templates/example-spec.md (bundled, lowest)
  → Return first match or None
```

**Template Composition**:
```
Given: "strategy": "wrap" (non-replace strategy)
  ↓ Collect all layers via resolve_all_layers()
  ↓ For each layer (top to bottom by priority):
     - If this layer's strategy is replace: skip lower layers
     - If this layer's strategy is prepend: insert content before next layer
     - If this layer's strategy is append: insert content after next layer
     - If this layer's strategy is wrap: wrap next layer with placeholder {CORE_TEMPLATE}
  ↓ Merge results → final composed template
```

---

## Component Diagram: Extension Manager

```mermaid
graph TB
    ExtMgr["ExtensionManager<br/>Orchestrator<br/><br/>install(ext_source, id)<br/>remove(ext_id)<br/>update(ext_id)<br/>list_installed()"]
    
    ExtManifest["ExtensionManifest<br/>Validation<br/><br/>Load & validate extension.yml<br/>Enforce schema v1.0<br/>Check command constraints<br/>Validate dependencies"]
    
    ExtRegistry["ExtensionRegistry<br/>Persistence<br/><br/>Load/save to .registry JSON<br/>Add/update/remove<br/>Resilient to corruption<br/>Priority management"]
    
    ExtCatalog["ExtensionCatalog<br/>Discovery<br/><br/>Fetch remote catalogs<br/>Merge with priority<br/>Cache (24h TTL)<br/>HTTPS validation"]
    
    ConflictDetector["ConflictDetector<br/>Safety<br/><br/>Detect command shadowing<br/>Check namespace patterns<br/>Reject dangerous installs"]
    
    CmdReg["CommandRegistrar<br/>Agent Registration<br/><br/>Register with 30+ agents<br/>Render command metadata<br/>Handle multi-format output"]
    
    HookExecutor["HookExecutor<br/>Event Automation<br/><br/>Register hooks from manifest<br/>Execute on events<br/>Condition evaluation<br/>Command execution"]
    
    %% Data flows
    ExtMgr -->|"Creates & validates"| ExtManifest
    ExtMgr -->|"Persists metadata"| ExtRegistry
    ExtMgr -->|"Discovers extensions"| ExtCatalog
    ExtMgr -->|"Conflict checking"| ConflictDetector
    ExtMgr -->|"Registers commands"| CmdReg
    ExtMgr -->|"Registers hooks"| HookExecutor
    
    ConflictDetector -->|"Checks against"| ExtRegistry
    
    style ExtMgr fill:#50C878,stroke:#2D7A4A,stroke-width:2px,color:#fff
    style ExtManifest fill:#50C878,stroke:#2D7A4A,color:#fff
    style ExtRegistry fill:#34495E,stroke:#1C2833,color:#fff
    style ExtCatalog fill:#3498DB,stroke:#1C5E89,color:#fff
    style ConflictDetector fill:#E74C3C,stroke:#8B2323,color:#fff
    style CmdReg fill:#16A085,stroke:#0D5D47,color:#fff
    style HookExecutor fill:#16A085,stroke:#0D5D47,color:#fff
```

### Extension Manager Components

| Component | Responsibility | Key Methods |
|-----------|----------------|-------------|
| **ExtensionManager** | Orchestrate install/remove/update; manage lifecycle | `install()`, `remove()`, `update()`, `list_installed()` |
| **ExtensionManifest** | Load & validate `extension.yml` files | `__init__(path)`, `_validate()`, properties for id/name/version/commands |
| **ExtensionRegistry** | Persist extension metadata to `.registry` JSON | `_load()`, `_save()`, `add()`, `update()`, `remove()` |
| **ExtensionCatalog** | Fetch remote catalogs, cache, merge sources | `_fetch_single_catalog()`, `fetch_catalog()`, `get_extension_info()`, `download_extension()` |
| **ConflictDetector** | Detect command name conflicts, namespace violations | `validate_install_conflicts()`, `_collect_manifest_command_names()` |
| **CommandRegistrar** | Register extension commands with 30+ AI agents | `register_commands()`, `_register_with_agent()` |
| **HookExecutor** | Register and execute event-driven hooks | `register_hooks()`, `execute_hook()`, `_evaluate_condition()` |

### Namespace Validation

**Pattern**: `speckit.{extension_id}.{command_name}`

Example:
- Valid: `speckit.ai-tools.generate-spec`
- Invalid: `speckit.ai-tools` (no command name)
- Invalid: `my-custom.ai-tools.spec` (wrong namespace prefix)

---

## Component Diagram: Workflow Engine

```mermaid
graph TB
    WorkflowEng["WorkflowEngine<br/>Orchestrator<br/><br/>load(workflow_id)<br/>execute(workflow)<br/>resume(run_id)<br/>pause(run_id)"]
    
    YAMLParser["YAMLParser<br/>Parsing<br/><br/>Load workflow.yml<br/>Validate schema<br/>Parse step definitions"]
    
    StepRegistry["StepRegistry<br/>Dispatch<br/><br/>Dispatch by type<br/>command, prompt, shell<br/>if/then, while, loop<br/>fan-out, fan-in"]
    
    ControlFlow["ControlFlowExecutor<br/>Logic<br/><br/>Conditional branching<br/>Loop iteration<br/>Fan-out spawning<br/>Fan-in aggregation"]
    
    StepRunner["StepRunner<br/>Execution<br/><br/>Build execution context<br/>Call step handler<br/>Capture output<br/>Handle errors"]
    
    StateManager["StateManager<br/>Persistence<br/><br/>Save run state<br/>Persist step results<br/>Track status<br/>Allow resume"]
    
    %% Data flows
    WorkflowEng -->|"Loads workflows"| YAMLParser
    WorkflowEng -->|"Routes steps"| StepRegistry
    WorkflowEng -->|"Handles control flow"| ControlFlow
    WorkflowEng -->|"Executes each step"| StepRunner
    WorkflowEng -->|"Persists state"| StateManager
    
    StepRegistry -->|"Delegates to"| StepRunner
    ControlFlow -->|"Branching/looping"| StepRunner
    
    style WorkflowEng fill:#9B59B6,stroke:#5D3A5D,stroke-width:2px,color:#fff
    style YAMLParser fill:#9B59B6,stroke:#5D3A5D,color:#fff
    style StepRegistry fill:#9B59B6,stroke:#5D3A5D,color:#fff
    style ControlFlow fill:#9B59B6,stroke:#5D3A5D,color:#fff
    style StepRunner fill:#9B59B6,stroke:#5D3A5D,color:#fff
    style StateManager fill:#34495E,stroke:#1C2833,color:#fff
```

### Workflow Engine Components

| Component | Responsibility | Key Methods |
|-----------|----------------|-------------|
| **WorkflowEngine** | Load and execute workflows, manage lifecycle | `load()`, `execute()`, `resume()`, `pause()`, `abort()` |
| **YAMLParser** | Parse and validate workflow YAML | `load_workflow()`, `validate_schema()`, `parse_steps()` |
| **StepRegistry** | Dispatch steps by type to appropriate handlers | `dispatch()`, `get_handler()`, `register_step_type()` |
| **ControlFlowExecutor** | Evaluate conditionals, loops, fan-out/fan-in | `evaluate_condition()`, `execute_loop()`, `fan_out()`, `fan_in()` |
| **StepRunner** | Execute individual step, handle errors, capture output | `run_step()`, `build_context()`, `handle_error()`, `capture_output()` |
| **StateManager** | Persist workflow/step state for resumability | `save_run_state()`, `load_run_state()`, `update_step_result()` |

### Step Types

| Type | Purpose | Example |
|------|---------|---------|
| **command** | Execute CLI command | `specify plan --input requirements.md` |
| **prompt** | Send prompt to AI agent | `Generate code from spec {spec_path}` |
| **shell** | Execute shell script | `bash scripts/deploy.sh` |
| **if/then** | Conditional execution | `if: '{{ steps.check.output }}'` |
| **while/do-while** | Loop constructs | `while: '{{ item.remaining > 0 }}'` |
| **fan-out** | Parallel iterations | `for_each: {{ items }}` |
| **fan-in** | Aggregation after fan-out | `aggregate: {{ fanout_results }}` |

---

## Component Diagram: Integration Runtime

```mermaid
graph TB
    IntRuntime["IntegrationRuntime<br/>Orchestrator<br/><br/>execute_step(step)<br/>resolve_integration(step)<br/>build_command()"]
    
    IntState["IntegrationState<br/>Config<br/><br/>Load integration.json<br/>Resolve options<br/>Persist state"]
    
    IntBase["IntegrationBase (ABC)<br/>Abstract Interface<br/><br/>execute_command()<br/>parse_response()<br/>get_capabilities()"]
    
    Claude["ClaudeIntegration<br/>Claude Handler<br/><br/>claude.ai integration<br/>Anthropic SDK support<br/>Model selection"]
    
    Copilot["CopilotIntegration<br/>Copilot Handler<br/><br/>VSCode Copilot<br/>GitHub Copilot API<br/>Settings.json interface"]
    
    Cursor["CursorIntegration<br/>Cursor Handler<br/><br/>Cursor IDE integration<br/>Agent-specific commands"]
    
    Windsurf["WindsurfIntegration<br/>Windsurf Handler<br/><br/>Windsurf editor integration<br/>AI command dispatch"]
    
    Generic["GenericIntegration<br/>Custom Handler<br/><br/>Custom agent adapter<br/>Generic protocol handler<br/>Extensible interface"]
    
    OptionResolver["OptionResolver<br/>Option Processing<br/><br/>Parse raw options<br/>Validate against schema<br/>Store resolved options"]
    
    %% Data flows
    IntRuntime -->|"Loads config"| IntState
    IntRuntime -->|"Resolves integration"| IntBase
    IntRuntime -->|"Processes options"| OptionResolver
    
    IntBase -->|"Base interface"| Claude
    IntBase -->|"Base interface"| Copilot
    IntBase -->|"Base interface"| Cursor
    IntBase -->|"Base interface"| Windsurf
    IntBase -->|"Base interface"| Generic
    
    style IntRuntime fill:#FF6B6B,stroke:#8B3A3A,stroke-width:2px,color:#fff
    style IntState fill:#34495E,stroke:#1C2833,color:#fff
    style IntBase fill:#FF6B6B,stroke:#8B3A3A,color:#fff
    style Claude fill:#FF6B6B,stroke:#8B3A3A,color:#fff
    style Copilot fill:#FF6B6B,stroke:#8B3A3A,color:#fff
    style Cursor fill:#FF6B6B,stroke:#8B3A3A,color:#fff
    style Windsurf fill:#FF6B6B,stroke:#8B3A3A,color:#fff
    style Generic fill:#FF6B6B,stroke:#8B3A3A,color:#fff
    style OptionResolver fill:#3498DB,stroke:#1C5E89,color:#fff
```

### Integration Runtime Components

| Component | Responsibility | Key Methods |
|-----------|----------------|-------------|
| **IntegrationRuntime** | Dispatch steps to appropriate agent handler | `execute_step()`, `resolve_integration()`, `build_command()` |
| **IntegrationState** | Load and manage integration configuration | `load_config()`, `save_config()`, `get_option()`, `set_option()` |
| **IntegrationBase (ABC)** | Abstract base for all agent implementations | `execute_command()` (must implement), `parse_response()`, `get_capabilities()` |
| **ClaudeIntegration** | Claude.ai or Anthropic SDK handler | `execute_command()` impl., model selection, streaming support |
| **CopilotIntegration** | GitHub Copilot handler | `execute_command()` impl., VSCode settings.json interface |
| **CursorIntegration** | Cursor IDE handler | `execute_command()` impl., Cursor-specific protocol |
| **WindsurfIntegration** | Windsurf editor handler | `execute_command()` impl., Windsurf command dispatch |
| **GenericIntegration** | Custom agent adapter | `execute_command()` impl., generic protocol support |
| **OptionResolver** | Parse and validate integration-specific options | `resolve_options()`, `validate_schema()`, `store_options()` |

### Supported Integrations (30+)

🔴 **Tier 1** (Core): Claude, Copilot, Cursor, Devin, Windsurf, Gemini, Codex  
🟡 **Tier 2** (Extended): Goose, Kimi, OpenCode, Tabnine, Qwen, Roo, Shai, Trae, Vibe  
🟢 **Tier 3** (Community): Kilocode, Junie, Lingma, Kiro CLI, QoderCLI, Auggie, AMP, AGY, Bob, Forge, PI, Codebuddy, iFlow

---

## Data Flow: Component Interaction

### Preset Installation & Template Composition

```mermaid
sequenceDiagram
    User->>CLI: specify preset install python-templates
    CLI->>PresetMgr: install(source, 'python-templates')
    PresetMgr->>PsetManifest: Load & validate preset.yml
    PsetManifest-->>PresetMgr: ✓ Valid
    PresetMgr->>PsetCatalog: Download ZIP from catalog
    PsetCatalog-->>PresetMgr: preset-contents.zip
    PresetMgr->>FileSystem: Extract to .specify/presets/python-templates/
    PresetMgr->>PsetResolver: Resolve templates (4-level stack)
    PsetResolver->>PsetRegistry: Query installed presets (by priority)
    PsetResolver-->>PresetMgr: Template paths
    PresetMgr->>Composer: Compose layers (if non-replace strategies)
    Composer-->>PresetMgr: Composed template content
    PresetMgr->>CmdReg: Register template commands with agents
    CmdReg-->>PresetMgr: ✓ Registered
    PresetMgr->>PsetRegistry: Add preset entry (version, priority, enabled)
    PsetRegistry-->>PresetMgr: ✓ Persisted
    PresetMgr-->>CLI: ✓ Installation complete
    CLI-->>User: "✅ Preset installed: python-templates v1.2.0"
```

### Workflow Execution

```mermaid
sequenceDiagram
    User->>CLI: specify workflow run generate-feature
    CLI->>WorkflowEng: execute(workflow_id='generate-feature')
    WorkflowEng->>YAMLParser: load_workflow('generate-feature')
    YAMLParser-->>WorkflowEng: Parsed workflow + steps
    WorkflowEng->>StateManager: Create new run state
    StateManager-->>WorkflowEng: run_id = 'gen-123'
    
    loop For each step
        WorkflowEng->>StepRegistry: Dispatch step by type
        StepRegistry->>StepRunner: Execute step
        StepRunner->>StepRunner: Build execution context
        StepRunner->>IntRuntime: execute_step(context)
        IntRuntime->>IntState: Resolve integration (default: Claude)
        IntRuntime->>Claude: execute_command(prompt)
        Claude-->>IntRuntime: AI-generated output
        IntRuntime-->>StepRunner: Output
        StepRunner-->>StepRegistry: Step result
        StepRunner->>StateManager: Persist step result
    end
    
    WorkflowEng->>StateManager: Save final run state
    StateManager-->>WorkflowEng: ✓ Persisted
    WorkflowEng-->>CLI: run_result (status=completed)
    CLI-->>User: "✅ Workflow complete. Generated files: feature.py, feature_test.py"
```

---

## Technology Details

| Component | Language | Key Libraries | Purpose |
|-----------|----------|----------------|---------|
| CLI | Python | Typer (Click) | Command routing, argument parsing |
| Config | Python | pyyaml, json5 | YAML/JSON parsing |
| Validation | Python | packaging, pathspec | Version specifiers, path patterns |
| Workflow | Python | yaml, json | YAML parsing, state persistence |
| Integration | Python | subprocess, agent SDKs | Command execution, agent communication |
| Auth | Python | urllib, hashlib | HTTPS requests, token handling |
| Caching | Python | pathlib, json | File-based cache with TTL checks |

