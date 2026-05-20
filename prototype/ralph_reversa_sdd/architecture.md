# Ralph — Architecture Overview

**Generated:** 2026-05-20  
**Doc Level:** Completo  
**Version:** 1.0

---

## System Context

Ralph is a **framework for autonomous AI agent loops** that automates software development from Product Requirements Documents (PRDs). The system coordinates stateless AI agents (Amp or Claude Code) to iteratively implement user stories, leveraging Git for version control and file-based persistence.

**Key Principle:** Fresh agent per iteration. No server-side state. Everything persists via Git, PRD files, and progress logs.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RALPH FRAMEWORK                          │
│  (Autonomous AI Agent Loop for PRD-Driven Development)      │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────▼────────┐   ┌──────▼───────┐
            │  Core Loop     │   │   Frontend   │
            │  (ralph.sh)    │   │  (Flowchart) │
            └────────────────┘   └──────────────┘
                    │                   │
        ┌───────────┼───────────┐       │
        │           │           │       │
    ┌───▼──┐   ┌───▼──┐   ┌───▼──┐   │
    │ PRD  │   │ Prog │   │ Skills   │
    │.json │   │.txt  │   │Manager   │
    └──────┘   └──────┘   └────────┘
        │           │           │
        └─────┬─────┴─────┬─────┘
              │           │
          ┌───▼───────────▼────┐
          │   Git Repository   │
          │  (Version Control) │
          └────────────────────┘
              │
          ┌───▼────────────────┐
          │  AI Agent Runtime  │
          │  (Amp | Claude)    │
          └────────────────────┘
```

---

## Containers (C4 Level 2)

### 1. Ralph Loop Container 🟢
**Responsibility:** Orchestrate agent iterations, manage PRD state, handle completion signals.

**Technology:** Bash (`ralph.sh`)

**Internal Components:**
- Loop manager (for i=1 to MAX_ITERATIONS)
- Agent spawner (subprocess for Amp or Claude)
- Completion detector (looks for `<promise>COMPLETE</promise>`)
- Archive manager (branch isolation)
- Progress listener (appends to progress.txt)

**Interfaces:**
- ✅ **Reads:** `prd.json` (story list, branch name)
- ✅ **Reads:** `progress.txt` (past learnings, patterns)
- ✅ **Reads:** git history (commits, branch state)
- ✅ **Writes:** spawns Agent process
- ✅ **Detects:** COMPLETE signal from agent stdout

**Entry Points:**
- `./ralph.sh [--tool amp|claude] [MAX_ITERATIONS]`

---

### 2. Story State Container (PRD File) 🟢
**Responsibility:** Single source of truth for what needs doing.

**Technology:** JSON (`prd.json`)

**Schema:**
```json
{
  "projectName": "string",
  "branchName": "string",
  "stories": [
    {
      "id": "US-001",
      "title": "Feature title",
      "acceptanceCriteria": ["criterion 1", "criterion 2"],
      "passes": false
    }
  ]
}
```

**State Transitions:**
- `passes: false` → Story needs implementation (next agent picks it)
- `passes: true` → Story complete (agent skips it)

**Concurrency:** Single-threaded (ralph.sh runs one agent at a time)

---

### 3. Progress Container (Append-Only Log) 🟢
**Responsibility:** Preserve learnings across stateless iterations.

**Technology:** Markdown (`progress.txt`)

**Format:**
```
## Codebase Patterns
- Pattern 1
- Pattern 2

