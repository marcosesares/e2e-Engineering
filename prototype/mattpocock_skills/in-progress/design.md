# Design: In-Progress Skills Bucket

> Identificador: `004-in-progress-skills`
> Data: `2026-05-15`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

---

## 1. Componentes

| Component | Primary design pattern | State model |
|-----------|----------------------|-------------|
| `review` | Parallel sub-agent fan-out per file | Stateless invocation |
| `writing-beats` | Journey state machine (beat-by-beat) | Stateful across turns (journey state) |
| `writing-fragments` | Accumulator with interview loop | Stateful across turns (fragment file on disk) |
| `writing-shape` | Read-only source + write-only target | Stateless invocation (disk is state) |

---

## 2. Cross-cutting design invariant: disk is the source of truth (🟢)

All three writing skills share one fundamental invariant:

```
BEFORE every write:
  1. Re-read the target file from disk
  2. Apply the new content on top of what's on disk
  3. Write back

WHY: the user may have edited the file manually between turns.
     In-memory state is always stale. Disk is authoritative.
```

This pattern prevents the classic "AI overwrites user's edits" defect that occurs when the agent caches the file content in its context window.

---

## 3. Fluxo de controle — `review`

Two parallel review modes run simultaneously (intentional design — source: tutorial Part 10). A fresh context is recommended; the same agent that wrote the code is less effective as reviewer.

```
/review [file-paths or PR] invoked (fresh context recommended)
  │
  ├─ MODE A — SPEC REVIEW (in parallel with Mode B):
  │   ├─ Does the implementation satisfy the issue / PRD?
  │   ├─ Are all acceptance criteria met?
  │   └─ Are user stories preserved in the implementation?
  │
  ├─ MODE B — STANDARDS REVIEW (in parallel with Mode A):
  │   ├─ Does the code match existing conventions?
  │   ├─ Are module boundaries (seams) respected?
  │   ├─ Are tests meaningful (not just coverage theatre)?
  │   ├─ Are there unnecessary abstractions?
  │   └─ Are there risky changes outside the stated scope?
  │
  └─ AGGREGATE: produce ReviewReport
      ├─ Findings from both modes combined
      ├─ Ranked by severity (critical first)
      ├─ NO code rewrites in the report — findings only
      ├─ Critical findings (must fix before merge)
      ├─ Suggested findings (improve but not blocking)
      └─ Confidence: 🟢 / 🟡 / 🔴
```

**Key design constraint** (🟢): Report findings only on first pass — do not rewrite code. Rewrites come after the developer has reviewed and accepted the findings.

---

## 4. Fluxo de controle — `writing-beats` (journey state machine)

```
STATE: AWAITING_PATH
  │ article path confirmed
  ▼
STATE: AWAITING_START
  │ user ready to begin
  ▼
STATE: PRESENTING_CANDIDATES
  Action: draft 2-3 starting beats
  │ user picks a beat
  ▼
STATE: WRITING_BEAT
  Action:
    1. Re-read article from disk (invariant)
    2. Write chosen beat to article
  │
  ▼
STATE: OFFERING_NEXT
  Action: offer 2-3 next-beat candidates
  │
  ├─ user picks next beat → WRITING_BEAT
  ├─ user requests rewrite → EDITING → OFFERING_NEXT
  └─ natural end of journey → ENDED

STATE: ENDED
  (session complete — pile may still have unused candidates)
```

**Key design point**: The journey ends when the article has reached a natural stopping point — NOT when all possible beats are exhausted. A writer who runs out of things to say does not determine article end; the narrative arc does.

---

## 5. Fluxo de controle — `writing-fragments`

```
STATE: CAPTURING_INITIAL
  Trigger: very first user message
  Action: write H1 title + first fragment to file
  (NO interview questions yet — capture first)
  │
  ▼
STATE: FIRST_WRITE (file created)
  │
  ▼
STATE: INTERVIEWING
  LOOP:
  ├─ Ask one question to surface next fragment
  ├─ Fragment emerges:
  │   ├─ Re-read file from disk (invariant)
  │   ├─ Append new fragment
  │   └─ Continue interviewing
  │
  ├─ User gives editing command (cut/rewrite/merge):
  │   ├─ Re-read file from disk
  │   ├─ Apply edit
  │   └─ Continue interviewing
  │
  └─ User signals end → ENDED

STATE: ENDED
  (pile intentionally not exhausted — fragments may remain as seeds)
```

**Fragment types** (🟢): claims, vignettes, sharp sentences, half-thoughts, quotes. Heterogeneous by design. Not all will survive to the final article — that is expected.

---

## 6. Fluxo de controle — `writing-shape`

```
/writing-shape [raw-material-path] [shaped-target-path] invoked
  │
  ├─ READ raw-material (READ-ONLY — never write to this file)
  │
  ├─ READ shaped-target (if exists — preserve user's existing shaped content)
  │
  ├─ ANALYSE raw material:
  │   ├─ What themes emerge?
  │   ├─ What is the strongest claim or argument?
  │   └─ What structure would serve the reader?
  │
  LOOP:
  ├─ Propose next structural move
  ├─ User approves / redirects
  ├─ Re-read shaped-target from disk (invariant)
  ├─ Write next shaped section
  └─ Continue until article is complete
  │
  └─ FINAL: shaped-target contains the article
             raw-material is unchanged
```

---

## 7. Estruturas de dados

### ReviewReport (🟡 — in-progress, format may evolve)

```
## Review: <files reviewed>
> Date: <ISO date>
> Axes: Correctness × Craft

### Correctness findings
- 🔴 CRITICAL: <finding>
- 🟡 SUGGESTED: <finding>

### Craft findings
- 🔴 CRITICAL: <finding>
- 🟡 SUGGESTED: <finding>

### Summary
Critical: N | Suggested: M | Confidence: 🟢/🟡/🔴
```

### Fragment file (🟢)

```markdown
# <Article Title>

<fragment 1>

---

<fragment 2>

---

<fragment 3>
```

Fragments are separated by `---` horizontal rules. The file grows one fragment at a time.

### Beat in article (🟢)

Beats are written directly to the article file. No separate data structure. A beat is:
- Sized by what it needs: one sentence to multiple paragraphs
- Stops at the point where the next beat could pivot direction

---

## 8. Invariantes de design

| Invariant | Applies to | Source |
|-----------|-----------|--------|
| Re-read from disk before every write | writing-beats, writing-fragments, writing-shape | `domain.md#writing-skills-rules` 🟢 |
| Raw material read-only | writing-shape | `domain.md#writing-skills-rules` 🟢 |
| First message → first fragment captured before any question | writing-fragments | `domain.md#writing-skills-rules` 🟢 |
| Journey ends at natural narrative end, not exhausted pile | writing-beats | `domain.md#writing-skills-rules` 🟢 |
| Fragment pile intentionally incomplete at end | writing-fragments | `state-machines.md#writing-fragments` 🟢 |
| in-progress skills NOT in plugin.json or README.md | all | `CLAUDE.md` 🟢 |
