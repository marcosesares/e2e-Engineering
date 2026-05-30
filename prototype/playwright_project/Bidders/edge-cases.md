# Edge Cases — Bidders Feature

**Unit:** Bidders  
**Confidence:** 🟡 INFERIDO  
**Date:** 2026-05-20

---

## Data Boundary Cases

### EC-01: Maximum Field Lengths

**Scenario:** User enters very long strings in form fields

| Field | Max Length (per spec) | Test Input | Expected Behavior |
|-------|----------------------|------------|-------------------|
| Company Name | 255 chars | 256-char string | Truncated to 255 or rejected (TBD) |
| Contact Name | 100 chars | 101-char string | Truncated or rejected |
| Email | 254 chars (RFC 5321) | 255-char email | Rejected (exceeds RFC 5321 limit) |
| Phone | 15 digits | "1234567890123456" (16 chars) | Rejected as invalid format |

**Expected Outcome:**  
🟡 Input validation either: (a) enforces max length in UI, or (b) API rejects and shows error. Confirm behavior.

**Traceability:** PageObjects/Components/BidderModal.cs (maxlength attributes on inputs)

---

### EC-02: Special Characters in Company Name

**Scenario:** User enters company with special characters

**Test Cases:**
- Input: "ABC & Co." → Expected: ✅ Accepted
- Input: "O'Reilly Construction" → Expected: ✅ Accepted  
- Input: "Smith/Jones LLC" → Expected: ✅ Accepted
- Input: "Company<script>alert('xss')</script>" → Expected: ❌ Rejected or escaped (XSS prevention)

**Expected Outcome:**  
Legitimate punctuation accepted; HTML/script tags escaped or rejected.

**Risk Level:** 🔴 HIGH (XSS vulnerability if not sanitized)  
**Traceability:** Database layer (SQL injection prevention)

---

### EC-03: Email Format Variations

**Scenario:** RFC 5322 compliant but unusual email formats

**Valid Cases (should accept):**
- `user+tag@example.com` (plus addressing)
- `user.name@example.co.uk` (subdomain)
- `user_name@example.com` (underscore)
- `123@example.com` (numeric local part)

**Invalid Cases (should reject):**
- `user@.com` (missing domain name)
- `user..name@example.com` (consecutive dots)
- `user name@example.com` (space in local part)
- `user@example.com.` (trailing dot)

**Expected Outcome:**  
Validation follows RFC 5322 strictly. Ambiguous formats require decision from business stakeholder.

**Traceability:** TestSteps/TestStep.Bidders.cs (validation helper)

---

### EC-04: Phone Number International Formats

**Scenario:** User enters phone numbers from different countries

**Current Assumption:** US format (10-15 digits with symbols)

**Test Cases:**
- US: `(555) 123-4567` → ✅ Expected: Accepted
- US: `+1-555-123-4567` → ✅ Expected: Accepted
- UK: `+44 20 1234 5678` → 🟡 Unknown (may fail if only US accepted)
- India: `+91-98765-43210` → 🟡 Unknown

**Expected Outcome:**  
🔴 **Clarification needed:** Is phone validation hardcoded to US format, or does it support international? Affects field behavior.

**Traceability:** TestSteps/TestStep.Bidders.cs (phone regex/validation)

---

## State & Concurrency Cases

### EC-05: Bidder Edited While User Viewing Modal

**Scenario:** User A opens Edit modal for bidder; User B modifies same bidder before User A saves

**Test Setup:**
1. Two browser sessions (or simulated via API)
2. Session 1: Opens bidder "Turner" in Edit modal
3. Session 2: API call: UPDATE Bidder where Email='jane@turner.com' → Phone='(555) 999'
4. Session 1: User modifies phone to '(555) 111' and clicks Save

**Expected Outcome:**  
🟡 **Behavior depends on locking strategy:**
- **Optimistic:** Last write wins (Session 1 overwrites Session 2)
- **Pessimistic:** Modal shows "Bidder locked by another user" error

**Current Implementation Assumption:** 🔴 LACUNA (not documented)  
**Recommendation:** Clarify locking strategy and add test if pessimistic locking implemented.

---

### EC-06: Delete Bidder Twice (Race Condition)

**Scenario:** User clicks Delete, then Delete again before grid refreshes

**Test Setup:**
1. Click Delete on bidder "Turner"
2. Confirmation modal appears
3. Before user responds, click Delete on same row again (rapid clicks)

**Expected Outcome:**  
- First confirmation takes precedence
- Rapid clicks ignored or second click fails gracefully
- Only one delete request sent to API

**Traceability:** UI event debouncing (should be present in PageObjects)

---

### EC-07: Grid Refresh During Edit

**Scenario:** Background sync updates bidders grid while Edit modal is open

**Test Setup:**
1. User opens Edit modal for bidder "Turner"
2. Event Processor syncs updated bidder data (background)
3. Grid refreshes automatically
4. User still editing in modal

**Expected Outcome:**  
- Modal data stale (no automatic reload from grid)
- User saves modal → Overwrites synced changes (🟡 verify desired behavior)
- OR Modal detects stale state and prompts user to reload (better UX)

**Recommendation:** Add test to verify modal refresh strategy.

---

## UI Interaction Edge Cases

### EC-08: Click Save While API Request In-Flight

**Scenario:** User clicks Save, then clicks Save again before response arrives

**Test Setup:**
1. Fill bidder form completely
2. Click Save (API request sent, 3s latency)
3. While waiting, user clicks Save button again

