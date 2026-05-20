# Validation Questions for Ralph SDD

**Doc level:** completo  
**Answer mode:** chat  
**Questions:** 7 critical items requiring your validation

---

## Q1: Who Updates `prd.json` After Agent Completes?

**Specs affected:** Agent System / PRD Management

**Current state:**
- Agent System/requirements.md (L43): ralph.sh updates it
- CLAUDE.md (step 9): agent updates it
- Both claim to do it; unclear who is authoritative

**Question:**  
Should the **agent** (autonomous, per CLAUDE.md instructions) or **ralph.sh** (orchestrator) update `prd.json` to mark `passes: true` after story completion?

**Impact:**  
- If both try to update: risk of concurrent writes, lost updates
- If agent only: ralph.sh loses visibility into prd.json state
- If ralph.sh only: agent can't track its own progress across sessions

**Your answer:** 
- [x] **Agent updates prd.json (autonomous, agent-driven)**
- [ ] ralph.sh updates prd.json (centralized orchestration)
- [ ] Other (please specify):

**Justification:**
- Confirmed by code: `ralph.sh` only **reads** `prd.json` (line 44, 69 — extracts `branchName` only). It never writes.
- The Agent System spec line 43 claim that "ralph.sh updates it" is **incorrect** — needs correction in spec.
- CLAUDE.md step 9 is authoritative: the agent owns `prd.json` mutation.
- Rationale: Agent has full context of what was implemented; ralph.sh is just a loop runner. Centralizing in ralph.sh would require parsing agent output, adding fragility.

**Spec actions required:**
- Fix `agent-system/requirements.md` L43: remove "ralph.sh updates prd.json" claim.
- Reinforce in `prd-management/requirements.md`: agent is sole writer.

---

## Q2: Flowchart Role — Operational or Educational?

**Specs affected:** Flowchart / Agent System

**Current state:**
- Flowchart is React SPA deployed to GitHub Pages
- Shows 10-step loop visually
- Agent System doesn't mention or integrate with it
- Unclear if flowchart is:
  - **Educational:** Users reference it before running ralph
  - **Operational:** Controls or monitors agent loop in real-time
  - **Logging:** Visualizes completed run history

**Question:**  
What is the **primary role** of the flowchart in the Ralph system?

**Your answer:**
- [x] **Educational only (user reference, no integration with ralph.sh)**
- [ ] Operational (integrates with ralph.sh to control or monitor loop)
- [ ] Logging (visualizes past runs from progress.txt)
- [ ] Other:

**Justification:**
- Confirmed by code: `flowchart/` is a Vite/React SPA deployed via `.github/workflows/deploy.yml` to GitHub Pages.
- Zero coupling with `ralph.sh`: no shared state file, no fetch of `progress.txt`, no PRD parsing in the SPA.
- Purpose: visual reference for the 10-step Ralph loop — onboarding and conceptual documentation.
- Treating it as operational would invent infrastructure that doesn't exist (websockets, polling, state sync).

**Spec actions required:**
- `flowchart/requirements.md`: clarify scope = static educational SPA. No runtime dependency on `ralph.sh`.
- Remove any spec language implying flowchart consumes `progress.txt` or `prd.json`.

---

## Q3: CI/CD Test Gates — Include or Remove?

**Specs affected:** CI/CD / Agent System

**Current state:**
- Agent System requires: "lint, test must pass before commit"
- CI/CD workflow only runs: TypeScript compile (via `npm run build`)
- CI/CD **skips**: `npm run test`, `npm run lint`

**Question:**  
Should the GitHub Actions CI/CD workflow run lint and test checks, or are those the agent's responsibility?

**Impact:**
- If YES: adds ~2 min to CI, ensures main branch is always clean
- If NO: rely on agent to validate; risk broken tests reaching GitHub Pages

**Your answer:**
- [x] **YES — add `npm run lint` and `npm run test` to CI workflow**
- [ ] NO — lint/test are agent-only responsibility
- [ ] Conditional: only for main branch (not for Pull Request previews)

**Justification:**
- Agent quality checks are advisory and can silently fail (the agent may skip them under context pressure, or hallucinate success).
- CI is the only **enforced** gate before deployment to GitHub Pages — making it the source of truth.
- Defense in depth: agent runs them locally (fast feedback), CI re-runs (independent verification).
- Cost: ~2 min added to CI is negligible vs. the cost of a broken `main` shipping to Pages.

