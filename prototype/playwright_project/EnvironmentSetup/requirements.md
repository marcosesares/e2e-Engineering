# Requirements — EnvironmentSetup Feature

**Unit:** EnvironmentSetup  
**Type:** Test Infrastructure & Maintenance  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Overview

Setup & maintenance operations: DB migrations, resync, schema verification.

---

## Functional Requirements

### FR-01: Run Database Migration
**Priority:** MUST

- Execute pending SQL migrations (EF Core Migrations or custom SQL)
- Idempotent (safe to run multiple times)
- Verify schema version post-migration

### FR-02: Resync BidDay Settings
**Priority:** MUST

- Trigger FULL resync from domain entities → query database
- Fallback mechanism verification
- Assert data consistency (domain = query DB)

### FR-03: Database Health Check
**Priority:** SHOULD

- Verify connections: Azure SQL, PostgreSQL
- Check table counts, key counts
- Report: ✅ Healthy / ❌ Issue with X

---

## Data Entities

| Table | Purpose | Source |
|-------|---------|--------|
| SchemaMigrations | Migration version tracking | EF Core |
| BidProject, BidPackage, etc. | Main domain entities | Domain aggregates |
| Query DB tables (BidProject_View, etc.) | Denormalized read models | Event handlers + sync |

---

## Dependencies

- Database helpers: AzureSql.cs, PostgresSql.cs
- CommandService (domain)
- Event store (PostgreSQL)
- Query database (Azure SQL)

