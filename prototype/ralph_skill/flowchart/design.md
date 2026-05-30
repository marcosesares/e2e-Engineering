# Flowchart — Design

## Interface

No explicit API. React component accepts no props (self-contained). Exports single component `<App />` as SPA entry point.

**Internal State:**
```typescript
visibleCount: number          // Step progression counter (1–10)
nodes: Node[]                 // @xyflow Node objects with phase colors
edges: Edge[]                 // @xyflow Edge objects with animated strokes
nodePositions: Map<string, {x, y}>  // Persisted drag positions
```

**User Controls:**
- Button: "Next" → increment visibleCount
- Button: "Previous" → decrement visibleCount
- Button: "Reset" → reset to initial state
- Draggable: node repositioning stored in nodePositions

## Flowchart Structure

**10 Steps (Phase-colored):**

| Step | ID | Title | Phase | Description |
|------|----|----|-------|------|
| 1 | setup-1 | Write PRD | setup | User defines product requirements in Markdown |
| 2 | setup-2 | Convert to JSON | setup | Ralph skill transforms Markdown → `prd.json` |
| 3 | setup-3 | Start Loop | setup | Launch `ralph.sh` with tool (amp/claude) |
| 4 | loop-1 | Pick Story | loop | Agent selects highest-priority story where `passes: false` |
| 5 | loop-2 | Implement | loop | Agent writes code for chosen story |
| 6 | loop-3 | Test & Commit | loop | Agent runs quality checks; commits if passing |
| 7 | loop-4 | Update PRD | loop | Agent sets `passes: true` for completed story |
| 8 | loop-5 | Log Progress | loop | Agent appends learnings to `progress.txt` |
| 9 | decision-1 | More Stories? | decision | Decision diamond: loop (if yes) or exit (if no) |
| 10 | done-1 | Complete | done | All stories complete; framework ready to use |

**Phase Colors:**
```typescript
phaseColors = {
  setup: { bg: '#f0f7ff', border: '#0066cc' },   // Light blue
  loop: { bg: '#f5f5f5', border: '#666666' },     // Gray
  decision: { bg: '#fff8e6', border: '#ff9900' }, // Yellow
  done: { bg: '#f0fff4', border: '#00aa00' }      // Green
}
```

## Flowchart Edges (9 connections)

| Source | Target | Label | Handle Logic |
|--------|--------|-------|-------|
| setup-1 → setup-2 | Sequential | — | top-to-bottom |
| setup-2 → setup-3 | Sequential | — | top-to-bottom |
| setup-3 → loop-1 | Entry | — | top-to-bottom |
| loop-1 → loop-2 | Sequential | — | left-side handles (avoid crossing) |
| loop-2 → loop-3 | Sequential | — | left-side |
| loop-3 → loop-4 | Sequential | — | left-side |
| loop-4 → loop-5 | Sequential | — | left-side |
| loop-5 → decision-1 | Sequential | — | left-to-right into diamond |
| decision-1 ⤴ (back to loop-1) | "Yes, more stories" | — | right-side loop-back |
| decision-1 → done-1 | "No, all done" | — | bottom path |

## Annotations (2 Notes)

| Note ID | Appears at Step | Position | Color | Content |
|---------|---|---|---|---|
| note-1 | Step 2 | Right of setup-2 | Light gray | `{ "project": "...", "userStories": [...], ... }` (PRD.json format) |
| note-2 | Step 8 | Right of loop-5 | Light gray | `## Codebase Patterns\n- Pattern 1\n- Pattern 2` (AGENTS.md snippet) |

## Key Algorithms

### 1. Visibility Cascade 🟢
```
When visibleCount changes:
  For each node:
    opacity = (nodeIndex < visibleCount) ? 1.0 : 0.0
    pointerEvents = (nodeIndex < visibleCount) ? 'auto' : 'none'
```
Ensures hidden steps don't intercept clicks.

### 2. Edge Visibility Matching 🟢
```
getEdgeVisibility(sourceIndex, targetIndex, visibleCount):
  return (sourceIndex < visibleCount) AND (targetIndex < visibleCount)

If true:
  animate edge with strokeDasharray animation
Else:
  do not render edge
```
Prevents floating or dangling edges.

### 3. Node Position Persistence 🟢
```
onNodesChange(changes):
  For each change:
    If change.type == 'position':
      nodePositions[change.id] = { x: change.position.x, y: change.position.y }

createNode(step, visibleCount, positionOverride?):
  If nodePositions[step.id] exists:
    Use nodePositions[step.id]
  Else:
    Use default position from allSteps
```

### 4. Circular Loop Routing 🟢
```
Loop cycle: steps 4 → 5 → 6 → 7 → 8 → 9
Back edge: 9 ⤴ 4 (if yes) using right-side handles
Forward edge: 9 → 10 (if no)

Use distinct sourceHandle/targetHandle per connection:
  Example: 9→4 uses sourceHandle='right-out', targetHandle='right-in'
  Prevents edge crossing with 9→10 path
```

## Dependencies

- **React 19.2.0:** Main framework; StrictMode enforces pure functions
- **@xyflow/react 12.10.0:** Node/edge rendering, drag-drop, animations, layout engine
- **Vite 7.2.4:** Dev server, bundler, HMR during development
- **TypeScript 5.9.3:** Type safety for node/edge definitions, event handlers
- **ESLint 9.39.1:** Code quality checks during dev

## Design Decisions Identified

| Decision | Rationale | Confidence |
|----------|-----------|-----------|
| 10 discrete steps (not variable) | Matches Ralph's fixed loop structure: setup (3) + loop (5) + decision (1) + done (1) | 🟢 |
| Phase-based coloring instead of priority | Helps users understand workflow phases (which steps are setup, which are repeatable) | 🟢 |
| Node drag-drop enabled | Users may want to rearrange for clarity; @xyflow supports it natively | 🟡 |
| Animated edges (not static) | Visual feedback that user is progressing through loop; improves UX | 🟡 |
| No keyboard shortcuts (MVP) | Touch/mouse-first design; keyboard nav can be added later | 🟢 |
| Custom node types (CustomNode, NoteNode) | Separates concerns: regular steps vs. annotations; easier to style | 🟢 |

## Observability

**Console Logs (inferred from common React patterns):**
- Likely logs on mount: "Flowchart initialized"
- Possibly logs on visibleCount change: `console.log('visibleCount:', visibleCount)`
- Possibly logs on position change: `console.log('Node moved:', nodeId, newPosition)`

**No formal metrics/tracing.** Component is stateless visualization; no performance instrumentation.

## Risks & Gaps

- 🔴 **Keyboard accessibility:** No keyboard nav (Next/Prev via keyboard). Users with mouse impairment cannot use flowchart.
- 🔴 **Mobile responsiveness:** Vite build targets desktop browsers. Flowchart likely not responsive to touch/mobile viewports.
- 🟡 **Position persistence across page reloads:** Session storage implementation unclear. User must not close page mid-exploration.
- 🟡 **Edge routing algorithm:** Right-side loop-back handle assignment may not be generalized; hard to extend to 12+ steps.
