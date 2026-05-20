# Requirements — Bidders Feature

**Unit:** Bidders  
**Type:** Feature (CRUD operations on bidding contractors)  
**Status:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Overview

Bidders feature manages the lifecycle of contractors bidding on a project: creation, validation, update, and deletion. Each bidder is uniquely identified within a project by email address.

---

## Functional Requirements

### FR-01: Add Bidder
**MoSCoW:** MUST  
**Trigger:** User clicks "Add Bidder" button on BidPackage page  
**Behavior:** 🟢 Modal form opens with required fields: Company Name, Contact Name, Email, Phone Number

**Acceptance Criteria:**
- ✅ Form displays all 4 required fields (Company Name, Contact Name, Email, Phone)
- ✅ Save button disabled until all required fields filled
- ✅ Cancel button dismisses modal without saving
- ✅ Email validation prevents duplicate emails within project
- ✅ Phone number accepts 10-15 digits with symbols (-, +, space, parentheses)

**Flows:**
- **Happy path:** Fill all fields → Click Save → Bidder added → Modal closes
- **Error: Missing field:** Empty Company Name → Click Save → Error message, modal stays open
- **Error: Duplicate email:** Enter existing email → Click Save → "Email already exists in project"

---

### FR-02: Edit Bidder
**MoSCoW:** SHOULD  
**Trigger:** User clicks bidder row → Edit button  
**Behavior:** 🟡 Modal pre-fills current bidder data; email cannot be changed

**Acceptance Criteria:**
- ✅ Modal loads with current bidder values
- ✅ Email field is read-only or hidden (cannot change)
- ✅ Other fields (Company Name, Contact Name, Phone) editable
- ✅ Save commits changes; Cancel discards
- ✅ No-op: If no fields changed, Save still succeeds silently

---

### FR-03: Delete Bidder
**MoSCoW:** SHOULD  
**Trigger:** User clicks bidder row → Delete button  
**Behavior:** 🟢 Confirmation dialog, then removal from list

**Acceptance Criteria:**
- ✅ Confirmation modal displayed: "Delete [Company Name]?"
- ✅ Confirm button removes bidder permanently
- ✅ Cancel dismisses dialog
- ✅ After deletion, bidder no longer appears in list
- ✅ Deletion cascade: Remove any responses associated with this bidder

---

### FR-04: List Bidders
**MoSCoW:** MUST  
**Trigger:** BidPackage page loads  
**Behavior:** 🟢 Display all bidders for project in grid/table format

**Acceptance Criteria:**
- ✅ Grid shows: Company Name, Contact Name, Email, Phone, Actions (Edit, Delete)
- ✅ Empty state message if no bidders: "No bidders added yet"
- ✅ Sorting by Company Name (ascending default)
- ✅ Pagination if >10 bidders (10 per page)

---

## Non-Functional Requirements

### NFR-01: Performance
- ✅ Add bidder: < 2s round-trip (API + UI)
- ✅ List bidders: < 500ms for 100 bidders
- ✅ Validation (email uniqueness): < 100ms

### NFR-02: Security
- ✅ Email validation: RFC 5322 compliant
- ✅ Phone number: No SQL/script injection (sanitized input)
- ✅ Authorization: Only project members can view/edit bidders

### NFR-03: Availability
- ✅ Retry on transient network failure (up to 3 attempts)
- ✅ Offline handling: Queue changes, sync when online

---

## Data Entities

| Entity | Fields | Source |
|--------|--------|--------|
| Bidder | CompanyName, ContactName, Email, PhoneNumber, ProjectId, CreatedAt, ModifiedAt | 🟢 PageObjects/Components/BidderModal.cs |
| TestUser | Email, Role, ProjectId | 🟢 TestConfiguration.cs |

---

## Dependencies

- **Domain:** Bidder aggregate (DESTINI.BidDay.Domain)
- **API:** POST /commands/add-bidder, PUT /commands/update-bidder, DELETE /commands/delete-bidder
- **Database:** Bidder table in Query DB
- **UI Components:** BidderModal, BidPackagePage

---

## Gaps & Questions

- 🔴 **Q1:** Can bidders be bulk-imported from CSV? (Currently not in scope)
- 🔴 **Q2:** Phone number country code handling? (Currently assumes US format)
- 🟡 **Q3:** Soft-delete vs hard-delete for audit trail? (Need validation)

---

## Traceability

| Test File | Coverage |
|-----------|----------|
| TestCases/Bidders/Bidders.cs | FR-01 (AddBidderModal_RequiredFields) |
| PageObjects/Components/BidderModal.cs | UI locators & interactions |
| TestSteps/TestStep.Bidders.cs | Reusable steps (fill, validate, click) |
