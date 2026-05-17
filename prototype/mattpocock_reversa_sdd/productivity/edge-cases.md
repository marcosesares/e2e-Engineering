# Edge Cases: Productivity Skills Bucket

> Identificador: `002-productivity-skills`
> Data: `2026-05-15`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

---

## EC-01 — Caveman: trigger in mid-sentence (🟡)

**Skill**: `caveman`
**Scenario**: Developer writes "I want to use caveman mode from now on, also can you explain X?" in a single message.
**Expected behaviour**: 🟡 INFERIDO — Caveman mode activates AND the skill answers the question "X" in compressed form in the same response.
**Risk if unhandled**: Skill answers "X" in full verbosity and then activates compression on the next turn — one turn of full verbosity leaks through.

---

## EC-02 — Caveman: user signals confusion while in COMPRESSING mode (🟢)

**Skill**: `caveman`
**Scenario**: Developer says "I don't understand what you just said" while caveman mode is ACTIVE.
**Expected behaviour**: Skill detects user confusion (one of the EXCEPTION triggers), enters EXCEPTION sub-state, re-explains in full verbosity, then resumes COMPRESSING.
**Risk if unhandled**: Skill continues compressing an explanation the user already does not understand — communication breakdown.
**Source**: `state-machines.md#2-caveman-communication-mode`

---

## EC-03 — Caveman: irreversible action inside COMPRESSING response (🟢)

**Skill**: `caveman`
**Scenario**: While in COMPRESSING mode, the agent proposes `git reset --hard origin/main` as part of a longer response.
**Expected behaviour**: Agent enters EXCEPTION sub-state for the section describing the irreversible action (full verbosity, explicit risk explanation), then returns to COMPRESSING for the rest of the response.
**Risk if unhandled**: Dangerous operation described in compressed form — user may not notice the risk.
**Source**: `state-machines.md#2-caveman-communication-mode`

---

## EC-04 — Grill-me: user answers are inconsistent with earlier answers (🟡)

**Skill**: `grill-me`
**Scenario**: Developer says "users must be logged in" in turn 3 but "this works without an account" in turn 7.
**Expected behaviour**: 🟡 INFERIDO — Skill detects the inconsistency and asks for clarification before proceeding. Does not silently pick one answer.
**Risk if unhandled**: Spec produced contains contradictory requirements — downstream tools (to-prd, to-issues) generate incorrect output.

---

## EC-05 — Handoff: session state is ambiguous or incomplete (🟡)

**Skill**: `handoff`
**Scenario**: Developer invokes `/handoff` at the very start of a task — nothing has been done yet. "Current state" section would be empty.
**Expected behaviour**: 🟡 INFERIDO — Skill produces handoff document with explicit "No work completed yet" in current state. Next action section is the first step of the task. Document remains usable.
**Risk if unhandled**: Empty current-state section confuses fresh agent about whether work was done but lost, or simply not started.

---

## EC-06 — Handoff: file paths in document become stale (🟡)

**Skill**: `handoff`
**Scenario**: Developer generates a handoff document, then a teammate makes several commits that move or rename the referenced files. A fresh agent reads the handoff and navigates to now-stale paths.
**Expected behaviour**: 🟡 INFERIDO — Handoff document should include a creation timestamp. Fresh agent should treat file paths as potentially stale and verify before acting.
**Risk if unhandled**: Fresh agent attempts to read/edit files that no longer exist at the referenced paths — wasted effort or errors.
**Note**: This is an inherent limitation of the structured-document approach (ADR-0005), not a bug.

---

## EC-07 — Write-a-skill: name collision with existing skill (🟡)

**Skill**: `write-a-skill`
**Scenario**: Developer asks `write-a-skill` to create a skill named `diagnose`, which already exists in `skills/engineering/`.
**Expected behaviour**: 🟡 INFERIDO — Skill detects the collision, warns the developer, and asks whether to overwrite, rename, or abort. Does not silently overwrite the existing skill.
**Risk if unhandled**: Existing production skill overwritten — data loss; registry may point to corrupted SKILL.md.

---

## EC-08 — Write-a-skill: skill description exactly at 1024 characters (🟢)

**Skill**: `write-a-skill`
**Scenario**: The generated description is exactly 1024 characters — at the boundary of the limit.
**Expected behaviour**: Skill accepts it (limit is ≤ 1024, so exactly 1024 is valid). If 1025 characters, skill must prompt for a shorter description.
**Risk if unhandled**: Off-by-one error causes a valid description to be rejected or an invalid one to be accepted.
**Source**: `domain.md#skill-authoring-rules`
