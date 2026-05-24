# Setup, Decisões

## ADR-005 (referenced): 4-Hour TTL for Update Check

Decision: Cache update check per repo root with 4-hour TTL.

Rationale: Balance freshness vs. session speed.

Status: ✅

---

## Set-Based Sync Delta

Decision: Use set operations (added = remote − local; removed = local − remote) instead of count-based logic.

Rationale: Handles renames correctly.

Status: ✅

---

## Fail-Open Guard Posture

Decision: PreToolUse guard exits 0 on structural errors.

Rationale: Prevent blocking user workflow.

Status: ✅
