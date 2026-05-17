# Edge Cases: In-Progress Skills Bucket

> Identificador: `004-in-progress-skills`
> Data: `2026-05-15`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

---

## EC-01 — `writing-beats`: user edits a beat that was just written (🟢)

**Skill**: `writing-beats`
**Scenario**: Developer writes a beat, then edits it manually in the file before the skill offers next candidates.
**Expected behaviour**: When the skill re-reads the file before the next write, the edited version is used as the authoritative state. The skill does not restore the original beat.
**Risk if unhandled**: If the skill uses in-memory state, the user's edit is silently overwritten on the next turn.
**Source**: `domain.md#writing-skills-rules` — disk re-read invariant.

---

## EC-02 — `writing-beats`: article path provided but file does not exist yet (🟡)

**Skill**: `writing-beats`
**Scenario**: Developer provides a path to an article file that hasn't been created yet.
**Expected behaviour**: 🟡 INFERIDO — Skill creates the file (empty, or with H1 title only) before presenting starting beat candidates.
**Risk if unhandled**: Skill attempts to re-read a non-existent file and errors out.

---

## EC-03 — `writing-beats`: all candidate beats are rejected by user (🟡)

**Skill**: `writing-beats`
**Scenario**: Developer rejects all 3 presented beat candidates and asks for different options.
**Expected behaviour**: 🟡 INFERIDO — Skill generates a new set of 2-3 candidates. No defined limit on how many times this can happen.
**Risk if unhandled**: Session loops without progress if the skill doesn't offer genuinely different candidates on retry.

---

## EC-04 — `writing-fragments`: first message is very short ("let's write about X") (🟢)

**Skill**: `writing-fragments`
**Scenario**: Developer's first message is a title or topic only — no fragment content.
**Expected behaviour**: The skill captures the topic as the H1 title. Since there is no fragment content in the first message, it begins the interview immediately without writing a fragment on the first write.
**Risk if unhandled**: Skill writes the topic phrase as a fragment when it is actually just the title — fragment file starts with noise.
**Source**: `domain.md#writing-skills-rules` — "capture fragments from the very first user prompt."

---

## EC-05 — `writing-fragments`: user gives an editing command before any fragments exist (🟡)

**Skill**: `writing-fragments`
**Scenario**: Developer says "cut the last fragment" immediately after the first write, when only one fragment exists.
**Expected behaviour**: 🟡 INFERIDO — Skill detects no fragment to cut (only one exists = the one being referenced). Asks for clarification.
**Risk if unhandled**: Skill attempts to delete the only fragment, leaving an empty file with only the H1 title.

---

## EC-06 — `writing-shape`: shaped target file already has content (🟡)

**Skill**: `writing-shape`
**Scenario**: The developer invokes `/writing-shape` with a target file that already contains a partially shaped article from a previous session.
**Expected behaviour**: Skill reads the existing shaped content and continues from where the previous session left off. Does not overwrite existing shaped content.
**Risk if unhandled**: Skill starts fresh and overwrites the existing shaped article — data loss.
**Source**: `design.md#6-fluxo-de-controle-writing-shape` — "READ shaped-target (if exists — preserve user's existing shaped content)"

---

## EC-07 — `review`: runtime does not support parallel sub-agents (🟡)

**Skill**: `review`
**Scenario**: The skill is invoked on a runtime (e.g., Codex, older Claude Code version) that does not support parallel sub-agent spawning.
**Expected behaviour**: 🟡 INFERIDO — Skill falls back to sequential review per file. Output format is unchanged; only performance degrades.
**Risk if unhandled**: Skill errors out or produces no output when parallel spawning fails.

---

## EC-08 — `writing-shape`: raw material is already well-structured (🟡)

**Skill**: `writing-shape`
**Scenario**: The raw material file is already structured as a near-complete article. Very little shaping is needed.
**Expected behaviour**: 🟡 INFERIDO — Skill recognises this and produces a minimal shaped output (perhaps a copy with minor structural improvements), or informs the developer that the raw material is already well-shaped.
**Risk if unhandled**: Skill over-engineers a simple shaping task, rewriting content that was already well-formed.
