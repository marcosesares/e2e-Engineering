# Superpowers — Architectural Specification

> **Project:** Superpowers  
> **Analysis Date:** 2026-05-17  
> **Doc Level:** Detalhado  
> **Architecture Pattern:** Skill-Driven Agent Behavior Shaping via Multi-Harness Plugin Architecture

---

## Executive Summary

Superpowers is a zero-dependency framework that shapes AI agent behavior during software development by distributing reusable process skills as markdown documents. The system operates across 6+ harnesses (Claude Code, Codex CLI/App, Cursor, OpenCode, Gemini CLI) via a plugin architecture that auto-triggers skills based on user intent.

**Core Thesis:** Process discipline (TDD, systematic debugging, design gates) is enforced through documentation, not code instrumentation. Skills are executable specifications that agents load in-context and follow because violation signals are clear and consequences are immediate.

**Key Constraint:** Zero external dependencies; skills work in any environment.

---

## System Context (C4 Level 1)

```
┌─────────────────────────────────────────┐
│         User (AI Agent / Human)         │
└────────────┬────────────────────────────┘
             │ Message / Intent
             ↓
┌─────────────────────────────────────────┐
│   Superpowers Plugin / Framework         │
│  (Auto-trigger skills, state management)│
└────────────┬────────────────────────────┘
             │ Skill workflow, process guidance
             ↓
┌─────────────────────────────────────────┐
│  Harness (Claude Code / Codex / etc.)   │
│ Provides tools: git, bash, file access  │
└────────────┬────────────────────────────┘
             │ Tool calls
             ↓
┌─────────────────────────────────────────┐
│    External Systems & Repositories      │
│  (Git, npm, file system, build tools)   │
└─────────────────────────────────────────┘
```

**Actors:**
- **User (AI Agent):** Claude or other LLM operating within a harness session, reading skills and executing workflows
- **Superpowers:** The skill framework, manages auto-trigger logic, state, skill lifecycle
- **Harness:** IDE/CLI (Claude Code, Codex App, Cursor, etc.) that provides tools and loads bootstrap
- **External Systems:** Git repositories, build tools, package managers, CI/CD

**Data Flow:**
1. User sends message (e.g., "Let's make a React todo list")
2. Harness loads `using-superpowers` bootstrap at session start
3. Bootstrap detects intent ("make → brainstorming trigger")
4. Superpowers loads `brainstorming` skill
5. Agent reads skill workflow (9-step process), executes design gates
6. On completion, skill invokes next skill (e.g., `writing-plans`)
7. Execution continues with checkpoints, state saved per session

---

## Container Architecture (C4 Level 2)

### Layers

```
┌──────────────────────────────────────────────────────────────────┐
│ Layer 1: Plugin / Bootstrap Integration                          │
├──────────────────────────────────────────────────────────────────┤
│  .claude-plugin/        .codex-plugin/        .cursor-plugin/    │
│  .opencode/             gemini-extension.json                    │
│  └─ Load bootstrap at session start (using-superpowers)          │
└───────────────┬────────────────────────────────────────────────┘
                │ Invoke based on trigger
┌───────────────▼────────────────────────────────────────────────┐
│ Layer 2: Skill Execution Engine                               │
├───────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ Skill Loader    │  │ Trigger Matcher  │  │ Gate Enforcer│ │
│  │ & Parser        │  │ (intent parsing) │  │ (hard gates) │ │
│  └─────────────────┘  └──────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ Context         │  │ Red Flag         │  │ Checkpoint   │ │
│  │ Injector        │  │ Detector         │  │ Saver        │ │
│  │ (codebase data) │  │ (anti-patterns)  │  │ (state mgmt) │ │
│  └─────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                 │
│  Skills: brainstorming, TDD, debugging, planning,             │
│  code-review, worktree, finishing-branch, compression          │
└───────────────┬────────────────────────────────────────────────┘
                │ Dispatch requests
┌───────────────▼────────────────────────────────────────────────┐
│ Layer 3: Agent & Worktree Orchestration                       │
├───────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐  ┌────────────────────────────┐ │
│  │ Subagent Dispatch System │  │ Git Worktree Manager       │ │
│  │ (spawn per-task agents)  │  │ (isolation, cleanup)       │ │
│  │ • SDD: fresh agent/task  │  │ • Detect existing env      │ │
│  │ • Parallel dispatch      │  │ • Create/remove worktrees  │ │
│  │ • Review loops           │  │ • Guard against nesting    │ │
│  └──────────────────────────┘  └────────────────────────────┘ │
└───────────────┬────────────────────────────────────────────────┘
                │ Tool calls (git, bash, file ops)
┌───────────────▼────────────────────────────────────────────────┐
│ Layer 4: Harness Tool Abstraction                             │
├───────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Git Tool │  │ Bash     │  │ File I/O │  │ Subagent     │  │
│  │(universal)  │ Tool     │  │(universal)  │ Spawn Tool   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
│              (via harness native APIs)                         │
└───────────────┬────────────────────────────────────────────────┘
                │
┌───────────────▼────────────────────────────────────────────────┐
│ Layer 5: External Systems                                      │
├───────────────────────────────────────────────────────────────┤
│  • Git repositories (local/remote)                              │
│  • File system, build tools, package managers                  │
│  • External APIs, CI/CD systems                                │
└───────────────────────────────────────────────────────────────┘
```

