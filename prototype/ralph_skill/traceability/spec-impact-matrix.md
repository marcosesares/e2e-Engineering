# Ralph — Specification Impact Matrix

**Generated:** 2026-05-20  
**Purpose:** Cross-component dependency analysis; risk/change impact assessment

---

## Executive Summary

This matrix tracks **how changes to one component affect others**. Used to:
- Assess change risk (modifying X breaks Y?)
- Identify critical components
- Plan regression testing
- Understand blast radius of changes

**Legend:**
- 🔴 **HIGH** — Direct dependency; breaking change likely
- 🟡 **MEDIUM** — Indirect or conditional dependency; some risk
- 🟢 **LOW** — Loose coupling; minimal impact
- ⚪ **NONE** — No known dependency

---

## Component Matrix

### Format
**Rows** = Source Component (What changes?)  
**Columns** = Target Component (What is affected?)  
**Cell** = Impact level + explanation

---

## Detailed Impact Matrix

### 1. Ralph Loop Orchestrator (ralph.sh)

| If Changed | Spawns Agents | Detects Completion | Reads prd.json | Reads Git | Manages Archives | Flowchart UI |
|-----------|---|---|---|---|---|---|
| **Effect** | 🔴 HIGH — Agent command/args | 🔴 HIGH — Stdout parsing | 🔴 HIGH — State loading | 🟡 MEDIUM — History access | 🟡 MEDIUM — Branch logic | ⚪ NONE |
| **Why** | Syntax error → no spawn | Wrong signal → loop doesn't end | Schema change → parse fail | Git command fail → abort | Archive logic fails | UI is independent |
| **Test Impact** | End-to-end integration tests | stdout parsing tests | prd.json schema tests | git integration tests | Branch archival tests | No impact |
| **Mitigation** | Unit test spawn logic | Add COMPLETE signal tests | Validate prd.json before use | Test git commands offline | Test branch scenarios | — |

---

### 2. Story State (prd.json)

| If Changed | Ralph Loop | Agents | Progress.txt | Git Commits | Flowchart |
|-----------|---|---|---|---|---|
| **Schema** | 🔴 HIGH | 🔴 HIGH | 🟡 MEDIUM | 🟡 MEDIUM | ⚪ NONE |
| **Why** | Parser expects structure | Read to find story | Agents reference stories | Commit messages use story.id | UI is hardcoded |
| **Example** | Add `priority` field? | Agent needs to read it | Progress entries reference it | Commit format may need update | No change needed |
| **Mitigation** | Validate schema before use | Document new fields in CLAUDE.md | Update progress.txt format | Update agent instructions | — |
| **Breaking** | Change story.id format | Change `passes` semantics | Rename fields | Different ID in commits | — |

---

### 3. Progress Log (progress.txt)

| If Changed | Agents Read It | Future Agents Learn | Ralph Loop | Pattern Consolidation | Flowchart |
|-----------|---|---|---|---|---|
| **Format** | 🟡 MEDIUM | 🔴 HIGH | ⚪ NONE | 🟡 MEDIUM | ⚪ NONE |
| **Why** | Agents parse it for patterns | Next agent uses learnings | Not read by ralph.sh | Depends on entry structure | Independent |
| **Example** | Change date format? | Agents confused → miss patterns | No impact | Pattern extraction fails | No impact |
| **Mitigation** | Document format in CLAUDE.md | Add structured fields (JSON?) | — | Add parser validation | — |
| **Breaking** | Truncate file | All learnings lost | — | All patterns lost | — |

---

### 4. Amp Agent Runtime

