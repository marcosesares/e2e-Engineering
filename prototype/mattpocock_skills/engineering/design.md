# Design: Engineering Skills Bucket

> Identificador: `001-engineering-skills`
> Data: `2026-05-15`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

---

## 1. Visão geral

The engineering bucket is a collection of 10 self-contained AI agent skills. Each skill is a Markdown natural-language program stored in a folder with a mandatory `SKILL.md` and optional supporting files. Skills share no runtime state between sessions — they are stateless invocations. State that must persist between invocations (e.g., issue tracker config, CONTEXT.md glossary) lives in the developer's target repository, seeded by `setup-matt-pocock-skills`.

---

## 2. Componentes e responsabilidades

| Component | Primary responsibility | Dependency tier |
|-----------|----------------------|-----------------|
| `setup-matt-pocock-skills` | Seeds per-repo config; acts as hard-dep gatekeeper | None (entry point) |
| `triage` | 5-state issue lifecycle management | Hard (triage-labels.md) |
| `to-prd` | Requirement → structured PRD conversion | Hard (triage-labels.md) |
| `to-issues` | PRD → vertical-slice issues in tracker | Hard (triage-labels.md) |
| `grill-with-docs` | Conversational requirements elicitation with docs | Soft (CONTEXT.md, ADRs) |
| `tdd` | Test-first feature implementation loop | Soft (CONTEXT.md, ADRs) |
| `diagnose` | 6-phase bug diagnosis loop | Soft (CONTEXT.md) |
| `improve-codebase-architecture` | Iterative seam identification + deep module refactoring | Soft (CONTEXT.md, ADRs) |
| `prototype` | Design-question answering via throwaway artifacts | None |
| `zoom-out` | Perspective reset (no AI reasoning; content is the instruction) | None |

---

## 3. Fluxo de controle — componentes principais

### 3.1 `setup-matt-pocock-skills` — Config seeding flow

```
Invoke /setup-matt-pocock-skills
  │
  ├─ Check: does triage-labels.md exist?
  │   ├─ YES → skip (idempotent)
  │   └─ NO  → interview user: issue tracker type, label strings
  │             → write triage-labels.md to target repo
  │
  ├─ Check: does CONTEXT.md exist?
  │   ├─ YES → skip
  │   └─ NO  → write empty CONTEXT.md seed (glossary-only notice)
  │
  ├─ Check: does docs/adr/ exist?
  │   ├─ YES → skip
  │   └─ NO  → create docs/adr/ directory
  │
  └─ Report: files created / files skipped
```

### 3.2 `triage` — State machine execution

Explicit 7-step triage workflow (🟢 — source: tutorial Part 5):

```
Step 1: PULL all untriaged issues from tracker
Step 2: CATEGORIZE each as bug or enhancement (apply category label)
Step 3: DECIDE target state
Step 4: If unclear → needs-info (mark and post Triage Notes)
Step 5: If out of scope → wontfix (document why in .out-of-scope/)
Step 6: If actionable → write Agent Brief
Step 7: Mark ready-for-agent ONLY when fully specified

KEY RULE: an issue must not be picked up by an AFK agent
unless it is explicitly ready-for-agent.
(Prevents wasting agent time on vague, low-quality,
contradictory, or out-of-scope tasks.)
```

Detailed per-issue flow:

```
Invoke /triage [issue-url or issue-number]
  │
  ├─ READ: triage-labels.md (hard dependency — halt if missing)
  │
  ├─ FETCH: issue content + current labels from tracker
  │
  ├─ CHECK: out-of-scope match
  │   └─ concept-similarity scan against .out-of-scope/*.md
  │       └─ MATCH FOUND → report to maintainer, suggest wontfix
  │
  ├─ CHECK: label conflict (multiple state roles)
  │   └─ CONFLICT → flag and halt; ask maintainer to resolve
  │
  ├─ DETERMINE: current state from labels
  │
  ├─ GRILL: one question at a time until issue fully understood
  │   └─ if answerable by codebase exploration → explore, don't ask
  │
  ├─ DECIDE: target state transition
  │   ├─ needs-info → post Triage Notes comment; apply needs-info label
  │   ├─ ready-for-agent → post Agent Brief comment; apply ready-for-agent label
  │   ├─ ready-for-human → apply ready-for-human label
  │   └─ wontfix
  │       ├─ enhancement → write .out-of-scope/<concept>.md; apply wontfix label
  │       └─ bug → polite explanation only; apply wontfix label
  │
  └─ INVARIANT: verify exactly 1 state role + exactly 1 category role on issue
```

