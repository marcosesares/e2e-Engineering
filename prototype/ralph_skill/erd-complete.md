# Ralph — Entity-Relationship Diagram

**Generated:** 2026-05-20  
**Database Status:** ❌ **NO DATABASE**

---

## Database Architecture Note 🟢

Ralph is a **stateless framework tool** with no persistent data store (database). All state is preserved via:

1. **Git Repository** — Version control and commit history
2. **JSON Files** — `prd.json` (story list), configuration
3. **Markdown Files** — `progress.txt` (append-only log), specifications
4. **File System** — Archive folders, git history

**Rationale:** Ralph is designed for lightweight automation, not data-intensive applications. Agents are spawned fresh each iteration; state persists through files and git, not a database.

---

## Data Entities (File-Based)

### Entity 1: UserStory

**Storage:** `prd.json` (JSON array)

**Schema:**
```json
{
  "id": "string",                    // Unique identifier (e.g., "US-001")
  "title": "string",                 // Feature name
  "acceptanceCriteria": ["string"],  // Testable criteria
  "passes": "boolean"                // Status: false = TODO, true = DONE
}
```

**Attributes:**

| Attribute | Type | Nullable | Unique | Description |
|-----------|------|----------|--------|-------------|
| id | string | No | Yes | Story identifier (e.g., "US-001", "US-002") |
| title | string | No | No | Human-readable story name |
| acceptanceCriteria | array<string> | No | No | Testable acceptance criteria |
| passes | boolean | No | No | Completion status (false = pending, true = done) |

**Constraints:**
- `id` must be unique within `stories[]`
- `passes` is only forward-transitioning (false → true, never true → false)
- `acceptanceCriteria` must be non-empty array

**Cardinality:** 1 PRD has N stories (1:N)

---

### Entity 2: ProgressEntry

**Storage:** `progress.txt` (Markdown, append-only)

**Schema:**
```markdown
## [2026-05-20 10:30] - US-001
- **Implementation:** <description>
- **Files Changed:** <file list>
- **Learnings for future iterations:**
  - <pattern 1>
  - <pattern 2>
---
```

**Attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| timestamp | ISO 8601 | When story was implemented |
| story_id | string | Reference to UserStory.id |
| implementation | markdown | What was done |
| files_changed | list | Modified/created files |
| learnings | list | Patterns discovered |

**Constraints:**
- Append-only (never truncated or reordered)
- timestamp is monotonic (each entry later than previous)
- story_id references UserStory.id (foreign key-like)

**Cardinality:** 1 story has 1 progress entry (1:1 after completion)

---

### Entity 3: CodebasePattern

**Storage:** `progress.txt` (Markdown, `## Codebase Patterns` section)

**Schema:**
```markdown
## Codebase Patterns
- Use @xyflow/react for node/edge layouts (phase colors: setup=#f0f7ff, loop=#f5f5f5)
- Append-only: never truncate progress.txt; each iteration appends new entry
- Always run `npm run build` before deploying flowchart
- Agent picks story where passes: false (highest priority first)
```

**Attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| pattern_text | string | Reusable guideline for future agents |
| discovered_in_story | string | Reference to UserStory.id where pattern was found |
| consolidation_count | integer | How many agents have reinforced this pattern |

**Constraints:**
- Patterns are consolidated from ProgressEntry.learnings
- Consolidation is optional (not enforced)

**Cardinality:** N patterns can be discovered per story; 1 pattern shared across multiple stories

---

### Entity 4: GitCommit

**Storage:** Git history (`.git/objects/`, accessed via `git log`)

**Schema:**
```
commit <SHA-1>
Author: Agent <agent@ralph.local>
Date:   <ISO 8601 timestamp>

feat: [Story ID] - [Story Title]

<optional description>
```

**Attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| commit_sha | string | Git commit hash |
| story_id | string | Reference to UserStory.id |
| author | string | AI agent or human |
| timestamp | ISO 8601 | Commit date |
| message | string | Commit message |
| files_diff | list | File changes (git diff) |

**Constraints:**
- Commit message follows pattern: `feat: [ID] - [Title]`
- Files changed correspond to story implementation
- SHA is immutable (git invariant)

**Cardinality:** 1 completed story has 1 commit (plus 1 commit for updated prd.json)

---

### Entity 5: ProjectMetadata

**Storage:** `prd.json` (top-level fields)

**Schema:**
```json
{
  "projectName": "ralph",
  "branchName": "main",
  "stories": [...]
}
```

**Attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| projectName | string | Project identifier |
| branchName | string | Current git branch |
| stories | array | UserStory[] |

**Constraints:**
- branchName must match current git branch (ralph.sh validates)

**Cardinality:** 1 per project

---

## Entity Relationships (Logical)

### Relationship 1: UserStory ↔ ProgressEntry

```
UserStory
├─ id: "US-001"
│
└─ has ONE
   └─ ProgressEntry
      └─ timestamp: "2026-05-20 10:30"
         story_id: "US-001"
```

**Cardinality:** 1:1 (after story completion)  
**Type:** Foreign key (story_id → UserStory.id)

### Relationship 2: ProgressEntry ↔ CodebasePattern

```
ProgressEntry
├─ learnings: ["Pattern A", "Pattern B"]
│
└─ references N
   └─ CodebasePattern[]
      ├─ pattern_text: "Pattern A"
      └─ pattern_text: "Pattern B"
```

**Cardinality:** 1:N (entry can discover multiple patterns)  
**Type:** Implicit (patterns consolidated from learnings)