| If Changed | Orchestrator | prd.json | progress.txt | Git Commits | Quality Checks |
|-----------|---|---|---|---|---|
| **Behavior** | 🔴 HIGH | 🔴 HIGH | 🔴 HIGH | 🔴 HIGH | 🔴 HIGH |
| **Why** | Exit code changes → loop behavior | Update logic changes → wrong status | Log format changes → unreadable | Commit format changes → broken SHAs | Test command changes → failures |
| **Example** | Output COMPLETE signal differently | Stop updating story.passes | Append inconsistently | Commit unsigned | Run different tests |
| **Mitigation** | Document exit code contract | Validate prd.json written correctly | Validate progress entry format | Use git hooks to enforce signing | Document test requirements |
| **Critical** | Orchestrator depends on exit code | Stories won't mark as done | Lost learnings | Lost auditability | Loop continues on failures |

---

### 5. Claude Code Agent Runtime

| If Changed | Orchestrator | prd.json | progress.txt | Git Commits | Quality Checks |
|-----------|---|---|---|---|---|
| **Behavior** | 🔴 HIGH | 🔴 HIGH | 🔴 HIGH | 🔴 HIGH | 🔴 HIGH |
| **Why** | Same as Amp; swap tool | Same as Amp; swap tool | Same as Amp; swap tool | Same as Amp; swap tool | Same as Amp; swap tool |
| **Note** | Both agents have identical contract with orchestrator | N/A | N/A | N/A | N/A |

---

### 6. Git Repository

| If Changed | Ralph Loop | Agents | CI/CD | Pages | prd.json Sync |
|-----------|---|---|---|---|---|
| **Config** | 🟡 MEDIUM | 🟡 MEDIUM | 🔴 HIGH | ⚪ NONE | 🟡 MEDIUM |
| **Why** | Branch checks fail if config wrong | Commits fail if auth broken | Workflows won't trigger | Independent hosting | Archive paths broken |
| **Example** | Wrong branch name | SSH key removed | Workflow trigger removed | No impact | Archive to wrong location |
| **Auth Failure** | Loop stalls waiting for commit | Can't push code | Deployment skipped | Manual deploy needed | Loss of audit trail |
| **Mitigation** | Validate git config before loop | Test SSH/HTTPS auth | Monitor workflow status | Separate static hosting | Test archival logic |

---

### 7. GitHub Actions (CI/CD)

| If Changed | Git | Pages Deployment | Build Artifact | Flowchart |
|-----------|---|---|---|---|
| **Workflow** | 🟡 MEDIUM | 🔴 HIGH | 🔴 HIGH | 🔴 HIGH |
| **Why** | Reads commits (loose coupling) | Depends on artifact upload | Failure → no deploy | UI won't update |
| **Example** | Change trigger event? | Build fails → no upload | Build timeout | Old version served |
| **Critical** | Broken workflow blocks deployment | Users see old UI | Lost artifact = no deploy | Out-of-date docs |
| **Mitigation** | Test workflow locally | Check artifact upload logs | Add timeout monitoring | Users can access prior version |

---

### 8. GitHub Pages

| If Changed | Flowchart Serving | User Access | CI/CD Deploy | Search Engines |
|-----------|---|---|---|---|
| **Hosting** | 🔴 HIGH | 🔴 HIGH | 🟡 MEDIUM | 🟢 LOW |
| **Why** | Artifact only deploys here | Users can't view | Artifact has nowhere to go | Cached old version |
| **Example** | Change domain path? | Links break | Deployment target changed | Search index stale |
| **Downtime** | Users can't access flowchart | Loop still works (UI not critical) | Deployment fails | Old docs cached |
| **Mitigation** | Use canonical domain | Provide offline docs | Test deployment target | Purge search index |

---

### 9. Flowchart UI (React App)

| If Changed | App Build | Dev Server | GitHub Pages | User Learning |
|-----------|---|---|---|---|
| **UI** | 🔴 HIGH | 🔴 HIGH | 🔴 HIGH | 🔴 HIGH |
| **Why** | Build generates artifact | Dev relies on app | Artifact = deployed app | Users learn workflow |
| **Example** | Change step definitions | Dev recompilation fails | Deployed UI wrong | Users misunderstand loop |
| **Breaking** | App won't build → no deploy | Can't iterate on UI | Wrong steps shown | Incorrect documentation |
| **Mitigation** | Test build pipeline | Use HMR during dev | Verify deployed steps | Document step changes |