### 3.3 `to-prd` → `to-issues` pipeline

```
to-prd:
  Input: freeform requirements text or existing document
  │
  ├─ READ: triage-labels.md
  ├─ INTERVIEW: grill user for missing details (one question at a time)
  └─ OUTPUT: structured PRD with
      ├─ title
      ├─ user stories (role, want, so-that)
      ├─ acceptance criteria
      └─ open questions

to-issues (receives PRD):
  │
  ├─ READ: triage-labels.md
  ├─ DECOMPOSE PRD into vertical slices
  │   ├─ Identify tracer bullet (thinnest end-to-end path)
  │   └─ Identify remaining slices by layer: schema → api → ui → test
  │
  ├─ TYPE each slice: AFK (automatable) or HITL (requires human)
  │
  └─ CREATE issues in tracker:
      ├─ Tracer bullet issue (first)
      └─ Remaining slices (ordered by layer)
```

### 3.4 `diagnose` — 6-phase loop

```
Phase 1: CLARIFY       — understand symptom and repro steps
Phase 2: REPRODUCE     — attempt to reproduce; confirm repro path
Phase 3: HYPOTHESIZE   — generate candidate root causes
Phase 4: TEST          — design targeted test for top hypothesis
Phase 5: CONFIRM       — validate hypothesis matches evidence
Phase 6: FIX           — propose minimal fix for confirmed root cause
```

All 6 phases must complete before a fix is suggested. 🟢

### 3.5 `tdd` — Red-green-refactor loop

```
LOOP:
  1. Write ONE failing test (RED) for the smallest vertical slice
  2. Write minimal implementation to make it pass (GREEN)
  3. Refactor — ONLY while GREEN
     └─ Never refactor while RED (invariant)
  4. Test targets public interface only — never private methods or internal state

  SLICE ORDERING:
    1. Tracer bullet first (proves end-to-end path)
    2. Schema / data model
    3. Business logic
    4. API / integration layer
    5. UI / presentation
UNTIL: feature complete
```

### 3.6 `grill-with-docs` — Conversational elicitation loop

```
INPUT: user intent + project docs (CONTEXT.md, ADRs, design docs)

LOOP:
  1. Read available docs
  2. Identify next unknown
  3. If answerable by codebase exploration → explore (no question)
  4. Else → ask exactly ONE question
  5. Record answer
  6. Assess: is output spec complete and unambiguous?
     ├─ YES → produce structured output
     └─ NO  → continue loop

NO maximum question cap.
```

### 3.7 `prototype` — Branch router

```
INPUT: design question

ROUTE DECISION:
  ├─ Logic question (state/behaviour) → LOGIC BRANCH
  ├─ UI question (appearance/layout)  → UI BRANCH
  └─ Ambiguous
      ├─ Surrounding code is backend → LOGIC BRANCH
      ├─ Surrounding code is page/component → UI BRANCH
      └─ User reachable → ask user

LOGIC BRANCH:
  1. Build logic module (reducer / state machine / functions)
  2. Wrap in throwaway TUI shell
  3. Hand to user to run
  4. Capture answer
  5. DELETE TUI shell
  6. Optionally PROMOTE logic module to production

UI BRANCH:
  1. Build 2-3 variants
     ├─ Preferred: variations on existing page
     └─ Last resort: new hidden route
  2. Gate with NODE_ENV !== 'production' switcher
  3. User picks winner
  4. Winner PROMOTED into real page/route
  5. Losers DELETED
```

### 3.8 `improve-codebase-architecture` — Deepening loop

```
LOOP:
  1. Read current codebase area
  2. Identify seams (where interfaces live; where behaviour can be altered)
  3. Assess each component: deep (small interface, large impl) or shallow (large interface, thin impl)?
  4. Propose refactor toward deeper module / cleaner seam
  5. Discuss with user; apply if agreed
  6. Re-read updated code
UNTIL: user is satisfied with depth
```

---

## 4. Estruturas de dados

