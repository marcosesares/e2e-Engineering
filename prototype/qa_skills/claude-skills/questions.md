# Claude Skills, Lacunas & Questões Abertas

---

## Q1: Exception Handling in PowerShell Scripts

**Lacuna:** 🔴

Exact exception handling strategy in create-ado-test-cases.ps1, manage-ado-test-suite.ps1, and fetch scripts not fully documented.

**Question:** 
- On REST API 500 error, does the script retry, fail fast, or return partial results?
- Is there exponential backoff for transient failures?
- How are timeouts handled?

**Impact:** Understanding error recovery is critical for production reliability.

**Validation needed:** Read script implementations; document error path.

---

## Q2: Rollback on Partial TC Creation

**Lacuna:** 🔴

When create-ado-test-cases.ps1 successfully creates 50 of 100 TCs and then fails on TC #51, what happens?

**Question:**
- Are the 50 TCs left in ADO, or is a rollback attempted?
- Does the script return errors array listing which TCs failed?
- Can apply-test-plan re-run and skip already-created TCs?

**Impact:** Affects data integrity and idempotency (BR-TC-09 states creation is NOT idempotent).

**Validation needed:** Test large batch creation with mid-stream failure.

---

## Q3: Concurrent Skill Execution Safety

**Lacuna:** 🔴

Are skills thread-safe for concurrent execution?

**Question:**
- If user runs `/work-on QA-1` and `/work-on QA-2` in parallel (two Claude Code sessions), do they interfere?
- Are Jira caches (per-issue) isolated, or is there race condition?
- Is the repo root locked during apply-test-plan?

**Impact:** Affects usability in CI/CD pipelines where multiple parallel workers may invoke skills.

**Validation needed:** Design concurrency safeguards (if needed); document assumptions.

---

## Q4: Performance Characteristics for Large Batches

**Lacuna:** 🔴

No measured performance data for large test case batches (>100 TCs).

**Question:**
- What is the time to create 200 TCs via apply-test-plan?
- Are there API rate limits from Jira or ADO?
- Does update check (check-updates.ps1) slow down session start for large repos?

**Impact:** Unknown latency affects user experience.

**Validation needed:** Benchmark apply-test-plan with 50, 100, 200 TCs.

---

## Q5: Guard Hook Error Conditions

**Lacuna:** 🟡

Guard hook is fail-open on structural errors, but exact error conditions not enumerated.

**Question:**
- What errors trigger fail-open behavior?
- Is a malformed .sync-manifest JSON ignored, or does it fail to parse?
- What if .sync-manifest path is invalid (symlink broken)?

**Impact:** Affects predictability of guard behavior.

**Validation needed:** Read guard-shared-skills.ps1; document error handling.

---

## Q6: Jira Cache Invalidation Strategy

**Lacuna:** 🟡

Cache invalidation relies on comparing 'updated' field, but what if Jira is offline?

**Question:**
- If Jira REST call times out during freshness check, does fetch-jira-item use stale cache or error?
- Is there a fallback TTL (e.g., "cache is valid for 24 hours even if check fails")?

**Impact:** Affects offline-readiness.

**Validation needed:** Test network timeout scenario.

---

## Q7: Feature Plan Writeback — Partial Failure

**Lacuna:** 🟡

apply-test-plan writes TestPlan + Suite IDs back to Jira stories after TC creation. What if this fails?

**Question:**
- If ADO creation succeeds but Jira writeback fails, are TCs orphaned (no story link)?
- Can apply-test-plan be re-run to retry just the writeback?

**Impact:** Affects traceability between Jira and ADO.

**Validation needed:** Test feature plan writeback failure scenario.

---

## Q8: Regression Coverage Evaluation Picklist Labels

**Lacuna:** 🔴 (Domain.md G-01, G-02)

Exact Jira custom field picklist values for RegressionCoverageEvaluation and ManualReason are not confirmed.

**Question:**
- What is the exact label for "not contributing to regression coverage"?
- What is the exact label for "Covered by other Automation"?

**Impact:** Regression plan TC updates may fail if labels don't match ADO picklist.

**Validation needed:** Query ADO custom field definitions; confirm labels.

---

## Q9: NuGet Package Status

**Lacuna:** 🔴 (Domain.md G-04)

TestKit source (dotnet/BeckTech.QA.TestKit/) is completely absent from repo.

**Question:**
- Is publish-testkit.yml pipeline still active, or deprecated?
- Are NuGet packages still being published to DESTINI-Web feed?
- Should TestKit be regenerated, or is it archived?

**Impact:** Affects whether consumers can use BeckTech.QA.TestKit packages.

**Validation needed:** Check Azure Artifacts feed; confirm pipeline status.

---

## Q10: Approval Phrase Patterns

**Lacuna:** 🟡

plan-change and review-change skills detect approval via phrases like "looks good", "approved", "go ahead", etc.

**Question:**
- Exact regex or word list for approval phrases?
- Are phrases case-insensitive?
- What if user says "looks good enough"? (minor doubt)

**Impact:** Affects approval gate correctness.

**Validation needed:** Read skill frontmatter; document approval patterns.