### Container Catalog

| Container | Responsibility | Technologies | Harness Provided |
|-----------|---|---|---|
| **Plugin Manifest** | Entry point per harness, bootstrap loader | JSON/YAML plugin config | Harness-specific (Claude Code plugin.json, Codex plugin.json, etc.) |
| **Skill Markdown Repository** | Version control, storage of all 21 skills | Git, Markdown, JSON frontmatter | Git repository (`.claude/skills/`, `.agents/skills/`, or symlink) |
| **Skill Execution Engine** | Load, parse, trigger, enforce gates, manage state | Markdown parser, state machine logic | Agent context (skills loaded as markdown into session context) |
| **Agent Dispatch System** | Spawn subagents for parallel/sequential task execution | Subagent spawning API, agent creation, review dispatch | Harness subagent tool (Claude Code Agent tool, Codex Agent dispatch, etc.) |
| **Git Worktree Manager** | Create/manage isolated workspaces, detect existing isolation | `git worktree add`, environment detection (`GIT_DIR` vs `GIT_COMMON`) | Harness worktree tools or git fallback |
| **Eval/Drill Framework** | Test skill behavior, measure effectiveness, tune content | Markdown test definitions, eval harness | `evals/` directory with test cases |
| **Session State Manager** | Persist checkpoints, skill history, user preferences | Checkpoint storage (`.reversa/state.json` or similar) | File I/O via harness |
| **Trigger Intent Matcher** | Parse user messages, match against trigger patterns | Natural language understanding (agent inference) | Agent reading skill trigger definitions |

---

## Component Architecture (C4 Level 3) — Skill Execution Engine

The core engine that makes skills work:

```
Skill Execution Engine
├── Skill Loader
│   ├── Locate skill file (find SKILL.md or use explicit /skill invocation)
│   ├── Parse SKILL.md frontmatter (metadata, triggers, dependencies)
│   ├── Load full skill content (phases, examples, red flags, gates)
│   └── Priority rules: explicit invocation > trigger match > fallback
│
├── Trigger Matcher
│   ├── Extract user intent from message (semantic, not keyword sniffing)
│   ├── Compare against trigger list in using-superpowers bootstrap
│   ├── Examples:
│   │   "let's make X" → brainstorming
│   │   "write code" / "implement" → TDD (if no design yet)
│   │   "test failed" / "error" → systematic-debugging
│   │   "need review" → requesting-code-review
│   │   "/skillname" → explicit override (highest priority)
│   └── Return matched skill ID + confidence
│
├── Context Injector
│   ├── Codebase context: file structure, recent commits, patterns
│   ├── Session context: current branch, checked-out files, test status
│   ├── User context: preferences, harness type, language
│   ├── Task context: current plan, checkpoint state
│   └── Inject all into skill presentation
│
├── Gate Enforcer (Hard Gates)
│   ├── TDD Red Phase: "No production code before failing test"
│   ├── Brainstorming: "No implementation until design approved"
│   ├── Debugging Phase 4: "Escalate to human after fix #3 fails"
│   ├── If gate violated: Show violation signal, ask for explicit consent
│   └── Log consent for audit trail
│
├── Red Flag Detector
│   ├── Monitor agent behavior against documented anti-patterns
│   ├── Example red flags in TDD:
│   │   "I'll test after" → reality check: "Tests after = what does this do?"
│   │   "Code before test" → "Delete & restart"
│   │   "Test passes immediately" → "Test was trivial, rewrite"
│   ├── Example red flags in debugging:
│   │   "Just try this fix" → "Investigate first"
│   │   "Multiple changes at once" → "One variable at a time"
│   ├── Agent reads table, self-corrects
│   └── If violation detected, ask: "Confirm intentional?" (soft gate)
│
├── Skill Renderer
│   ├── Format skill as readable workflow to agent
│   ├── Highlight current phase, next checkpoint
│   ├── Emphasize examples relevant to current code/language
│   └── Show gates & red flags for current phase
│
└── Checkpoint Saver
    ├── Persist session state at key moments:
    │   After skill completion, at major phase transitions
    ├── Save to checkpoint file (project-local, git-ignored)
    ├── Include: completed skills, pending skills, decisions made
    └── Allow resume in new session: `/resume` or skill re-invoke
```

