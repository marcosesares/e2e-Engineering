# Caveman, Tasks

> Implementation tasks for ultra-compressed communication mode.

## Prerequisites

- [ ] Harness supports skill auto-triggering (all 6 supported harnesses do)
- [ ] Session-level variable storage available (for mode persistence)
- [ ] Hook system available for optional session-start activation
- [ ] Agent can read and apply text transformation rules

## Tasks

### Core Transformation Pipeline

- [ ] T-01, Implement article dropper (a, an, the)
  - Origin: `skills/caveman/SKILL.md` — Main caveman rules section
  - Acceptance: All instances of "a user", "the function", "an API" become "user", "function", "API"
  - Confidence: 🟢

- [ ] T-02, Implement filler removal (just, really, basically, actually, simply)
  - Origin: `skills/caveman/SKILL.md` — Filler list
  - Acceptance: "I'd really like to help" → "I'd like to help"; "basically the code" → "code"
  - Confidence: 🟢

- [ ] T-03, Implement pleasantry removal (sure, certainly, of course, happy to)
  - Origin: `skills/caveman/SKILL.md` — Pleasantry list
  - Acceptance: "Sure, I'd be happy to help" → "Help you"
  - Confidence: 🟢

- [ ] T-04, Implement hedging reduction (would, might, could be, perhaps → committed forms)
  - Origin: `skills/caveman/SKILL.md` — Hedging transformation rules
  - Acceptance: "This might fix it" → "Fix it"; "would be useful" → "useful"
  - Confidence: 🟢

- [ ] T-05, Implement code block preservation (no transformation inside ```...``` blocks)
  - Origin: `skills/caveman/SKILL.md` — Code boundary rule
  - Acceptance: Code examples, error messages, function signatures remain exact
  - Confidence: 🟢

### Intensity Level Implementation

- [ ] T-06, Implement lite intensity (~30% reduction)
  - Origin: `skills/caveman/SKILL.md` — Lite mode definition
  - Acceptance: Mild compression, conversational tone preserved
  - Confidence: 🟢

- [ ] T-07, Implement full intensity (~75% reduction, default)
  - Origin: `skills/caveman/SKILL.md` — Full mode + pattern `[thing] [action] [reason]. [next step].`
  - Acceptance: Aggressive article/filler/pleasantry drop, fragments OK
  - Confidence: 🟢

- [ ] T-08, Implement ultra intensity (~85% reduction)
  - Origin: `skills/caveman/SKILL.md` — Ultra mode definition, telegraphic fragments
  - Acceptance: Minimal context, single-letter abbreviations allowed
  - Confidence: 🟢

- [ ] T-09, Implement wenyan-lite variant (Classical Chinese style)
  - Origin: `skills/caveman/SKILL.md` — Wenyan-lite definition
  - Acceptance: Output in Classical Chinese grammar, mild compression
  - Confidence: 🟡 (implementation examples sparse)

- [ ] T-10, Implement wenyan-full variant
  - Origin: `skills/caveman/SKILL.md` — Wenyan-full definition
  - Acceptance: Full caveman rules mapped to Classical Chinese syntax
  - Confidence: 🟡

- [ ] T-11, Implement wenyan-ultra variant
  - Origin: `skills/caveman/SKILL.md` — Wenyan-ultra definition
  - Acceptance: Ultra compression in Classical Chinese style
  - Confidence: 🟡

### Boundary & Persistence

- [ ] T-12, Implement auto-revert on security warnings
  - Origin: `skills/caveman/SKILL.md` — Auto-clarity rule, security boundary
  - Acceptance: Detect "rm -rf", "reset --hard", "force push"; revert to normal English; resume after confirmation
  - Confidence: 🟡 (detection heuristics not fully specified)

- [ ] T-13, Implement persistence across turns
  - Origin: `skills/caveman/SKILL.md` — Persistence rule
  - Acceptance: Mode remains active across T2, T3, ... until user says "stop caveman" or "normal mode"
  - Acceptance: Store `caveman_intensity` in session state
  - Confidence: 🟢

- [ ] T-14, Implement /caveman command
  - Origin: `skills/caveman/SKILL.md` — Skill invocation via /caveman
  - Acceptance: `/caveman`, `/caveman full`, `/caveman ultra` activate corresponding intensity
  - Confidence: 🟢

- [ ] T-15, Implement auto-trigger on keywords
  - Origin: `skills/caveman/SKILL.md` — Auto-trigger rules ("caveman mode", "less tokens", "be brief")
  - Acceptance: User says "less tokens" → activate full intensity automatically
  - Acceptance: User says "talk like caveman" → same
  - Confidence: 🟡 (keyword list may be incomplete)

- [ ] T-16, Implement hook-based session-start activation (optional)
  - Origin: `.claude/hooks.yml` — Hook system
  - Acceptance: If hook defines `on_session_start → activate caveman [intensity]`, mode activates before first user message
  - Acceptance: Admin configurable via settings.json
  - Confidence: 🟡 (hook timing relative to system prompt load unclear)

### Testing

- [ ] TT-01, Happy path: user says "less tokens" → full caveman activated, output compressed 75%
- [ ] TT-02, Code boundary: code snippet inside caveman mode stays exact, not compressed
- [ ] TT-03, Security revert: detecting "rm -rf" → switch to normal English, ask for confirmation, resume caveman after approval
- [ ] TT-04, Persistence: activate in T1, check mode still active in T2, T3 without re-activation
- [ ] TT-05, Mode switching: user in full mode says `/caveman ultra` → intensity changes mid-session
- [ ] TT-06, Stop command: user says "stop caveman" → mode deactivates, output reverts to normal English
- [ ] TT-07, Repeated clarification: user asks same question twice → auto-revert to normal English, offer explicit clarification
- [ ] TT-08, Wenyan mode: `/caveman wenyan-full` → output in Classical Chinese with caveman compression rules

## Implementation Order

1. **Foundation (T-01 to T-05):** Text transformation rules + code preservation
2. **Intensity levels (T-06 to T-11):** lite, full, ultra, wenyan variants
3. **Control flow (T-12 to T-16):** Boundaries, persistence, commands, hooks
4. **Testing (TT-01 to TT-08):** Comprehensive coverage

**Blockers:** None; tasks are independent once T-01–T-05 complete.

## Gaps Pending Validation (🔴)

- **Wenyan token metrics:** Does Classical Chinese style actually achieve ~75% reduction in CJK-tuned models? Validate with real session data.
- **Hook timing:** Does hook fire before or after system prompt initialization? Affects auto-activation reliability.
- **Security detection heuristic:** Current keyword list (rm, reset, force) may be incomplete. Validate against real unsafe commands corpus.
- **Fragment misinterpretation:** Do some harnesses treat incomplete sentences as "waiting for more input"? Edge case not tested.
