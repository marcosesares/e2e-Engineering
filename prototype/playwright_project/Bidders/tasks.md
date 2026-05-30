# Tasks — Bidders Feature

**Unit:** Bidders  
**Feature Area:** Contractor management  
**Status:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Task List

### Task B-001: Verify Required Field Validation
**Source:** TestCases/Bidders/Bidders.cs:AddBidderModal_RequiredFields()  
**Confidence:** 🟢 CONFIRMADO  
**Type:** Validation Test  
**Priority:** HIGH (MUST)

**Description:**  
Verify that the Add Bidder modal enforces all 4 required fields (Company Name, Contact Name, Email, Phone Number) before allowing save.

**Acceptance Criteria:**
- [ ] Open Add Bidder modal
- [ ] Verify Save button is disabled initially
- [ ] Fill Company Name only, verify Save still disabled
- [ ] Fill all 4 fields
- [ ] Verify Save button becomes enabled
- [ ] Leave Email empty, verify Save disabled again
- [ ] Verify error messages display for empty required fields

**Test Steps:**
1. Navigate to BidPackage page
2. Click "Add Bidder" button
3. Assert modal visible
4. Assert Save button disabled (class="disabled" or aria-disabled="true")
5. Fill Company Name: "Test Company"
6. Assert Save button still disabled
7. Fill Contact Name, Email, Phone
8. Assert Save button enabled
9. Clear Email field
10. Assert Save button disabled & error message appears

**Expected Outcome:**
- Test passes if all assertions succeed
- Modal validation prevents incomplete submissions

**Estimated Duration:** 30 seconds  
**Environment:** QA (appsettings.QA.json)

---

### Task B-002: Verify Bidder Addition (Happy Path)
**Source:** PageObjects/Components/BidderModal.cs  
**Confidence:** 🟡 INFERIDO  
**Type:** Functional Test  
**Priority:** MUST

**Description:**  
Verify that a valid bidder (with all required fields) is successfully added to the project and appears in the bidders grid.

**Acceptance Criteria:**
- [ ] Bidder form submitted with valid data
- [ ] API accepts POST /commands/add-bidder
- [ ] Modal closes after save
- [ ] New bidder appears in grid with correct data
- [ ] No duplicate entries in grid

**Test Steps:**
1. Open BidPackage page
2. Click Add Bidder
3. Fill form: Company="Turner", Contact="Jane", Email="jane@turner.com", Phone="(555)123-4567"
4. Click Save
5. Wait for modal close (timeout 5s)
6. Query grid for row with email "jane@turner.com"
7. Assert row contains: Company="Turner", Contact="Jane", Phone="(555)123-4567"

**Expected Outcome:**
- Bidder successfully persisted
- Grid reflects new addition
- Email uniqueness enforced at database level

**Estimated Duration:** 45 seconds  
**Dependencies:** CommandService running, database connectivity

---

### Task B-003: Verify Email Uniqueness Constraint
**Source:** PageObjects/Components/BidderModal.cs  
**Confidence:** 🟢 CONFIRMADO  
**Type:** Validation Test  
**Priority:** MUST

**Description:**  
Verify that duplicate email addresses within a project are rejected.

**Acceptance Criteria:**
- [ ] First bidder added with email "test@example.com"
- [ ] Second bidder submission with same email rejected
- [ ] Error message clearly states "Email already exists"
- [ ] Modal remains open for correction

**Test Steps:**
1. Create 2 bidders in same project, first with email="test@example.com"
2. First bidder save succeeds, grid updated
3. Click Add Bidder again
4. Fill form with email="test@example.com" (different company/contact)
5. Click Save
6. Assert error message visible: "This email is already assigned to another bidder"
7. Assert modal still open

**Expected Outcome:**
- Validation prevents duplicate emails
- User can correct error and retry

**Estimated Duration:** 60 seconds  
**Environment:** QA

---

### Task B-004: Verify Phone Number Format Validation
**Source:** TestSteps/TestStep.Bidders.cs  
**Confidence:** 🟡 INFERIDO  
**Type:** Validation Test  
**Priority:** SHOULD

**Description:**  
Verify that phone number accepts various formats (10-15 digits with symbols).

**Acceptance Criteria:**
- [ ] Format "(555) 123-4567" accepted ✓
- [ ] Format "+1-555-123-4567" accepted ✓
- [ ] Format "5551234567" accepted ✓
- [ ] Format "123" rejected (too short)
- [ ] Format "abc1234567" rejected (letters)

**Test Steps:**
1. For each valid format in list, fill phone field and verify Save button enabled
2. For each invalid format, fill phone field and verify error message or Save disabled

