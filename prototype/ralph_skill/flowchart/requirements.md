# Flowchart — Requirements

## Overview

Interactive visualization component that teaches users how Ralph's autonomous agent loop works. Step through each phase of execution (setup, loop, decision, completion) with animated nodes, edges, and annotations. Essential for onboarding new users to the Ralph framework.

## Scope (resolved gap Q2, 2026-05-19)

**The flowchart is an EDUCATIONAL artifact only.** It has zero runtime coupling with `ralph.sh`:
- It does NOT consume `progress.txt`
- It does NOT consume `prd.json`
- It does NOT control or monitor live agent iterations
- It does NOT receive websocket/polling events from the loop

It is a static SPA deployed to GitHub Pages whose sole purpose is documenting the conceptual 10-step Ralph loop for newcomers. Any spec language implying operational integration with `ralph.sh` is incorrect.

## Responsibilities

- Render 10-step visual flowchart representing Ralph's main loop
- Track step progression via "Next", "Previous", "Reset" controls
- Persist user-modified node positions during session
- Display phase-specific colors (setup, loop, decision, done) for visual clarity
- Show annotated notes at relevant steps (PRD format, AGENTS.md updates)
- Animate edges conditionally based on visible step count

## Business Rules

- Flowchart must show Ralph's loop as a decision tree: setup → loop (repeatable) → decision → done 🟢
- Loop structure: steps 4–9 form a cycle ("More stories?" → back to 4 or forward to done) 🟢
- Node positioning is draggable and must persist across renders within session 🟢
- Edges animate only if both source and target steps are visible 🟢
- All 10 steps must be visible when `visibleCount ≥ 10`; hidden steps have `opacity: 0` and `pointerEvents: 'none'` 🟢
- **Flowchart is decoupled from `ralph.sh`** — no runtime dependency, no shared state file 🟢 (Q2)

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| RF-01 | Render fixed-size step nodes (240×70px) | Must | Each step node displays exactly at specified dimensions; title + description visible |
| RF-02 | Support "Next" button to increment visible steps | Must | Clicking "Next" increments `visibleCount` by 1; nodes/edges update immediately |
| RF-03 | Support "Previous" button to decrement visible steps | Must | Clicking "Previous" decrements `visibleCount` by 1; nodes/edges update immediately |
| RF-04 | Support "Reset" button to restore initial state | Must | Clicking "Reset" sets `visibleCount = 1` and restores all nodes to default positions |
| RF-05 | Color nodes by phase (setup/loop/decision/done) | Must | Background and border colors match phase definitions; transitions smooth |
| RF-06 | Allow drag-and-drop repositioning of nodes | Should | User can drag nodes; new positions persist for session duration |
| RF-07 | Display annotated notes at specified steps | Should | 2 notes appear at steps 2 (PRD format) and 8 (AGENTS.md); non-draggable |
| RF-08 | Animate edges based on visibility of both endpoints | Should | Edge shows animated stroke only if source AND target visible; matching `getEdgeVisibility` logic |
| RF-09 | Support 8-handle custom nodes (top/bottom/left/right ×2) | Could | Nodes expose 8 connection points for routing; prevents overlapping edges |
| RF-10 | Preserve node layout across page reloads | Could | Session storage or localStorage for node positions; restore on mount |

## Non-Functional Requirements

| Type | Requirement | Evidence in Code | Confidence |
|------|-----------|--------------------|----------|
| Performance | Render 10 nodes + 9 edges + 2 notes without lag on modern browsers | `App.tsx` uses React 19 with memoization; @xyflow optimized for large graphs | 🟢 |
| Accessibility | Keyboard navigation not required for MVP; mouse-only interaction | No keyboard handlers in `App.tsx` | 🟡 |
| Compatibility | Must work on Chrome, Firefox, Safari (ES2020+) | Vite config targets modern browsers; no IE11 support | 🟢 |
| Maintainability | Custom node types (CustomNode, NoteNode) should be reusable | Components defined in `App.tsx`; can be extracted to separate files | 🟡 |

## Acceptance Criteria

```gherkin
Scenario: User steps through flowchart
  Given flowchart is rendered with visibleCount = 1
  When user clicks "Next"
  Then visibleCount increments to 2
  And nodes 1–2 become visible (opacity: 1)
  And edges connecting visible nodes animate

Scenario: User resets flowchart
  Given flowchart has visibleCount = 7 and nodes moved to custom positions
  When user clicks "Reset"
  Then visibleCount = 1
  And all nodes return to default positions
  And no edges visible

Scenario: Edge visibility matches node visibility
  Given step 4 (source) and step 5 (target) are both visible
  When renderEdge(4, 5) is called
  Then edge is rendered with animated stroke
  And edge respects custom sourceHandle/targetHandle routing

Scenario: Hidden nodes block interaction
  Given step 5 is hidden (visibleCount = 3)
  When user clicks on hidden step 5
  Then click event does not register (pointerEvents: 'none')
```

## Priority (MoSCoW)

| Requirement | MoSCoW | Justification |
|---|---|---|
| Render steps, colors, navigate | Must | Core user interaction; first experience with Ralph |
| Persist positions, drag-drop | Should | Nice UX improvement; optional for MVP |
| Annotated notes | Should | Educational value; not blocking core loop visualization |
| Keyboard nav, localStorage restore | Could | Accessibility/convenience; can ship MVP without |

## Code Traceability

| File | Class / Function | Coverage |
|-----|-----------------|----------|
| `flowchart/src/App.tsx` | `App` (main component) | 🟢 |
| `flowchart/src/App.tsx` | `createNode`, `createEdge`, `createNoteNode` | 🟢 |
| `flowchart/src/App.tsx` | `handleNext`, `handlePrev`, `handleReset` | 🟢 |
| `flowchart/src/App.tsx` | Custom node types (CustomNode, NoteNode) | 🟢 |
| `flowchart/src/App.css` | Global styles | 🟢 |
| `flowchart/package.json` | React 19, @xyflow/react 12.10, Vite 7.2 | 🟢 |