**Expected Outcome:**  
- Save button disabled immediately after first click
- Second click is no-op (button state prevents double-submission)
- Only one API request processed

**Traceability:** BidderModal.cs (Save button state management)

---

### EC-09: Modal Dismiss During API Call

**Scenario:** User clicks Cancel while API request is in-flight

**Test Setup:**
1. Click Save
2. Modal shows loading spinner (optional)
3. User clicks Cancel before response arrives
4. Modal dismisses

**Expected Outcome:**  
- API request either completes or is aborted by client
- No data corruption if request was mid-flight
- Grid state consistent with API outcome

**Risk:** 🟡 If cancel doesn't abort request, bidder may be added despite modal dismiss

---

### EC-10: Enter Key in Form Fields

**Scenario:** User presses Enter while focused on form field

**Test Setup:**
1. Fill Company Name field
2. Press Enter (instead of Tab or clicking elsewhere)

**Expected Outcome:**  
- Enter in Company field: Move focus to Contact field (Tab-like behavior)
- Enter in last field (Phone): Trigger Save (form submission)
- OR Enter anywhere: No-op (focus stays in current field)

**Current Assumption:** 🟡 Behavior depends on form implementation

---

### EC-11: Tab Through Form Fields

**Scenario:** User uses Tab key to navigate form

**Test Setup:**
1. Click Company Name field
2. Press Tab multiple times to navigate all fields
3. Verify focus order and Save button reachability

**Expected Outcome:**  
- Focus order: Company → Contact → Email → Phone → Save → Cancel → (back to Company)
- All fields keyboard accessible
- Save button keyboard triggerable (Enter or Space)

**Traceability:** PageObjects/Components/BidderModal.cs (tab index attributes)

---

## External Dependencies

### EC-12: API Timeout on Save

**Scenario:** CommandService endpoint is slow or unreachable

**Test Setup:**
1. Mock API delay of 10 seconds
2. User clicks Save (modal timeout set to 5s)

**Expected Outcome:**  
- Modal shows loading/spinner
- After 5s timeout: Error message "Request timed out. Try again?"
- Retry button available
- Modal stays open for user to retry or cancel

**Traceability:** RetryHelper in TestStep.Bidders.cs

---

### EC-13: Network Connectivity Loss

**Scenario:** Browser loses internet during save operation

**Test Setup:**
1. Open DevTools, enable "Offline" mode
2. Fill form, click Save
3. Network request fails (ERR_INTERNET_DISCONNECTED)

**Expected Outcome:**  
- Modal shows error: "No internet connection"
- Offline indicator visible (browser-level or app-level)
- Retry available once connection restored

**Traceability:** Playwright network simulation (optional in tests)

---

### EC-14: Database Constraint Violation

**Scenario:** Database rejects save due to constraint (e.g., email unique constraint, FK violation)

**Test Setup:**
1. Database constraint on (ProjectId, Email) = unique
2. Somehow identical emails slip past UI validation
3. API executes INSERT, database returns constraint violation

**Expected Outcome:**  
- API returns 409 Conflict or 400 Bad Request
- Modal shows: "Email already exists" (friendly message, not SQL error)
- Retry possible

**Traceability:** CommandService error handling, API response mapping

---

## Performance Edge Cases

### EC-15: Grid with 1000+ Bidders

**Scenario:** Project has many bidders, causing grid performance degradation

**Test Setup:**
1. Create project with 1000 bidders (or simulate via data generation)
2. Load BidPackage page
3. Paginate through bidders

**Expected Outcome:**  
- Grid loads within 2s (target NFR)
- Pagination works smoothly
- Sorting performs within 1s

**Recommendation:** Load testing & virtualization strategy (if not in scope, mark 🟡 LACUNA)

---

### EC-16: Very Large Email Address

**Scenario:** Edge case email with 200+ character local part (technically valid per RFC)

**Test Setup:**
- Email: `${'a'.repeat(200)}@example.com`
- Fill form, attempt save

**Expected Outcome:**  
- Accepted or rejected based on field max-length
- No UI layout breaking (wrapping handled)

---

## Summary

| Edge Case ID | Severity | Status | Notes |
|--------------|----------|--------|-------|
| EC-01 | Medium | 🟡 Needs clarification | Field length limits |
| EC-02 | High | 🟢 Needs test | XSS prevention |
| EC-03 | Medium | 🟡 Needs decision | RFC 5322 strictness |
| EC-04 | Medium | 🔴 LACUNA | International phone support |
| EC-05 | Medium | 🔴 LACUNA | Concurrency locking strategy |
| EC-06 | Low | 🟡 Needs test | Double-click prevention |
| EC-07 | Medium | 🟡 Needs test | Stale data handling |
| EC-08 | Low | 🟢 Likely covered | Double-submission prevention |
| EC-09 | High | 🟡 Needs test | Mid-flight cancellation |
| EC-10 | Low | 🟡 Needs clarification | Enter key behavior |
| EC-11 | Low | 🟢 Likely covered | Keyboard navigation |
| EC-12 | Medium | 🟢 Needs test | Timeout & retry UX |
| EC-13 | High | 🟡 Optional | Offline handling |
| EC-14 | High | 🟡 Needs test | DB constraint errors |
| EC-15 | Low | 🟡 LACUNA | Performance at scale |
| EC-16 | Low | 🟡 Needs test | Large email addresses |