## [Date] - Story ID
- Implementation details
- Files changed
- Learnings for future iterations
---
```

**Key Property:** Append-only; never truncated. Acts as audit trail + learning base for next agents.

---

### 4. Skills Manager Container 🟢
**Responsibility:** Provide domain-specific automation (PRD generation, validation).

**Technology:** Markdown + SKILL.md definitions (`.claude/skills/` & `.agents/skills/`)

**Known Skills:**
- `prd-to-json` — Convert Markdown PRD → prd.json
- `prd` — Generate PRD from scratch
- 40+ Reversa analysis skills (installed in `.claude/skills/reversa-*`, `.agents/skills/reversa-*`)

**Invocation:** Via CLI or agent prompt (e.g., `/prd` skill)

---

### 5. Flowchart UI Container 🟢
**Responsibility:** Interactive visualization of Ralph's loop for user education.

**Technology:** React 19 + @xyflow/react + Vite + TypeScript

**Architecture:**
- Single **App.tsx** component (~380 lines)
- 10-step visualizer (Setup → Loop → Decision → Done)
- Mermaid-compatible layout using @xyflow node/edge model
- Color-coded phases (setup/loop/decision/done)

**Data Models:**
- `allSteps: Step[]` — 10 workflow steps
- `nodes: Node[]` — Flowchart boxes
- `edges: Edge[]` — Connections between boxes
- `visibleCount: number` — Animation state (user can step forward/backward)

**Interfaces:**
- ✅ **Reads:** None (hardcoded step definitions)
- ✅ **Renders:** Static HTML (no backend data)
- ✅ **Hosts:** GitHub Pages (via CI/CD)

**Key Functions:**
- `createNode(step, visible, position)` — Build @xyflow Node
- `createEdge(conn, visible)` — Build @xyflow Edge with animation
- onClick handlers for Next/Previous/Reset buttons

---

### 6. AI Agent Runtime Container 🟢
**Responsibility:** Implement single story, run quality checks, commit if tests pass.

**Technology:** Amp CLI or Claude Code (spawned as subprocess)

**Internal State:**
- Reads CLAUDE.md / prompt.md (instructions)
- Reads prd.json (story to implement)
- Reads progress.txt (past patterns)
- Fresh context per iteration (no memory)

**Responsibilities:**
1. Pick story where `passes: false` (highest priority)
2. Implement story (write code)
3. Run quality checks (typecheck, lint, test)
4. **If checks pass:** commit + update prd.json + log to progress.txt + output COMPLETE signal
5. **If checks fail:** abort (no commit)

**Concurrency:** Single agent per iteration (sequential)

---

### 7. Git Repository Container 🟢
**Responsibility:** Version control, commit history, auth.

**Technology:** Git (local + remote on GitHub)

**Artifacts Stored:**
- Codebase (source files)
- Commit history (audit trail; commit message: `feat: [Story ID] - [Title]`)
- Branch state (current branch from prd.json)
- Archive folders (when branch changes: `archive/YYYY-MM-DD-{branch}/`)

**Interfaces:**
- ✅ **Agent pushes:** commits + updated prd.json
- ✅ **ralph.sh reads:** commit history, branch state
- ✅ **CI/CD triggers:** on push to main

---

### 8. Reversa Framework Container 🟡
**Responsibility:** Legacy code analysis (installed but not active in normal Ralph loops).

**Technology:** 40+ Markdown skills + agent orchestration (`.claude/skills/reversa-*`)

**Purpose:** Analyze existing codebases, extract requirements, generate specs for new features.

**Current Status:** Installed, available via `/reversa` skill. Operates independently (not integrated into main Ralph loop).

---

### 9. CI/CD Container 🟢
**Responsibility:** Build and deploy the Flowchart UI on every push to main.

**Technology:** GitHub Actions (`.github/workflows/deploy.yml`)

**Trigger:** Push to main branch or manual `workflow_dispatch`

**Pipeline:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (`npm ci`)
4. Build (`npm run build`)
5. Deploy artifact to GitHub Pages (`/ralph` path)

**Output:** Flowchart UI hosted at GitHub Pages

---

## Integration Points

### Ralph ↔ Agents
```
ralph.sh
  │
  ├─ Spawns Amp/Claude subprocess
  │  with CLAUDE.md + prd.json + progress.txt
  │
  └─ Waits for:
     • Completion signal: <promise>COMPLETE</promise>
     • Exit code (0 = success, 1 = failure)
     • Updated prd.json + progress.txt in git history
```

### Agents ↔ Git
```
Agent
  │
  ├─ Writes code to repo
  │
  ├─ Commits: git commit -m "feat: [Story ID] - [Title]"
  │  └─ Includes updated prd.json (prd.json.stories[i].passes = true)
  │
  └─ Logs to progress.txt (append-only)
```

### Flowchart ↔ User
```
Browser (localhost:5173 or GitHub Pages)
  │
  └─ React App
     ├─ Renders 10-step workflow
     ├─ User clicks Next/Previous/Reset
     └─ Shows phase colors, notes, edge animations
```

### CI/CD ↔ GitHub Pages
```
Git push main
  │
  └─ GitHub Actions triggered
     ├─ Builds flowchart (npm run build)
     ├─ Generates flowchart/dist/
     └─ Deploys to GitHub Pages (/ralph path)
