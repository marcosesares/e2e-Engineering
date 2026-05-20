# Requirements: In-Progress Skills Bucket

> Identificador: `004-in-progress-skills`
> Data: `2026-05-15`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

---

## 1. Resumo executivo

The `in-progress/` bucket contains 4 draft skills not yet promoted to an active bucket: `review` (two-axis code review), `writing-beats` (beat-by-beat article development), `writing-fragments` (idea/fragment accumulation for writing), and `writing-shape` (article shaping from raw material). None are published in `plugin.json`. All four share a key design invariant: they re-read the target file from disk before every write, treating user edits between turns as authoritative.

---

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-analysis.md#in-progress` | 4 skills; disk re-read invariant; review parallel sub-agents | 🟢 |
| `_reversa_sdd/state-machines.md#4-writing-session-states` | writing-beats journey state machine; writing-fragments accumulation state | 🟢 |
| `_reversa_sdd/domain.md#writing-skills-rules` | All writing skills re-read from disk; writing-shape raw material read-only; fragments captured from first message | 🟢 |
| `_reversa_sdd/domain.md#gaps` | Graduation criteria undefined; no formal promotion path | 🔴 |

---

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Developer | Get a two-axis code review (correctness + craft) | Invokes `/review`; receives structured ReviewReport |
| Writer / Developer | Develop an article beat by beat | Invokes `/writing-beats`; picks beats from candidates, article grows incrementally |
| Writer / Developer | Capture fragments of ideas for an article | Invokes `/writing-fragments`; interview surfaces raw fragments, file grows |
| Writer / Developer | Shape raw material into a structured article | Invokes `/writing-shape`; shaped article written to target file; raw material untouched |

---

## 4. Regras de negócio

1. **RN-01:** All writing skills re-read the target file from disk before every write — user edits between turns are authoritative. 🟢
   - Origem: `domain.md#writing-skills-rules`

2. **RN-02:** `writing-shape` raw material file is read-only — never edited. 🟢
   - Origem: `domain.md#writing-skills-rules`

3. **RN-03:** `writing-beats` writes one beat at a time. End = natural end of journey, NOT empty pile. 🟢
   - Origem: `domain.md#writing-skills-rules`

4. **RN-04:** `writing-fragments` captures fragments from the very first user prompt (initial message). 🟢
   - Origem: `domain.md#writing-skills-rules`

5. **RN-05:** `writing-fragments` pile is intentionally incomplete at end of session — that is expected and fine. 🟢
   - Origem: `state-machines.md#writing-fragments-accumulation-state`

6. **RN-06:** `review` performs two-axis review: correctness (does it work?) × craft (is it well-written?). 🟢
   - Origem: `code-analysis.md#in-progress`

7. **RN-07:** `in-progress` skills must NOT appear in `plugin.json` or top-level `README.md`. 🟢
   - Origem: `CLAUDE.md`

---

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | `review` evaluates code on two axes: correctness and craft | Must | Output contains both axes; each with findings | 🟢 |
| RF-02 | `review` runs two review modes in parallel: standards review and spec review | Must | Both modes execute; neither is skipped | 🟢 |
| RF-03 | `review` produces a structured ReviewReport with findings ranked by severity | Must | Findings ranked; critical distinguished from suggested; no rewrites in the report itself | 🟢 |
| RF-04 | `writing-beats` reads target article from disk before each write | Must | User edits made between turns are preserved | 🟢 |
| RF-05 | `writing-beats` offers 2-3 candidate beats before writing; user picks one | Must | User choice drives which beat is written | 🟢 |
| RF-06 | `writing-beats` session ends at natural journey end, not when pile is empty | Must | Session can end with unused beat candidates | 🟢 |
| RF-07 | `writing-fragments` captures fragment from the very first user message | Must | First message fragment is in the file before the first question | 🟢 |
| RF-08 | `writing-fragments` re-reads file before each append | Must | User edits between turns are preserved | 🟢 |
| RF-09 | `writing-fragments` pile is intentionally incomplete at end — session ends when user signals done | Must | Skill does not force exhaustion of all ideas | 🟢 |
| RF-10 | `writing-shape` reads raw material file as read-only input | Must | Raw material file is unchanged after session | 🟢 |
| RF-11 | `writing-shape` writes shaped output to a separate target file | Must | Raw material and shaped article are separate files | 🟢 |
| RF-12 | `writing-shape` re-reads shaped file from disk before each write | Must | User edits to shaped article between turns are preserved | 🟢 |

---

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência | Confidência |
|------|-----------|-----------|-------------|
| Data integrity | All writing skills: re-read before write — never overwrite in-memory stale state | `domain.md#writing-skills-rules` | 🟢 |
| Safety | writing-shape: raw material is immutable — read-only access only | `domain.md#writing-skills-rules` | 🟢 |
| Correctness | writing-fragments: first-message capture must occur before any interview turn | `domain.md#writing-skills-rules` | 🟢 |

---

## 7. Critérios de Aceitação

```gherkin
Cenário: writing-beats — user edits preserved between turns
  Dado the developer has invoked /writing-beats on article.md
  Quando the developer edits article.md manually between two skill turns
  Então the skill reads the updated article.md before writing the next beat
    E the user's manual edits are preserved

Cenário: writing-fragments — first message capture
  Dado the developer invokes /writing-fragments with an initial message containing an idea
  Quando the skill starts
  Então the idea from the first message is written to the fragment file
    E before any interview question is asked

Cenário: writing-shape — raw material unchanged
  Dado raw-material.md contains the source content
  Quando /writing-shape runs a full session
  Então raw-material.md is identical after the session
    E the shaped article is written to a separate target file

Cenário: review — two-axis output
  Dado the developer invokes /review on a set of files
  Quando the review completes
  Então the output contains a correctness section (does it work?)
    E the output contains a craft section (is it well-written?)
    E findings are classified as critical or suggested
```

---

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-04, RF-08, RF-12 (disk re-read) | Must | Core data-integrity invariant across all writing skills |
| RF-07 (first message capture) | Must | Invariant; missing it loses user's first idea |
| RF-10 (raw material read-only) | Must | Data loss if raw material modified |
| RF-01, RF-03 (review two-axis) | Must | Core value of the review skill |
| RF-05 (beat candidates) | Must | User agency over article direction |
| RF-09 (pile not exhausted) | Must | Avoids forcing artificial completion |
| RF-02 (parallel sub-agents) | Should | Performance enhancement; not structurally required |
| RF-06 (natural end) | Must | End condition correctness |

---

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda.

---

## 10. Lacunas

- 🔴 [DÚVIDA] Graduation criteria undefined: no documented threshold for when any of these 4 skills is ready to graduate to `engineering/` or `productivity/`.
- 🔴 [DÚVIDA] `review` parallel sub-agent mechanism not fully specified — relies on engine support for parallel agent spawning, which varies by runtime.

---

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-05-15 | Versão inicial gerada por reversa-writer | reversa |