### Relationship 3: UserStory ↔ GitCommit

```
UserStory
├─ id: "US-001"
│  passes: false → true
│
└─ has ONE
   └─ GitCommit
      ├─ story_id: "US-001"
      ├─ message: "feat: US-001 - Add flowchart visualization"
      └─ files_diff: ["flowchart/src/App.tsx"]
```

**Cardinality:** 1:1 (per completed story)  
**Type:** Foreign key (story_id → UserStory.id)

### Relationship 4: ProjectMetadata ↔ UserStory

```
ProjectMetadata
├─ projectName: "ralph"
├─ branchName: "main"
│
└─ contains N
   └─ UserStory[]
      ├─ US-001
      ├─ US-002
      └─ US-003
```

**Cardinality:** 1:N (project has multiple stories)  
**Type:** Composition (stories[] array in prd.json)

---

## Data Flow & Persistence

```
┌──────────────────────────────────────────────────────────────┐
│                      RALPH PERSISTENCE                       │
└──────────────────────────────────────────────────────────────┘

ITERATION 1
──────────
Write:
  ✓ prd.json: US-001.passes = false → true
  ✓ GitCommit: "feat: US-001 - ..."
  ✓ ProgressEntry: [2026-05-20 10:30] - US-001
  ✓ CodebasePattern: pattern consolidation

Read (Next Iteration):
  ✓ prd.json (updated story list)
  ✓ GitCommit (from git log)
  ✓ ProgressEntry (from progress.txt)
  ✓ CodebasePattern (from ## Codebase Patterns section)

ITERATION 2
──────────
Same flow for US-002...
```

---

## File-Based Schema Validation

Ralph has **no automated schema validation** (gap 🔴). However, assumed constraints:

### prd.json Schema (Implicit)

```json
{
  "type": "object",
  "required": ["projectName", "branchName", "stories"],
  "properties": {
    "projectName": {
      "type": "string"
    },
    "branchName": {
      "type": "string"
    },
    "stories": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "title", "acceptanceCriteria", "passes"],
        "properties": {
          "id": {
            "type": "string",
            "pattern": "^[A-Z]+-\\d+$"
          },
          "title": {
            "type": "string"
          },
          "acceptanceCriteria": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "minItems": 1
          },
          "passes": {
            "type": "boolean"
          }
        }
      }
    }
  }
}
```

---

## Data Integrity Constraints

| Constraint | Type | Enforcement | Status |
|-----------|------|-------------|--------|
| story.id uniqueness | Unique | Manual (user discipline) | 🟡 INFERRED |
| story.passes forward-only | State | Implicit (agent logic) | 🟢 CONFIRMED |
| prd.json well-formed JSON | Format | Manual + git validation | 🟡 INFERRED |
| progress.txt append-only | Write pattern | Enforced (never truncated) | 🟢 CONFIRMED |
| commit message format | Convention | Enforced (agent CLAUDE.md) | 🟡 INFERRED |
| All AC criteria testable | Semantic | Manual (user discipline) | 🔴 LACUNA |

---

## Scalability

**Current Limitations:**
- `prd.json` is a single JSON file (no sharding)
- `progress.txt` is a single text file (append-only, could grow large)
- No indexing or query optimization (linear scan for story)

**Practical Scale:**
- ✅ Tested: 10-20 stories per PRD
- ⚠️ Untested: 100+ stories (progress.txt parsing might slow)
- ❌ Not recommended: 1000+ stories (consider splitting into multiple PRDs)

---

## Data Relationships Diagram (ERD Notation)

```
┌─────────────────┐
│  ProjectMetadata│
│  ──────────────│
│  projectName PK│
│  branchName    │
└────────┬────────┘
         │ 1
         │ contains
         │ N
         ▼
┌─────────────────────┐
│    UserStory        │
│  ─────────────────│
│  id PK             │
│  title             │
│  acceptanceCriteria│
│  passes            │
└─────┬──────┬───────┘
      │      │
      │ 1    │ 1
      │      │
  ref │      │ ref
      │      │
┌─────▼──────▼────────────┐     ┌──────────────────────┐
│   GitCommit             │────→│  CodebasePattern     │
│  ─────────────────────│     │ ──────────────────────│
│  commit_sha PK       │     │ pattern_text PK      │
│  story_id FK         │     │ discovered_in_story FK
│  author             │     │ consolidation_count │
│  timestamp          │     └──────────────────────┘
│  message            │
│  files_diff         │
└─────────────────────┘

┌──────────────────────────┐
│   ProgressEntry          │
│ ────────────────────────│
│ timestamp PK             │
│ story_id FK              │
│ implementation          │
│ files_changed           │
│ learnings               │
└──────────────────────────┘
```

---

## Summary

**Ralph uses File-Based Persistence, not a Database:**

| Aspect | Technology | Format | Persistence |
|--------|-----------|--------|-------------|
| Stories | JSON | prd.json | Atomic (file) |
| History | Git | Commit objects | Immutable |
| Learnings | Markdown | progress.txt | Append-only |
| Metadata | JSON | prd.json | Atomic (file) |

**No RDBMS, no ORM, no queries.** All entities are serialized to files and deserialized by agents when needed.

**Consequences:**
- ✅ Simplicity (no database setup)
- ✅ Reproducibility (everything in git)
- ✅ Portability (copy repo, run ralph.sh)
- ⚠️ No concurrent writes (agents are sequential)
- ⚠️ No schema enforcement (garbage in, garbage out)
- ⚠️ No indexing (linear scan for story selection)

