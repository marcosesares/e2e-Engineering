# Flowchart — Tasks

## Prerequisites

- [ ] React 19.2.0, @xyflow/react 12.10.0 installed in `flowchart/`
- [ ] TypeScript 5.9.3 configured (tsconfig.json)
- [ ] Vite dev server runnable via `npm run dev`
- [ ] ESLint 9.39.1 installed and passing

## Tasks

- [ ] **T-01: Create App component structure**
  - Origin: `flowchart/src/App.tsx` lines 1–50
  - Implement React functional component with useState hooks for `visibleCount` and `nodePositions`
  - Criterion: Component mounts without errors; initial visibleCount = 1
  - Confidence: 🟢

- [ ] **T-02: Define step data (10 steps)**
  - Origin: `flowchart/src/App.tsx` lines 50–150
  - Create `allSteps` array with id, label, description, phase for each of 10 steps
  - Criterion: Array has 10 entries; each step has required fields
  - Confidence: 🟢

- [ ] **T-03: Define phase colors**
  - Origin: `flowchart/src/App.tsx` lines 150–170
  - Create `phaseColors` record mapping phase → {bg, border} hex colors
  - Criterion: setup (blue), loop (gray), decision (yellow), done (green) render correctly
  - Confidence: 🟢

- [ ] **T-04: Implement createNode function**
  - Origin: `flowchart/src/App.tsx` lines 170–220
  - Generate @xyflow Node object from step data; apply opacity based on visibleCount; set position from nodePositions map or default
  - Criterion: Nodes render at correct size (240×70), correct colors, correct opacity
  - Confidence: 🟢

- [ ] **T-05: Implement createEdge function**
  - Origin: `flowchart/src/App.tsx` lines 220–270
  - Generate @xyflow Edge object; set animated stroke if both source/target visible; use correct sourceHandle/targetHandle for loop routing
  - Criterion: Edges animate only when both endpoints visible; loop-back edge routes on right side
  - Confidence: 🟢

- [ ] **T-06: Implement createNoteNode function**
  - Origin: `flowchart/src/App.tsx` lines 270–300
  - Generate special non-draggable Node for annotations; set position relative to step; apply note color
  - Criterion: Notes appear at correct steps (2, 8); text renders in monospace
  - Confidence: 🟢

- [ ] **T-07: Implement getEdgeVisibility function**
  - Origin: `flowchart/src/App.tsx` lines 300–310
  - Return boolean: (sourceIndex < visibleCount) AND (targetIndex < visibleCount)
  - Criterion: Function correctly gates 9 edges based on current visibleCount
  - Confidence: 🟢

- [ ] **T-08: Implement handleNext function**
  - Origin: `flowchart/src/App.tsx` lines 310–320
  - Increment visibleCount by 1 (cap at 10); trigger re-render of nodes/edges
  - Criterion: Clicking "Next" button increments count; new nodes become visible
  - Confidence: 🟢

- [ ] **T-09: Implement handlePrev function**
  - Origin: `flowchart/src/App.tsx` lines 320–330
  - Decrement visibleCount by 1 (floor at 1); trigger re-render
  - Criterion: Clicking "Previous" decrements count; nodes fade out
  - Confidence: 🟢

- [ ] **T-10: Implement handleReset function**
  - Origin: `flowchart/src/App.tsx` lines 330–340
  - Reset visibleCount to 1; clear nodePositions map; trigger re-render
  - Criterion: Clicking "Reset" returns flowchart to initial state; all custom positions lost
  - Confidence: 🟢

- [ ] **T-11: Implement custom node types (CustomNode, NoteNode)**
  - Origin: `flowchart/src/App.tsx` lines 340–400
  - Render colored boxes with title/description and handles for CustomNode; render monospace box for NoteNode
  - Criterion: Nodes display correctly; handles are positioned for @xyflow routing
  - Confidence: 🟢

- [ ] **T-12: Integrate @xyflow ReactFlow component**
  - Origin: `flowchart/src/App.tsx` lines 400–450
  - Render ReactFlow with nodes, edges, nodeTypes, edgeTypes, fitView; connect onNodesChange to persist positions
  - Criterion: Flowchart renders in ReactFlow container; drag-drop works; edges animate
  - Confidence: 🟢

- [ ] **T-13: Create control buttons (Next, Previous, Reset)**
  - Origin: `flowchart/src/App.tsx` lines 450–500
  - Render 3 buttons with onClick handlers calling handleNext, handlePrev, handleReset
  - Criterion: Buttons visible above flowchart; each button triggers correct action
  - Confidence: 🟢

- [ ] **T-14: Style App container and controls**
  - Origin: `flowchart/src/App.css` lines 1–100
  - Define CSS for header, button group, flowchart container, responsive layout
  - Criterion: Controls and flowchart layout correctly; buttons are clickable; no layout breaks
  - Confidence: 🟢

## Test Tasks

- [ ] **TT-01: Happy path — step through flowchart**
  - Render component; click "Next" 10 times; all steps become visible in order
  - Expected: visibleCount progresses 1→10; edges animate as expected
  - Confidence: 🟢

- [ ] **TT-02: Reverse navigation**
  - Render with visibleCount = 10; click "Previous" 10 times; return to initial state
  - Expected: visibleCount regresses 10→1; hidden nodes fade out; edges disappear
  - Confidence: 🟢

- [ ] **TT-03: Reset action**
  - Render; click "Next" 5 times; drag a node to new position; click "Reset"
  - Expected: visibleCount = 1; node returns to default position
  - Confidence: 🟢

- [ ] **TT-04: Drag-drop persistence**
  - Render; drag nodes to custom positions; verify positions persist across re-renders (state persists)
  - Expected: nodePositions map updated; subsequent renders respect stored positions
  - Confidence: 🟡

- [ ] **TT-05: Edge animation timing**
  - Render; click "Next" once; verify edge (setup-1→setup-2) animates; click "Previous"; verify edge stops animating
  - Expected: Animated stroke only visible when both endpoints are visible
  - Confidence: 🟢

## Tasks Order

1. **T-01 through T-07:** Foundation (data structures, helper functions) — no blocking dependencies
2. **T-08 through T-10:** Event handlers — depends on T-01 (visibleCount state)
3. **T-11 through T-13:** Integration — depends on T-04, T-05, T-06 (node/edge creators)
4. **T-14:** Styling — no blocking dependencies; can run in parallel with T-08–T-13

**Suggested sequence:** T-01 → T-02 → T-03 → {T-04, T-05, T-06, T-07 in parallel} → T-08 → T-09 → T-10 → T-11 → T-12 → T-13 → T-14

## Open Gaps (🔴)

- **Keyboard navigation:** No spec for Next/Prev via arrow keys or keyboard shortcuts. Requires UX review.
- **Mobile responsiveness:** No viewport meta tag or CSS media queries documented. Flowchart may not render correctly on mobile.
- **Persistence across page reloads:** No localStorage/sessionStorage implementation detailed. Positions lost on refresh.
- **Animation performance:** No performance benchmarks for 10+ nodes on slow devices. May require optimization.
