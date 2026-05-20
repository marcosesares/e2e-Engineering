# Tasks — EnvironmentSetup Feature

**Unit:** EnvironmentSetup  
**Status:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

| Task ID | Title | Priority | Est. Time |
|---------|-------|----------|-----------|
| ES-001 | Execute Pending Migrations | MUST | 3m |
| ES-002 | Verify Schema Version Post-Migration | MUST | 1m |
| ES-003 | Trigger & Verify Full Resync | MUST | 3m |
| ES-004 | Database Health Check | SHOULD | 2m |

**Total:** ~9 minutes

---

## Key Tests

### ES-001: Migration Execution
1. Query SchemaMigrations table → note version
2. Call migration API endpoint
3. Query again → verify new version
4. Assert: No failed migration status

### ES-003: Full Resync
1. Create 10 BidProjects (domain entities)
2. Call /api/resync-all endpoint
3. Poll /api/resync-status until complete (timeout 60s)
4. Query query DB: COUNT(BidProject_View)
5. Assert: 10 rows in query DB
6. Assert: All fields match domain entities

