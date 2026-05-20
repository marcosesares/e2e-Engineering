# Requirements — BidResponses Feature

**Unit:** BidResponses  
**Type:** Bid Entry & Calculation (CQRS read-side validation)  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Overview

Data entry for contractor bids: line items, adjustments, general/trade requirements, alternate selections. Includes real-time fee/rollup calculations.

---

## Functional Requirements

### FR-01: Enter Line Item Responses
**Priority:** MUST | **Complexity:** High

- Line item grid with editable cells (Quantity, UnitPrice per bidder)
- Extended = Quantity × UnitPrice (calculated, read-only)
- Subtotal = Sum of all Extended
- Validation: Qty > 0, UnitPrice ≥ 0

**Acceptance:**
- ✅ Cell edit mode (click → editable → blur → saved)
- ✅ Dependent calc: Change Qty → Extended updates
- ✅ Subtotal updates live
- ✅ Min/Max bid constraints enforced (if defined)

---

### FR-02: Apply Adjustments (Discount/Premium)
**Priority:** MUST | **Complexity:** High

- Adjustment grid: Type (Discount, Premium), Value (% or $), Reason
- AdjustmentAmount = Subtotal × (Value/100) or Value
- NetAmount = Subtotal ± AdjustmentAmount
- Validation: Adjustment reason required (audit trail)

---

### FR-03: Calculate Fees & GrandTotal
**Priority:** MUST | **Complexity:** High

- Fee grid: Fee Name, Calculated Amount (% OF BID × Subtotal, etc.)
- GrandTotal = Subtotal ± Adjustments + Fees
- Per-bidder rollup
- Real-time recalc on any cell change

**Validation:** Result ≥ MinBid, ≤ MaxBid (if constraints defined)

---

### FR-04: General Requirements Response
**Priority:** SHOULD | **Complexity:** Medium

- Bidder confirms/comments on general requirements
- Checkbox for "Accepted", Text field for exceptions
- Display admin-defined conditions + bidder response

---

### FR-05: Trade-Specific Requirements
**Priority:** SHOULD | **Complexity:** Medium

- Per-trade requirements (if defined in settings)
- Bidder marks met/not-met + optional notes

---

### FR-06: Alternate Line Items
**Priority:** SHOULD | **Complexity:** Medium

- Allow alternate pricing for selected line items
- User selects between primary/alternate amount
- Affects subtotal/GrandTotal recalc

---

### FR-07: Bid Submission
**Priority:** MUST | **Complexity:** Medium

- Save button (stores bid response)
- Validation: All required fields filled + calculations valid
- Confirmation: "Bid submitted on [date] by [user]"

---

## Non-Functional Requirements

### NFR-01: Calculation Performance
- Subtotal calc <50ms (100+ line items)
- GrandTotal with fees <100ms
- Real-time cell updates (no delay >200ms)

### NFR-02: Data Integrity
- No partial saves (all-or-nothing)
- Concurrent bid edits: Last-writer-wins OR pessimistic lock (🟡 clarify)

### NFR-03: Audit
- Track who submitted bid, when, from what IP
- Amendment history (if bids revised)

---

## Data Entities

| Entity | Fields | Source |
|--------|--------|--------|
| BidResponse | BidderId, BidPackageId, SubmittedAt, SubmittedBy, GrandTotal | 🟢 PageObjects/BidPackagePage.BidResponses.cs |
| LineItemResponse | LineItemId, BidderId, Quantity, UnitPrice, Extended | 🟢 Code-Analysis |
| AdjustmentResponse | AdjustmentId, BidderId, Amount | 🟢 Code-Analysis |
| RequirementResponse | RequirementId, BidderId, IsAccepted, Notes | 🟡 INFERIDO |

---

## Dependencies

- Fee Calculation Service (microservice)
- QueryService (read models for grid)
- CommandService (save bid response)
- Event Processor (update query models post-save)

---

## Gaps

🔴 **Q1:** Trade-specific requirement structure? (FR-05 design TBD)  
🔴 **Q2:** Concurrent edit locking strategy?  
🟡 **Q3:** Amendment workflows (bid revisions)?

