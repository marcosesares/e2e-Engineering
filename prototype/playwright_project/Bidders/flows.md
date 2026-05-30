# Flows — Bidders Feature

**Unit:** Bidders  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Flow-01: Add Bidder Happy Path

```
Start: BidPackage page loaded, no bidders yet
  │
  ├─→ Click "Add Bidder" button
  │     │ Wait for modal visible (timeout 3s)
  │     └─ Modal appears with empty form
  │
  ├─→ Fill form fields (4 required)
  │     ├─ Company Name: "Turner Construction"
  │     ├─ Contact Name: "Jane Smith"
  │     ├─ Email: "jane@turner.com"
  │     └─ Phone: "(555) 123-4567"
  │
  ├─→ Verify Save button enabled
  │     │ (All 4 required fields present)
  │     └─ Save button becomes clickable
  │
  ├─→ Click Save
  │     │ API: POST /commands/add-bidder (request body)
  │     │   {
  │     │     "projectId": "ABC123",
  │     │     "company": "Turner Construction",
  │     │     "contact": "Jane Smith",
  │     │     "email": "jane@turner.com",
  │     │     "phone": "(555) 123-4567"
  │     │   }
  │     │
  │     └─ Command processed by CommandService
  │
  ├─→ Wait for response (timeout 5s)
  │     ├─ Success (HTTP 200): Proceed
  │     └─ Error (HTTP 400/500): Show error modal
  │
  ├─→ Modal closes
  │     │ Grid refreshed automatically
  │     └─ BiddersGrid.Refresh() triggered
  │
  ├─→ Verify new bidder in grid
  │     ├─ Grid row contains: Company="Turner Construction"
  │     ├─ Contact="Jane Smith"
  │     ├─ Email="jane@turner.com"
  │     └─ Phone="(555) 123-4567"
  │
  └─→ End: Test passes ✅
```

**Duration:** ~2 seconds (API + UI)  
**Key Assertions:**
- Modal visible after button click
- Save button state (disabled → enabled)
- Modal closes post-save
- Grid updated with new row

---

## Flow-02: Validation Error (Required Field Missing)

```
Start: BidPackage page, Add Bidder modal open
  │
  ├─→ User fills only 3 of 4 required fields
  │     ├─ Company: "ABC Mechanical" ✓
  │     ├─ Contact: "John Doe" ✓
  │     ├─ Email: [EMPTY]
  │     └─ Phone: "(555) 012-3456" ✓
  │
  ├─→ Save button remains disabled
  │     │ (Email is required, still empty)
  │     └─ Save button class includes "disabled"
  │
  ├─→ User attempts to click Save anyway
  │     │ (Button click may be blocked at UI level)
  │     └─ If click succeeds, API returns 400
  │
  ├─→ Validation message appears below Email field
  │     │ "Email Address is required"
  │     └─ Red border around input field
  │
  ├─→ Modal stays open
  │     │ No submission to API
  │     └─ User can correct and retry
  │
  ├─→ User fills Email field: "john@abc.com"
  │     │ Save button becomes enabled (all fields now filled)
  │     └─ User clicks Save → Happy path resumes
  │
  └─→ End: Test validates error state, then recovery ✅
```

**Duration:** ~30 seconds (user interaction + validation)  
**Key Assertions:**
- Save button disabled state
- Error message visible & accurate
- Modal persists (not dismissed on error)
- Recovery path works (correct field, save succeeds)

---

## Flow-03: Duplicate Email Error

```
Start: Project with existing bidder "jane@turner.com"
  │
  ├─→ User clicks "Add Bidder" again
  │     └─ Modal opens empty
  │
  ├─→ User fills form with same email (different company)
  │     ├─ Company: "Different Corp"
  │     ├─ Contact: "Different Person"
  │     ├─ Email: "jane@turner.com" [DUPLICATE!]
  │     └─ Phone: "(555) 999-9999"
  │
  ├─→ All 4 required fields present → Save button enabled
  │
  ├─→ User clicks Save
  │     │ API: POST /commands/add-bidder
  │     │ CommandService checks email uniqueness within project
  │     │ Database query: SELECT * FROM Bidder WHERE ProjectId=X AND Email=Y
  │     │ → Result: 1 row found (duplicate detected)
  │     │
  │     └─ API returns 400 Bad Request
  │         { "error": "Email already exists in project" }
  │
  ├─→ Modal displays error message
  │     │ "This email is already assigned to another bidder."
  │     │ Red warning banner at top of modal
  │     └─ Focus moved to Email field
  │
  ├─→ User can correct email or cancel
  │     ├─ Option 1: Change email to "different@corp.com" → Save → Succeeds
  │     └─ Option 2: Click Cancel → Modal closes, no change
  │
  └─→ End: Test validates duplicate detection & recovery ✅
```

**Duration:** ~45 seconds  
**Key Assertions:**
- API rejects duplicate email with 400 status
- Error message shown in modal (not generic toast)
- Modal stays open for correction
- Retry with different email succeeds

---

## Flow-04: Edit Bidder

