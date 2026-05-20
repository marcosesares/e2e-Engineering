# Ralph — Code Analysis

**Generated:** 2026-05-20  
**Project:** Ralph  
**Primary Language:** TypeScript / React  
**Doc Level:** Completo

---

## Executive Summary

Ralph is a **framework for autonomous AI agent loops** that implements features from Product Requirements Documents (PRDs). The codebase is lightweight:
- **Flowchart module:** Interactive React/Vite visualization (1 main component, ~380 lines)
- **Skills module:** 2 skill definitions (PRD generation, PRD-to-JSON conversion)
- **Agent framework:** Reversa framework installed (.claude, .agents directories)
- **CI/CD:** GitHub Actions workflow for GitHub Pages deployment

**No backend, database, or API** — Ralph is a pure **framework/tool** with a static SPA frontend.

---

## Module: Flowchart

### Purpose
Interactive visualization of Ralph's autonomous agent loop. Teaches users how Ralph works by stepping through each phase of execution.

### Architecture

**Technology Stack:**
- React 19.2.0 with StrictMode
- @xyflow/react 12.10.0 (flowchart visualization)
- Vite 7.2.4 (bundler)
- TypeScript 5.9.3

**Key Components:**

#### 1. App Component (App.tsx, ~380 lines)
Core component managing the entire flowchart.

**State:**
- `visibleCount: number` — tracks which steps are shown (1-10)
- `nodes: Node[]` — ReactFlow node objects
- `edges: Edge[]` — ReactFlow edge objects
- `nodePositions: Map<string, { x, y }>` — persistent node coordinates

**Data Models:**

```typescript
type Phase = 'setup' | 'loop' | 'decision' | 'done';

// Step definitions (10 steps)
allSteps: { id, label, description, phase }[]
  - Setup (3 steps): PRD writing, conversion, loop startup
  - Loop (5 steps): AI picks story → implements → commits → updates → logs
  - Decision (1 step): "More stories?"
  - Done (1 step): Complete

// Phase colors
phaseColors: Record<Phase, { bg: string; border: string }>
  - setup: light blue (#f0f7ff)
  - loop: gray (#f5f5f5)
  - decision: yellow (#fff8e6)
  - done: green (#f0fff4)

// Annotated notes (2 notes)
notes: {
  id, appearsWithStep, position, color, content
}
  - Note 1: PRD format (appears at step 2)
  - Note 2: AGENTS.md updates (appears at step 8)

// Edge connections (9 edges)
edgeConnections: { source, target, sourceHandle, targetHandle, label }[]
```

**Control Flow:**

```
User clicks "Next" 
  → visibleCount++
  → Recalculate nodes (opacity based on visibleCount)
  → Recalculate edges (animated if both source & target visible)
  → Render

User clicks "Previous"
  → visibleCount--
  → Same recalculation

User clicks "Reset"
  → visibleCount = 1
  → Reset node positions to defaults
  → Hide all edges
```

**Main Functions:**

| Function | Input | Output | Logic |
|----------|-------|--------|-------|
| `createNode(step, visible, position?)` | Step data, visibility flag | Node object | Builds @xyflow Node with phase colors, position, opacity |
| `createEdge(conn, visible)` | Edge connection, visibility | Edge object | Builds @xyflow Edge with animated stroke, arrow marker |
| `createNoteNode(note, visible)` | Note data, visibility | Node object | Special node type for annotations (unconnectable) |
| `getEdgeVisibility(conn, count)` | Connection, step count | boolean | Checks if both source & target steps are < count |
| `handleNext()` | — | none | Increments visibleCount, updates all nodes/edges |
| `handlePrev()` | — | none | Decrements visibleCount, updates all nodes/edges |
| `handleReset()` | — | none | Resets visibleCount to 1, positions to defaults |

**Custom Node Types:**

```typescript
CustomNode({ data: { title, description, phase } })
  - Renders colored box with title + description
  - 8 handles (top, bottom, left, right × source/target)
  - Dynamic border/background color based on phase

NoteNode({ data: { content, color } })
  - Renders monospaced code/note box
  - Non-draggable annotation
```

**Algorithms & Logic:**

1. **Visibility Cascade** (🟢 CONFIRMADO)
   - visibleCount controls which nodes render
   - Each node's opacity is set based on: `visible ? 1 : 0`
   - Prevents user interaction on hidden nodes via `pointerEvents: 'none'`
   - Used for progressive disclosure of the flowchart

