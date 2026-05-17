# Flows: Engineering Skills Bucket

> Identificador: `001-engineering-skills`
> Data: `2026-05-15`
> Fluxos distintos não completamente cobertos no design.md.
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO

---

## Flow 1 — Full issue lifecycle: from request to implementation (🟢)

The canonical end-to-end flow using the full engineering toolkit:

```
Developer has a feature request
  │
  ▼
/grill-with-docs ──── conversational elicitation ────► structured requirements
  │
  ▼
/to-prd ──────────── requirements → structured PRD ──► PRD document
  │
  ▼
/to-issues ─────────── PRD → vertical slices ─────────► issues in tracker (tracer bullet first)
  │
  ▼
/triage ─────────────── state machine per issue ──────► labels + Agent Brief or Human assignment
  │
  ├── AFK agent picks up ready-for-agent issues
  │     └── implements + closes
  └── Human picks up ready-for-human issues
        └── /tdd → implements with red-green-refactor
              └── /diagnose if bugs found during implementation
```

---

## Flow 2 — Bug report triage (🟢)

```
Reporter opens issue (category: bug)
  │
  ▼
/triage invoked by maintainer
  │
  ├─ GRILL: one question at a time to understand repro, severity, environment
  │     └─ if answerable by codebase: explore first
  │
  ├─ DECIDE:
  │   ├─ Insufficient info → needs-info + Triage Notes comment
  │   │     └─ Reporter replies → needs-triage → triage again
  │   │
  │   ├─ Fully specified, automatable → ready-for-agent + Agent Brief
  │   │
  │   ├─ Requires human judgment → ready-for-human
  │   │
  │   └─ Won't fix → wontfix + polite explanation (NO .out-of-scope entry for bugs)
  │
  └─ VERIFY: exactly 1 state + exactly 1 category label on issue
```

---

## Flow 3 — Architecture improvement session (🟢)

```
Developer identifies architectural concern
  │
  ▼
/zoom-out ──── step back from implementation detail ──► fresh perspective
  │
  ▼
/improve-codebase-architecture
  │
  ├─ READ: codebase area + CONTEXT.md (soft dep)
  ├─ IDENTIFY seams (where interfaces live)
  ├─ ASSESS depth: deep module or shallow module?
  ├─ PROPOSE: refactor toward deeper module / cleaner seam
  ├─ DISCUSS with developer
  ├─ APPLY if agreed
  └─ RE-READ updated code → continue loop
  │
  ▼
(optional) /grill-with-docs ── capture emerging domain vocabulary ──► CONTEXT.md updates
```

---

## Flow 4 — Prototype → production promotion (🟢)

### Logic branch promotion

```
Question about state/logic behaviour
  │
  ▼
/prototype routes to LOGIC BRANCH
  │
  ├─ Build: logic module (reducer/state machine/functions)
  ├─ Wrap: in throwaway TUI shell
  ├─ Run: developer experiments with TUI
  ├─ Capture: answer documented
  ├─ DELETE TUI shell (always)
  └─ PROMOTE (optional): logic module lifted into production codebase
        └─ /tdd to add tests around promoted logic
```

### UI branch promotion

```
Question about appearance/layout
  │
  ▼
/prototype routes to UI BRANCH
  │
  ├─ Build: 2-3 variants (preferred: on existing page; last resort: hidden route)
  ├─ Gate: NODE_ENV !== 'production' switcher on all variants
  ├─ Run: developer evaluates variants in dev environment
  ├─ PICK: winner chosen
  ├─ PROMOTE: winner folded into real page/route
  └─ DELETE: all losing variants removed
```

---

## Flow 5 — First-time repo setup (🟢)

```
New repo, no skills config present
  │
  ▼
/setup-matt-pocock-skills
  │
  ├─ INTERVIEW:
  │   ├─ Issue tracker type: github | gitlab | local-markdown | other
  │   ├─ Label strings for each state role
  │   └─ Label strings for each category role
  │
  ├─ WRITE (skip if exists):
  │   ├─ triage-labels.md (hard-dep config)
  │   ├─ CONTEXT.md (glossary seed — empty, with instructions)
  │   └─ docs/adr/ (directory for future ADRs)
  │
  └─ REPORT: files created / files skipped
  │
  ▼
All engineering skills now fully operational
(triage, to-issues, to-prd: hard-dep satisfied)
(diagnose, tdd, improve-arch, zoom-out: soft-dep enhanced)
```

---

## Flow 6 — Grilling with codebase-first exploration (🟢)

```
/grill-with-docs or /triage invoked with a question
  │
  ├─ ASSESS: can this question be answered by reading the codebase?
  │   │
  │   ├─ YES:
  │   │   ├─ Read relevant files
  │   │   ├─ Extract answer
  │   │   └─ Proceed with answer (no question asked)
  │   │
  │   └─ NO:
  │       ├─ Formulate exactly ONE question
  │       ├─ Ask question
  │       └─ Record answer
  │
  └─ REPEAT until spec is complete (no maximum cap)
```

**Rationale**: This codebase-first rule reduces question count organically without an artificial cap. The developer is asked only when exploration is insufficient.

---

## Flow 7 — Deprecation of a skill (🟢)

```
Maintainer decides skill is no longer useful
  │
  ├─ MOVE: skill folder → skills/deprecated/
  │
  ├─ UPDATE plugin.json: remove entry
  ├─ UPDATE link-skills.sh: add to exclusion list
  ├─ UPDATE top-level README.md: remove entry
  ├─ UPDATE bucket README.md: remove entry
  │
  ├─ IF deprecated reason was enhancement/wontfix:
  │   └─ WRITE: .out-of-scope/<concept>.md
  │
  └─ COMMIT with message explaining why deprecated
        (institutional knowledge preserved in git history)
```