```
Start: BidPackage page with existing bidder
  │       (Company: "Turner", Email: "jane@turner.com", Phone: "(555) 123")
  │
  ├─→ User clicks "Edit" button on bidder row
  │     │ Locates row by email or row index
  │     └─ Modal opens with pre-filled data
  │
  ├─→ Modal displays current values
  │     ├─ Company: "Turner" (editable)
  │     ├─ Contact: "Jane Smith" (editable)
  │     ├─ Email: "jane@turner.com" (READ-ONLY, disabled attribute)
  │     └─ Phone: "(555) 123" (editable)
  │
  ├─→ User modifies phone number
  │     │ Changes from "(555) 123" to "(555) 123-4567"
  │     └─ Other fields untouched
  │
  ├─→ User clicks Save
  │     │ API: PUT /commands/update-bidder
  │     │ Body: { "biddderId": "...", "phone": "(555) 123-4567" }
  │     │
  │     └─ CommandService validates & persists change
  │
  ├─→ Modal closes
  │     │ Grid refreshes
  │     └─ Bidder row updated: Phone now shows "(555) 123-4567"
  │
  ├─→ (Alternative: No-op update)
  │     │ User opens Edit, makes NO changes
  │     │ Clicks Save anyway
  │     │ → API succeeds (no-op is OK)
  │     │ → Modal closes, grid unchanged (no visual diff)
  │
  └─→ End: Test validates edit, email immutability, no-op handling ✅
```

**Duration:** ~60 seconds  
**Key Assertions:**
- Modal pre-population accuracy
- Email field disabled/read-only
- Other fields editable
- Save commits changes
- No-op update succeeds silently

---

## Flow-05: Delete Bidder with Confirmation

```
Start: BidPackage page with bidders grid
  │
  ├─→ User clicks "Delete" button on bidder row
  │     │ E.g., company "Turner Construction"
  │     └─ Confirmation modal opens
  │
  ├─→ Confirmation modal displays
  │     │ Title: "Delete Bidder?"
  │     │ Message: "Are you sure you want to delete 'Turner Construction'?"
  │     │ Buttons: [Confirm] [Cancel]
  │     └─ Close (X) button also cancels
  │
  ├─→ (Scenario A: User cancels)
  │     │ Click Cancel button
  │     │ Modal closes
  │     └─ Bidder still in grid (unchanged)
  │
  ├─→ (Scenario B: User confirms deletion)
  │     │ Click Confirm button
  │     │ API: DELETE /commands/delete-bidder?id=...
  │     │ CommandService processes deletion
  │     │ Cascade: Associated responses marked orphaned or deleted
  │     │
  │     └─ API returns 200 OK
  │
  ├─→ Confirmation modal closes
  │     │ Grid refreshes automatically
  │     └─ Bidder row removed from table
  │
  ├─→ Grid updates immediately
  │     │ If grid was showing "Turner" before, it's gone now
  │     │ If grid becomes empty, empty state message shown
  │     └─ No page reload necessary
  │
  └─→ End: Test validates two-step deletion & cascade ✅
```

**Duration:** ~60 seconds  
**Key Assertions:**
- Confirmation modal displays correct company name
- Cancel doesn't delete (grid unchanged)
- Confirm deletes (row removed from grid)
- Grid refreshes automatically (no manual reload)

---

## Flow-06: Grid Sorting & Pagination

```
Start: BidPackage page with 12+ bidders
  │
  ├─→ Grid displays first 10 bidders (default pagination)
  │     │ Companies: ABC, DEF, GHI, ... (alphabetical order)
  │     │ Pagination controls visible: "Page 1 of 2", [Next]
  │     └─ Each row shows: Company, Contact, Email, Phone, Actions
  │
  ├─→ User clicks "Company Name" column header (sort)
  │     │ Grid re-sorts by Company Name (ascending)
  │     │ Visual indicator (▲ or ▼) on column header
  │     └─ Order refreshed: ABC, DEF, GHI, ... (maintained if already ascending)
  │
  ├─→ User clicks [Next] pagination button
  │     │ Page 2 loads (bidders 11-12 shown)
  │     └─ [Prev] button now enabled
  │
  ├─→ User navigates back to page 1
  │     │ Original 10 bidders shown again
  │     └─ Page 2 state preserved (if user goes to 2 again, same position)
  │
  └─→ End: Test validates sort & pagination UX ✅
```

**Duration:** ~45 seconds  
**Key Assertions:**
- Default sort order (alphabetical by Company)
- Pagination works (page count, next/prev buttons)
- State persists within session
- Sort indicators visible

---

## Edge Cases

| Scenario | Behavior | Test |
|----------|----------|------|
| Very long company name (500+ chars) | Text truncated or wrapped | Verify grid cell fits |
| Special chars in email (john+test@ex.com) | Accepted if RFC 5322 valid | Task B-004 variant |
| Concurrent edits (2 users on same bidder) | Depends on pessimistic/optimistic locking (🔴 LACUNA) | N/A (needs design) |
| Browser back button during modal | Modal dismissed, grid state restored | Task B-001 edge case |
| Network timeout during save | RetryHelper kicks in (3x) | Implicit in integration tests |