2. **Edge Visibility Matching** (🟢 CONFIRMADO)
   - An edge animates if AND ONLY IF both its source and target steps are visible
   - Formula: `sourceIndex < visibleCount AND targetIndex < visibleCount`
   - Prevents floating edges or disconnected nodes

3. **Circular Loop Routing** (🟢 CONFIRMADO)
   - Loop structure: steps 4→5→6→7→8→9 then back to 4 (if "Yes")
   - Also 9→10 (if "No")
   - Uses different handles per connection (sourceHandle, targetHandle) to avoid crossing lines
   - Position layout: left column (setup), centered loop, bottom (done)

4. **Position Tracking** (🟢 CONFIRMADO)
   - `nodePositions.current` persists user drag positions across renders
   - `onNodesChange` intercepts position events and stores them
   - Allows users to rearrange flowchart and have layout persist during session

**Configuration Constants:**

```typescript
nodeWidth = 240      // Fixed width for all step nodes
nodeHeight = 70      // Fixed height for all step nodes

positions: Map<nodeId, { x, y }> = { ... }  // Default positions for all nodes
```

**Styling:**

- Global: `App.css` (custom styles for header, controls, instructions)
- @xyflow CSS imported directly
- Inline styles for phase colors, opacity transitions

---

## Module: Skills

### Purpose
Skill definitions for PRD management within Claude Code / Amp ecosystem.

### Contents

#### 1. PRD Skill (`skills/prd/SKILL.md`)
- **Trigger:** "create a prd", "write prd for", "plan this feature"
- **Output:** `tasks/prd-[feature-name].md`
- **Role:** Initial requirements writing

#### 2. Ralph Skill (`skills/ralph/SKILL.md`)
- **Trigger:** "convert this prd", "turn into ralph format", "create prd.json"
- **Output:** `prd.json`
- **Role:** Convert markdown PRD → JSON format with user stories
- **Story size rule:** Each story must fit in ONE context window

**PRD Format (JSON):**
```json
{
  "project": "string",
  "branchName": "string (ralph/feature-name-kebab)",
  "description": "string",
  "userStories": [
    {
      "id": "US-001",
      "title": "string",
      "description": "As a ... I want ... so that ...",
      "acceptanceCriteria": ["...", "..."],
      "priority": 1-3,
      "passes": boolean
    }
  ]
}
```

---

## Module: .claude & .agents

### Purpose
Reversa framework installation — 40+ specialized agents for code analysis.

### Structure

Both `.claude/` and `.agents/` contain identical copies of:
- `reversa/` — Main orchestrator
- `reversa-scout/` — Surface mapping
- `reversa-archaeologist/` — Code analysis
- `reversa-detective/` — Business rules extraction
- `reversa-architect/` — Architecture diagrams
- `reversa-writer/` — Spec generation
- `reversa-reviewer/` — Quality review
- ~34 additional specialized agents

**Reversa State Files:**
- `.reversa/state.json` — Execution state, checkpoints
- `.reversa/config.toml` — Project config, analysis decisions
- `.reversa/config.user.toml` — User overrides
- `.reversa/plan.md` — Task list by phase
- `.reversa/version` — Installed version (1.2.43)

---

## Module: .github

### Purpose
CI/CD configuration for GitHub Actions.

### Workflow: Deploy to GitHub Pages

**File:** `.github/workflows/deploy.yml`

**Trigger:**
- Push to `main` branch
- Manual `workflow_dispatch`

**Stages:**

1. **Build** (runs-on: ubuntu-latest)
   - Checkout (v4)
   - Setup Node 20 with npm caching
   - `npm ci` in `flowchart/`
   - `npm run build` → TypeScript compile + Vite bundle → `dist/`

2. **Deploy** (needs: build)
   - Configure GitHub Pages
   - Upload artifact from `flowchart/dist`
   - Deploy to GitHub Pages at `/ralph/`

**Permission Model:**
- contents: read
- pages: write
- id-token: write

**Concurrency:**
- Group: `pages`
- Cancel in-progress if new push arrives

---

## Data Structures

### Flowchart Data Dictionary

| Field | Type | Values | Required | Purpose |
|-------|------|--------|----------|---------|
| `visibleCount` | number | 1–10 | yes | Controls which steps render in flowchart |
| `nodes` | Node[] | @xyflow Node[] | yes | Rendered step boxes in flowchart |
| `edges` | Edge[] | @xyflow Edge[] | yes | Connections between nodes |
| `nodePositions` | Map<string, Pos> | { x: num, y: num } | yes | User-dragged node coordinates |
| `Phase` | string literal | setup, loop, decision, done | yes | Visual phase grouping |
| `Step.id` | string | "1"–"10" | yes | Unique step identifier |
| `Step.label` | string | "You write a PRD" | yes | User-visible step label |
| `Step.description` | string | "Define what you want to build" | yes | Sub-text explanation |
| `Note.appearsWithStep` | number | 2, 8 | yes | Step number when note appears |
| `Edge.sourceHandle` | string | top, bottom, left, right, left-source, bottom-target | no | Attachment point on source node |
| `Edge.targetHandle` | string | same as above | no | Attachment point on target node |
| `Edge.label` | string | "Yes", "No" | no | Decision label |

