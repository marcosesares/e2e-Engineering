# PRD Management — Design

## Interface

Two separate skills invoked by user via `/prd` (generator) and `/ralph` (converter).

**PRD Generator Skill (`/prd`):**
```
Input: Feature description (text)
Output: tasks/prd-[feature-name].md (markdown file)
Process: Ask clarifying questions → Generate PRD structure → Save to disk
```

**Ralph Converter Skill (`/ralph`):**
```
Input: prd.json or tasks/prd-*.md (markdown file)
Output: prd.json (JSON file)
Process: Parse markdown → Validate stories → Convert to JSON → Save to prd.json
```

## PRD Generator Flow

**Step 1: Input**
- User provides feature description (1-3 sentences)
- Example: "Add dark mode toggle to settings panel"

**Step 2: Clarifying Questions**
```
1. What is the primary goal?
   A. Improve UX (reduce eye strain)
   B. Increase engagement
   C. Technical requirement
   D. Other: [custom]

2. Who is the target user?
   A. All users
   B. Power users only
   C. Mobile users only
   D. Admin users

3. Scope?
   A. Minimal (toggle + basic colors)
   B. Full (toggle + multiple themes + persistence)
   C. Just backend API
```

- User responds: "1A, 2A, 3B"
- Skill parses and proceeds

**Step 3: PRD Structure**

```markdown
# [Feature Name] — PRD

## Overview
[Paragraph describing problem + solution]

## Goals
- [Goal 1]
- [Goal 2]

## User Stories

### US-001: [Title]
**Description:** As a [user], I want [feature] so that [benefit]

**Acceptance Criteria:**
- Criterion 1
- Criterion 2 (GWT format preferred)

**Priority:** Must/Should/Could/Won't

### US-002: [Title]
...
```

**Step 4: Save**
- File written to `tasks/prd-[feature-name-kebab].md`
- Return file path to user

## Ralph Converter Flow

**Step 1: Input**
- Accept `tasks/prd-*.md` or existing `prd.json` as input
- Parse markdown to extract stories

**Step 2: Validation**

| Check | Logic | Fail Behavior |
|-------|-------|---------------|
| Story count | 3-8 stories recommended | Warn if <3 or >15 |
| Story size | Heuristic: if >2-3 sentences, flag | Suggest split |
| Order check | Schema → Logic → UI → Dashboard | Warn if out of order |
| IDs unique | No duplicate US-XXX IDs | Error; abort |
| Acceptance criteria | At least 1 per story | Warn; auto-generate generic |
| JSON schema | Validate against prd.json structure | Error; show diff |

**Step 3: Transform**

```typescript
for each markdown story:
  {
    id: "US-XXX",
    title: story.title,
    description: story.description,
    acceptanceCriteria: story.criteria[],
    priority: (story.moscow == 'Must') ? 1 : (2 : 3 : 4),
    passes: false,    // Always false for new stories
    notes: ""
  }
```

**Step 4: Merge Context**
```json
{
  "project": "[extracted from context or user input]",
  "branchName": "ralph/[feature-name-kebab]",
  "description": "[overview paragraph]",
  "userStories": [...]
}
```

**Step 5: Save**
- Write to `prd.json` in project root
- Return summary: "PRD saved with 5 stories. Branch: ralph/dark-mode"

## Dependencies

- **File system:** Read/write markdown and JSON files
- **User input parsing:** Question parser, text extraction
- **Markdown parser:** Extract structure from markdown PRDs
- **JSON schema validation:** Verify prd.json structure
- **Ralph agent loop:** prd.json consumed by ralph.sh and CLAUDE.md

## Design Decisions Identified

| Decision | Rationale | Confidence |
|----------|-----------|-----------|
| Clarifying questions before PRD generation | Reduces back-and-forth; forces user to think through scope | 🟢 |
| Two separate skills (generator + converter) | Decouples concerns; user can use generator OR converter standalone | 🟢 |
| Kebab-case branch names | Consistent with git conventions; URL-safe | 🟢 |
| Story size warning (2-3 sentences) | Empirical: fits in one Claude context window | 🟡 |
| Automatic passes: false initialization | Ensures agent picks story on first iteration | 🟢 |
| Priority: numeric (1-4) in JSON | Easier for agent to compare and sort | 🟡 |
| MoSCoW in markdown, numeric in JSON | Markdown human-readable, JSON machine-readable | 🟢 |

## State Machine: Story Lifecycle

```
[NOT STARTED]
  ↓ (agent picks story where passes: false)
[IN PROGRESS] (agent implements)
  ↓ (agent runs quality checks)
  ├→ [PASSED] → passes: true
  └→ [FAILED] → passes: false (retry or manual fix)
  ↓
[COMPLETE] (next iteration picks next story)
```

**State persistence:** prd.json stores `passes` boolean. ralph.sh loop reads and updates.

## Observability

**Logging (inferred):**
- PRD skill logs: "Generated PRD with X stories", "Saved to tasks/prd-XXX.md"
- Ralph skill logs: "Validating PRD...", "Story size warning: US-003 may be too large", "Saved to prd.json"

**No metrics/tracing.** File-based skill; no performance instrumentation.

## Risks & Gaps

- 🔴 **Story size heuristic:** "2-3 sentences" is empirical but not scientifically validated. May vary by complexity.
- 🔴 **Schema validation:** prd.json structure not validated against JSON schema. Invalid files may silently break ralph.sh.
- 🟡 **Markdown parsing robustness:** Custom PRD formats (tables, nested sections) may not parse correctly.
- 🟡 **Branch name sanitization:** Kebab-case conversion may fail on special characters; unclear error handling.
- 🔴 **Rollback mechanism:** No version history or undo for prd.json updates. Overwrite is destructive.
