# Spec Impact Matrix — Specify CLI

**System**: Specify CLI  
**Generated**: 2026-05-18 (Architect)  
**Scope**: Component dependencies, impact analysis, change propagation

---

## Component Dependency Matrix

This matrix shows **which components impact which** when changed. Each cell indicates the strength of the dependency (direction and strength).

```
Legend:
→  Calls / Uses (hard dependency)
⇢  Notifies / Reads (soft dependency)
⚙  Shared state (registry/config)
🔌 Plugin interface (indirect dependency)
```

### Dependency Grid

|  | CLI | Ext Mgr | Preset Mgr | Workflow | Int Runtime | Auth Mgr | Shared | Agents |
|---|---|---|---|---|---|---|---|---|
| **CLI** | — | → | → | → | ⇢ | ⇢ | → | ⚙ |
| **Ext Mgr** | ← | — | ← | ← | ← | ← | → | → |
| **Preset Mgr** | ← | ← | — | ← | ← | ← | → | → |
| **Workflow** | ← | ← | ← | — | → | ← | ← | ⇢ |
| **Int Runtime** | ← | ← | ← | ← | — | → | ← | 🔌 |
| **Auth Mgr** | ← | ← | ← | ← | ← | — | ← | ← |
| **Shared** | ← | ← | ← | ← | ← | ← | — | ← |
| **Agents** | ← | ← | ← | ← | 🔌 | ← | ← | — |

---

## Change Impact Analysis

### When CLI (Command Router) Changes

| Affected Component | Impact Type | Severity | Recovery |
|-------------------|------------|----------|----------|
| Ext Manager | Command dispatch | 🔴 HIGH | Must update route mappings |
| Preset Manager | Command dispatch | 🔴 HIGH | Must update route mappings |
| Workflow Engine | Command dispatch | 🔴 HIGH | Must update route mappings |
| Int Runtime | Indirect | 🟡 MEDIUM | Workflows affected if router broken |
| Registry files | Configuration | 🟢 LOW | Projects can upgrade |

**Mitigation**: Keep CLI dispatcher minimal; delegate to subsystems early.

---

### When Extension Manager Changes

| Affected Component | Impact Type | Severity | Recovery |
|-------------------|------------|----------|----------|
| Command Registrar | Core logic | 🔴 HIGH | Extension commands may not register |
| Ext Registry | Persistence | 🔴 HIGH | Installed extensions may become unreadable |
| Conflict Detector | Algorithm | 🟡 MEDIUM | May allow invalid installations |
| CLI (indirect) | Command availability | 🟡 MEDIUM | Extensions not available after reboot |

**Mitigation**: Maintain schema version lock; test conflict detection thoroughly.

---

### When Preset Manager Changes

| Affected Component | Impact Type | Severity | Recovery |
|-------------------|------------|----------|----------|
| Template Resolver | 4-level stack | 🔴 HIGH | Templates may resolve to wrong source |
| Composer | Composition algo | 🔴 HIGH | Non-replace strategies may break |
| Preset Registry | Persistence | 🔴 HIGH | Installed presets may become unreadable |
| Command Registrar | Template registration | 🟡 MEDIUM | Preset commands not available |

**Mitigation**: Keep template resolution algorithm stable; version the 4-level stack algorithm.

---

### When Workflow Engine Changes

| Affected Component | Impact Type | Severity | Recovery |
|-------------------|------------|----------|----------|
| Int Runtime | Step execution | 🔴 HIGH | Workflows cannot execute steps |
| Step types | Dispatch table | 🔴 HIGH | Some step types (fan-out, if/then) may break |
| State Manager | Persistence | 🟡 MEDIUM | Run state format may become incompatible |
| Status transitions | Enums | 🟡 MEDIUM | Running workflows may hang if status undefined |

**Mitigation**: Document step type interface; version run state schema.

---

### When Integration Runtime Changes

| Affected Component | Impact Type | Severity | Recovery |
|-------------------|------------|----------|----------|
| 30+ Agent Handlers | Plugin interface | 🔴 HIGH | All integrations may fail |
| Workflow Engine | Step execution | 🔴 HIGH | Workflows cannot execute agent steps |
| Option Resolver | Configuration | 🟡 MEDIUM | Integration options may become invalid |

**Mitigation**: Stable `IntegrationBase` interface; version agent SDKs separately.

---

### When Auth Manager Changes

| Affected Component | Impact Type | Severity | Recovery |
|-------------------|------------|----------|----------|
| Catalog fetchers | Remote access | 🟡 MEDIUM | Cannot fetch authenticated catalogs |
| Auth Config | Persistence | 🟡 MEDIUM | User credentials may become unreadable |
| Host pattern validation | Security | 🟡 MEDIUM | May allow/block unexpected patterns |

**Mitigation**: Keep auth.json format stable; validate host patterns thoroughly.

---