---

## Entity Relationship Diagram (Logical Data Model)

```
┌─────────────────┐                  ┌──────────────────┐
│     Skill       │                  │  SkillTrigger    │
├─────────────────┤                  ├──────────────────┤
│ id (pk)         │                  │ id (pk)          │
│ name            │   1 ──→ * │ skill_id (fk)       │
│ description     │                  │ intent_pattern   │
│ category        │                  │ priority         │
│ version         │                  │ description      │
│ confidence      │                  └──────────────────┘
└────────┬────────┘
         │ 1 ──→ *
         │
┌────────▼──────────────┐            ┌──────────────────┐
│    SkillPhase        │            │   GateDefinition │
├──────────────────────┤            ├──────────────────┤
│ id (pk)              │ 1 ──→ *    │ id (pk)          │
│ skill_id (fk)        │   ├─ phase_id (fk) │
│ sequence_num         │    │ type: HARD|SOFT │
│ name                 │    │ trigger_state   │
│ description          │    │ description     │
│ entry_condition      │    │ requires_consent│
│ exit_condition       │    └──────────────────┘
└──────────────────────┘
         │ 1 ──→ *
         │
┌────────▼──────────────┐
│    RedFlag           │
├──────────────────────┤
│ id (pk)              │
│ phase_id (fk)        │
│ description          │
│ severity (HIGH|MED)  │
│ category             │
│ rationalization      │
│ reality_check        │
└──────────────────────┘

┌─────────────────────────┐
│  Session / Checkpoint   │
├─────────────────────────┤
│ id (pk)                 │
│ user_id                 │
│ harness_type            │
│ created_at              │
│ last_checkpoint_at      │
│ current_skill_id (fk)   │
│ current_phase           │
└─────────────────────────┘
         │ 1 ──→ *
         │
┌────────▼────────────────────┐
│  Checkpoint                 │
├─────────────────────────────┤
│ id (pk)                     │
│ session_id (fk)             │
│ timestamp                   │
│ completed_skill_ids []      │
│ pending_skill_ids []        │
│ decisions_made {}           │
│ artifacts_generated []      │
│ state_snapshot {}           │
└─────────────────────────────┘

┌────────────────────────┐
│   WorktreeContext      │
├────────────────────────┤
│ id (pk)                │
│ session_id (fk)        │
│ git_dir                │
│ git_common_dir         │
│ current_branch         │
│ isolation_level        │
│ is_linked_worktree     │
│ cleanup_strategy       │
└────────────────────────┘

┌────────────────────────┐
│   HarnessManifest      │
├────────────────────────┤
│ harness_name (pk)      │
│ supported_tools []     │
│ entry_point_path       │
│ plugin_config_path     │
│ bootstrap_path         │
│ env_detection_rules    │
└────────────────────────┘
```

**Key Relationships:**
- **Skill → Triggers:** 1-to-many (one skill, multiple ways to invoke)
- **Skill → Phases:** 1-to-many (sequential workflow)
- **Phase → Red Flags:** 1-to-many (multiple anti-patterns per phase)
- **Phase → Gates:** 1-to-many (multiple checkpoints possible)
- **Session → Checkpoints:** 1-to-many (multiple pauses/saves per session)
- **Session → Worktree Context:** 1-to-1 (each session has env state)

---

## Integration Points & Workflow Orchestration

### 1. Brainstorming → Writing Plans → Execution