**Spec actions required:**
- `ci-cd/requirements.md`: add `npm run lint` and `npm run test` steps to the workflow contract.
- `ci-cd/design.md`: update workflow YAML excerpt to reflect the new jobs.
- `ci-cd/tasks.md`: add task "Add lint + test jobs to `.github/workflows/deploy.yml`".

---

## Q4: Agent Failure Recovery — What Happens?

**Specs affected:** Agent System

**Current state:**
- Spec says "Agent fails gracefully; quality checks catch broken code"
- **No actual recovery logic defined:**
  - Timeout? (no limit specified)
  - Crash mid-implementation? (who reverts?)
  - Quality checks fail after commit? (manual `git revert`?)
  - Lost stdout? (how to detect completion if agent process dies?)

**Question:**  
If an agent crashes or fails, what should ralph.sh do?

**Your answer:**
- [ ] Abort entire session; require manual recovery
- [ ] Automatically revert changes and retry with same story
- [ ] Revert changes and move to next story
- [x] **Custom strategy: continue loop, do not revert, let next iteration re-pick highest-priority unfinished story**

**Justification:**
- Confirmed by code: `ralph.sh` line 92-96 already does this — `OUTPUT=... || true` swallows agent exit codes; the loop continues.
- Current behavior is **intentional minimalism**: if the agent failed mid-story, partial commits may still be useful (or none at all if no commit happened). The next iteration re-reads `prd.json` and re-picks highest priority where `passes: false` — naturally retries.
- Auto-revert is dangerous: it could destroy partial progress that a human would salvage.
- Auto-abort is too rigid: transient failures (rate limits, network) shouldn't kill a 10-iteration session.

**Spec actions required:**
- `agent-system/requirements.md`: document the **fail-forward** recovery model explicitly:
  - "Agent crash/non-zero exit → ralph.sh logs failure, continues to next iteration"
  - "No automatic rollback; partial commits remain in branch history"
  - "User manually reviews/reverts via git after session ends"
- Add **future enhancement** note: per-iteration timeout (currently unlimited).

---

## Q5: Story Size Validation — When?

**Specs affected:** PRD Management / Agent System

**Current state:**
- PRD Management validates "2-3 sentence limit" **during JSON conversion**
- Agent System **doesn't re-check** at runtime
- Heuristic "2-3 sentences" varies wildly (one run-on sentence = 500 tokens)

**Question:**  
Should story size be validated **before agent spawning** (prevent oversized stories) or **only during PRD creation** (trust agent to manage context)?

**Your answer:**
- [x] **Validate only at PRD creation time (trust agent)**
- [ ] Re-validate at agent spawn time (prevent oversized execution)
- [ ] Token-count based validation (measure actual tokens, not sentences)
- [ ] Custom approach:

**Justification:**
- The PRD skill (`skills/prd/SKILL.md`) is the single human-facing checkpoint. Enforce there.
- `ralph.sh` is a Bash loop runner — adding tokenizer logic would import Python/Node tooling and tighten coupling unnecessarily.
- Token-count validation is theoretically better but: (a) no current infrastructure for it, (b) heuristics like "2-3 sentences" cover ~95% of real-world cases, (c) the agent gracefully degrades under context pressure (it just runs slower).
- Trust-and-verify model: PRD creation is the gate; agent runtime is best-effort.

**Spec actions required:**
- `prd-management/requirements.md`: explicitly state "Story size validation occurs **only** at PRD creation by the PRD skill; runtime trusts the input."
- `agent-system/requirements.md`: remove any implication of runtime size validation.
- **Future enhancement** note: if context overflow becomes a real problem, revisit with token-count validation.

---

## Q6: Branch Naming Validation

**Specs affected:** PRD Management / Agent System

**Current state:**
- PRD Management spec (L24): "Branch name must be kebab-case: `ralph/[feature-name-kebab-case]`"
- Agent System: **no mention** of validating branch name format
- If user provides `ralph/MyFeature-NAME` (invalid), does agent:
  - Fail loudly?
  - Silently convert to kebab-case?
  - Create branch anyway (violate spec)?

**Question:**  
Should invalid branch names be **rejected** (fail fast) or **auto-corrected** (convert to kebab-case)?

