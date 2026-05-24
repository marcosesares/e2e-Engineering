# Claude Skills, Decisões de Design

---

## ADR-001: Git Subtree for Skill Distribution

**Decision:** Distribute skills via git subtree split (published-skills branch) to consuming repos.

**Alternative:** Submodules, npm packages, direct copy-paste.

**Rationale:** Subtree allows independent history on publisher side; consuming repos pull cleanly; no external registry dependency.

**Tradeoff:** Force-push history on published-skills is disposable; requires PreToolUse guard to prevent local edits.

**Status:** ✅ Implemented (BR-SD-01, BR-SD-02)

---

## ADR-002: Skills as Markdown SKILL.md Files

**Decision:** Define skills in plaintext SKILL.md (not JSON, YAML, or binary).

**Rationale:** Version-controllable, human-readable, review-friendly; can be read raw on GitHub.

**Tradeoff:** No built-in validation for skill frontmatter structure.

**Status:** ✅ Implemented

---

## ADR-003: Multi-Phase ADO Test Case Creation

**Decision:** Create TCs via wit_create_work_item (all Custom.* fields in one call), then update steps separately.

**Alternative:** testplan_create_test_case (does not allow Custom.* fields).

**Rationale:** Avoids TF401320 error; maintains separation of concerns (schema vs content).

**Status:** ✅ Implemented (BR-TC-01, BR-TC-02)

---

## ADR-004: Fail-Open Guard Posture

**Decision:** PreToolUse guard exits 0 (allow) if .sync-manifest is missing or malformed.

**Rationale:** Prevents blocking user workflow due to infrastructure issues; worst case, user edits a synced file (discovered later via PR review).

**Alternative:** Strict validation; fail closed.

**Tradeoff:** Risk of accidental edits to synced files.

**Status:** ✅ Implemented (BR-SD-03)

---

## ADR-005: 4-Hour TTL for Update Check Cache

**Decision:** Cache update check result per repo root for 4 hours.

**Rationale:** Balance between freshness (detect new versions) and session speed (avoid slow checks every session).

**Tradeoff:** User may miss urgent updates for up to 4 hours; manual `/refresh-setup` needed.

**Status:** ✅ Implemented (BR-SD-05)

---

## ADR-006: Per-Artifact Version Markers

**Decision:** Each generated artifact (CLAUDE.md, settings.json, repo-context/SKILL.md) has its own version marker.

**Rationale:** Allows independent upgrade/downgrade of artifact versions; refresh-setup can detect drift per artifact.

**Status:** ✅ Implemented

---

## ADR-007: PowerShell NuGet Glob Resolution

**Decision:** Use PowerShell Get-ChildItem (not shell glob) for NuGet package globbing in publish-testkit.yml.

**Rationale:** Shell glob depends on NuGet SDK version; PowerShell is platform-neutral.

**Status:** ✅ Implemented (publish-testkit.yml)

---

## ADR-008: Sidecar Schema Alignment

**Decision:** Operations JSON (used by create-ado-test-cases.ps1) is the canonical schema; sidecar generated during apply-test-plan is aligned to this schema.

**Rationale:** Reduces serialization overhead; sidecar can be re-used as direct script input.

**Status:** ✅ Implemented

---

## ADR-009: CSPROJ Version as Release Source

**Decision:** NuGet package versions are driven by <Version> in each src/*.csproj, not Git tags or build numbers.

**Rationale:** Central authority in code; pipeline reads version once.

**Status:** ✅ Implemented (publish-testkit.yml)

---

## ADR-010: Set-Based Sync Delta

**Decision:** Skill sync uses set operations (added = remote − local; removed = local − remote) instead of count-based logic.

**Rationale:** Handles file renames (count unchanged, but set differs) correctly.

**Status:** ✅ Implemented (sync-shared-skills.ps1 line ~106)
