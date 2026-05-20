# Requirements — BidPackageNotes Feature

**Unit:** BidPackageNotes  
**Type:** Audit Trail & Collaboration  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Overview

Notes on bid packages for collaboration & audit trail. Add, edit, delete with user/timestamp tracking.

---

## Functional Requirements

### FR-01: Add Note
**Priority:** MUST

- Modal: Rich text editor (bold, italic, lists)
- Save → Note created with timestamp + user
- Notes grid updated immediately

### FR-02: Edit Note
**Priority:** MUST

- Only note author can edit (or Admin override)
- Edit modal pre-fills text
- Save → Updated timestamp, "edited" marker

### FR-03: Delete Note
**Priority:** SHOULD

- Confirmation dialog
- Soft delete (preserve audit trail)
- Note marked as deleted, not removed from history

### FR-04: List Notes
**Priority:** MUST

- Reverse chronological (newest first)
- Display: Author, Timestamp, "Edited [date]" (if modified), Content
- Pagination (10 per page)

### FR-05: Note Formatting
**Priority:** SHOULD

- Rich text preserved: bold, italic, bullet points
- XSS prevention (sanitize HTML)

---

## Data Entities

| Entity | Fields | Source |
|--------|--------|--------|
| BidPackageNote | Id, BidPackageId, Content, CreatedBy, CreatedAt, ModifiedBy, ModifiedAt, IsDeleted | 🟢 PageObjects/Components/NotesModal.cs |

---

## Gaps

🟡 **Q1:** Mention/@notify feature (e.g., @john → notification)?  
🟡 **Q2:** Note attachments (documents, images)?