**Your answer:**
- [x] **Reject invalid names with clear error message**
- [ ] Auto-convert to kebab-case (e.g., `MyFeature-NAME` → `my-feature-name`)
- [ ] Warn but allow (user's responsibility)

**Justification:**
- Auto-conversion creates **divergence** between what the user typed and what the system did silently — bad UX, hard to debug.
- "Warn but allow" produces inconsistent branch naming across the team, defeating the spec.
- Reject-with-clear-error is the cleanest contract: fail fast, point to the rule, let the user fix it.
- Validation regex: `^ralph/[a-z0-9]+(-[a-z0-9]+)*$` — runs at PRD creation in `skills/prd/SKILL.md`.

**Spec actions required:**
- `prd-management/requirements.md`: define the regex contract and the rejection behavior.
- `prd-management/design.md`: add a validation step in the PRD generation flow.
- Error message template: `"Invalid branchName '<value>'. Must match 'ralph/<kebab-case-name>' (lowercase letters, digits, hyphens only)."`

---

## Q7: Agent Output Format — Full Spec Needed

**Specs affected:** Agent System

**Current state:**
- Spec mentions: "detect completion signal `<promise>COMPLETE</promise>`"
- **No full output format specified** for:
  - Story implementation summary
  - Files changed
  - Build/test results
  - Learnings to append to progress.txt
  - Error messages (if any)

**Question:**  
What should the **minimum required output** from agent include for ralph.sh to validate completion?

**Your answer:**
```
[Describe expected agent output format, or select preset]

- [x] Minimal: only `<promise>COMPLETE</promise>` + exit code 0
- [ ] Standard: COMPLETE + summary (story ID, files changed, learnings)
- [ ] Verbose: Standard + build logs, test results, all Git commit messages
- [ ] Custom format (describe):
```

**Justification:**
- Confirmed by code: `ralph.sh` line 99 already greps **only** for `<promise>COMPLETE</promise>` in stdout. Everything else is logged but not parsed.
- The **actual record** of work is already structured in two places:
  - Git commit history (`feat: [Story ID] - [Story Title]`) — files changed, diff, message.
  - `progress.txt` — agent's own structured log (Story ID, files, learnings).
- Forcing a "Standard" or "Verbose" output format means **parsing stdout** in Bash — fragile, brittle, and duplicates info already on disk.
- Keep the contract minimal: one sentinel string + exit code. All else lives in commits and `progress.txt`.

**Spec actions required:**
- `agent-system/requirements.md`: document the contract as:
  - **Required:** `<promise>COMPLETE</promise>` in stdout when **all** stories pass.
  - **Required:** `progress.txt` appended with structured entry per iteration.
  - **Required:** Git commit per completed story.
  - **Not required:** specific stdout format beyond the sentinel.
- Add **observability** note: ralph.sh `tee /dev/stderr` already streams full output to the operator's terminal — sufficient for debugging.

---

## Next Steps

1. ~~Review each question~~ ✅ Done
2. ~~Provide your answers (select checkboxes or type custom responses)~~ ✅ Done
3. ~~Reply with answers and I'll update specs accordingly~~ → **In progress (Reviewer agent)**

---

## Answers Summary

| # | Question | Decision |
|---|----------|----------|
| Q1 | Who updates `prd.json`? | **Agent** (autonomous). Fix spec — `ralph.sh` only reads. |
| Q2 | Flowchart role? | **Educational only.** No runtime coupling with `ralph.sh`. |
| Q3 | CI/CD lint + test? | **YES.** Add to `.github/workflows/deploy.yml`. |
| Q4 | Agent crash recovery? | **Fail-forward.** Continue loop; no auto-revert. Matches current `ralph.sh` behavior. |
| Q5 | Story size validation? | **PRD creation time only.** Trust agent at runtime. |
| Q6 | Branch naming? | **Reject** with clear error. Regex: `^ralph/[a-z0-9]+(-[a-z0-9]+)*$`. |
| Q7 | Agent output format? | **Minimal:** `<promise>COMPLETE</promise>` + exit 0. Real record lives in git + `progress.txt`. |

**Answered by:** Marcos
**Date:** 2026-05-19
**Next:** Reviewer integrates answers into affected specs and generates final confidence report.
