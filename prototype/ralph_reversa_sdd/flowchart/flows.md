# Flowchart — Interaction Flows

## Flow 1: Step-by-Step Navigation (Happy Path)

**Actor:** User learning Ralph for first time

**Trigger:** User lands on Ralph homepage; flowchart component mounts

**Flow:**
1. Flowchart renders with `visibleCount = 1`
   - Only "Write PRD" (step 1) is visible
   - All other nodes are opacity 0, pointerEvents: none
   - No edges visible
2. User reads step 1 description and clicks "Next"
3. visibleCount increments to 2
   - Steps 1 and 2 both appear (fade in)
   - Edge setup-1 → setup-2 animates
4. User repeats "Next" 8 more times
   - Each click progresses flowchart
   - New nodes fade in; new edges animate
   - By visibleCount = 10, entire workflow visible
5. User sees "Complete" step at bottom
6. User understands Ralph's loop and proceeds to create PRD

**Exit condition:** visibleCount = 10 or user leaves page

**Notes:**
- No looping back within this flow; forward only
- Each click shows exactly one new step (step-by-step learning)

---

## Flow 2: Backward Navigation

**Actor:** User who went too fast or wants to review earlier steps

**Trigger:** User clicks "Previous" button at any point where visibleCount > 1

**Flow:**
1. visibleCount decrements by 1
2. Rightmost visible node fades out (opacity 0, pointerEvents: none)
3. Any edge involving faded node stops animating
4. User re-reads step at new visibleCount - 1
5. User can click "Next" again to re-explore or "Previous" again to go further back

**Edge cases:**
- If visibleCount = 1 and user clicks "Previous": nothing happens (floor at 1)
- If user drags a node while at visibleCount = 5, then clicks "Previous" twice: node position persists; when visibleCount increments back to 5, node is at custom position

**Exit condition:** User clicks "Next" to resume forward, or leaves page

---

## Flow 3: Reset and Restart

**Actor:** User who wants to start over from beginning

**Trigger:** User clicks "Reset" button at any visibleCount

**Flow:**
1. visibleCount reset to 1
2. All custom node positions cleared
3. All nodes return to default positions
4. Only step 1 visible; all others hidden
5. No edges visible
6. All notes hidden
7. User can start fresh with "Next" button

**Purpose:**
- Undo any exploratory navigation or custom node rearrangement
- Return to initial state without page reload

**Exit condition:** User resumes with "Next" or leaves page

---

## Flow 4: Node Drag and Reposition

**Actor:** User exploring flowchart interactively, customizing layout

**Trigger:** User clicks and drags a visible node to new position

**Flow:**
1. User hovers over visible node (cursor changes to grab)
2. User drags node to new (x, y) coordinate
3. As user drags, @xyflow updates node position in real-time
4. `onNodesChange` event fires with position change
5. Handler stores new position in `nodePositionsRef.current`
6. User releases mouse
7. Node stays at new position
8. If user clicks "Next" (visibleCount increases), new node appears at default position, previously-moved nodes stay at custom positions
9. If user refreshes page (in future with localStorage), custom positions lost (currently not persisted)

**Constraints:**
- Only visible nodes are draggable (pointerEvents: none on hidden nodes)
- Drag is continuous (not snapped to grid)
- No undo for individual drag operations (only "Reset" clears all)

**Use case:**
- User finds default layout cramped, spreads nodes horizontally
- User wants to group loop steps closer together for readability

**Exit condition:** User releases mouse; flow continues with other interactions

---

## Flow 5: Viewing Annotated Notes

**Actor:** User needing context on specific step content

**Trigger:** User clicks "Next" enough times that note appears (e.g., visibleCount >= 2 for note-1)

**Flow:**
1. At visibleCount = 2, `note-1` becomes visible
   - Note positioned to right of "Convert to JSON" step
   - Content shows PRD.json format (monospace, gray background)
   - User sees example of what step 2 produces