```
User: "Let's build a feature X"
  ↓
[Trigger Matcher: intent="make" → brainstorming]
  ↓
[Skill Loader: load brainstorming/SKILL.md]
  ↓
Skill renders 9-step design workflow:
  Step 1-3: Explore context, ask questions
  Step 4: Propose 2-3 approaches
  Step 5-6: Write design doc
  Step 7-8: Self-review, user approval (HARD GATE)
  ↓ [Gate passed]
  Step 9: Invoke writing-plans
  ↓
[Skill Loader: load writing-plans/SKILL.md]
  ↓
Skill renders plan generation:
  - Extract architecture from design
  - Decompose into bite-sized tasks (≤2h each)
  - Add dependencies, estimates
  - Output: `docs/superpowers/specs/YYYY-MM-DD-<topic>-plan.md`
  ↓
Offer execution choice:
  a) Subagent-Driven (fresh subagent per task + review)
  b) Executing-Plans (sequential, same session)
```

### 2. Test-Driven Development Cycle

```
[Skill: TDD loaded at code-time]
  ↓
RED phase:
  - Agent writes failing test (VERIFY: test fails expected way)
  - Gate enforced: "No production code before test"
  ↓ [Test fails confirmed]
GREEN phase:
  - Agent writes minimal code (no refactoring)
  - Gate enforced: "Pass test, no new failures"
  ↓ [Test passes]
REFACTOR phase:
  - Agent cleans code (duplication removal, naming)
  - Gate enforced: "Tests still pass"
  ↓ [All tests pass]
DONE
  - Verify no regressions
  - Ready for merge
```

**Red Flag Examples (from skill):**
- "I'll test after" → "Tests after = what does this do? Tests-first = what should this do?"
- "Code before test" → "Delete & restart. Iron law."
- "Test passes immediately" → "Test was trivial or already implemented. Rewrite RED."

### 3. Systematic Debugging

```
Error detected:
  ↓
Phase 1: Root Cause Investigation
  - Read error message (file:line, code, type)
  - Reproduce consistently
  - Check recent changes (git diff)
  - Gather evidence at component boundaries
  - Trace data flow backward
  ↓ [Root cause hypothesis formed]
Phase 2: Pattern Analysis
  - Find working example in codebase
  - Identify differences (list every one)
  - Understand dependencies
  ↓
Phase 3: Hypothesis & Testing
  - Form single hypothesis: "X is root cause because Y"
  - Test with one variable change
  - Confirm before proceeding
  ↓
Phase 4: Implementation
  - Create failing test (reproduction)
  - Implement single fix
  - Verify (test passes, no regressions)
  - If fix #3+ fails: ESCALATE to human (architectural issue)
```

### 4. Subagent-Driven Development

```
Plan ready (tasks 1..N)
  ↓
For each task (sequential):
  a) Dispatch Implementer subagent
     - Fresh subagent, full task text
     - Implements, tests, commits
     - Awaits spec review
     ↓
  b) Dispatch Spec Reviewer subagent
     - Confirms code matches spec
     - No → Implementer fixes → re-review (loop until ✅)
     ↓
  c) Dispatch Quality Reviewer subagent
     - Approves code quality?
     - No → Implementer fixes → re-review
     - Yes → Mark task complete ✅
     ↓
[Next task, repeat a-c]
```

---

## External Integrations

### Harness Contracts

Each harness provides:

| Contract | Claude Code | Codex CLI | Codex App | Cursor | OpenCode | Gemini |
|----------|---|---|---|---|---|---|
| **Bootstrap Load** | Auto at session start | Auto at session start | Auto at session start | Via ext config | Config-based | CLI invocation |
| **Skill Location** | `.claude/skills/` or `.agents/skills/` | `.codex/skills/` or symlink | Similar to Codex CLI | `.cursor/` or symlink | Via `using-superpowers` | Package-based |
| **Subagent Tool** | `Agent` tool | Agent dispatch API | Native agent creation | Extension API | Native workflow | CLI spawn |
| **Worktree Tool** | `EnterWorktree` | Native UI or `git worktree` | Native managed worktrees | Via git | Native UI | `git worktree` fallback |
| **Git Tool** | `Bash` (git commands) | Native git or `Bash` | Native git UI | Native git | Native CLI | Bash |
| **File I/O** | `Read`, `Write`, `Edit` | File APIs | File UI | Native APIs | File CLI | Bash/Read/Write |
| **State Storage** | Project-local (git-ignored) | Project-local | Managed by harness | Project-local | Project-local | Project-local |

**Key Contract:** Bootstrap MUST auto-trigger `brainstorming` skill on message "Let's make a react todo list" — no manual steps, no opt-in, no wrapper scripts.

