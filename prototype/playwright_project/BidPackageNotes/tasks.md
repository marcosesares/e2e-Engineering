# Tasks — BidPackageNotes Feature

**Unit:** BidPackageNotes  
**Status:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

| Task ID | Title | Priority | Est. Time |
|---------|-------|----------|-----------|
| BPN-001 | Add Note with Rich Text | MUST | 2m |
| BPN-002 | Edit Note (Author Only) | MUST | 2m |
| BPN-003 | Delete Note (Soft Delete) | SHOULD | 2m |
| BPN-004 | List Notes Reverse Chronological | MUST | 1m |
| BPN-005 | XSS Prevention Test | MUST | 1m |

**Total:** ~8 minutes

---

## Key Tests

### BPN-001: Add Rich Text Note
1. Open Notes section
2. Click "Add Note"
3. Enter: "**Bold text** and *italic*"
4. Click Save
5. Assert: Note appears in grid with formatting preserved

### BPN-005: XSS Prevention
1. Try to enter: `<script>alert('xss')</script>`
2. Assert: Script tags escaped or removed
3. Note renders as text, not executed

