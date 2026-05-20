# Cross-Review Results via Codex

**Engine:** Codex (independent LLM review)  
**Date:** 2026-05-20  
**Specs reviewed:** 4 units (flowchart, prd-management, agent-system, ci-cd)

---

## Contradictions Identified

### 1. Agent System ↔ PRD Management: `passes` Update Responsibility
- **Specs:** Agent System/requirements.md (L43) vs. CLAUDE.md (step 9)
- **Issue:** Ambiguous who updates `prd.json` — ralph.sh or agent?
- **Risk:** Concurrent writes could corrupt prd.json
- **Status:** 🔴 NEEDS CLARIFICATION

### 2. Agent System ↔ Flowchart: Loop-Back Semantics
- **Specs:** Flowchart/design.md (step 9 ⤴ 4) vs. Agent System flat iteration
- **Issue:** Is loop-back visual only or operationally significant?
- **Status:** 🔴 NEEDS CLARIFICATION

### 3. CI/CD ↔ Agent System: Quality Gate Mismatch
- **Specs:** Agent System requires "lint, test" before commit; CI/CD skips both
- **Issue:** Tests may be missing from main branch deployment
- **Status:** 🔴 CRITICAL GAP

---

## Critical Gaps

### 1. Agent Error Recovery
- **Issue:** No spec for agent crash, timeout, or quality-check failure recovery
- **Status:** 🔴 MISSING SPEC

### 2. Flowchart Integration
- **Issue:** Flowchart role unclear — educational, operational, or logging?
- **Status:** 🔴 MISSING SPEC

### 3. Agent Output Format
- **Issue:** Only mentions `<promise>COMPLETE</promise>`; no full output spec
- **Status:** 🔴 MISSING SPEC

---

## Weak Claims (🟢 → 🟡 downgrade recommended)

| Spec | Claim | Issue | Recommend |
|------|-------|-------|-----------|
| Flowchart/design L72 | Visibility cascade 🟢 | Inferred from React patterns, not implemented | 🟡 |
| Flowchart/design L81 | Edge visibility matching 🟢 | Function not explicitly coded, logic inferred | 🟡 |
| Agent System/req L54 | Quality gates 🟢 | Current ralph.sh doesn't call them | 🟡 |
| PRD Mgmt/design L142 | "2-3 sentence" fits context 🟡 | No token measurements provided | Stay 🟡 |

---

## Missing Validations

1. **Branch naming:** PRD requires kebab-case but Agent System doesn't validate
2. **Story size runtime check:** Only pre-flight, not enforced during agent execution
3. **prd.json schema atomicity:** No atomic write guarantee if agent writes mid-loop
4. **Rollback strategy:** What happens if agent commits breaking change?

---

## Conclusion

**Total issues:** 12  
**Severity distribution:** 7 🔴 high-impact, 5 🟡 medium-impact  
**Reviewer confidence in specs:** 65% (valid, but gaps require user input)
