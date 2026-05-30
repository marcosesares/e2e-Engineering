# Caveman, Edge Cases & Challenging Scenarios

> Detailed treatment of boundary conditions, failure modes, and ambiguous situations.

## Edge Case 1: Nested Code in Natural Language

**Scenario:** Agent outputs caveman-mode response with inline code snippets, examples, and long function names.

```
Bug in auth middleware. Token expiry check use `<` not `<=`. Example:

const isExpired = (token) => token.expiry < Date.now();  // RIGHT

Fix line 42 in src/middleware/auth.ts. Refactor token-refresh logic (3 callers affected).
```

**Challenge:** Should function names `token.expiry`, variable `isExpired`, and code quotes remain exact, or get caveman-fied?

**Decision:** 🟢 Code boundaries are strict. Anything inside backticks (inline) or code blocks (triple backticks) is preserved exactly. Caveman rules apply only to surrounding prose.

**Implementation:** Tokenize output; identify backtick-delimited regions and triple-backtick blocks; apply caveman transformation only outside these regions.

**Test Case:** 
- Input: "Sure, I'd be happy to help you fix the `isExpired()` function. Really, it's quite simple."
- Output (full caveman): "Fix `isExpired()` function. Simple."
  - ✅ Backticks preserved
  - ✅ Articles/pleasantries dropped

---

## Edge Case 2: Multi-Line Error Messages

**Scenario:** Agent is quoting an error stack trace or log dump in caveman mode.

```
Error in database query:
  at executeQuery (/app/db.ts:42)
  at main (/app/index.ts:15)
  Caused by: ValidationError: field "email" is required
```

**Challenge:** Should function paths, line numbers, and error text be caveman-fied, or quoted exactly?

**Decision:** 🟢 Any content inside markdown code blocks (triple backticks) or standalone error/log sections is preserved. Quote markers (backticks, code fences) signal "technical content — no transformation."

**Implementation:** Detect markdown code fence delimiters; treat entire block as code boundary.

**Test Case:**
- Input error block → exact copy, no caveman rules applied inside

---

## Edge Case 3: User Request for Clarification (Repeated Question)

**Scenario:** User asks a question, agent responds in caveman. User re-asks the same question (indicates confusion).

```
User: What's the caveman intensity levels?
Agent (caveman full): Six modes. lite ~30%, full ~75%, ultra ~85% reduction.

User: Sorry, what are the caveman intensity levels?
Agent: [SHOULD REVERT TO NORMAL ENGLISH]
```

**Challenge:** How does agent detect "repeated question"? Exact string match? Semantic similarity?

**Decision:** 🟡 Heuristic approach. Agent checks:
1. User message contains keywords from previous question (e.g., "caveman", "intensity", "levels")
2. Time between messages < 5 minutes
3. Agent didn't add new information in previous response

If all three match, treat as repeat clarification request; revert to normal English temporarily.

**Implementation:** Caveman mode includes optional callback hook to detect repeated intents.

**Confidence:** 🟡 (heuristic may have false positives/negatives; semantic similarity check requires embedding comparison, expensive)

**Test Case:**
- T1 → T2 within 5 min with overlapping keywords → revert to normal English
- T1 → T2 with different topic → keep caveman active

---

## Edge Case 4: Security Warning During Caveman Mode

**Scenario:** Agent is in caveman mode, detects the user is about to run a destructive command.

```
User: Sure, let me do `rm -rf node_modules` to clean up.

Agent (caveman): REVERT TO NORMAL — "This command will permanently delete the node_modules directory. Are you absolutely sure? [Type YES to confirm or N to cancel.]"
```

**Challenge:** Caveman rules conflict with clarity requirements for irreversible actions. How does agent decide which to prioritize?

**Decision:** 🟢 **Hard boundary:** Security warnings and confirmation sequences ALWAYS use normal English, never caveman-fied. Rule:

> "If output involves irreversible action (`rm -f`, `git reset --hard`, `git push --force`, schema drop), revert caveman mode temporarily. Resume after user confirms."

**Implementation:** Before outputting any response, scan for destructive keywords (rm, delete, drop, erase, reset, force push). If found, temporarily set `caveman_boundary_active = true`, output in normal English, prompt for confirmation, then resume caveman.

**Test Case:**
- Caveman active, user requests `git reset --hard` → revert to normal English, get approval, resume caveman ✅

---

## Edge Case 5: Caveman Mode in Code Comments

