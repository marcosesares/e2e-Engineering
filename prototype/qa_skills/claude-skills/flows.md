# Claude Skills, Fluxos Distintivos

---

## Flow A: Bug Fix Workflow

```
/work-on QA-1234 (Bug)
  ↓
work-on routes to fix-qa-bug
  ↓
fix-qa-bug [QA-1234]
  ├─ /plan-change (user describes investigation)
  ├─ [awaits user code changes + tests]
  ├─ /review-change (user describes changes)
  ├─ /commit-change (commits + Jira comment)
  └─ Done
```

**Entry points:** `/work-on`, `/fix-qa-bug`  
**Key gates:** plan-change (approval), review-change (approval)  
**Output:** Commit SHA, Jira comment with link

---

## Flow B: Story Implementation Workflow

```
/work-on QA-2000 (Automation Story)
  ↓
work-on routes to implement-story
  ↓
implement-story [QA-2000]
  ├─ /plan-change (user describes implementation)
  ├─ [awaits user code + test implementation]
  ├─ /review-change (peer review)
  ├─ /commit-change (commits + links)
  └─ Done
```

**Identical to Flow A** except context is story-specific.

---

## Flow C: Feature Test Plan → Apply

```
/plan-feature-coverage DC-4719 (Epic)
  ├─ Fetch epic + stories
  ├─ Evaluate AC vs existing ADO TCs
  ├─ test-plan generates feature Markdown
  └─ Saves to DC-4719-{slug}.md

/apply-test-plan output/DC-4719-{slug}.md
  ├─ Parse → Validate → Approve gate
  ├─ create-ado-test-cases.ps1 (creates TCs)
  ├─ manage-ado-test-suite.ps1 (adds to suite)
  ├─ set-jira-test-plan-ids.ps1 (writes back)
  └─ Done
```

**Entry points:** `/plan-feature-coverage`, `/apply-test-plan`  
**Key gate:** Approve before ADO mutations  
**Output:** ADO test cases, suite, Jira story custom fields 10257/10258

---

## Flow D: Regression Plan → Apply

```
/plan-regression-coverage
  ├─ Fetch all TCs in scope (JQL by product/sprint)
  ├─ Apply rubric: NEW | Manual | Absorbed | Dropped
  ├─ test-plan generates regression Markdown
  └─ Saves to {Product}-regression-{date}.md

/apply-test-plan {path}
  ├─ Parse → Validate → Approve gate
  ├─ create-ado-test-cases.ps1 (creates NEW TCs)
  ├─ update-ado-test-cases.ps1 (updates existing)
  ├─ manage-ado-test-suite.ps1 (suite management)
  └─ [NO Jira writeback for regression]
```

**Entry points:** `/plan-regression-coverage`, `/apply-test-plan`  
**Key difference:** No Jira writeback  
**Output:** ADO test cases with CoverageType, RegressionCoverageEvaluation fields

---

## Flow E: Jira Fetch with Caching

```
/fetch-jira-item QA-1234
  OR
work-on → fetch internally

Step 1: Check cache
  cache_path = ~/.claude/fetch-jira-item/QA-1234/raw.json
  
Step 2a: Cache miss
  → Full REST fetch → write raw.json → continue
  
Step 2b: Cache hit
  → Lightweight timestamp check
  → If mismatch → full fetch
  → If match → use cached

Step 3: Return structured brief
```

**Caching:** Timestamp-based invalidation  
**TTL:** Implicit (user may manually delete cache)  
**Output:** brief.md + attachments/

---

## Flow F: Skill Distribution & Updates

```
Publisher (BeckTech.QA.Tools)
  ├─ /publish-skills
  ├─ git subtree split → published-skills
  └─ Force push to remote

Consumer (BeckTech.QA.Estimator)
  ├─ /onboard (first time)
  │  ├─ setup-claude-hooks
  │  │  └─ Install SessionStart + PreToolUse hooks
  │  └─ sync-shared-skills.ps1
  │     └─ Fetch published-skills → .claude/skills/
  │
  └─ SessionStart hook runs
     ├─ check-updates.ps1
     ├─ Detect new published-skills commits (cached 4h)
     └─ If updates: prompt user "Updates available. Sync now?"
        └─ User: /refresh-setup
           └─ sync-shared-skills.ps1 again
```

**Guard:** PreToolUse hook prevents edits to synced files  
**Bypass:** QA_ALLOW_SHARED_EDIT=1 for maintainers

---

## Flow G: New User Onboarding

```
/onboard
  ├─ Repo checks
  │  ├─ git remote 'shared-skills' exists?
  │  ├─ repo-context/SKILL.md exists?
  │  ├─ CLAUDE.md exists?
  │  └─ Updates available?
  │
  └─ Per-user setup (7 steps)
     ├─ Step 1: Claude hooks (SessionStart + PreToolUse)
     ├─ Step 2: Atlassian MCP
     ├─ Step 3: Atlassian API credentials
     ├─ Step 4: Azure DevOps MCP
     ├─ Step 5: ADO API credentials
     ├─ Step 6: Playwright MCP (optional)
     └─ Step 7: Notifications (optional)
```

**Output:** Setup completion report