2. At visibleCount = 8, `note-2` becomes visible
   - Note positioned to right of "Log Progress" step
   - Content shows AGENTS.md snippet (codebase patterns example)
   - User sees example of what gets logged in progress.txt
3. User reads notes to understand context
4. Notes fade out when visibleCount decreases below their trigger step

**Visibility:**
- Notes are NoteNode type, non-draggable, non-connectable
- Notes fade in/out with same visibility logic as regular nodes
- Notes do not block interaction with step nodes

**Purpose:**
- Provide just-in-time examples
- Reduce cognitive load by showing format/output at relevant step

---

## Flow 6: Mobile/Small-Screen Fallback

**Actor:** User on tablet or small browser window

**Scenario:** Flowchart container is constrained to 500px width (or viewport-dependent)

**Expected behavior (not yet implemented):**
1. Nodes resize or stack vertically
2. Edges route around obstacles
3. Control buttons remain accessible
4. Scroll if needed to see full flowchart

**Current status:** 🔴 No responsive CSS implemented. Flowchart may overflow or be unreadable on small screens.

---

## Flow 7: Accessibility — Keyboard Navigation (Future)

**Actor:** Keyboard-only user or user preferring keyboard shortcuts

**Desired behavior (not yet implemented):**
- Arrow Right / Enter → call handleNext()
- Arrow Left / Backspace → call handlePrev()
- Home → call handleReset()
- Tab to cycle focus through nodes (optional)

**Current status:** 🔴 No keyboard handlers. Button focus visible but no keyboard shortcuts.

---

## Error/Edge Cases

### Case 1: Rapid Clicking
**Scenario:** User clicks "Next" button very rapidly (5 times per second)

**Expected behavior:**
- React batches state updates
- visibleCount increments atomically (no race conditions)
- UI updates in order (visibleCount 1→2→3→...→10)
- No intermediate renders missed

**Confidence:** 🟢 React's useState handles this correctly

---

### Case 2: Clicking "Next" at visibleCount = 10
**Scenario:** visibleCount already at maximum

**Expected behavior:**
- Click ignored (Math.min enforces cap)
- No error, no console warning
- visibleCount stays at 10

**Confidence:** 🟢

---

### Case 3: Hidden Node Click
**Scenario:** User tries to click a hidden node (visibleCount = 2, but tries to click step 5)

**Expected behavior:**
- Click ignored (pointerEvents: 'none' on hidden node)
- No drag, no selection, no error
- Only visible nodes respond to clicks

**Confidence:** 🟢

---

### Case 4: Node Drag While Hidden
**Scenario:** User drags node A to position P, then clicks "Previous" enough times to hide node A

**Expected behavior:**
- Hidden node position persists in nodePositionsRef
- When node becomes visible again (via "Next"), it reappears at position P
- No data loss

**Confidence:** 🟢

---

### Case 5: Custom Position + Reset
**Scenario:** User drags all nodes to custom positions, then clicks "Reset"

**Expected behavior:**
- visibleCount = 1
- nodePositionsRef.current is cleared
- All nodes return to default positions
- Next time "Next" is clicked, nodes appear at defaults (not custom positions)

**Confidence:** 🟢

---

## Flow Summary Table

| Flow | Entry | Action | Exit | User Goal |
|------|-------|--------|------|-----------|
| 1 (Navigation) | Page load | Click "Next" 10x | visibleCount = 10 | Learn entire workflow |
| 2 (Back) | Any step | Click "Previous" | Revisit earlier steps | Review/correct understanding |
| 3 (Reset) | Any step | Click "Reset" | visibleCount = 1, positions cleared | Start over fresh |
| 4 (Drag) | Visible node | Drag to new position | Drop node | Customize layout |
| 5 (Notes) | visibleCount ≥ trigger | View annotation | Read context | Understand step details |
| 6 (Mobile) | Small viewport | [Responsive CSS] | Full-width layout | Use on mobile (future) |
| 7 (Keyboard) | Any state | Press arrow key | Call handler | Keyboard-only access (future) |

