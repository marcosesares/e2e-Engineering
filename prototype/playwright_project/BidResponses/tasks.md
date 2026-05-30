# Tasks — BidResponses Feature

**Unit:** BidResponses  
**Priority:** CRITICAL  
**Date:** 2026-05-20

---

## Task List

| Task ID | Title | Priority | Type | Est. Time |
|---------|-------|----------|------|-----------|
| BR-001 | Line Item Qty/Price Edit & Extended Calc | MUST | Functional | 3m |
| BR-002 | Subtotal Real-Time Recalc | MUST | Functional | 2m |
| BR-003 | Adjustment Apply & NetAmount | MUST | Functional | 2m |
| BR-004 | Fee Calculation Service Integration | MUST | Integration | 3m |
| BR-005 | GrandTotal Validation vs Min/Max Bid | MUST | Validation | 2m |
| BR-006 | General Requirements Response | SHOULD | Functional | 2m |
| BR-007 | Bid Submit & Validation | MUST | Functional | 2m |
| BR-008 | Concurrent Edit Handling | SHOULD | Integration | 3m |
| BR-009 | Calculation Performance (100+ items) | SHOULD | Performance | 2m |

**Total Est.:** ~21 minutes

---

## Critical Tests

### BR-001: Line Item Entry & Extended Calc
**Test Flow:**
1. Navigate to bid response grid
2. Click cell: LineItem qty (e.g., default 0)
3. Enter qty=150
4. Click cell: UnitPrice (e.g., default 0)
5. Enter price=125.50
6. Press Tab → blur event
7. Assert: Extended cell now shows 18825.00 (150 × 125.50)
8. Assert: Subtotal row updates
9. Repeat for 5+ line items, verify Subtotal = Σ Extended

**Assertions:**
- ✅ Extended = Qty × UnitPrice
- ✅ No flickering (batch update)
- ✅ Subtotal persists on page reload

---

### BR-004: Fee Service Integration
**Test Flow:**
1. Line items entered → Subtotal = 50000
2. Admin defined fee: "Admin Fee 5% of BID"
3. User submits bid
4. FeeCalculationService called: POST /calculate with subtotal=50000
5. Service returns: FeeAmount = 2500
6. GrandTotal = Subtotal + FeeAmount = 52500

**Assertions:**
- ✅ FeeService receives correct subtotal
- ✅ Correct fee amount calculated
- ✅ GrandTotal reflects fee

**Retry Scenario:** Mock FeeService delay 10s → Timeout 5s → Retry 3x → Eventually success

---

### BR-005: Min/Max Bid Constraint
**Test Cases:**
- GrandTotal < MinBid: Show error "Bid below minimum ($X)"
- GrandTotal > MaxBid: Show error "Bid exceeds maximum ($X)"
- MinBid ≤ GrandTotal ≤ MaxBid: Allow submit

