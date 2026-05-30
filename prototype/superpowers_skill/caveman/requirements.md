# Caveman — Ultra-Compressed Communication

> Agent behavior-shaping skill for token efficiency via terse, colloquial communication while preserving technical precision.

## Overview

Caveman enables agents to reduce token usage ~75% by adopting a "caveman" communication style—dropping articles (a/an/the), filler words (just, really, basically), pleasantries (sure, certainly), and hedging—while maintaining full technical accuracy. Six intensity levels (lite, full, ultra, wenyan-lite, wenyan-full, wenyan-ultra) allow tuning compression vs. clarity. 🟢

## Responsibilities

- Transform agent output into ultra-compressed format without loss of technical substance
- Maintain code blocks, technical terms, and error messages unchanged  
- Preserve structured information (code, commands, logs) in original form
- Auto-trigger when token efficiency is requested
- Support multiple intensity levels for different contexts
- Auto-revert on security warnings, irreversible action confirmations, and user clarification requests

## Business Rules

- **Core Rule:** Drop articles, filler, pleasantries, hedging; fragments OK; technical terms exact. 🟢
- **Code Boundary:** Code blocks, commits, PRs, and security context revert to normal writing. 🟢
- **Auto-Clarity Rule:** Drop caveman mode for security warnings, confirmation sequences, and repeated user questions; resume after clarity achieved. 🟢
- **Persistence Rule:** Once activated, caveman mode persists across turns unless explicitly stopped ("stop caveman" / "normal mode") or boundary condition triggered. 🟢
- **Intensity Levels:** lite (mild), full (default), ultra (maximal compression), wenyan-* variants (Classical Chinese style). 🟡
- **Hook Integration:** Caveman mode can be activated via hook on session start or user request; level persists unless changed. 🟡

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| RF-01 | Transform natural language output by dropping articles/filler/pleasantries | Must | "Sure, I'd be happy to help with..." becomes "Help you with..." |
| RF-02 | Preserve code blocks, technical terms, and error messages exactly | Must | `git commit -m "message"` remains unchanged; `<` vs `<=` bug notation exact |
| RF-03 | Support 6 intensity levels with predictable token reduction | Should | lite ~30%, full ~75%, ultra ~85% reduction from baseline |
| RF-04 | Auto-trigger on user request ("caveman mode", "less tokens", "be brief") | Should | Activate within same response without explicit /skill invocation |
| RF-05 | Auto-revert on security warnings and irreversible action confirmations | Must | Revert to normal writing for "this will delete...", "are you sure?" contexts |
| RF-06 | Persist mode across conversation turns until explicitly stopped | Must | User says "stop caveman" or "normal mode" to exit; no silent revert |

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|------------|----------|-----------|
| Performance | Token reduction ~75% in full mode | Code analysis of caveman logic, ~400 lines stripped from skill descriptions | 🟢 |
| Clarity | No loss of technical substance | Caveman output retains exact code, error messages, technical terminology | 🟢 |
| Safety | Security warnings always in normal English | Auto-clarity rule explicit in skill | 🟢 |
| Harness Support | Works across all 6 harnesses | Caveman is a skill, loaded by any harness with bootstrap | 🟡 |

## Acceptance Criteria

```gherkin
Given caveman mode is active at full intensity
When agent describes a bug fix
Then output drops articles/filler/pleasantries but preserves code, function names, and error signatures exactly

Scenario: Code boundary respected
Given caveman mode active
When agent writes a code snippet or commit message
Then code block/message is in normal format, not caveman-ized

Scenario: Auto-revert on security warning
Given caveman mode active
When agent detects irreversible action (force push, rm -rf, reset --hard)
Then revert to full normal English for confirmation, resume caveman after approval

Scenario: Persistence across turns
Given caveman mode active in turn 1
When turn 2 begins
Then caveman mode remains active unless "stop caveman" or "normal mode" was said
```

## Priority (MoSCoW)

| Requirement | MoSCoW | Justification |
|-------------|--------|---------------|
| Drop articles/filler → reduce tokens | Must | Core feature, main benefit users seek |
| Preserve code/technical terms exactly | Must | Non-negotiable; partial compression breaks code/commands |
| Security warnings in normal English | Must | Irreversible actions require clarity; user safety critical |
| Auto-trigger on user request | Should | Convenience; can be invoked explicitly via /caveman |
| 6 intensity levels | Should | Flexibility; full intensity covers 90% of use cases |
| Persist across turns | Must | User expects mode to stay on until they disable it |

## Code Traceability

| File | Function / Section | Coverage |
|------|------------------|----------|
| `skills/caveman/SKILL.md` | Main skill definition, all intensity levels | 🟢 |
| `skills/caveman-help/SKILL.md` | Quick reference card | 🟢 |
| `.claude/hooks.yml` | Hook injection for session-start activation | 🟡 |
