# Flowchart — Interface Contracts

## React Component Contract

**Export:**
```typescript
export default function App(): JSX.Element
```

**Props:** None (self-contained SPA)

**Expected Mount Location:** `flowchart/index.html` → `<div id="root">` container

**Initial State:**
```typescript
visibleCount: 1            // First step visible only
nodePositions: Map {}      // No custom positions initially
```

## Internal State API (Private to App)

**State variables:**
```typescript
const [visibleCount, setVisibleCount] = useState<number>(1)
const nodePositionsRef = useRef<Map<string, {x: number, y: number}>>(new Map())
const [nodes, setNodes] = useState<Node[]>([])
const [edges, setEdges] = useState<Edge[]>([])
```

**Triggering re-render:**
- Calling `setVisibleCount(newCount)` triggers full node/edge recalculation
- Calling `onNodesChange(changes)` updates nodePositionsRef and stores in state

## Event Handlers (Public Interface for UI)

| Handler | Triggered by | Behavior |
|---------|--------------|----------|
| `handleNext()` | "Next" button click | `setVisibleCount(prev => Math.min(prev + 1, 10))` |
| `handlePrev()` | "Previous" button click | `setVisibleCount(prev => Math.max(prev - 1, 1))` |
| `handleReset()` | "Reset" button click | `setVisibleCount(1); nodePositionsRef.current.clear()` |
| `onNodesChange(changes)` | @xyflow drag event | Store position in nodePositionsRef for each position change |

## Data Structure: Step Definition

```typescript
interface Step {
  id: string              // Unique identifier (e.g., 'setup-1')
  label: string           // Human-readable title
  description: string     // 1-2 line description
  phase: 'setup' | 'loop' | 'decision' | 'done'  // For coloring
  position?: {x: number, y: number}  // Optional override; otherwise use defaults
}
```

**Example:**
```typescript
{
  id: 'setup-1',
  label: 'Write PRD',
  description: 'User defines product requirements in Markdown',
  phase: 'setup'
}
```

## Data Structure: Note Definition

```typescript
interface Note {
  id: string              // Unique identifier (e.g., 'note-1')
  appearsWithStep: number // Which step triggers display (1-10)
  position: {x: number, y: number}  // Absolute position
  color: string           // CSS color for background
  content: string         // Multiline markdown or code snippet
}
```

**Example:**
```typescript
{
  id: 'note-1',
  appearsWithStep: 2,
  position: {x: 600, y: 100},
  color: '#f5f5f5',
  content: '```json\n{"project": "...", "userStories": [...]}\n```'
}
```

## Node/Edge Type Contract (@xyflow)

**CustomNode:**
```typescript
type CustomNode = Node<{
  title: string
  description: string
  phase: 'setup' | 'loop' | 'decision' | 'done'
}, 'custom'>

// Rendered as:
<div style={{
  width: '240px',
  height: '70px',
  background: phaseColors[phase].bg,
  border: `2px solid ${phaseColors[phase].border}`,
  opacity: visible ? 1 : 0,
  pointerEvents: visible ? 'auto' : 'none'
}}>
  <h3>{title}</h3>
  <p>{description}</p>
  <Handles /> {/* 8 handles: top, bottom, left, right × 2 */}
</div>
```

**NoteNode:**
```typescript
type NoteNode = Node<{
  content: string
  color: string
}, 'note'>

// Rendered as:
<div style={{
  background: color,
  padding: '12px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '12px',
  maxWidth: '300px'
}}>
  {content}
</div>
```

**Edge:**
```typescript
type FlowchartEdge = Edge<{
  label?: string
}, 'smoothstep'>

// Properties:
{
  animated: boolean              // true if both source/target visible
  stroke: string                 // Color of line
  strokeWidth: number            // 2px typically
  markerEnd: {type: 'arrowclosed'}  // Arrow endpoint
  sourceHandle?: string          // Named handle on source node
  targetHandle?: string          // Named handle on target node
}
```

## Visibility Gating Contract

**Function:** `getEdgeVisibility(sourceIndex: number, targetIndex: number, visibleCount: number): boolean`

**Logic:**
```typescript
return sourceIndex < visibleCount && targetIndex < visibleCount
```

**Example:**
- `getEdgeVisibility(0, 1, 1)` → false (step 1 not yet visible)
- `getEdgeVisibility(0, 1, 2)` → true (both steps visible)
- `getEdgeVisibility(3, 4, 10)` → true (all steps visible)

**Usage:** Applied to all 9 edges; if false, edge is not rendered.

## CSS Contract

**Expected Classes/IDs in App.css:**
```css
/* Header */
#app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #ddd;
}

/* Control buttons */
.controls {
  display: flex;
  gap: 8px;
}

button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ccc;
  background: #fff;
}

button:hover {
  background: #f5f5f5;
}

button:active {
  background: #e0e0e0;
}

/* ReactFlow container */
.react-flow-wrapper {
  width: 100%;
  height: 600px;  /* or viewport-dependent */
  border: 1px solid #ddd;
}

/* Phase-specific colors applied inline via style prop */
```

**No external CSS imports** (except @xyflow/react CSS, imported in App.tsx).

## Environment & Deployment Contract

**Development:**
```bash
cd flowchart
npm install
npm run dev        # Vite dev server on http://localhost:5173/ralph/
```

**Build & Deploy:**
```bash
npm run build      # Output to dist/
# GitHub Actions copies dist/ → GitHub Pages
```

**Base Path:** `/ralph/` (defined in Vite config; affects all relative URLs)

## Error Handling Contract

**No explicit error boundaries or error states.** Component assumes:
- @xyflow library functions correctly
- React 19 mounts without issues
- No async operations (no API calls, no fetch)

**Implicit contracts:**
- visibleCount never exceeds 10 or goes below 1 (enforced by Math.min/Math.max in handlers)
- nodePositions map never corrupts (React state guarantees)
- Hidden nodes do not trigger click events (enforced by pointerEvents: 'none')
