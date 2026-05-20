# Requirements — BidDaySettings Feature

**Unit:** BidDaySettings  
**Type:** Admin Configuration (8 sub-areas)  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Overview

Administrative settings for DESTINI BidDay system: Bid Packages, Fees, Conditions, Requirements, Units of Measure, User Permissions, Directory, and Preferences. Each sub-area has CRUD + import/validation.

---

## Functional Areas

### FA-01: Admin Bid Packages
**Priority:** MUST | **Files:** AdminBidPackages.cs, Settings.BidPackagesPage.cs, TestStep.BidPackagesSettings.cs

- **FR-01.1:** Create package with code + description
- **FR-01.2:** Edit package details (code immutable post-creation)
- **FR-01.3:** Delete package (cascade to child line items)
- **FR-01.4:** Validate code uniqueness within project
- **FR-01.5:** Set due date override (optional, inherits from project if empty)

**NFR:** Create <2s, List 100 packages <500ms, Validation <100ms

---

### FA-02: Admin Fees
**Priority:** MUST | **Files:** AdminFees.cs, Settings.FeesPage.cs, TestStep.Fees.cs

- **FR-02.1:** Create fee with name, type (% OF BID, % OF TOTAL, LUMP SUM), amount
- **FR-02.2:** Edit fee details
- **FR-02.3:** Delete fee (rollup recalc)
- **FR-02.4:** Fee applicability: all packages or selected codes
- **FR-02.5:** Validation: % fees 0-100%, LUMP SUM ≥0

**NFR:** Fee calc <50ms per bidder

---

### FA-03: General Conditions
**Priority:** MUST | **Files:** GeneralConditions.cs, Settings.GeneralConditionsPage.cs, TestStep.GeneralConditions.cs

- **FR-03.1:** Add/edit/delete general conditions (text)
- **FR-03.2:** Conditions appear on bidder forms
- **FR-03.3:** Rich text support (bold, italic, bullet lists)

---

### FA-04: General Requirements
**Priority:** SHOULD | **Files:** GeneralRequirements.cs, Settings.GeneralRequirementsPage.cs, TestStep.GeneralRequirements.cs

- **FR-04.1:** Add/edit/delete general requirements (text)
- **FR-04.2:** Requirements per trade (TBD design)

---

### FA-05: Units of Measure
**Priority:** MUST | **Files:** UnitsOfMeasure.cs, Settings.UnitsOfMeasurePage.cs, TestStep.UnitsOfMeasure.cs

- **FR-05.1:** Define units: FT, SQFT, YD, LB, etc.
- **FR-05.2:** Add conversion factors (optional)
- **FR-05.3:** Unit validation in line items (only defined units allowed)

---

### FA-06: User Permissions (RBAC)
**Priority:** MUST | **Files:** UserPermissions.cs, Settings.UserPermissionsPage.cs, TestStep.UserPermissionMatrix.cs

- **FR-06.1:** Define roles: Admin, Editor, Contributor, Viewer
- **FR-06.2:** Assign permissions: View, Edit, Delete per entity type
- **FR-06.3:** Role inheritance (Editor includes Contributor perms)
- **FR-06.4:** Test matrix: 16 permission combinations (4 roles × 4 entity types)

**NFR:** Permission check <10ms per request

---

### FA-07: Directory
**Priority:** SHOULD | **Files:** Directory.cs, Settings.DirectoryPage.cs

- **FR-07.1:** List project members
- **FR-07.2:** Invite new members (email)
- **FR-07.3:** Manage member roles
- **FR-07.4:** Remove member from project

---

### FA-08: Preferences
**Priority:** COULD | **Files:** Preferences.cs, Settings.PreferencesPage.cs, TestStep.Preferences.cs

- **FR-08.1:** Theme (light/dark)
- **FR-08.2:** Locale & timezone
- **FR-08.3:** Notification settings

---

## Data Entities

| Entity | Source |
|--------|--------|
| BidPackage | AdminBidPackages.cs |
| Fee | AdminFees.cs |
| Condition | GeneralConditions.cs |
| Requirement | GeneralRequirements.cs |
| UnitOfMeasure | UnitsOfMeasure.cs |
| RolePermission | UserPermissions.cs |

---

## Gaps & Questions

🔴 **Q1:** Trade-specific requirements design? (FR-04.2)  
🟡 **Q2:** Bulk import for fees/packages? (currently manual CRUD)  
🟡 **Q3:** Permission inheritance rules (Editor ⊃ Contributor)? Need formal definition.

