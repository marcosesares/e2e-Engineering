# Secondary Skills Module — Flowcharts

> Consolidated flowcharts for 10 supporting skills with simpler processes

---

## 1. Receiving Code Review

**Purpose:** Process feedback on work, implement fixes

```
Receive review feedback
  ↓
Read comments carefully
  ↓
For each comment:
  - Understand problem
  - Implement fix
  - Test fix
  - Commit change
  ↓
Re-submit for review
```

**Key:**
- Don't argue, understand intent
- Implement all feedback unless blocked
- Test before re-submitting
- Respond to reviewer with changes made

---

## 2. Requesting Code Review

**Purpose:** Get external quality gate before merging

```
Feature complete
  ↓
Push branch to remote
  ↓
Create pull request with:
  - Clear title
  - Summary of changes
  - Test plan
  - Issue reference
  ↓
Assign reviewers (spec → quality → final)
  ↓
Wait for feedback
  ↓
Respond to comments
  ↓
Merge when approved
```

**Reviewer sequence:**
1. **Spec reviewer** — Does code match spec?
2. **Quality reviewer** — Is code clean?
3. **Final reviewer** — Architecture OK?

---

## 3. Dispatching Parallel Agents

**Purpose:** Execute independent tasks simultaneously

```
Read plan
  ↓
Identify independent tasks (no dependencies)
  ↓
For each task in parallel:
  ├─ Dispatch subagent
  ├─ Wait for completion
  └─ Verify work
  ↓
Collect all results
  ↓
Integrate results
  ↓
Run full test suite
```

**Red flags:**
- Tasks NOT independent → use sequential execution
- Unclear dependencies → clarify order first
- Tight coupling → split differently

---

## 4. Writing Skills

**Purpose:** Create new skills using TDD (meta-skill)

```
Skill idea (problem to solve)
  ↓
Test skill: Write scenario showing what skill does
  ↓
Write skill framework:
  - Metadata (name, description, triggers)
  - Process phases
  - Gate conditions
  - Red flags / anti-patterns
  ↓
Run skill in real session (pressure test)
  ↓
Refine based on results
  ↓
Document fully (examples, checklist)
  ↓
User approves skill design
```

**Key:** Skills are tested like code (TDD applied to documentation)

---

## 5. Using Superpowers

**Purpose:** Foundation skill — check this before invoking others

```
User requests something
  ↓
Check: Is there a skill for this?
  ↓
YES → Check skill triggers → Does your context match?
     YES → Invoke skill
     NO → Do work inline
  ↓
NO → Check existing skills for related work
     → Consider combining skills
     → Or do work inline
```

**Principle:** Skills are optional patterns, not required. Use when they fit.

---

## 6. Caveman Commit

**Purpose:** Generate terse, precise commit messages

```
Staged changes
  ↓
Determine:
  - Type: feat, fix, refactor, etc.
  - Scope: (optional) component affected
  - Subject: ≤50 chars, imperative
  ↓
Generate message:
  type(scope): subject
  
  [optional body if WHY non-obvious]
  [optional footer if breaking change]
  ↓
Commit with message
```

**Format (Conventional Commits):**
```
feat(auth): add JWT token refresh

Implement automatic token refresh before expiry.
Tokens now refresh 5 min before expiration.

BREAKING CHANGE: old tokens will expire without refresh
```

---

## 7. Caveman Compress

**Purpose:** Lossless compression of markdown files

```
Source file: README.md (3000 lines, 50k chars)
  ↓
Compress:
  - Remove articles/filler
  - Keep all technical substance
  - Preserve structure, code blocks, URLs
  ↓
Output:
  - README.md (compressed, 1200 lines)
  - README.original.md (backup)
  ↓
Result: ~60% size reduction, zero loss
```

---

## 8. Caveman Review

**Purpose:** Generate compressed PR feedback

```
PR diff
  ↓
For each issue:
  - Locate (file:line)
  - Classify (🔴 bug / 🟡 risk / 🔵 nit / ❓ question)
  - Problem (≤20 words)
  - Fix (≤20 words, concrete action)
  ↓
Output: One-line comments
```

**Example:**
```
src/api.ts:42: 🔴 bug: user null after .find(). Add guard before .email.
src/api.ts:128: 🟡 risk: concurrent dict modification. Use lock.
```

---

## 9. Caveman Help

**Purpose:** Quick reference card for caveman modes

```
User asks: "What caveman commands?"
  ↓
Display:
  - 6 intensity levels
  - Drop/keep rules
  - Pattern examples
  - Session control
  - Auto-clarity triggers
  ↓
One-shot display, not persistent mode
```

---

## 10. Caveman Stats

**Purpose:** Token usage reporting (hook-injected)

```
Session ends
  ↓
Hook measures:
  - Baseline tokens (no compression)
  - Compressed tokens (caveman mode)
  - Reduction percent
  ↓
Report:
  Caveman mode: 75% reduction
  Baseline: 12,500 tokens
  Compressed: 3,125 tokens
  Savings: 9,375 tokens
```

**Note:** Hook-injected, not computed by model. Metrics collected at transport layer.

---

## Integration Points

```
brainstorming ↓
writing-plans ↓
[execution: choose one]
├─ subagent-driven-development
├─ executing-plans (sequential)
└─ dispatching-parallel-agents (parallel)
↓
finishing-a-development-branch
```

**Supporting skills:**
- caveman-* (all modes)
- cavecrew (delegation)
- receiving/requesting-code-review
- writing-skills (meta)
- using-superpowers (foundation)

---

## Confidence

| Skill | Confidence |
|-------|-----------|
| Receiving/Requesting Review | 🟢 CONFIRMADO |
| Dispatching Parallel | 🟢 CONFIRMADO |
| Writing Skills | 🟢 CONFIRMADO |
| Using Superpowers | 🟢 CONFIRMADO |
| Caveman Commit | 🟢 CONFIRMADO |
| Caveman Compress | 🟡 INFERIDO (mechanism) |
| Caveman Review | 🟢 CONFIRMADO |
| Caveman Help | 🟢 CONFIRMADO |
| Caveman Stats | 🔴 LACUNA (hook-based) |

