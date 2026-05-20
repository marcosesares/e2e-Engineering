# Ralph Flowchart — Visual Process Flow

**Module:** Flowchart (React SPA)  
**Generated:** 2026-05-20  
**Purpose:** Step-by-step visualization of Ralph's autonomous agent loop

---

## Overall Flow Diagram

```mermaid
graph TD
    A["🟦 Step 1: You write a PRD<br/>Define what you want to build"]
    B["🟦 Step 2: Convert to prd.json<br/>Break into small user stories"]
    C["🟦 Step 3: Run ralph.sh<br/>Starts the autonomous loop"]
    D["⬜ Step 4: AI picks a story<br/>Finds next passes: false"]
    E["⬜ Step 5: Implements it<br/>Writes code, runs tests"]
    F["⬜ Step 6: Commits changes<br/>If tests pass"]
    G["⬜ Step 7: Updates prd.json<br/>Sets passes: true"]
    H["⬜ Step 8: Logs to progress.txt<br/>Saves learnings"]
    I{"🟨 Step 9: More stories?"}
    J["🟩 Step 10: Done!<br/>All stories complete"]
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I -->|Yes| D
    I -->|No| J
    
    style A fill:#f0f7ff,stroke:#4a90d9,stroke-width:2px
    style B fill:#f0f7ff,stroke:#4a90d9,stroke-width:2px
    style C fill:#f0f7ff,stroke:#4a90d9,stroke-width:2px
    style D fill:#f5f5f5,stroke:#666666,stroke-width:2px
    style E fill:#f5f5f5,stroke:#666666,stroke-width:2px
    style F fill:#f5f5f5,stroke:#666666,stroke-width:2px
    style G fill:#f5f5f5,stroke:#666666,stroke-width:2px
    style H fill:#f5f5f5,stroke:#666666,stroke-width:2px
    style I fill:#fff8e6,stroke:#c9a227,stroke-width:2px
    style J fill:#f0fff4,stroke:#38a169,stroke-width:2px
```

---

## Phase: Setup (Steps 1–3)

User prepares the work environment:

```mermaid
graph LR
    A["📝 Write PRD<br/>describe requirements<br/>natural language"]
    B["🔄 Convert<br/>generate prd.json<br/>split into stories"]
    C["▶️ Run Loop<br/>ralph.sh<br/>spawn AI agents"]
    
    A --> B
    B --> C
    
    style A fill:#f0f7ff,stroke:#4a90d9,stroke-width:2px
    style B fill:#f0f7ff,stroke:#4a90d9,stroke-width:2px
    style C fill:#f0f7ff,stroke:#4a90d9,stroke-width:2px
```

**Decisions:** None  
**User Actions:** Write docs, run script  
**Exit:** Once ralph.sh starts, control passes to AI agents

---

## Phase: Main Loop (Steps 4–8)

AI agent executes in fresh context each iteration:

```mermaid
graph TD
    A["🔍 AI Picks Story<br/>SELECT * FROM userStories<br/>WHERE passes = false<br/>ORDER BY priority"]
    B["💻 Implement<br/>Write code<br/>Run tests"]
    C{Tests<br/>Pass?}
    D["✅ Commit<br/>git commit<br/>IF tests_pass"]
    E["📝 Update prd.json<br/>passes: true<br/>AGENTS.md learnings"]
    F["⏳ Loop Back"]
    
    A --> B
    B --> C
    C -->|Yes| D
    C -->|No| B
    D --> E
    E --> F
    F --> A
    
    style A fill:#f5f5f5,stroke:#666666,stroke-width:2px
    style B fill:#f5f5f5,stroke:#666666,stroke-width:2px
    style D fill:#f5f5f5,stroke:#666666,stroke-width:2px
    style E fill:#f5f5f5,stroke:#666666,stroke-width:2px
    style F fill:#f5f5f5,stroke:#666666,stroke-width:2px
```

**Key Property:** Each iteration is a **fresh AI instance** with clean context  
**Memory Between Iterations:**
- Git history (commits from previous iterations)
- `progress.txt` (learnings)
- `prd.json` (which stories are done)

---

## Phase: Decision & Exit (Steps 9–10)

Check if work is complete:

```mermaid
graph TD
    A["❓ More Stories?<br/>SELECT COUNT(*)...<br/>WHERE passes = false"]
    B["🔄 Loop Again<br/>Check if true"]
    C["✨ Done!<br/>All passes = true"]
    
    A -->|Yes| B
    A -->|No| C
    B --> A
    
    style A fill:#fff8e6,stroke:#c9a227,stroke-width:2px
    style B fill:#f5f5f5,stroke:#666666,stroke-width:2px
    style C fill:#f0fff4,stroke:#38a169,stroke-width:2px
```