### CI/CD & External Services

**Connections (if present):**
- GitHub Actions (for skill eval drill runs)
- npm registry (for version checking, `npm view reversa`)
- Evaluation servers (for behavior metrics)

**Note:** Superpowers core has ZERO dependencies; external integrations are optional per-harness.

---

## Technical Debt & Constraints

### Known Limitations 🔴 LACUNA

1. **Caveman Mode Token Injection Mechanism**
   - How exactly tokens are counted per intensity level
   - Actual reduction measurements (claimed ~75%)
   - Implementation in harness (hook-based? context-based?)

2. **Hook Injection Implementation**
   - How .reversa/hooks.yml or settings.json hooks fire
   - Guard conditions, async handling, error recovery

3. **Agent Model Tuning**
   - Which Claude model for which role (implementer vs. reviewer)?
   - Model selection heuristics per task complexity

4. **Eval Methodology Details**
   - Complete drill framework specification
   - How to add new eval cases, run evals, measure lift

### Architectural Constraints (by design)

1. **Zero External Dependencies**
   - All behavior via markdown + documentation
   - No npm packages, language-specific runtimes, or third-party services
   - Exception: new harness support OK if platform-native

2. **Skill Content Is Immutable Without Evidence**
   - Red flags tables, process phases, gate definitions
   - Cannot be casually reworded
   - Change requires before/after eval evidence

3. **Hard Gates Are Non-Negotiable**
   - TDD RED phase, design approval, debugging escalation
   - Can only be waived with explicit human consent
   - Violations logged for audit trail

4. **Multi-Harness Complexity**
   - Each harness has different tool APIs, environment models
   - Skills must detect environment, adapt behavior, not fragment
   - Worktree isolation: GIT_DIR vs GIT_COMMON detection critical

---

## Deployment & Distribution

### Distribution Model

- **Repository:** GitHub (superpowers)
- **Entry Points:**
  - `.claude-plugin/plugin.json` → Claude Code harness
  - `.codex-plugin/plugin.json` → Codex CLI/App
  - `.cursor-plugin/` → Cursor IDE
  - `.opencode/` → OpenCode platform
  - `gemini-extension.json` → Gemini CLI
  - `.version-bump.json` → Factory Droid, GitHub Copilot CLI

- **Versioning:** Semantic versioning (package.json, .version-bump.json)
- **Update Mechanism:** `npx reversa update` (external tooling)

### Installation Variants

1. **Direct Plugin Install** (preferred)
   - User installs superpowers plugin in harness
   - Harness loads `.claude-plugin/plugin.json` or equiv
   - Bootstrap auto-triggers at session start

2. **Git Submodule / Symlink** (alternative)
   - User clones repo or adds as submodule
   - Skills at `.claude/skills/` or `.agents/skills/`
   - Same bootstrap contract

3. **CLI Wrapper** ❌ NOT supported
   - Manual copying of files → Not a real integration
   - `npx skills` shim → Dead weight
   - User opt-in per session → Violates contract

---

## Security & Governance

### Constraints

- **94% PR Rejection Rate:** Deliberate quality signal
- **No Fabricated Claims:** PRs with invented functionality closed immediately
- **Evidence Required:** All claims tested before PR submission
- **No Fork Merges:** Fork-specific customizations do not belong upstream

### Audit Trail

- All hard gate violations logged (timestamp, user, reason for override)
- Session checkpoints persist decisions made (useful for post-incident analysis)
- Eval results in `evals/` tied to git commits (traceability)

---

## Summary: Key Architectural Principles

| Principle | Rationale | Implementation |
|-----------|-----------|---|
| **Zero Dependencies** | Works anywhere; no installation friction | Pure markdown + documentation |
| **Skills as Code** | Behavior changes require evidence | High bar for skill modifications; eval framework |
| **Process Over Tools** | Discipline is portable; tools are not | TDD/debugging/verification gates in skill content |
| **Multi-Harness Agility** | Agents work everywhere | Environment detection, platform abstraction layer |
| **Hard Gates** | Prevents rationalization drift | Explicit consent required for override |
| **Documentation-Driven** | Context is king; agent reads skills mid-task | Bootstrap auto-trigger, in-context skill loading |
| **Checkpoint Persistence** | Survive session boundaries | Session state saved, resumable later |
| **Subagent Dispatch** | Parallel execution, quality gates | Fresh subagent per task + 2-stage review loop |

---

**End of Architecture Specification**