**Expected Outcome:**
- Valid formats: save succeeds, bidder added
- Invalid formats: save blocked with error message

**Estimated Duration:** 90 seconds  
**Depends On:** Task B-002 (happy path established)

---

### Task B-005: Verify Edit Bidder (Email Read-Only)
**Source:** PageObjects/Components/BidderModal.cs  
**Confidence:** 🟡 INFERIDO  
**Type:** Functional Test  
**Priority:** SHOULD

**Description:**  
Verify that editing a bidder allows updates to Company, Contact, and Phone, but not Email.

**Acceptance Criteria:**
- [ ] Modal pre-fills with current bidder data
- [ ] Email field is read-only (disabled attribute or hidden)
- [ ] Company, Contact, Phone fields are editable
- [ ] Save commits changes to database
- [ ] No-op update (no changes made) still succeeds

**Test Steps:**
1. Add bidder: Company="ABC", Contact="John", Email="john@abc.com", Phone="(555)123"
2. Click Edit on bidder row
3. Modal opens with pre-filled data
4. Verify Email field is disabled (aria-disabled="true")
5. Change Company to "XYZ Corp"
6. Click Save
7. Assert grid updated: Company now "XYZ Corp", Email unchanged

**Expected Outcome:**
- Edits persist
- Email immutability enforced
- Grid reflects updates immediately

**Estimated Duration:** 60 seconds

---

### Task B-006: Verify Delete Bidder with Confirmation
**Source:** PageObjects/Components/BidderModal.cs  
**Confidence:** 🟡 INFERIDO  
**Type:** Functional Test  
**Priority:** SHOULD

**Description:**  
Verify that deleting a bidder shows a confirmation dialog and removes the bidder from the grid.

**Acceptance Criteria:**
- [ ] Delete button on bidder row is present
- [ ] Click Delete triggers confirmation modal: "Delete [Company Name]?"
- [ ] Confirm button removes bidder
- [ ] Cancel button dismisses confirmation without deletion
- [ ] After deletion, bidder no longer in grid
- [ ] Associated responses (if any) cascade-deleted or marked orphaned

**Test Steps:**
1. Add bidder: Company="Turner", Email="jane@turner.com"
2. Click Delete on bidder row
3. Assert confirmation modal appears with text "Delete Turner Construction?"
4. Click Cancel
5. Assert modal closes, bidder still in grid
6. Click Delete again
7. Click Confirm
8. Assert modal closes, grid refreshed, bidder removed

**Expected Outcome:**
- Two-step deletion prevents accidental removal
- Grid state reflects deletion immediately

**Estimated Duration:** 60 seconds

---

### Task B-007: Verify Bidders Grid Display
**Source:** PageObjects/BidPackagePage.cs  
**Confidence:** 🟢 CONFIRMADO  
**Type:** UI Test  
**Priority:** MUST

**Description:**  
Verify that the bidders grid displays all columns and allows basic interactions.

**Acceptance Criteria:**
- [ ] Grid columns visible: Company Name, Contact Name, Email, Phone, Actions
- [ ] Actions column contains Edit and Delete buttons
- [ ] Empty state message if no bidders: "No bidders added yet"
- [ ] Sorting by Company Name works (ascending default)
- [ ] Pagination visible if >10 bidders

**Test Steps:**
1. Navigate to BidPackage page with no bidders
2. Assert grid shows "No bidders added yet"
3. Add 3 bidders: ABC, XYZ, DEF (alphabetically)
4. Assert grid displays all 3 in alphabetical order
5. Verify columns: Company, Contact, Email, Phone, Actions
6. Verify Edit/Delete buttons on each row

**Expected Outcome:**
- Grid renders correctly
- Empty state UX is clear
- All data visible and interactive

**Estimated Duration:** 45 seconds

---

## Summary Table

| Task ID | Title | Priority | Type | Estimated Time | Status |
|---------|-------|----------|------|-----------------|--------|
| B-001 | Required Field Validation | MUST | Validation | 30s | Pending |
| B-002 | Happy Path (Add Bidder) | MUST | Functional | 45s | Pending |
| B-003 | Email Uniqueness | MUST | Validation | 60s | Pending |
| B-004 | Phone Format Validation | SHOULD | Validation | 90s | Pending |
| B-005 | Edit Bidder | SHOULD | Functional | 60s | Pending |
| B-006 | Delete Bidder | SHOULD | Functional | 60s | Pending |
| B-007 | Grid Display | MUST | UI | 45s | Pending |

**Total Estimated Duration:** ~390 seconds (~6.5 minutes)  
**Test Suite:** Sequential execution (dependencies respected)
