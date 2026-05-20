# PRD Management — Requirements

## Overview

Comprehensive system for creating, validating, and converting Product Requirements Documents (PRDs) into structured JSON format for Ralph's autonomous agent loop. Includes two complementary skills: PRD Generator (markdown) and Ralph Converter (JSON), with quality validation and story size enforcement.

## Responsibilities

- Generate well-structured PRDs from feature descriptions with clarifying questions
- Convert markdown PRDs to `prd.json` format with validation
- Enforce story size limits (context-window fit)
- Validate story ordering and dependencies
- Provide clear acceptance criteria and MoSCoW prioritization
- Persist PRD state for multi-iteration agent loops

## Business Rules

- Each user story must be completable in one Ralph iteration (single context window) 🟢
- Story ordering must respect dependencies (schema → logic → UI) 🟢
- Every user story has unique ID (US-001, US-002, ...) 🟢
- Each story tracks `passes: boolean` to gate agent iteration 🟢
- PRD generation asks 3-5 clarifying questions before writing 🟢
- Acceptance criteria are verifiable (GWT format preferred) 🟢
- Branch name must match regex `^ralph/[a-z0-9]+(-[a-z0-9]+)*$` 🟢 (Q6 — enforced at PRD creation; reject invalid with clear error)
- **Story size validation occurs ONLY at PRD creation by `skills/prd/SKILL.md`** 🟢 (Q5 — runtime trusts the input; no re-validation at agent spawn)
- **The agent (not ralph.sh) is the sole writer of `prd.json` `passes` field** 🟢 (Q1 — see `agent-system/requirements.md` RF-08)

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| RF-01 | Accept feature description and ask clarifying questions | Must | User receives 3-5 questions with A/B/C/D options; responds with letter(s) |
| RF-02 | Generate markdown PRD with Introduction, Goals, User Stories | Must | Output file saved to `tasks/prd-[feature-name].md` with valid markdown structure |
| RF-03 | Convert markdown PRD to `prd.json` with validation | Must | Output file `prd.json` created with all required fields (project, branchName, description, userStories[]) |
| RF-04 | Validate story size (context-window fit) | Should | Flag stories > 2-3 sentences as "too large"; suggest split |
| RF-05 | Validate story ordering (dependencies first) | Should | Warn if UI story precedes schema story; suggest reordering |
| RF-06 | Generate acceptance criteria in Gherkin (Given/When/Then) | Should | Each story lists at least 1 happy path and 1 error scenario |
| RF-07 | Assign MoSCoW priority (Must/Should/Could/Won't) | Should | PRD categorizes each story; JSON includes priority field (1-4) |
| RF-08 | Initialize `passes: false` for all stories | Must | New stories start with `passes: false`; agent loops set to true on completion |
| RF-09 | Support priority reordering | Could | Allow user to swap story order before conversion; re-number IDs |
| RF-10 | Merge multiple PRDs | Could | Support combining 2+ markdown PRDs into single `prd.json` |
| RF-11 | **Validate branch name regex** | Must | Apply `^ralph/[a-z0-9]+(-[a-z0-9]+)*$` to `branchName` at PRD creation. Reject with: `"Invalid branchName '<value>'. Must match 'ralph/<kebab-case-name>' (lowercase letters, digits, hyphens only)."` (Q6) |
| RF-12 | **Story size validation timing** | Must | Apply "2-3 sentence" heuristic ONLY at PRD creation. No runtime re-check at agent spawn time. (Q5) |

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-----------|----|---|
| Accuracy | Story size validation must be manual review + heuristic (word count or sentence count) | skills/ralph/SKILL.md line 47: "If you cannot describe the change in 2-3 sentences, it is too big" | 🟢 |
| Clarity | PRD output must be readable by non-technical stakeholders | skills/prd/SKILL.md line 8: "clear, actionable" | 🟢 |
| Portability | `prd.json` must be consumable by ralph.sh and autonomous agents | CLAUDE.md step 2-3: "Read the PRD at prd.json" | 🟢 |
| Persistence | PRD artifacts persisted to disk (markdown + JSON) for multi-session use | skills/prd/SKILL.md line 18: "Save to tasks/prd-[feature-name].md" | 🟢 |
| Validation | Invalid JSON structure must be caught before saving | skills/ralph/SKILL.md section "Output Format" defines schema | 🟡 |

## Acceptance Criteria

```gherkin
Scenario: Generate PRD from feature description
  Given user provides feature description "Add dark mode"
  When PRD skill asks clarifying questions
  Then user receives 3-5 questions with options (A/B/C/D)
  And user responds with letter(s) or custom text
  And PRD is generated with Introduction, Goals, 3-5 User Stories
  And file saved to tasks/prd-dark-mode.md

Scenario: Convert markdown PRD to JSON
  Given markdown PRD at tasks/prd-dark-mode.md
  When Ralph skill processes the file
  Then prd.json created with:
    - project: "project-name"
    - branchName: "ralph/dark-mode"
    - description: "Feature summary"
    - userStories: [{ id, title, description, acceptanceCriteria[], priority, passes: false }]
  And all stories have unique IDs (US-001, US-002, ...)
  And passes defaults to false for all stories

Scenario: Validate story size
  Given a user story with 10+ sentences in description
  When Ralph converter processes the story
  Then warning issued: "Story may be too large for single iteration"
  And suggestion: "Split into: [substory1], [substory2]"

Scenario: Enforce dependency order
  Given stories: [UI Component, Schema Migration, Database Query]
  When Ralph converter validates order
  Then error: "UI Component (story 1) depends on Schema Migration (story 2). Reorder: Migration → Query → UI"

Scenario: Initialize iteration state
  Given new prd.json created
  When Ralph processes first iteration
  Then agent picks highest-priority story where passes: false
  And after agent completes, agent updates prd.json: passes: true
  And next iteration picks next story with passes: false
```

## Priority (MoSCoW)

| Requirement | MoSCoW | Justification |
|---|---|---|
| Generate PRD from description | Must | Core entry point; without this, feature planning is manual |
| Convert to prd.json | Must | Ralph agent loop reads prd.json; without conversion, agents can't execute |
| Question-based clarification | Must | Prevents ambiguous PRDs; gates generation quality |
| Validate story size | Should | Prevents context overflow; improves success rate but not blocking |
| Validate order/dependencies | Should | Improves execution speed; not blocking |
| Gherkin acceptance criteria | Could | Nice-to-have; standard practice but can be written free-form |
| Priority reordering | Could | Useful for refinement but not critical for MVP |

## Code Traceability

| File | Skill / Function | Coverage |
|-----|-----------------|----------|
| `skills/prd/SKILL.md` | PRD Generator | 🟢 |
| `skills/ralph/SKILL.md` | Ralph Converter | 🟢 |
| `prd.json` (template) | Output format | 🟢 |
| `CLAUDE.md` (line 2) | Integration point ("Read the PRD at prd.json") | 🟢 |
| `ralph.sh` (line 4) | Loop checks prd.json for stories where passes: false | 🟢 |

## Resolved Gaps (was 🔴, now 🟢 after user validation 2026-05-19)

- ✅ **Story size validation timing:** Resolved (Q5). Validation happens ONLY at PRD creation by `skills/prd/SKILL.md`. Runtime trusts input. See RF-12.
- ✅ **Branch name validation:** Resolved (Q6). Regex enforced at PRD creation; invalid names rejected with clear error. See RF-11.

## Outstanding Gaps (🟡 — non-blocking, future enhancements)

- **Story size validation algorithm:** Heuristic ("2-3 sentences") is intentional choice (Q5). Token-counting deferred until context overflow becomes a real problem.
- **Acceptance criteria format enforcement:** Gherkin format is recommended but not enforced. Free-form criteria accepted.
- **Schema validation on JSON:** No formal JSON schema validator. Invalid `prd.json` may not be caught until agent reads it.
- **Multi-user PRD merging:** Unclear how to combine PRDs from multiple users or projects into single `prd.json`.
- **Rollback / PRD versioning:** No mechanism to restore previous `prd.json` if iteration goes wrong (manual `git revert`).
