# Design — BidPackageNotes Feature

**Unit:** BidPackageNotes  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Architecture

```
NotesSection (on BidPackagePage)
  ├── NotesGrid
  │   ├── Add Note button
  │   ├── Table rows (Author, Timestamp, Content preview, Actions)
  │   └── Empty state
  └── NotesModal
      ├── Rich text editor (TinyMCE or similar)
      ├── Save/Cancel buttons
      └── Character limit indicator (if enforced)

TestStep.BidPackageNotes
  ├── teststep_OpenNotesModal()
  ├── teststep_EnterNoteContent()
  ├── teststep_ClickSaveNote()
  └── teststep_VerifyNoteInGrid()
```

---

## State Machine

```
[NotesGrid] --Add--> [Modal] --Fill--> [Save] --> [GridUpdated]
                                ↓
                              [Error] --Retry

[NotesGrid] --Edit--> [Modal] --Modify--> [Save] --> [GridUpdated]

[NotesGrid] --Delete--> [Confirm] --OK--> [SoftDeleted]
```

---

## Data Binding

| Field | Type | Editable | Validation |
|-------|------|----------|-----------|
| Content | RichHTML | Yes | Not empty, XSS sanitize |
| Author | Text | No | Set from CurrentUser |
| CreatedAt | Timestamp | No | Auto-set |
| ModifiedAt | Timestamp | No | Auto-update on edit |
| IsDeleted | Boolean | No | Soft delete flag |