### PRD Data Dictionary

| Field | Type | Example | Required |
|-------|------|---------|----------|
| `project` | string | "ralph" | yes |
| `branchName` | string | "ralph/add-auth" | yes |
| `userStories[].id` | string | "US-001" | yes |
| `userStories[].title` | string | "Add login form" | yes |
| `userStories[].priority` | number | 1 (high) | yes |
| `userStories[].passes` | boolean | false | yes |
| `userStories[].acceptanceCriteria` | string[] | ["Typecheck passes", "Tests pass"] | yes |

---

## External Dependencies

### Flowchart Runtime Dependencies
- `react@19.2.0` — UI framework
- `react-dom@19.2.0` — DOM renderer
- `@xyflow/react@12.10.0` — Flowchart library

### Dev Dependencies
- `typescript@~5.9.3`
- `vite@7.2.4`
- `eslint@9.39.1`
- `@types/react@19.2.5`

**Dependency Relationships:**
```
App.tsx
  ├── @xyflow/react (flowchart rendering)
  ├── React (hooks, components)
  └── App.css (styling)

main.tsx
  ├── React (createRoot)
  └── App.tsx
```

---

## Algorithms & Business Logic

### 1. Progressive Disclosure (🟢 CONFIRMADO)
**Purpose:** Teach users Ralph's flow step-by-step  
**Algorithm:**
```
visibleCount = 1
FOR step in [1..10]:
  IF step <= visibleCount:
    opacity = 1 (visible)
    pointerEvents = auto
  ELSE:
    opacity = 0 (hidden)
    pointerEvents = none
RENDER all nodes with calculated opacity
```
**Complexity:** O(n) where n=10 steps

### 2. Conditional Visibility (🟢 CONFIRMADO)
**Purpose:** Show edges only when both endpoints are visible  
**Algorithm:**
```
FOR each edge in edgeConnections:
  sourceIdx = findIndex(source)
  targetIdx = findIndex(target)
  IF sourceIdx < visibleCount AND targetIdx < visibleCount:
    edge.animated = true
    edge.opacity = 1
  ELSE:
    edge.animated = false
    edge.opacity = 0
```
**Complexity:** O(e) where e=9 edges

### 3. Phase Color Mapping (🟢 CONFIRMADO)
**Purpose:** Visual categorization of steps  
**Data Structure:**
```typescript
Record<Phase, { bg: string, border: string }>
```
**Lookup:** O(1) constant time

---

## Confidence Levels

| Component | Level | Notes |
|-----------|-------|-------|
| App.tsx main logic | 🟢 Confirmed | Code clearly visible |
| Flowchart interactions | 🟢 Confirmed | onClick handlers present |
| Node/Edge creation | 🟢 Confirmed | Factory functions clear |
| @xyflow integration | 🟢 Confirmed | Standard usage patterns |
| Skills definitions | 🟢 Confirmed | SKILL.md files readable |
| CI/CD workflow | 🟢 Confirmed | YAML file complete |
| Reversa framework | 🟡 Inferred | Installed, structure visible, detailed config not analyzed |
| Potential edge cases | 🔴 Unknown | Runtime behavior with extreme counts, network edge cases |

---

## Known Complexity Areas

1. **Handle Routing:** 8 handles per custom node to avoid edge crossing — may be fragile if node positions change significantly
2. **Position Persistence:** Relies on `nodePositions.current` to survive re-renders — could lose state if component unmounts
3. **No Undo/Redo:** User rearrangement is immediate and irreversible during session
4. **Static Step Count:** Hardcoded 10 steps; adding new steps requires code change

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| **Total TypeScript files** | 2 (.tsx) |
| **Lines of code (App.tsx)** | ~380 |
| **React components** | 3 (App, CustomNode, NoteNode) |
| **@xyflow Node types** | 2 (custom, note) |
| **Flowchart steps** | 10 |
| **Flowchart edges** | 9 |
| **Skill modules** | 2 |
| **CI/CD workflows** | 1 |
| **Package manager** | npm |