```

---

## Data Models

### User Story (prd.json)
```typescript
type UserStory = {
  id: string;                    // e.g., "US-001"
  title: string;                 // Feature name
  acceptanceCriteria: string[];  // What counts as done
  passes: boolean;               // Status: false = TODO, true = DONE
};
```

### Flowchart Step (hardcoded in App.tsx)
```typescript
type Step = {
  id: string;                 // e.g., "step-1"
  label: string;              // Display text
  description: string;        // Detailed explanation
  phase: 'setup' | 'loop' | 'decision' | 'done';
};
```

### Progress Entry (progress.txt)
```markdown
## [Date/Time] - [Story ID]
- Implementation details
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas
  - Useful context
---
```

---

## Key Patterns

### ✅ Stateless Agents, File-Based Persistence
- **Pattern:** Fresh agent per iteration; zero memory between runs.
- **Benefit:** Isolation, reproducibility, no context drift.
- **Implementation:** ralph.sh spawns subprocess; agent reads prd.json + progress.txt.

### ✅ Single Story Per Iteration
- **Pattern:** Agent implements exactly one story where `passes: false`.
- **Benefit:** Focus, lower risk of test failures, faster completion.
- **Implementation:** CLAUDE.md step 4; agent skips if all stories are `passes: true`.

### ✅ Commit Only If Tests Pass
- **Pattern:** Quality gate (typecheck, lint, test) before commit.
- **Benefit:** Broken code doesn't reach main; next iteration starts fresh.
- **Implementation:** Agent runs checks; only commits if all pass.

### ✅ Append-Only Learnings Log
- **Pattern:** progress.txt is never truncated; only appended.
- **Benefit:** Audit trail; future agents learn from past mistakes.
- **Implementation:** Agents append structured entries; ralph.sh preserves file.

### 🟡 Tool Flexibility: Amp or Claude
- **Pattern:** ralph.sh accepts `--tool amp|claude`; both supported.
- **Benefit:** Choice of AI backend; future-proof.
- **Implementation:** Argument parsing; conditional subprocess spawn.

### 🟡 Branch Isolation & Archival
- **Pattern:** If prd.json.branchName changes, old run is archived.
- **Benefit:** Parallel work; no accidental overwrites.
- **Implementation:** ralph.sh checks branch before loop; archives if changed.

---

## Technical Debt & Gaps 🔴

| Issue | Severity | Mitigation |
|-------|----------|-----------|
| No prd.json schema validation | High | Garbage in → garbage out. Could add JSON schema validation. |
| No maxContextSize enforcement | Medium | Agent could run out of context mid-story. Could add token budgeting. |
| No inter-story dependencies | Low | Stories assumed independent. If dependencies needed, add `depends_on: ["US-001"]` field. |
| No rollback mechanism | Medium | If commit breaks next iteration, no automatic revert. Could add `git reset --hard` option. |
| Pattern consolidation not enforced | Low | Agents are *instructed* to update AGENTS.md, but ralph.sh doesn't verify. Could add validation check. |
| No test framework detection | Medium | "Run tests" is generic; ralph.sh doesn't auto-detect pytest, jest, etc. Could add framework detection. |
| Archive location is local only | Low | No remote backup of archived runs. Could add `git push archive/*`. |

---

## Deployment Architecture

### Local Development
```
$ cd flowchart
$ npm install
$ npm run dev
→ Server starts at http://localhost:5173
→ Changes hot-reload (HMR enabled)
```

### Production (GitHub Pages)
```
git push main
  │
  └─ GitHub Actions (deploy.yml)
     ├─ Checkout, setup Node 20
     ├─ npm ci (clean install)
     ├─ npm run build (→ flowchart/dist/)
     ├─ Upload artifact
     └─ Deploy to https://github.com/pages
        └─ Served at /ralph/ path
```

---

## Confidence Levels

- 🟢 **CONFIRMED** — Code analysis, ralph.sh, CLAUDE.md, prd.json schema
- 🟡 **INFERRED** — Patterns, learnings consolidation (documented but not enforced)
- 🔴 **LACUNA** — maxContextSize, inter-story dependencies, rollback

---

## Next Steps (For Documentation)

1. ✅ C4 Contexto — This system, users, external systems
2. ✅ C4 Containers — Ralph Loop, Story State, Agent Runtime, UI, Git, CI/CD
3. ⏳ C4 Componentes — (see c4-components.md)
4. ⏳ ERD Completo — (see erd-complete.md)
5. ⏳ Spec Impact Matrix — (see traceability/spec-impact-matrix.md)