### When Registry Format Changes (Critical)

| Affected Component | Impact Type | Severity | Recovery |
|-------------------|------------|----------|----------|
| ALL subsystems | Persistence | 🔴 CRITICAL | All projects may become unreadable |
| CLI startup | Initialization | 🔴 CRITICAL | CLI may fail to load project state |

**Mitigation**: 
- ⛔ Registry schema version LOCKED at '1.0'
- ⛔ Any v2.0 requires migration script
- ✅ Resilient load: missing fields return defaults
- ✅ Deep-copy on read: prevent external mutation

---

## Data Flow Impact Chains

### Scenario 1: Add New Extension Command Type

**Change**: Add `http-request` command type to extension manifest  
**Impact Chain**:

```
Extension manifest (new type)
  ↓ → Extension Manager: validate
  ↓ → Command Registrar: register
  ↓ → Agent Manager: render command
  ↓ → AI Agents: new command available
  ↓ → Workflows: can call new command
  ↓ → Workflow Engine: executes command
  ↓ → Integration Runtime: translates to agent
  ↓ → AI Agent (e.g. Claude): executes
```

**Risk Level**: 🟡 MEDIUM (extension-scoped, doesn't affect core)  
**Test Coverage**: Extension validation tests, command registration tests

---

### Scenario 2: Change Template Resolution Priority

**Change**: Swap priority of Extension layer (3) and Preset layer (2) in 4-level stack  
**Impact Chain**:

```
Preset Manager: Template Resolver
  ↓ → Layer lookup order changes
  ↓ → Different template selected for same name
  ↓ → Affected projects: those with overlapping names in both layers
  ↓ → User sees different behavior from custom templates
  ↓ → Workflows may generate different output
```

**Risk Level**: 🔴 HIGH (affects template resolution globally)  
**Mitigation**: Version the resolution algorithm; provide migration guide

---

### Scenario 3: Add New Integration (e.g., New AI Agent)

**Change**: Add handler for new agent (e.g., `AnthropyIntegration`)  
**Impact Chain**:

```
Int Runtime: New agent handler
  ↓ → Implements IntegrationBase interface
  ↓ → Workflow steps can specify this agent
  ↓ → Option Resolver: validates agent-specific options
  ↓ → Workflow execution: can use new agent
  ↓ → No impact on existing workflows (backward compatible)
```

**Risk Level**: 🟢 LOW (additive, no breaking changes)  
**Test Coverage**: Agent integration tests, option validation tests

---

### Scenario 4: Fix Bug in Hook Execution

**Change**: Fix condition evaluation in `HookExecutor`  
**Impact Chain**:

```
Hook Executor: Condition evaluation bugfix
  ↓ → Existing hooks may execute when they didn't before (or vice versa)
  ↓ → Affected projects: those with hooks whose conditions were previously broken
  ↓ → User sees different behavior (fixed hooks now trigger)
  ↓ → Potential side effects: hooks may have unintended state changes
```

**Risk Level**: 🟡 MEDIUM (behavioral change, not breaking)  
**Mitigation**: Document fix; consider feature flag for gradual rollout

---

## Component Stability Ranking

| Component | Stability | Reason | Last Changed |
|-----------|-----------|--------|--------------|
| **CLI Router** | ★★★★★ | Core dispatch logic, rarely changes | Archaeologist (2026-05-18) |
| **Auth Manager** | ★★★★☆ | Security-critical, opt-in, stable | Detective (2026-05-18) |
| **Registry Format** | ★★★★★ | Locked at v1.0, backward compatibility critical | Scout (2026-05-16) |
| **Template Resolver** | ★★★★☆ | Algorithm stable, 4-level stack mature | Archaeologist (2026-05-18) |
| **Extension Manager** | ★★★☆☆ | Plugin system, frequent extensions added | Archaeologist (2026-05-18) |
| **Preset Manager** | ★★★☆☆ | Template composition, active development | Archaeologist (2026-05-18) |
| **Workflow Engine** | ★★★☆☆ | Step types evolving, control-flow complex | Archaeologist (2026-05-18) |
| **Integration Runtime** | ★★☆☆☆ | 30+ agents, frequent updates | Detective (2026-05-18) |
| **Agent Handlers** | ★★☆☆☆ | Tied to agent releases, rapid iteration | Detective (2026-05-18) |

---

## Critical Paths for Testing

### Path 1: Extension Installation & Command Registration

```
Extension manifest (invalid YAML)
  → Extension Manager validation MUST catch
  → Prevent corrupted registry entry
  → Prevent command shadowing
  ✓ Test: Invalid manifest → ValidationError
  ✓ Test: Conflict detection → Rejection
```

### Path 2: Preset Template Composition

```
Preset A (priority 5): template "spec" with strategy "wrap"
Preset B (priority 10): template "spec" with strategy "replace"
Core: template "spec" with base content
  → Resolver MUST respect priority (lower wins)
  → Composer MUST apply wrap strategy correctly
  → Result: Preset A wraps Core (Preset B ignored)
  ✓ Test: Priority ordering → Preset A selected
  ✓ Test: Wrap strategy → Content correct
  ✓ Test: Core placeholder substitution → Works
```

### Path 3: Workflow Execution & Step Status

```
Step 1: command (completes)
Step 2: if/then (condition true)
Step 3: fan-out (3 items)
Step 4: fan-in (aggregates results)
Step 5: prompt to AI agent
  → Each status transition MUST be valid
  → Fan-out results MUST be accessible to fan-in
  → AI agent output MUST be captured
  ✓ Test: Status graph → Valid transitions
  ✓ Test: Fan-out/fan-in → Correct aggregation
  ✓ Test: Context passing → Results available
```

### Path 4: Authentication & Catalog Fetch

```
Auth config: host="github.com", provider="github", token_env="GITHUB_TOKEN"
Catalog URL: "https://raw.githubusercontent.com/github/spec-kit/main/..."
  → Auth MUST resolve token from environment
  → Request MUST include Authorization header
  → HTTPS MUST be enforced (no http except localhost)
  ✓ Test: Token resolution → Correct env var
  ✓ Test: Header construction → Bearer token format
  ✓ Test: HTTPS validation → Reject http (except localhost)
```

---

## Architectural Decision Records (ADRs) Impacting Components

| ADR | Decision | Impacted Component | Trade-off |
|-----|----------|-------------------|-----------|
| **ADR-001** | Opt-in authentication (no auto-escalation) | Auth Manager | ❌ Less convenient; ✅ Secure by default |
| **ADR-002** | Composable preset templates (4-level stack) | Preset Manager | ❌ Complexity; ✅ Flexibility |
| **ADR-003** | 30+ agent integrations (plugin architecture) | Int Runtime | ❌ Maintenance overhead; ✅ Multi-vendor |
| **ADR-004** | Registry schema locked at v1.0 (no forward compat) | All subsystems | ❌ Inflexible; ✅ Simplicity |
| **ADR-005** | Workflow state persisted to registry (resumable) | Workflow Engine | ❌ Stale state risk; ✅ Pause/resume capability |
| **ADR-006** | Templates layer non-destructively (prepend/append) | Preset Manager | ❌ Algorithm complexity; ✅ Composability |

---

## Risk Assessment

### High-Risk Changes (🔴)

| Change Type | Reason | Mitigation |
|------------|--------|-----------|
| Registry schema modification | All projects affected | Version-locked; migration script required |
| Template resolution algorithm | Changes default behavior | Extensive testing; feature flag for rollout |
| Step status transitions | May break running workflows | Document valid transitions; versioned state |
| Integration interface change | All 30+ agents affected | Stable `IntegrationBase`; version SDKs |

### Medium-Risk Changes (🟡)

| Change Type | Reason | Mitigation |
|------------|--------|-----------|
| Extension manifest constraints | May invalidate existing extensions | Backward compatibility; deprecation period |
| Preset composition strategies | May change template resolution | Extensive testing; user communication |
| Hook event names | May disable existing hooks | Add new events; deprecate old ones |
| Auth scheme addition | Credential handling | Security audit; opt-in |

### Low-Risk Changes (🟢)

| Change Type | Reason | Mitigation |
|------------|--------|-----------|
| New integration (additive) | No breaking changes | Standard testing |
| New step type (additive) | Backward compatible | Step registry tests |
| New template type | Non-breaking extension | Schema tests |
| Performance optimization | Internal only | Regression testing |

---

## Component Interaction Strength

```
Strong Coupling (❌ Avoid):
  CLI ↔ Ext Manager (command dispatch is tightly coupled)
  Workflow ↔ Int Runtime (step execution is tightly coupled)
  Preset Manager ↔ Registry (persistence is tightly coupled)

Moderate Coupling (⚠️  Monitor):
  Ext Manager ↔ Command Registrar (plugin communication)
  Preset Manager ↔ Template Resolver (resolution logic)
  Workflow ↔ State Manager (persistence)

Weak Coupling (✅ Good):
  Int Runtime ↔ Agent Handlers (plugin interface)
  Workflow ↔ Extensions (indirect via commands)
  Auth Manager ↔ Catalog Fetchers (auth provider abstraction)
```

---

## Testing Priorities

1. **Registry corruption resilience** — Data loss risk
2. **Template resolution stack** — Affects all template users
3. **Workflow status transitions** — Affects workflow resumability
4. **Extension conflict detection** — Prevents shadowing attacks
5. **Authentication header generation** — Security risk
6. **Integration interface compatibility** — Affects 30+ agents
7. **Hook condition evaluation** — Event-driven behavior
8. **Catalog fetching & caching** — Network reliability