---

## Cross-Component Dependency Chains

### Chain 1: User Edits prd.json → Agent Reads → Commits → CI/CD Deploys

```
User edits prd.json
    ↓
ralph.sh reads prd.json
    ↓ (validates on next iteration)
Agent reads prd.json (picks story)
    ↓
Agent implements, tests, commits prd.json
    ↓
git pushes commit
    ↓
GitHub Actions triggered
    ↓
CI/CD builds flowchart
    ↓
Pages hosts new artifact
    ↓
User views updated flowchart

Impact Path: prd.json → ralph.sh → agent → git → CI/CD → pages → user
Critical Steps: Agent reading, git commit, CI/CD build
```

**Failure Scenarios:**
1. ❌ prd.json malformed → Agent can't parse → Story not picked → Loop stalls
2. ❌ Git commit fails → CI/CD not triggered → Pages not updated → User sees old UI
3. ❌ CI/CD build fails → Artifact not uploaded → Deployment fails → Manual intervention needed

### Chain 2: Agent Implements → Quality Checks → Commit → Progress Log

```
Agent picks story from prd.json
    ↓
Implements code changes
    ↓
Runs quality checks (typecheck, lint, test)
    ↓ (if pass)
Commits code + updated prd.json
    ↓
Appends to progress.txt
    ↓
ralph.sh detects completion signal
    ↓
Loop continues or exits

Impact Path: story → implementation → tests → commit → progress → loop
Critical Steps: Quality checks pass, commit succeeds, progress written
```

**Failure Scenarios:**
1. ❌ Tests fail → No commit → Story not marked done → Next iteration picks same story
2. ❌ Commit fails (git error) → prd.json not updated → Loop sees no progress
3. ❌ Progress.txt can't be written → Learnings lost → Future agents miss patterns

### Chain 3: ralph.sh Loop → Agent Spawn → Completion → Exit Code

```
ralph.sh starts loop (i=1 to MAX)
    ↓
Spawns agent (Amp or Claude)
    ↓
Agent reads prd.json, picks story
    ↓
Agent implements, commits, logs
    ↓
Agent outputs <promise>COMPLETE</promise> or exits normally
    ↓
ralph.sh detects signal/exit code
    ↓
(if COMPLETE) Exit 0 — SUCCESS
(if not COMPLETE & i < MAX) Continue to i+1
(if not COMPLETE & i >= MAX) Exit 1 — TIMEOUT

Impact Path: loop → spawn → story → signal → detection → exit
Critical Steps: Agent spawn, completion signal, signal detection
```

**Failure Scenarios:**
1. ❌ Agent spawn fails → ralph.sh gets exit 127 → Loop aborts → Manual restart needed
2. ❌ Completion signal format wrong → ralph.sh doesn't detect → Loop continues to MAX
3. ❌ Exit code wrong → Loop logic breaks → Unknown state

---

## Risk Assessment by Component

### 🔴 CRITICAL (High Risk)

| Component | Why | Mitigation |
|-----------|-----|-----------|
| **Agent Runtime** | All story implementation | Comprehensive testing; document CLAUDE.md contract |
| **ralph.sh** | Orchestrates entire loop | Unit tests for each function; integration tests |
| **prd.json** | Defines what to build | Schema validation before load; robust parsing |
| **Quality Checks** | Gatekeeper for commits | Enforce in agent; document in CLAUDE.md |

### 🟡 MEDIUM (Medium Risk)

| Component | Why | Mitigation |
|-----------|-----|-----------|
| **Git Integration** | Persistence layer | Test git commands offline; handle errors |
| **GitHub Actions** | Deployment automation | Monitor workflow runs; log artifacts |
| **progress.txt** | Learning consolidation | Test append logic; validate format |

### 🟢 LOW (Low Risk)

