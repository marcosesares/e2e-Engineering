# Design — Bidders Feature

**Unit:** Bidders  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Architecture Overview

```
TestCases/Bidders/Bidders.cs (entry point)
  ├── Inherits: TestBase
  ├── Setup: TestConfiguration, Playwright browser, ExtentReports
  ├── Test Methods: [Test] async Task (one per scenario)
  │   ├── AddBidderModal_RequiredFields() — validates required field enforcement
  │   ├── AddBidder_Success() — happy path (if present)
  │   └── AddBidder_DuplicateEmail() — error scenario (if present)
  └── Cleanup: Screenshots, Tracing, Browser.Close()

PageObjects/Components/BidderModal.cs
  ├── Locators: CompanyNameInput, ContactNameInput, EmailInput, PhoneInput, SaveBtn, CancelBtn
  ├── Methods:
  │   ├── FillBidder(string company, string contact, string email, string phone) → Task
  │   ├── ClickSave() → Task
  │   ├── ClickCancel() → Task
  │   ├── IsFormVisible() → Task<bool>
  │   ├── GetErrorMessage() → Task<string>
  │   └── WaitForValidation() → Task

TestSteps/TestStep.Bidders.cs
  ├── Constructor: TestConfiguration, TestUser, IPage
  ├── teststep_OpenAddBidderModal() → Task
  ├── teststep_FillBidderForm(BidderData data) → Task
  ├── teststep_ClickSaveButton() → Task
  ├── teststep_ValidateRequiredFieldError(string fieldName) → Task
  ├── teststep_ValidateBidderAdded(string email) → Task (checks grid)
  └── RetryHelper (internal): Retries with exponential backoff

PageObjects/BidPackagePage.cs (parent)
  ├── Locators: AddBidderBtn, BiddersGrid
  ├── Methods: ClickAddBidder() → Task, GetBidderRow(string email) → ILocator
```

---

## State Machine

```
BidderModal Lifecycle:

[Hidden] ──(ClickAddBidder)-→ [FormOpen]
                                   ↓
                              Fill Fields
                                   ↓
                           [ValidatingFields]
                              ↙        ↖
                    [Invalid]      [Valid]
                       ↓              ↓
                  [ErrorShown] ──→ [SaveReady]
                     ↓                ↓
                  Retry             Save
                     ↓                ↓
                  [Saved] ← ← ← ← ← ←

Cancel at any stage → [Hidden]
```

---

## Test Execution Flow

### Flow-01: Add Bidder (Happy Path)

1. **Setup Phase**
   - Create project via CommandService
   - Sign in as Contributor role
   - Navigate to BidPackage page
   - Wait for page load & grid visibility

2. **Action Phase**
   - Click "Add Bidder" button
   - Wait for BidderModal to appear
   - Fill Company Name: "Turner Construction"
   - Fill Contact Name: "Jane Smith"
   - Fill Email: "jane@turner.com"
   - Fill Phone: "(555) 123-4567"

3. **Validation Phase**
   - Assert Save button is enabled
   - Click Save
   - Assert modal closes
   - Assert bidder "Turner Construction" appears in grid
   - Assert email "jane@turner.com" matches new row

4. **Assertions** (FluentAssertions)
   ```csharp
   grid.Should().ContainSingle(b => b.Email == "jane@turner.com");
   row.CompanyName.Should().Be("Turner Construction");
   row.Phone.Should().Be("(555) 123-4567");
   ```

### Flow-02: Validation Error (Required Field Missing)

1. **Setup:** Same as Flow-01
2. **Action:**
   - Open modal
   - Leave Company Name empty
   - Fill other 3 fields
   - Click Save
3. **Assertion:**
   - Error message visible: "Company Name is required"
   - Modal stays open
   - Grid unchanged

---

## Components & Interactions

| Component | Interaction | Wait Strategy | Timeout |
|-----------|-------------|---------------|---------|
| BidderModal | Click Save | Wait for modal close or error | 5s |
| CompanyNameInput | Fill text | Wait for value set | 2s |
| BiddersGrid | Wait visible | `page.WaitForSelectorAsync` | 3s |
| SaveBtn | Click | Enabled state check | 2s |

---

## Error Handling

| Scenario | Signal | Recovery |
|----------|--------|----------|
| Network timeout on Save | `TimeoutException` | Retry 3x with exponential backoff |
| Duplicate email | API 400 Bad Request | Parse error message, display in modal |
| Page navigation during modal | Modal dismissed | No assertion, test fails with context |
| Browser crash | `PlaywrightException` | Caught by TestBase.Cleanup, screenshot taken |

---

## Retry Logic

**RetryHelper pattern (internal to TestStep):**
```csharp
await RetryHelper.ExecuteAsync(
  async () => await page.ClickAsync(selector),
  maxRetries: 3,
  delayMs: 100
);
```

---

## Data Structures

### BidderData (test fixture)
```csharp
class BidderData {
  string CompanyName { get; set; }     // e.g., "ABC Mechanical"
  string ContactName { get; set; }     // e.g., "John Doe"
  string Email { get; set; }           // e.g., "john@abc.com"
  string PhoneNumber { get; set; }     // e.g., "(555) 012-3456"
}
```

### BidderGridRow (assertion helper)
```csharp
class BidderGridRow {
  string CompanyName { get; set; }
  string ContactName { get; set; }
  string Email { get; set; }
  string PhoneNumber { get; set; }
}
```

---

## Traceability

| Design Element | Implementation | Test Coverage |
|----------------|-----------------|---------------|
| Add Modal flow | BidderModal.cs | Bidders.AddBidderModal_RequiredFields |
| Grid display | BidPackagePage.cs | (implicit in all tests) |
| Validation | CommandService (API) | Bidders.AddBidder_DuplicateEmail (if exists) |
| Email uniqueness | Database constraint | Query validation post-add |
