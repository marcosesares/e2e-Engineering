# Edge Cases: Engineering Skills Bucket

> Identificador: `001-engineering-skills`
> Data: `2026-05-15`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

---

## EC-01 — Triage: issue has conflicting state labels (🟢)

**Skill**: `triage`
**Scenario**: An issue has both `needs-info` and `ready-for-agent` labels applied simultaneously (e.g., manual override, race condition between maintainer actions).
**Expected behaviour**: The skill detects the conflict, halts all transitions, and asks the maintainer to resolve the conflict before acting.
**Risk if unhandled**: Skill applies a third label, creating a 3-label state — invariant broken.
**Source**: `state-machines.md#invariants`

---

## EC-02 — Triage: issue has no category label (🟢)

**Skill**: `triage`
**Scenario**: A new issue was opened with only a state label (e.g., `needs-triage`) but no `bug` or `enhancement` category label.
**Expected behaviour**: The skill determines the category during grilling and applies it before making any state transition. Never transitions state while category is missing.
**Risk if unhandled**: Issue ends with 1 state role + 0 category roles — invariant broken.
**Source**: `state-machines.md#category-roles`

---

## EC-03 — Triage: new enhancement duplicates rejected concept (🟢)

**Skill**: `triage`
**Scenario**: A reporter opens an enhancement issue for a concept already recorded in `.out-of-scope/`. The wording differs but the concept is the same.
**Expected behaviour**: The skill detects the match via concept-similarity (not keyword matching), reports the match to the maintainer, and suggests wontfix with a reference to the existing `.out-of-scope/` entry.
**Risk if unhandled**: Maintainer re-evaluates already-rejected work; `.out-of-scope/` loses its function as institutional memory.
**Source**: `domain.md#triage-rules`

---

## EC-04 — Hard-dependency skill invoked without `triage-labels.md` (🟢)

**Skill**: `to-issues`, `to-prd`, `triage`
**Scenario**: Developer invokes a hard-dependency skill in a repo that has never run `setup-matt-pocock-skills`.
**Expected behaviour**: Skill detects missing `triage-labels.md`, halts, and surfaces the setup pointer: "Run `/setup-matt-pocock-skills` first."
**Risk if unhandled**: Skill produces wrong tracker URLs, wrong label strings, or creates issues in the wrong tracker — silent structural errors.
**Source**: `adrs/0001-explicit-setup-pointer-only-for-hard-dependencies.md`

---

## EC-05 — Setup: re-invocation on already-configured repo (🟢)

**Skill**: `setup-matt-pocock-skills`
**Scenario**: Developer runs `/setup-matt-pocock-skills` again after initial setup, perhaps after a team member already ran it.
**Expected behaviour**: All three checks (triage-labels.md, CONTEXT.md, docs/adr/) return "already exists" and are skipped. User is informed of each skip.
**Risk if unhandled**: Existing user customizations in `triage-labels.md` or `CONTEXT.md` are overwritten — data loss.
**Source**: `adrs/0010-setup-skill-no-verify-mode.md`

---

## EC-06 — `triage-labels.md` exists but schema is incomplete or wrong (🔴)

**Skill**: `to-issues`, `to-prd`, `triage`
**Scenario**: `triage-labels.md` exists (idempotency skips re-creation) but was created with an outdated schema missing a required key (e.g., `ready-for-human` label is absent).
**Expected behaviour**: 🔴 **GAP** — no defined behaviour. Skill may silently use a wrong/empty string for the missing label.
**Risk if unhandled**: Issues created with empty or incorrect labels; triage state machine transitions silently produce broken state.
**Action needed**: Define schema validation step in `setup-matt-pocock-skills` or in hard-dependency skills.

---

## EC-07 — TDD: first test passes immediately without implementation (🟢)

**Skill**: `tdd`
**Scenario**: Developer writes a test that accidentally passes without the implementation being written (e.g., tests an already-existing function, or test assertion is trivially true).
**Expected behaviour**: Skill detects the test passed without an implementation step and warns: "This test should be RED before you write the implementation. Verify the test is testing the right thing."
**Risk if unhandled**: Developer skips the RED phase — TDD discipline broken, test may not actually validate the intended behaviour.
**Source**: `domain.md#tdd-rules`

---

## EC-08 — Prototype: design question is genuinely ambiguous (🟢)

**Skill**: `prototype`
**Scenario**: The question cannot be classified as logic or UI even after inspecting surrounding code (e.g., "should this animation feel fast or deliberate?" — has both logic and UI components).
**Expected behaviour**: If user is reachable: ask. If user is not reachable (AFK): default to UI branch with explicit note that logic branch was considered.
**Risk if unhandled**: Wrong branch chosen; wrong prototype type built; wasted effort.
**Source**: `state-machines.md#3-prototype-branch-state-machine`

---

## EC-09 — `grill-with-docs`: all questions answerable by codebase (🟡)

**Skill**: `grill-with-docs`
**Scenario**: The codebase is very well-documented; every potential question is answerable by reading existing files. The skill explores rather than asks.
**Expected behaviour**: Session completes with zero questions asked; output spec is produced entirely from codebase reading. User is informed.
**Risk if unhandled**: None directly — but user may expect to be asked questions and feel the session ended prematurely.
**Source**: `domain.md#grilling-rules`

---

## EC-10 — `to-issues`: PRD has no tracer bullet candidate (🟡)

**Skill**: `to-issues`
**Scenario**: The PRD describes a feature with no thin end-to-end path — every slice requires all other slices to be meaningful (e.g., a pure data migration with no UI or API).
**Expected behaviour**: 🟡 **INFERIDO** — skill should identify the thinnest testable path even if it is not a full vertical slice. If none exists, flag to user and ask for clarification.
**Risk if unhandled**: All slices created in arbitrary order; no tracer bullet; no validation that end-to-end path works before all slices are complete.
**Source**: `domain.md#vertical-slice`, `adrs/0001` (no direct reference to this edge case)

---

## EC-11 — `diagnose`: cannot reproduce the reported bug (🟢)

**Skill**: `diagnose`
**Scenario**: Phase 2 (REPRODUCE) fails — the bug cannot be reproduced with the reported repro steps.
**Expected behaviour**: Skill surfaces the non-reproduction to the user. Asks for additional repro information (environment, version, exact steps). Does not proceed to Phase 3 (HYPOTHESIZE) without a confirmed repro path.
**Risk if unhandled**: Skill hypothesizes about an unreproduced bug and proposes a fix for a symptom that may not exist in the user's context.
**Source**: `flowcharts/engineering.md#diagnose-6-phase`

---

## EC-12 — Local-markdown tracker: issue has no URL (🟡)

**Skill**: `triage`, `to-issues`, `to-prd`
**Scenario**: The issue tracker is `local-markdown` (a folder of `.md` files). Issues have no URL, no label API, no comment API.
**Expected behaviour**: 🟡 **INFERIDO** — skill writes labels as frontmatter in the markdown file; writes comments as additional sections in the file; no external API calls made.
**Risk if unhandled**: Skill attempts GitHub/GitLab API calls on a local-markdown workflow and fails.
**Source**: `domain.md#issue-tracker-support-scope` (local-markdown as escape hatch — full behaviour not explicitly specified)
