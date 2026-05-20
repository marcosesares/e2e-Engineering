# Tasks: Productivity Skills Bucket

> Identificador: `002-productivity-skills`
> Data: `2026-05-15`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

---

## T-01 — Implementar `caveman` — toggle state machine

**Origem**: `skills/productivity/caveman/SKILL.md`
**Pronto quando**:
- [ ] Activates on any of the documented trigger phrases: "caveman mode", "less tokens", "be brief", `/caveman`
- [ ] State persists across all turns without manual re-activation
- [ ] Deactivates only on explicit phrases: "stop caveman", "normal mode"
- [ ] EXCEPTION sub-state activated for: security warnings, irreversible actions, multi-step risk, user confusion
- [ ] EXCEPTION is temporary; COMPRESSING resumes on the next clear section
- [ ] Code blocks reproduced verbatim regardless of mode
- [ ] Exact error quotes reproduced verbatim regardless of mode

**Confiança**: 🟢

---

## T-02 — Implementar `grill-me` — standalone elicitation

**Origem**: `skills/productivity/grill-me/SKILL.md`
**Pronto quando**:
- [ ] Asks exactly one question per turn; never batches
- [ ] If codebase accessible: explores before asking (codebase-first rule)
- [ ] No maximum question cap; continues until spec is complete
- [ ] User can terminate by signalling they are done
- [ ] Produces structured requirements output at end of session

**Confiança**: 🟢

---

## T-03 — Implementar `handoff` — context transfer document

**Origem**: `skills/productivity/handoff/SKILL.md`
**Pronto quando**:
- [ ] Generates document with all required sections: current state, next action, blockers, open questions, relevant files
- [ ] Document is self-contained: a fresh agent with no prior context can continue from it
- [ ] Does NOT dump conversation history (not a passthrough)
- [ ] File paths and line numbers are specific and current at time of generation
- [ ] Document is saved to a file (not only printed to conversation)

**Confiança**: 🟢

---

## T-04 — Implementar `write-a-skill` — skill scaffolding

**Origem**: `skills/productivity/write-a-skill/SKILL.md`
**Pronto quando**:
- [ ] Interviews user for: skill name, purpose/trigger, target bucket, supporting files
- [ ] Creates `skills/<bucket>/<name>/SKILL.md` with valid frontmatter
- [ ] `description` field ≤ 1024 characters, includes "Use when [trigger]"
- [ ] SKILL.md body ≤ 100 lines total
- [ ] For `engineering/` and `productivity/` skills: updates `plugin.json`
- [ ] For `engineering/` and `productivity/` skills: updates top-level `README.md` with linked entry
- [ ] For `engineering/` and `productivity/` skills: updates bucket `README.md` with one-line description
- [ ] For `misc/`, `in-progress/`, `personal/`: does NOT update `plugin.json` or `README.md`

**Confiança**: 🟢

---

## T-05 — Verificar conformidade das productivity skills com as regras de publicação

**Origem**: `CLAUDE.md`, `.claude-plugin/plugin.json`
**Pronto quando**:
- [ ] All 4 productivity skills (`caveman`, `grill-me`, `handoff`, `write-a-skill`) appear in `plugin.json`
- [ ] All 4 appear in top-level `README.md` with links to their `SKILL.md`
- [ ] All 4 appear in `skills/productivity/README.md` with one-line descriptions
- [ ] `link-skills.sh` includes all 4 productivity skills

**Confiança**: 🟢

---

## Tarefas com lacuna

| Task | Gap | Action needed |
|------|-----|---------------|
| T-01 | Trigger phrase list may be incomplete | Maintainer to exhaustively enumerate or document "any natural language request for compression" |
| T-03 | No automated verification that the handoff doc is "self-contained" | Manual review required; consider adding a checklist at the end of the handoff document |