| Component | Why | Mitigation |
|-----------|-----|-----------|
| **Flowchart UI** | Documentation (not critical) | Test build pipeline; verify deployed steps |
| **GitHub Pages** | Hosting (user can access repo directly) | Monitor uptime; have fallback links |

---

## Change Impact Examples

### Example 1: Change prd.json schema (add `priority` field)

**Affected Components:**
- ✅ ralph.sh — Must handle new field (LOW if ignored)
- 🔴 Agent runtime — Needs to read new field if story.priority is used
- 🟡 progress.txt — Might reference priority in learnings
- ⚪ Git — Not affected
- ⚪ Pages — Not affected

**Recommendation:** 
- Update schema documentation
- Update agent CLAUDE.md to reference priority field
- Add test case for prd.json with new field

---

### Example 2: Change agent completion signal

**Affected Components:**
- 🔴 ralph.sh — Must update detection logic
- 🔴 Agent (Amp & Claude) — Must output new signal
- 🟡 Orchestrator loop — Depends on correct signal
- ⚪ Everything else — Not affected

**Recommendation:**
- Update both Amp and Claude agent instructions
- Add ralph.sh test for new signal format
- Document new signal in CLAUDE.md and prompt.md

---

### Example 3: Change flowchart UI steps

**Affected Components:**
- ⚪ ralph.sh — Not affected
- ⚪ Agents — Not affected
- 🟡 CI/CD — Must rebuild artifact
- 🟡 Pages — Serves new artifact
- 🔴 Users — See new workflow visualization

**Recommendation:**
- Update allSteps[] in App.tsx
- Test build pipeline
- Verify deployed steps on GitHub Pages
- Document step changes in README

---

## Regression Test Plan

### Core Regression Suite

| Component | Test | Impact |
|-----------|------|--------|
| **prd.json Loading** | Valid/invalid JSON, missing fields | HIGH — Story selection |
| **Agent Spawning** | Amp spawn, Claude spawn, missing tool | HIGH — Loop starts |
| **Completion Detection** | Signal present/absent, timeout | HIGH — Loop ends |
| **Git Integration** | Commit, push, branch change | HIGH — Persistence |
| **Quality Checks** | Pass/fail scenarios | HIGH — Code gates |
| **progress.txt** | Append, parse, format | MEDIUM — Learnings |
| **Build Pipeline** | npm build, artifact generation | MEDIUM — Deployment |
| **UI Steps** | Render, navigate, phase colors | LOW — Documentation |

### Smoke Tests (Quick Validation)

```bash
1. ralph.sh --tool amp 1        # Single iteration
2. Check prd.json updated       # Story marked passes: true
3. Check git commit exists      # Code committed
4. Check progress.txt appended  # Entry added
5. Check Pages deployment       # UI updated (if branch is main)
```

---

## Deployment Impact Analysis

### Low-Risk Changes (No Regression Testing Required)
- Flowchart UI styling or copy
- Documentation updates (CLAUDE.md, README)
- Non-breaking skill additions

### Medium-Risk Changes (Unit Testing Required)
- Ralph.sh functions (argument parsing, archive logic)
- prd.json schema extensions (new optional fields)
- progress.txt format improvements

### High-Risk Changes (Full Regression Suite + Integration Tests Required)
- Agent spawn logic
- Completion signal format
- prd.json schema breaking changes (removed/renamed fields)
- Git integration changes
- Quality check threshold changes

---

## Traceability Summary

| Artifact | Traced To | Dependency Type |
|----------|-----------|-----------------|
| prd.json | ralph.sh, agents, git | Hard (data-critical) |
| progress.txt | agents, future agents | Soft (knowledge) |
| Git commits | CI/CD, archive logic | Hard (audit trail) |
| CLAUDE.md | Agents | Soft (instructions) |
| App.tsx | Build, deployment | Hard (deliverable) |
| ralph.sh | Agents, git, prd.json | Hard (orchestration) |

**Critical Path:** prd.json → agents → git → CI/CD → Pages

