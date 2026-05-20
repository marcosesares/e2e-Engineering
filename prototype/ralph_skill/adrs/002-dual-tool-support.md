# ADR 002: Dual Tool Support (Amp vs Claude)

**Status:** Accepted  
**Decided:** Commit 8698c3e ("add Claude Code support as alternative to Amp")  
**Participants:** Ralph authors  
**Timestamp:** 2025 (inferred)

---

## Context

Ralph was originally built for **Amp**, a specific AI coding tool. Later, **Claude Code** (another AI tool) became available. Users wanted choice.

Challenge:
- Both tools have different APIs (Amp uses stdin piping; Claude Code uses `--print` flag)
- Ralph's loop architecture should not be tightly coupled to one tool
- Switching tools should be a **runtime flag**, not a rebuild

Decision: Add explicit `--tool` argument to `ralph.sh` and route prompts accordingly.

---

## Decision

**Support both Amp and Claude at runtime; default to Amp.**

ralph.sh accepts:
```bash
./ralph.sh --tool amp [max_iter]     # Default, backwards compatible
./ralph.sh --tool claude [max_iter]  # New, opt-in
./ralph.sh [max_iter]                # Uses amp (default)
```

Implementation:
- Parse `--tool` argument (lines 12–29 of ralph.sh)
- Validate tool choice (`amp` or `claude` only; reject others)
- Route to correct invocation:
  - **Amp:** `cat prompt.md | amp --dangerously-allow-all`
  - **Claude:** `claude --dangerously-skip-permissions --print < CLAUDE.md`

---

## Rationale

### Why Support Multiple Tools?
- **User choice:** Different users prefer different backends
- **Competition guard:** Not locked into one vendor
- **Future-proof:** Easy to add more tools later
- **Testing:** Can test same PRD with both tools to compare

### Why Default to Amp?
- **Backwards compatibility:** Existing scripts and docs assume Amp
- **Established:** Amp was the original target
- **Smoother upgrade:** Users don't accidentally switch tools

### Why Explicit `--tool` Flag?
- **Safety:** Tool choice is deliberate, not inferred from environment
- **Debuggability:** Error messages say "Invalid tool 'foo'" if user typos
- **Simplicity:** Boolean dispatch is simpler than feature detection

---

## Alternatives Considered

### Alternative 1: Auto-Detect Tool from Environment
**Pros:**
- No flag needed; "just works"

**Cons:**
- Magic behavior — hard to debug
- Environment variable pollution
- What if both are installed? Which wins?
- User can't easily switch mid-project

**Decision:** Rejected. Explicit is better than implicit.

---

### Alternative 2: Separate Scripts (ralph-amp.sh, ralph-claude.sh)
**Pros:**
- No branching logic; clean separation
- Easy to document per-tool

**Cons:**
- Code duplication (loop logic repeated)
- More files to maintain
- Users must remember which script to run
- Harder to switch tools

**Decision:** Rejected. One script with conditional is simpler.

---

### Alternative 3: Tool Plugin System
**Pros:**
- Extensible to many tools
- Decoupled logic

**Cons:**
- Over-engineered for two tools
- Adds complexity (plugin loader, manifest, etc.)
- Ralph is lightweight framework; plugins feel heavy

**Decision:** Rejected. YAGNI — wait for a third tool before abstracting.

---

## Consequences

### Positive

✅ **User choice.** Can pick best tool for their workflow.  
✅ **Backwards compatible.** Default is Amp; old scripts still work.  
✅ **Future-ready.** Adding a third tool is straightforward.  
✅ **Testing.** Can compare Amp vs Claude on same PRD.  
✅ **Simple validation.** ralph.sh catches typos early.

### Negative

❌ **Branching logic in ralph.sh.** Code is slightly more complex.  
❌ **Tool-specific flags.** Need different CLI flags for Amp vs Claude.  
❌ **Documentation burden.** Must document both invocations.

### Risks

🔴 **Risk:** User forgets `--tool claude` flag; runs with Amp instead.  
🔴 **Mitigation:** Default is clear; flag is required for Claude. Error message if tool name is invalid.

🔴 **Risk:** New AI tool added; ralph.sh validation needs update.  
🔴 **Mitigation:** Use case-statement to validate; easy to add new cases.

---

## Implementation Notes

### Argument Parsing (ralph.sh lines 12–29)
```bash
while [[ $# -gt 0 ]]; do
  case $1 in
    --tool)      TOOL="$2"; shift 2 ;;
    --tool=*)    TOOL="${1#*=}"; shift ;;
    *)           # Assume number = max_iterations
               if [[ "$1" =~ ^[0-9]+$ ]]; then
                 MAX_ITERATIONS="$1"
               fi; shift ;;
  esac
done
```

Supports: `--tool amp`, `--tool=amp`, `--tool amp 5`

### Validation (lines 31–35)
```bash
if [[ "$TOOL" != "amp" && "$TOOL" != "claude" ]]; then
  echo "Error: Invalid tool '$TOOL'. Must be 'amp' or 'claude'."
  exit 1
fi
```

### Invocation (lines 91–96)
```bash
if [[ "$TOOL" == "amp" ]]; then
  OUTPUT=$(cat "$SCRIPT_DIR/prompt.md" | amp --dangerously-allow-all 2>&1 | tee /dev/stderr)
else
  OUTPUT=$(claude --dangerously-skip-permissions --print < "$SCRIPT_DIR/CLAUDE.md" 2>&1 | tee /dev/stderr)
fi
```

### Supporting Files
- `prompt.md` — Instructions for Amp
- `CLAUDE.md` — Instructions for Claude Code
- Both should have equivalent logic, but tool-specific guidance

---

## Related Decisions

- [[ADR 001: Stateless Agents]] — tool is swappable because state persists via files, not agent memory
- [[ADR 004: Interactive Visualization]] — flowchart is tool-agnostic, works with both backends

---

## Validation

- ✅ Implemented and working (commit 8698c3e onward)
- ✅ ralph.sh has explicit test of tool validation (lines 32–34)
- ✅ CLAUDE.md exists and mirrors prompt.md logic
- ⚠️ No automated test comparing Amp vs Claude outputs on same PRD

---

## Future Considerations

### If a Third Tool Emerges
1. Add new case in validation (lines 31–35)
2. Add new branch in invocation (lines 91–96)
3. Create `TOOL-NAME.md` with instructions
4. Update README with new invocation syntax
5. Consider extracting to function if logic gets complex

### Tool-Agnostic Instructions
Keep core loop logic (pick story, implement, test, commit) **identical** across prompt.md and CLAUDE.md. Divergences should be tool-specific (auth flags, output format) only.

