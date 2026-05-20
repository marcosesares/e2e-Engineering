# Ralph — Data Dictionary

**Generated:** 2026-05-20  
**Scope:** All modules  
**Completeness:** Complete

---

## Flowchart Module Data

### Visualization State

| Field Name | Type | Cardinality | Constraints | Default | Confidence | Notes |
|-----------|------|-------------|-------------|---------|-----------|-------|
| `visibleCount` | integer | 1 | 1 ≤ value ≤ 10 | 1 | 🟢 Confirmed | Step count; controls rendering |
| `nodes` | Node[] | 12 | — | empty | 🟢 Confirmed | 10 step nodes + 2 annotation nodes |
| `edges` | Edge[] | 9 | — | empty | 🟢 Confirmed | Connections between steps |
| `nodePositions` | Map | — | nested {x: number, y: number} | predefined | 🟢 Confirmed | Persistent user-dragged positions |

### Step Definition

| Field Name | Type | Cardinality | Constraints | Example | Confidence |
|-----------|------|-------------|-------------|---------|-----------|
| `step.id` | string | 1 | enum: "1"–"10" | "4" | 🟢 Confirmed |
| `step.label` | string | 1 | non-empty, ≤50 chars | "AI picks a story" | 🟢 Confirmed |
| `step.description` | string | 1 | optional, ≤100 chars | "Finds next passes: false" | 🟢 Confirmed |
| `step.phase` | string | 1 | enum: setup, loop, decision, done | "loop" | 🟢 Confirmed |

### Phase Configuration

| Phase | Background | Border | Steps | Purpose |
|-------|-----------|--------|-------|---------|
| setup | #f0f7ff (light blue) | #4a90d9 (blue) | 1–3 | Initial PRD setup |
| loop | #f5f5f5 (light gray) | #666666 (dark gray) | 4–8 | Main execution loop |
| decision | #fff8e6 (pale yellow) | #c9a227 (gold) | 9 | Loop decision point |
| done | #f0fff4 (pale green) | #38a169 (green) | 10 | Completion |

### Node Geometry

| Property | Type | Value | Notes |
|----------|------|-------|-------|
| `nodeWidth` | integer | 240 | Fixed for all step nodes |
| `nodeHeight` | integer | 70 | Fixed for all step nodes |
| `position.x` | integer | varies | Range: 20–750 pixels |
| `position.y` | integer | varies | Range: 20–880 pixels |

### Edge Definition

| Field Name | Type | Cardinality | Constraints | Example | Confidence |
|-----------|------|-------------|-------------|---------|-----------|
| `edge.id` | string | 1 | format: `e{source}-{target}` | "e4-5" | 🟢 Confirmed |
| `edge.source` | string | 1 | valid step id | "4" | 🟢 Confirmed |
| `edge.target` | string | 1 | valid step id | "5" | 🟢 Confirmed |
| `edge.sourceHandle` | string | 0..1 | handle position | "right", "bottom" | 🟢 Confirmed |
| `edge.targetHandle` | string | 0..1 | handle position | "left", "top" | 🟢 Confirmed |
| `edge.label` | string | 0..1 | optional: "Yes" / "No" | "Yes" | 🟢 Confirmed |
| `edge.animated` | boolean | 1 | — | true if visible | 🟢 Confirmed |

### Annotation Notes

| Field | Type | Value | Appearance | Confidence |
|-------|------|-------|-----------|-----------|
| `note-1.appearsWithStep` | integer | 2 | JSON format example | 🟢 Confirmed |
| `note-1.content` | string | JSON PRD snippet | Monospace code block | 🟢 Confirmed |
| `note-2.appearsWithStep` | integer | 8 | AGENTS.md info | 🟢 Confirmed |
| `note-2.content` | string | Explanation text | Wrapped text | 🟢 Confirmed |

---

## PRD / Story Data

### PRD Root

| Field Name | Type | Cardinality | Constraints | Example | Confidence |
|-----------|------|-------------|-------------|---------|-----------|
| `project` | string | 1 | non-empty, ≤50 chars | "ralph" | 🟢 Confirmed |
| `branchName` | string | 1 | format: `ralph/kebab-case` | "ralph/auth-feature" | 🟢 Confirmed |
| `description` | string | 1 | optional, ≤500 chars | "Add user authentication" | 🟡 Inferred |
| `userStories` | array | 1+ | min 1 story | — | 🟢 Confirmed |

### User Story

| Field Name | Type | Cardinality | Constraints | Example | Confidence |
|-----------|------|-------------|-------------|---------|-----------|
| `userStories[].id` | string | 1 | format: US-{number} | "US-001" | 🟢 Confirmed |
| `userStories[].title` | string | 1 | non-empty, ≤100 chars | "Add priority field" | 🟢 Confirmed |
| `userStories[].description` | string | 1 | BDD format: "As a... I want... so that..." | "As a manager, I want to prioritize tasks so that I focus on important work" | 🟢 Confirmed |
| `userStories[].priority` | integer | 1 | enum: 1 (high), 2 (medium), 3 (low) | 1 | 🟢 Confirmed |
| `userStories[].passes` | boolean | 1 | — | false | 🟢 Confirmed |
| `userStories[].acceptanceCriteria` | string[] | 1+ | min 1 criterion | ["Add column", "Run migration", "Typecheck passes"] | 🟢 Confirmed |
| `userStories[].notes` | string | 0..1 | optional, ≤200 chars | "" | 🟡 Inferred |

---

## CI/CD Pipeline Data

### GitHub Actions Workflow

