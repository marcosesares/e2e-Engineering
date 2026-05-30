# Claude Skills, Casos Extremos

---

## Case 1: Jira Fetch — Corrupted Cache

**Scenario:** raw.json exists but is malformed JSON.

**Behavior:** Script attempts to parse; on parse error, falls through to fresh REST fetch and overwrites raw.json.

**Confidence:** 🟡 (error handling inferred)

---

## Case 2: TC Creation — TF401320 Error / Partial Failure

**Scenario:** Required custom field missing at TC creation time, OR steps/state PATCH fails after successful TC creation.

**Mitigation:** BR-TC-01 — all Custom.* fields set in single wit_create_work_item call.

**Behavior (confirmed by Reviewer 2026-05-23 against `create-ado-test-cases.ps1:348-378`):**
- If the initial `wit_create_work_item` PATCH fails → push `{ input_index, title, error }` to `failures[]`; **no TC created**; `continue` to next.
- If TC was created but steps PATCH or state PATCH fails → push `{ input_index, ado_id, title, error, partial: true }` to `failures[]`; **created TC remains in ADO** (no compensating delete).
- Final envelope returns `{ success: true, data: { created[], failures[], verification[] } }`.

**No rollback.** Consumer must filter out already-created TCs (use `failures[].ado_id`) before retrying with corrected input. BR-TC-09 non-idempotency applies.

**Confidence:** 🟢

---

## Case 3: Feature Plan Writeback — Jira Offline

**Scenario:** TC creation succeeds in ADO, but Jira REST call fails during TestPlan ID writeback.

**Behavior:** apply-test-plan reports partial success: TCs created, writeback failed.

**Confidence:** 🟡 (error recovery not documented)

---

## Case 4: Concurrent /work-on Calls

**Scenario:** User runs `/work-on QA-1` and `/work-on QA-2` in parallel (two sessions).

**Behavior:** Jira cache is per-issue (`~/.claude/fetch-jira-item/<key>/raw.json`), so distinct keys do not collide. No file-level locking; same-key concurrent runs would race on `raw.json` write but the outcome is functionally equivalent (last writer wins, both arrive at the same Jira state).

**Concurrent `/apply-test-plan` against the same repo:** **unsafe** — no locking on the operations JSON / sidecar files. Avoid.

**Confidence:** 🟢 (documented in `architecture.md §2` Concurrency row + `claude-skills/design.md` Concurrency Assumption)

---

## Case 5: Guard Hook — Missing .sync-manifest

**Scenario:** PreToolUse hook runs but .sync-manifest is missing or corrupt.

**Behavior:** Fail-open (BR-SD-03) — allow the edit to proceed.

**Justification:** Prevent blocking user workflow due to infrastructure issues.

**Confidence:** 🟢 (documented in domain.md BR-SD-03)

---

## Case 6: Regression Plan — Zero Matching TCs

**Scenario:** JQL search in plan-regression-coverage returns no TCs.

**Behavior:** test-plan generates plan with empty test case table.

**Risk:** User applies empty plan; no TCs created.

**Confidence:** 🟡 (handling inferred)

---

## Case 7: Approval Gate — User Quits

**Scenario:** plan-change is iterating; user types `/clear` or closes session.

**Behavior:** Iteration stops; plan not saved.

**Confidence:** 🟡 (session lifecycle not specified)

---

## Case 8: Large Batch TC Creation (>100 TCs)

**Scenario:** apply-test-plan invoked with 150 test cases.

**Behavior:** create-ado-test-cases.ps1 creates individual TCs via REST. Performance not measured.

**Risk:** API rate limiting, long runtime, timeout.

**Confidence:** 🔴 (no performance metrics)

---

## Case 9: ADO Suite Hierarchy — Parent Suite Missing

**Scenario:** manage-ado-test-suite tries to add TCs to a child suite, but parent is missing.

**Behavior:** lookup fails; script may create parent or error out.

**Confidence:** 🟡 (hierarchy handling inferred)

---

## Case 10: Spike Routing — User Ambiguous

**Scenario:** /work-on with Spike type; user is presented spike question but gives vague answer.

**Behavior:** work-on asks for clarification or provides default route (e.g., suggest fix-qa-bug or implement-story based on description).

**Confidence:** 🟡 (clarification loop inferred)