**Scenario:** Agent is writing code, and caveman mode is active. Should code comments be caveman-fied?

```js
// Sure, here's the fix. Really simple. Just drop articles.
const isExpired = (token) => token.expiry < Date.now();
```

**Challenge:** Comments are part of code; preserving them exactly is good practice. But should they follow caveman rules?

**Decision:** 🟢 Code blocks (including comments inside) are never caveman-fied. Comments remain in full, natural English as the agent writes them.

**Reasoning:** Comments are documentation first, code second. Caveman compression would make comments cryptic and maintenance-hostile.

**Implementation:** Code boundary preservation extends to the entire code block, including comments.

**Test Case:**
- Write code in caveman mode → code output exact, comments not compressed ✅

---

## Edge Case 6: Intensity Level Switch Mid-Conversation

**Scenario:** User activates caveman full, then says "get more aggressive" and switches to ultra mid-conversation.

```
Agent (caveman full): Fix bug. Use `<` not `<=`. Line 42.

User: Go ultra. Don't spare details.

Agent (caveman ultra): Fix. `<`. L42. 3 callers refactor needed.
```

**Challenge:** Agent should honor the switch immediately, but how does it know previous context if compression level changes?

**Decision:** 🟢 Intensity level switch applies only to future output. Previous outputs stay as-is (don't recompress). New intensity level overwrites session state.

**Implementation:** 
- Detect `/caveman [intensity]` or "switch to [intensity]" in user message
- Update `caveman_intensity` session variable
- Apply new intensity to next agent response

**Test Case:**
- T1 (full) → T2 (user requests ultra) → T3 uses ultra, T1 unchanged ✅

---

## Edge Case 7: Long Deliberation or Multi-Step Reasoning

**Scenario:** Agent needs to explain a complex debug session with many steps. Caveman compression might hide critical reasoning.

```
User: Debug this slow query.

Agent (caveman ultra): Slow query. Check index. Missing index on user_id. Add index. Test. Done.
```

**Challenge:** Ultra compression might over-summarize; user needs to understand the debugging process, not just the fix.

**Decision:** 🟡 This is a design trade-off. If user needs full reasoning, they should:
1. Request normal English temporarily: "give me full reasoning"
2. Switch intensity: `/caveman lite` (more readable)
3. Exit caveman: "stop caveman"

**Reasoning:** Caveman is opt-in for users who prefer speed/efficiency over verbosity. Users who need detail have override options.

**Implementation:** No special handling; user controls intensity/mode.

**Confidence:** 🟡 (relies on user awareness of mode; some users may forget they're in caveman)

**Test Case:**
- User can request temporary revert for complex reasoning; caveman resumes after ✅

---

## Edge Case 8: Non-English Languages in Caveman

**Scenario:** Skill is loaded in a non-English session (e.g., Portuguese, Spanish), but caveman rules are defined in English (drop "a", "the", "just", etc.).

**Challenge:** Caveman rules are English-language-specific. Should caveman apply to Portuguese output? Spanish output?

**Decision:** 🔴 **Currently unspecified.** Caveman as defined only works for English. Wenyan variants exist for Classical Chinese, but no Portuguese/Spanish/German variants documented.

**Recommendation:** Mark as lacuna pending language-specific implementations (wenyan-pt, wenyan-es, etc.) or explicit limitation ("caveman: English-only mode").

**Confidence:** 🔴 (no clear direction in codebase; user expectation unclear)

---

## Edge Case 9: Hook Auto-Activation Conflict with User Command

**Scenario:** Session hook auto-activates caveman on session start, but user immediately says "stop caveman" before sending any task.

```
[Session starts]
[Hook activates caveman:full]
User: stop caveman

Agent: [Should caveman be on or off?]
```

**Challenge:** Timing issue. If hook fires before user's first message, mode is on; user's stop command then turns it off. But hook might fire after user's message in some harnesses.

**Decision:** 🟡 Depends on host trigger ordering. No repository-local hook implements this behavior. When the host supports skill-trigger matching, user commands such as "stop caveman" should override an auto-activated mode. Behavior may differ in other harnesses.

**Implementation:** Harness-specific. Use host skill-trigger behavior when available. Do not claim repository-implemented hook auto-activation unless hook files or an equivalent host contract are added.

**Confidence:** 🟡 (host-dependent behavior; no repository-local hook implementation)

**Test Case:**
- Different harnesses may show different behavior; test each
