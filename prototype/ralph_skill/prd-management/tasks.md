# PRD Management — Tasks

## Prerequisites

- [ ] Markdown and JSON libraries available (Node.js built-ins or CLI tools)
- [ ] File system access to `tasks/` directory
- [ ] Ability to prompt user and parse responses
- [ ] Ralph agent loop integration (ralph.sh access to prd.json)

## Tasks

- [ ] **T-01: Implement clarifying questions prompt**
  - Origin: `skills/prd/SKILL.md` lines 24-53
  - Render 3-5 questions with A/B/C/D options; parse user response (letter or custom text)
  - Criterion: User can respond with "1A, 2C, 3B" or free text; skill parses correctly
  - Confidence: 🟢

- [ ] **T-02: Generate PRD markdown structure**
  - Origin: `skills/prd/SKILL.md` lines 59-95
  - Create markdown with sections: Overview, Goals, User Stories
  - Criterion: Output file has valid markdown syntax; all sections present
  - Confidence: 🟢

- [ ] **T-03: Generate 3-5 user stories from feature description**
  - Origin: `skills/prd/SKILL.md` lines 69-85
  - Each story has Title, Description (As a... I want... so that...), Acceptance Criteria, Priority
  - Criterion: Stories are focused and fit in 2-3 sentences; at least 1 story per major feature aspect
  - Confidence: 🟡

- [ ] **T-04: Assign MoSCoW priority to each story**
  - Origin: `skills/prd/SKILL.md` + common practice
  - Categorize each story as Must/Should/Could/Won't based on feature scope
  - Criterion: Must stories are critical path; Should are important but with fallback; Could are optional
  - Confidence: 🟡

- [ ] **T-05: Save PRD markdown to disk**
  - Origin: `skills/prd/SKILL.md` line 18
  - Write to `tasks/prd-[feature-name-kebab].md`
  - Criterion: File created at correct path; readable markdown
  - Confidence: 🟢

- [ ] **T-06: Parse markdown PRD to extract stories**
  - Origin: `skills/ralph/SKILL.md` + implicit conversion logic
  - Read markdown file; extract title, description, acceptance criteria, priority for each story
  - Criterion: All stories extracted; no data loss
  - Confidence: 🟡

- [ ] **T-07: Validate story size**
  - Origin: `skills/ralph/SKILL.md` lines 46-63
  - Check if story description > 2-3 sentences; warn and suggest split
  - Criterion: Stories >3 sentences flagged; suggestion provided
  - Confidence: 🟡

- [ ] **T-08: Validate story ordering (dependencies)**
  - Origin: `skills/ralph/SKILL.md` lines 67-80
  - Check order: Schema → Logic → UI → Dashboard; warn if out of order
  - Criterion: Stories with schema operations come before stories with UI components
  - Confidence: 🟡

- [ ] **T-09: Generate JSON user story objects**
  - Origin: `skills/ralph/SKILL.md` lines 19-42
  - Transform markdown stories to JSON structure: id, title, description, acceptanceCriteria[], priority (1-4), passes: false, notes: ""
  - Criterion: JSON has all required fields; passes defaults to false
  - Confidence: 🟢

- [ ] **T-10: Assign unique story IDs**
  - Origin: `skills/ralph/SKILL.md` line 28
  - Generate US-001, US-002, ... sequentially; check for duplicates
  - Criterion: No duplicate IDs; numbering contiguous starting at 001
  - Confidence: 🟢

- [ ] **T-11: Convert MoSCoW to numeric priority**
  - Origin: `skills/ralph/SKILL.md` (implied)
  - Map: Must → 1, Should → 2, Could → 3, Won't → 4
  - Criterion: All stories have priority 1-4; consistent mapping
  - Confidence: 🟢

- [ ] **T-12: Generate branch name from feature**
  - Origin: `skills/ralph/SKILL.md` line 24
  - Convert feature name to kebab-case; format as `ralph/[name]`
  - Criterion: Branch name valid git ref; no spaces or special chars
  - Confidence: 🟢

- [ ] **T-13: Assemble prd.json structure**
  - Origin: `skills/ralph/SKILL.md` lines 19-42
  - Create JSON with project, branchName, description, userStories[]
  - Criterion: Valid JSON; all fields present
  - Confidence: 🟢

- [ ] **T-14: Validate JSON schema**
  - Origin: Implicit requirement
  - Check prd.json conforms to expected structure; detect missing/extra fields
  - Criterion: Invalid JSON rejected; valid JSON accepted
  - Confidence: 🟡

- [ ] **T-15: Save prd.json to project root**
  - Origin: `skills/ralph/SKILL.md` + integration with ralph.sh
  - Write to `./prd.json` (or project-specific path)
  - Criterion: File created; readable by ralph.sh
  - Confidence: 🟢

## Test Tasks

- [ ] **TT-01: Generate PRD from feature description**
  - Run `/prd` skill with "Add dark mode"; answer clarifying questions
  - Expected: Output file `tasks/prd-dark-mode.md` with 4-5 user stories
  - Confidence: 🟢

- [ ] **TT-02: Convert markdown PRD to JSON**
  - Run `/ralph` on `tasks/prd-dark-mode.md`
  - Expected: `prd.json` created with same stories, unique IDs, passes: false for all
  - Confidence: 🟢

- [ ] **TT-03: Validate story size warning**
  - Create markdown story with 10+ sentences
  - Run `/ralph`
  - Expected: Warning logged; suggestion to split provided
  - Confidence: 🟡

- [ ] **TT-04: Validate dependency order warning**
  - Create markdown with UI story before schema story
  - Run `/ralph`
  - Expected: Warning logged; suggested reordering provided
  - Confidence: 🟡

- [ ] **TT-05: Agent loop integration**
  - Run `ralph.sh` with generated prd.json
  - Agent picks story where passes: false; implements; updates prd.json
  - Expected: passes set to true for completed story; next iteration picks next story
  - Confidence: 🟢

## Tasks Order

1. **T-01 → T-05:** PRD Generator skill — sequential, no dependencies
2. **T-06 → T-15:** Ralph Converter skill — sequential, depends on parsed markdown (T-06)
3. **TT-01 → TT-05:** Test tasks — end-to-end validation

**Suggested sequence:** T-01 → T-02 → T-03 → T-04 → T-05 → T-06 → T-07 → T-08 → T-09 → T-10 → T-11 → T-12 → T-13 → T-14 → T-15 → TT-01 → TT-02 → TT-03 → TT-04 → TT-05

## Open Gaps (🔴)

- **Story size heuristic:** No automated measurement. Manual review of sentence count.
- **Acceptance criteria generation:** If user doesn't provide, should skill auto-generate generic criteria or warn?
- **Duplicate story prevention:** No check for conceptual duplicates (different title, same feature).
- **PR description generation:** No skill to auto-generate commit/PR messages from completed stories.