| Field | Type | Value | Purpose | Confidence |
|-------|------|-------|---------|-----------|
| `workflow.name` | string | "Deploy Flowchart to GitHub Pages" | Workflow identifier | 🟢 Confirmed |
| `workflow.on.push.branches` | array | ["main"] | Trigger: push to main | 🟢 Confirmed |
| `workflow.on.workflow_dispatch` | boolean | true | Manual trigger enabled | 🟢 Confirmed |
| `workflow.jobs.build.runs-on` | string | "ubuntu-latest" | Build environment | 🟢 Confirmed |
| `workflow.jobs.build.steps[*].name` | string | "Checkout", "Setup Node", etc. | Step identifier | 🟢 Confirmed |

### Build Configuration

| Tool | Version | Property | Value | Confidence |
|------|---------|----------|-------|-----------|
| Node.js | 20.x | engine | ubuntu-latest | 🟢 Confirmed |
| npm | latest | cache | npm | 🟢 Confirmed |
| TypeScript | ~5.9.3 | command | `tsc -b` | 🟢 Confirmed |
| Vite | 7.2.4 | command | `vite build` | 🟢 Confirmed |
| Output | — | directory | `flowchart/dist` | 🟢 Confirmed |

---

## Reversa Framework State

### state.json Fields

| Field | Type | Example | Purpose | Confidence |
|-------|------|---------|---------|-----------|
| `version` | string | "1.2.43" | Framework version | 🟢 Confirmed |
| `project` | string | "ralph" | Project identifier | 🟢 Confirmed |
| `user_name` | string | "Marcos" | User for messages | 🟢 Confirmed |
| `chat_language` | string | "en-us" | UI language | 🟢 Confirmed |
| `doc_language` | string | "English" | Documentation language | 🟢 Confirmed |
| `doc_level` | string | "completo" | Documentation depth (essencial, completo, detalhado) | 🟢 Confirmed |
| `output_folder` | string | "_reversa_sdd" | Output directory | 🟢 Confirmed |
| `phase` | string | "escavacao" | Current phase (reconhecimento, escavacao, interpretacao, geracao, revisao) | 🟢 Confirmed |
| `completed` | string[] | ["reconhecimento"] | Completed phases | 🟢 Confirmed |
| `pending` | string[] | ["escavacao", ...] | Remaining phases | 🟢 Confirmed |
| `checkpoints` | object | { scout: { ... } } | Agent completion records | 🟢 Confirmed |

### config.toml Specs Section

| Field | Type | Constraint | Example | Confidence |
|-------|------|-----------|---------|-----------|
| `specs.layout` | string | "feature-folder" | Feature-based folder structure | 🟢 Confirmed |
| `specs.granularity` | string | enum: module, use-case, endpoint, hybrid, feature, custom | "feature" | 🟢 Confirmed |
| `specs.custom_folders` | array | if granularity == "custom" | [] | 🟢 Confirmed |
| `specs.scout_suggestion` | string | immutable after 1st run | "feature" | 🟢 Confirmed |
| `specs.decided_at` | string | ISO 8601 timestamp | "2026-05-20T00:00:00Z" | 🟢 Confirmed |

---

## Relationships

### Flowchart → Steps
```
flowchart (1) ── contains ── (10) steps
```

### Steps → Phases
```
step (1) ── belongs_to ── (1) phase
phase (1) ── contains ── (1..3) steps
```

### Steps → Edges
```
edge (1) ── connects ── (2) steps
step (1) ── source_of ── (0..2) edges
step (1) ── target_of ── (0..2) edges
```

### PRD → Stories
```
prd (1) ── contains ── (1+) userStories
userStory (1) ── belongs_to ── (1) prd
```

### Stories → Criteria
```
userStory (1) ── has ── (1+) acceptanceCriteria
acceptanceCriterion (1) ── belongs_to ── (1) userStory
```

---

## Enumerated Values

### Phase
- `setup` — Initial configuration
- `loop` — Main execution cycle
- `decision` — Conditional branching
- `done` — Completion

### Priority
- `1` — High
- `2` — Medium
- `3` — Low

### Granularity
- `module` — By code module
- `use-case` — By user story / use case
- `endpoint` — By API endpoint
- `hybrid` — Module + nested use cases
- `feature` — By feature folders
- `custom` — User-defined

### Doc Level
- `essencial` — Minimal docs, core artefacts only
- `completo` — Standard docs with diagrams
- `detalhado` — Comprehensive with per-function details

---

## Data Integrity Rules

| Rule | Scope | Constraint |
|------|-------|-----------|
| Unique step IDs | App.tsx | All step.id must be unique in allSteps |
| Unique edge IDs | App.tsx | All edge.id must follow format `e{source}-{target}` |
| Step reference integrity | App.tsx | All edge.source & edge.target must exist in allSteps |
| Visibility consistency | App.tsx | If edge is visible, both nodes must be visible |
| Phase mapping | App.tsx | Every step must have a valid phase in phaseColors |
| Story ID uniqueness | prd.json | All userStories[].id must be unique |
| Branch format | prd.json | branchName must match pattern `ralph/[kebab-case]` |
| Acceptance criteria | prd.json | Each story must have ≥1 criterion |
| Phase completeness | state.json | completed[] must contain only valid phase names |

---

## Estimated Cardinality

| Entity | Min | Max | Notes |
|--------|-----|-----|-------|
| Steps | 10 | 10 | Fixed |
| Edges | 9 | 9 | Fixed (by design) |
| Notes | 2 | 2 | Fixed |
| User Stories per PRD | 1 | ∞ | Depends on project scope |
| Acceptance Criteria per Story | 1 | ∞ | Depends on requirements |
| Phases | 5 | 5 | Fixed (reconhecimento, escavacao, interpretacao, geracao, revisao) |