**Exit Condition:** `∀ story ∈ userStories: story.passes = true`

---

## Data Flow Diagram

```mermaid
graph LR
    A["📄 prd.md<br/>Markdown"]
    B["🔄 Convert Skill<br/>ralph-skill"]
    C["📋 prd.json<br/>User Stories<br/>JSON"]
    D["▶️ ralph.sh<br/>Loop Script"]
    E["🤖 AI Agent<br/>Fresh Instance"]
    F["💾 progress.txt<br/>Learnings Log"]
    G["📝 AGENTS.md<br/>Patterns"]
    H["📂 Git History<br/>Commits"]
    
    A --> B --> C
    C --> D --> E
    E --> F
    E --> G
    E --> H
    H -.->|next iteration| E
    F -.->|context| E
    G -.->|context| E
    
    style C fill:#e8f5e9,stroke:#38a169
    style E fill:#fff3e0,stroke:#f57c00
    style F fill:#f3e5f5,stroke:#7b1fa2
    style G fill:#f3e5f5,stroke:#7b1fa2
    style H fill:#e3f2fd,stroke:#1976d2
```

---

## Control Flow: Visibility & Progressive Disclosure

The React App reveals steps progressively:

```
User clicks "Next"
├─ visibleCount++
├─ FOR each step in allSteps:
│  └─ IF step_index < visibleCount: opacity = 1, pointerEvents = auto
├─ FOR each edge in edgeConnections:
│  └─ IF source_visible AND target_visible: animated = true
└─ Re-render all nodes & edges

User clicks "Previous"
└─ Same, but visibleCount--

User clicks "Reset"
├─ visibleCount = 1
├─ Reset all node positions to defaults
└─ Hide all edges
```

**Purpose:** Progressive disclosure teaches users Ralph's workflow step-by-step

---

## State Machine: Loop Phase

```mermaid
stateDiagram-v2
    [*] --> PickStory
    PickStory --> Implement
    Implement --> TestsPass{Tests Pass?}
    TestsPass -->|No| Implement
    TestsPass -->|Yes| Commit
    Commit --> UpdatePRD
    UpdatePRD --> LogProgress
    LogProgress --> CheckMore{More<br/>Stories?}
    CheckMore -->|Yes| PickStory
    CheckMore -->|No| Done
    Done --> [*]
```

**Invariant:** Each iteration is atomic — either all steps succeed or iteration fails and agent re-runs

---

## Data Transformation Pipeline

**PRD.md → prd.json:**

```
User Story (Text):
  "As a user, I want to add a task with priority so that I can organize my work"

Ralph Skill converts to:
{
  "id": "US-003",
  "title": "Add priority field to task",
  "description": "As a user, I want...",
  "acceptanceCriteria": [
    "Add priority column to tasks table",
    "Create database migration",
    "Update task model",
    "Typecheck passes",
    "Tests pass"
  ],
  "priority": 1,
  "passes": false
}

AI Agent transforms to Code:
  - Migrations: schema changes
  - Models: updated types
  - UI: new input field
  - Tests: coverage
  - Commit: code in git

Updates prd.json:
  - Flips "passes": true
  - Appends to progress.txt
  - Updates AGENTS.md
```

---

## Checkpoint & Resumption

```
Iteration 1: 
  ├─ Pick story US-001
  ├─ Implement
  ├─ Update prd.json (US-001 passes: true)
  ├─ Commit to main
  └─ Git history preserved

Iteration 2 (Fresh AI Instance):
  ├─ Reads prd.json
  │   └─ Knows US-001 is done
  ├─ Reads progress.txt
  │   └─ Learns patterns from US-001
  ├─ Reads AGENTS.md
  │   └─ Knows gotchas & conventions
  ├─ Pick story US-002
  ├─ Implement (informed by prior learnings)
  └─ Loop...
```

**Key:** Only 3 sources of memory across iterations
- Git history (immutable)
- progress.txt (append-only)
- prd.json (current state)

---

## Complexity Notes

| Aspect | Complexity | Reason |
|--------|-----------|--------|
| Flowchart rendering | O(n) where n=10 steps | Linear re-render of nodes |
| Edge visibility | O(e) where e=9 edges | Check both endpoints each render |
| Position tracking | O(n) | Store position per node on drag |
| Phase lookup | O(1) | Constant time color map |
| Loop iterations | Unbounded | Depends on PRD size & AI capability |

---

## Design Patterns

1. **Progressive Disclosure** — Show steps gradually (teaching UX pattern)
2. **State Mutation on Callbacks** — useCallback + useState for event handling
3. **Ref for Transient Position State** — useRef maintains layout across renders without re-creating nodes
4. **Factory Functions** — createNode(), createEdge() reduce duplication
5. **Enumerated Phases** — Type-safe phase colors via Record<Phase, Colors>