### triage-labels.md schema (🟢)

```
# Triage Labels — <repo name>

## State roles
needs-triage: "<label-string-in-tracker>"
needs-info: "<label-string-in-tracker>"
ready-for-agent: "<label-string-in-tracker>"
ready-for-human: "<label-string-in-tracker>"
wontfix: "<label-string-in-tracker>"

## Category roles
bug: "<label-string-in-tracker>"
enhancement: "<label-string-in-tracker>"

## Issue tracker
type: github | gitlab | local-markdown
base_url: "<tracker URL>"
```

### Agent Brief structure (🟢)

```
> *This was generated by AI during triage.*

## Agent Brief — <issue title>

**What the system should do** (behavioral spec):
<description of expected behaviour — no file paths, no line numbers>

**Acceptance criteria:**
- [ ] <criterion 1>
- [ ] <criterion 2>

**Constraints:**
<any known limitations or out-of-scope items>
```

### .out-of-scope/<concept>.md structure (🟢)

```
# Out of Scope: <concept title>

**Issue:** #<number> (if available)
**Date:** YYYY-MM-DD
**Category:** enhancement

## What was requested
<description of the request>

## Why it is out of scope
<rationale>

## Alternative if user needs this
<escape hatch or workaround>
```

### Vertical slice issue structure (🟡)

```
Title: [SLICE] <feature> — <layer> (<AFK|HITL>)
Body:
  ## Context
  <link to PRD>

  ## What this slice does
  <behavioral description>

  ## Acceptance criteria
  - [ ] <criterion>

  ## Layer
  schema | api | ui | test

  ## Tracer bullet?
  yes | no
```

---

## 5. Integrações externas

| Integration | Skills | Protocol | Direction |
|-------------|--------|----------|-----------|
| GitHub Issues API | triage, to-issues, to-prd | Natural language → Claude Code → GH API | Read + Write |
| GitLab Issues API | triage, to-issues, to-prd | Natural language → Claude Code → GL API | Read + Write |
| Local markdown files | triage, to-issues, to-prd | Read/write .md files in target repo | Read + Write |
| Target repo filesystem | all engineering skills | Filesystem read (CONTEXT.md, ADRs, code) | Read |
| Target repo filesystem | setup-matt-pocock-skills | Filesystem write (triage-labels.md, CONTEXT.md seed) | Write |

---

## 6. Invariantes e restrições de design

| Invariant | Applies to | Source |
|-----------|-----------|--------|
| Exactly 1 state role + exactly 1 category role per issue | triage | `state-machines.md#invariants` 🟢 |
| All AI-generated comments open with the AI-generated header | triage | `domain.md#triage-rules` 🟢 |
| Never ask a question answerable by codebase exploration | grill-with-docs, triage | `domain.md#grilling-rules` 🟢 |
| Prototypes: delete TUI shell after capture; UI losers deleted | prototype | `domain.md#prototype-rules` 🟢 |
| UI prototype hidden by NODE_ENV gate | prototype | `domain.md#prototype-rules` 🟢 |
| Never refactor while RED | tdd | `domain.md#tdd-rules` 🟢 |
| Tests target public interfaces only | tdd | `domain.md#tdd-rules` 🟢 |
| SKILL.md ≤ 100 lines | all | `domain.md#skill-authoring-rules` 🟢 |
| setup-matt-pocock-skills is idempotent | setup | `adrs/0010` 🟢 |
| .out-of-scope/ records enhancements only, not bugs | triage | `domain.md#triage-rules` 🟢 |
| Concept-similarity matching for .out-of-scope/ (not keywords) | triage | `domain.md#triage-rules` 🟢 |

---

## 7. Decisões de design

| Decision | ADR | Rationale |
|----------|-----|-----------|
| Hard/soft dependency split | ADR-0001 | Avoids token waste on soft-dep skills |
| Tracker-agnostic triage via label mapping | ADR-0002 | Supports GitHub + GitLab + local-markdown |
| One question at a time, no cap | ADR-0004, ADR-0009 | Richer elicitation than batch forms |
| Prototype delete-or-absorb lifecycle | in design.md | Prevents prototype accumulation in prod |
| CONTEXT.md glossary-only | ADR-0006 | Keeps context token-efficient |
