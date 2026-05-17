# Caveman, Design

> Technical design for ultra-compressed communication mode.

## Interface

**Activation Points:**

| Trigger | Source | Effect |
|---------|--------|--------|
| `/caveman` | User command | Activate default (full) intensity |
| `/caveman lite\|full\|ultra` | User command | Activate specified intensity |
| `caveman mode` / `less tokens` / `be brief` | User message | Auto-trigger full intensity |
| Session hook | Host skill-trigger/runtime support | Optional auto-activation when the host supports trigger matching |
| `/caveman lite\|full\|ultra\|wenyan-lite\|wenyan-full\|wenyan-ultra` | User directive | Named intensity via skill or command |

**Output Transformation:**

| Element | Treatment |
|---------|-----------|
| Articles (a, an, the) | Drop |
| Filler (just, really, basically, actually, simply) | Drop |
| Pleasantries (sure, certainly, of course, happy to) | Drop |
| Hedging (would, might, could be, perhaps) | Drop to committed forms (will, is, does) |
| Code blocks | Unchanged |
| Technical terms | Exact, unchanged |
| Error messages | Quoted exact |
| Whitespace/formatting | Preserved |

## Modes & Compression Levels

### Lite (~30% reduction)
- Drop only obvious articles/filler
- Preserve most pleasantries and hedging
- Output remains conversational
- Example: "Sure, I'll help you fix the bug" → "I'll help fix bug" (9→7 words, but keeps some polish)

### Full (~75% reduction, default)
- Drop all articles, filler, pleasantries, hedging
- Fragment sentences OK
- Fragments pattern: `[thing] [action] [reason]. [next step].`
- Example: "Sure, I'd be happy to help you with that. The issue you're experiencing is likely caused by..." → "Bug in auth middleware. Token expiry check use `<` not `<=`. Fix:"

### Ultra (~85% reduction)
- Aggressive abbreviation beyond caveman
- Single-letter variables, acronyms, minimal context
- Fragments become telegraphic
- Example: "Fix auth token check. Use `<` not `<=` in middleware line 42. Refactor token-refresh logic (3 callers). Next: test."

### Wenyan-lite / Wenyan-full / Wenyan-ultra
- Classical Chinese style applied to ultra-compressed output
- Uses Classical Chinese grammar and syntax patterns
- Wenyan-full mirrors full intensity caveman rules in CJK style
- **Implementation detail:** Transforms output first to caveman, then applies Classical Chinese mapping
- Confidence: 🟡 (implementation examples exist in skill, actual token reduction metrics from CJK models unclear)

## Execution Flow

1. **Detection:** Agent or hook initiates caveman mode with optional intensity spec
2. **Persistence:** Mode persists across all subsequent turns
3. **Boundary Check:** Before applying compression, check if context is security/clarity critical
4. **Transform:** Apply compression rules matching intensity level
5. **Auto-Revert:** If security warning or repeated clarification needed, revert to normal English temporarily
6. **Resume:** After security confirmation or clarification, resume previous intensity level
7. **Termination:** User says "stop caveman" / "normal mode" → exit mode, clear intensity setting

**No-Compression Boundaries:**
- Security warnings (destructive operations, force pushes, deletes)
- Irreversible action confirmations (are you sure?)
- Multi-step sequences where fragment order risks misread
- User asks for clarification or repeats same question
- Code/commit/PR writing (write in normal English)

## Dependencies

- **Bootstrap:** `using-superpowers` skill must load for harness to recognize caveman triggers
- **Harness Support:** Any harness with skill auto-trigger support (Claude Code, Codex, Gemini CLI, OpenCode)
- **Hook System:** Optional host skill-trigger/runtime support for session-start or message-triggered auto-activation. No repository-local caveman hook implementation is present.

## Design Decisions

| Decision | Evidence | Confidence |
|----------|----------|-----------|
| Drop articles but preserve code | Caveman rules in skill, code blocks in README | 🟢 |
| 6 intensity levels, wenyan variants | Skill defines all 6 modes with output examples | 🟡 |
| Auto-revert on security warnings | Auto-Clarity rule in skill, explicit gates | 🟢 |
| Persist across turns unless stopped | Persistence rule in skill | 🟢 |
| Fragment patterns OK | Full skill section dedicated to fragments, pattern examples | 🟢 |

## Internal State

**Session State:**
- `caveman_mode: boolean` — whether caveman is active
- `caveman_intensity: string` — lite|full|ultra|wenyan-lite|wenyan-full|wenyan-ultra
- `caveman_boundary_active: boolean` — true if currently in security/clarity boundary (temporarily reverted)

**Persistence Mechanism:** Harness stores intensity in session-level variable, persists across turns until user explicitly stops.

## Observability

**Log Signals (from host/runtime execution):**
- "Caveman mode activated: [intensity]" — mode start
- "Caveman boundary active: [reason]" — temporary revert
- "Caveman mode disabled" — user exit
- "Caveman intensity changed: [old] → [new]" — level switch

## Risks & Lacunas

- 🟡 Wenyan intensity levels: token reduction metrics from Classical Chinese models unvalidated
- 🟡 Caveman auto-activation is host skill-trigger behavior, not a repository-implemented hook. No external hook/runtime layer is present in this repository.
- 🔴 `caveman-stats` token accounting is unsupported/incomplete in this repository until hook files or an equivalent host contract are added.
- 🟡 Fragment parsing: some harnesses may misinterpret fragments as incomplete input; edge case not fully specified
- 🟡 Security boundary detection: rule relies on agent keyword-sniffing; false positives/negatives possible

## Reviewer Validation Addendum

- Question 1 answered: no external hook/runtime layer is present in this repository for caveman auto-activation or `caveman-stats` token accounting. Auto-activation should be documented as host skill-trigger behavior when available. `caveman-stats` remains 🔴 unsupported/incomplete in this repository.
