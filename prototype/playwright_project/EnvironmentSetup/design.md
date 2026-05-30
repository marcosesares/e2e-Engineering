# Design — EnvironmentSetup Feature

**Unit:** EnvironmentSetup  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Architecture

```
TestStep.Database (static helpers)
  ├── MigrationHelper
  │   ├── GetPendingMigrations()
  │   ├── ExecuteMigration(name)
  │   └── VerifySchemaVersion()
  ├── ResyncHelper
  │   ├── TriggerFullResync()
  │   ├── WaitForResyncComplete(timeout)
  │   └── VerifyDataConsistency()
  └── HealthCheckHelper
      ├── ConnectAndQuery(db)
      └── ReportStatus()

TestStep.Database.CommandService
  ├── CallMigrationEndpoint() → API
  ├── CallResyncEndpoint() → API
  └── CallHealthCheckEndpoint() → API

Database Classes
  ├── AzureSql.cs (Azure SQL connections)
  └── PostgresSql.cs (PostgreSQL connections)
```

---

## Execution Flow

**Migration:**
1. Get pending migrations list
2. For each: Execute migration script
3. Verify: Query SchemaMigrations table
4. Assert: No failed migrations

**Resync:**
1. Trigger /api/commands/resync-all (or similar)
2. Poll event processor status (wait for completion)
3. Compare domain entities vs query DB
4. Report: X records synced, Y mismatches (if any)

