# User Stories — DESTINI BidDay Test Scenarios

**Date:** 2026-05-20  
**Doc Level:** Completo  
**Confidence:** 🟢 CONFIRMADO  

---

## Overview

Consolidated user stories representing core bid day workflows. Each story maps to one or more test features.

---

## Story 1: Admin Sets Up Bid Day System

**As a** BidDay Administrator  
**I want to** configure the bid day system (packages, fees, units, permissions)  
**So that** projects can run with correct constraints and allowed roles

**Acceptance Criteria:**
- ✅ Create bid package with unique code & description
- ✅ Define fees (%, LUMP SUM) with applicability rules
- ✅ Define units of measure (FT, SQFT, etc.)
- ✅ Assign roles to team members (Admin, Editor, Contributor, Viewer)
- ✅ All changes persist & visible in subsequent tests

**Test Coverage:**
- BidDaySettings (all 8 sub-areas)
- UserPermissionsMatrix (role assignment)

**Estimated Duration:** 30 minutes setup

---

## Story 2: Project Manager Creates Bid Project

**As a** Project Manager  
**I want to** create a bid project with packages and invite bidders  
**So that** contractors can submit their bids

**Acceptance Criteria:**
- ✅ Create project with name, bid due date, start/completion dates
- ✅ Create packages with codes (01.40, 02.20)
- ✅ Add line items to each package (description, qty, unit, price)
- ✅ Invite bidders (company, contact, email, phone)
- ✅ Set conditions & requirements for bidders

**Test Coverage:**
- Bidders (add/list)
- LineItems (add/edit/delete)
- BidDaySettings (conditions, requirements)
- BidResponses (data entry setup)

**Estimated Duration:** 20 minutes

---

## Story 3: Bidder Submits Competitive Bid

**As a** Contractor  
**I want to** enter my pricing for line items, apply discounts/premiums, and submit  
**So that** I can compete for the project

**Acceptance Criteria:**
- ✅ Enter qty/price per line item (real-time extended calc)
- ✅ Review subtotal, fees, adjustments
- ✅ Apply discount (e.g., -5% for early submission)
- ✅ Confirm general requirements & trade-specific requirements
- ✅ See final grand total before submit
- ✅ Submit bid → Confirmation with timestamp

**Test Coverage:**
- BidResponses (entry, calculations, submit)
- BidSummaryPageEdits (inline edit verification)
- EventFallbacks (bid event persisted & synced)

**Estimated Duration:** 15 minutes per bidder

---

## Story 4: Project Manager Reviews & Edits Bid Summary

**As a** Project Manager (Admin/Editor)  
**I want to** quickly edit bid totals inline (qty/price corrections)  
**So that** I can fix data entry errors without reopening complex forms

**Acceptance Criteria:**
- ✅ Click cell → inline edit mode
- ✅ Edit quantity or price
- ✅ Press ESC to cancel or Tab to save (real-time calc)
- ✅ All dependent calculations update (extended, subtotal, fees, grand total)
- ✅ Changes persisted & audit logged

**Test Coverage:**
- BidSummaryPageEdits (full inline edit flow)
- BidResponses (dependent calculations)

**Estimated Duration:** 10 minutes

---

## Story 5: Manager Adds Notes & Comments for Collaboration

**As a** Team Member  
**I want to** add notes to bid packages (with formatting)  
**So that** our team can collaborate & leave audit trail

**Acceptance Criteria:**
- ✅ Add note with rich text (bold, italic, lists)
- ✅ Note shows author, timestamp, edit history
- ✅ Edit note (author only or admin override)
- ✅ Delete note (soft delete, audit trail preserved)
- ✅ XSS prevention (scripts not executed)

**Test Coverage:**
- BidPackageNotes (add/edit/delete/list)

**Estimated Duration:** 8 minutes

---

## Story 6: Verify Data Consistency & Fallback

**As a** QA Engineer  
**I want to** verify that event sourcing & sync work correctly  
**So that** data is consistent between domain & query databases even on failures

**Acceptance Criteria:**
- ✅ Create bid project (domain events emitted)
- ✅ Verify query DB synced (event handler processed events)
- ✅ Simulate event bus failure → Manual resync → Query DB consistent
- ✅ Verify event order & no duplicates in event store
- ✅ Verify frozen entities immutable (closed projects reject new events)

**Test Coverage:**
- EventFallbacks (replay, sync, fallback, integrity)
- EnvironmentSetup (resync, migration, health check)

**Estimated Duration:** 25 minutes

---

## Story 7: Enforce Role-Based Access Control

**As a** Security Officer  
**I want to** verify that roles enforce proper permissions  
**So that** unauthorized users cannot edit/delete bid data

**Acceptance Criteria:**
- ✅ Viewer role: Can only view (no create/edit/delete)
- ✅ Contributor: Can create & edit but not delete
- ✅ Editor: Can create, edit, delete, but not manage users
- ✅ Admin: Full access (all actions allowed)
- ✅ Unauthorized attempts logged (audit trail)

**Test Coverage:**
- UserPermissionsMatrix (16 permission combinations)
- BidDaySettings (permission-gated admin features)

**Estimated Duration:** 20 minutes

---

## Story 8: System Health & Database Migrations

**As a** DevOps/QA  
**I want to** run database migrations & verify system health  
**So that** deployments are safe & consistent

**Acceptance Criteria:**
- ✅ Execute pending EF migrations (schema version updated)
- ✅ Verify connection to both event store (PostgreSQL) & query DB (Azure SQL)
- ✅ Trigger full resync (domain → query DB)
- ✅ Health check: Table counts, key counts, no orphaned records

**Test Coverage:**
- EnvironmentSetup (migrations, resync, health check)

**Estimated Duration:** 15 minutes

---

## User Story Mapping

| Story | Feature(s) | Priority | Complexity |
|-------|-----------|----------|-----------|
| 1 | BidDaySettings, UserPermissionsMatrix | MUST | HIGH |
| 2 | Bidders, LineItems, BidDaySettings | MUST | MEDIUM |
| 3 | BidResponses, EventFallbacks | MUST | HIGH |
| 4 | BidSummaryPageEdits, BidResponses | SHOULD | MEDIUM |
| 5 | BidPackageNotes | SHOULD | LOW |
| 6 | EventFallbacks, EnvironmentSetup | MUST | HIGH |
| 7 | UserPermissionsMatrix, BidDaySettings | MUST | MEDIUM |
| 8 | EnvironmentSetup | SHOULD | MEDIUM |

---

## Test Scenario Execution Order

Recommended sequencing (dependencies respected):

1. **Story 8** (EnvironmentSetup) — DB migrations & health
2. **Story 1** (BidDaySettings) — Admin setup
3. **Story 7** (UserPermissionsMatrix) — Role verification
4. **Story 2** (Bidders, LineItems) — Project setup
5. **Story 3** (BidResponses) — Bid entry
6. **Story 4** (BidSummaryPageEdits) — Quick edits
7. **Story 5** (BidPackageNotes) — Collaboration
8. **Story 6** (EventFallbacks) — Data consistency

**Total Test Time:** ~2 hours (sequential)

---

## Gaps & Questions

🔴 **G1:** Mobile/responsive design testing? (Not in scope for this extraction)  
🔴 **G2:** Performance testing at scale (1000+ bidders)? (Listed in edge cases, not in stories)  
🟡 **G3:** Integration with external systems (email, notifications)? (Not fully documented)

