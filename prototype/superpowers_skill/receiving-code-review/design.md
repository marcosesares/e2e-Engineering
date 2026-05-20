# Receiving Code Review, Design

> Technical design for review-feedback intake, evaluation, and implementation.

## Interface

**Input:** Code review feedback from a human partner, external reviewer, PR comment, or subagent review. 🟢

**Output:** One of:
- clarification request for unclear feedback. 🟢
- technical acceptance with fix implementation. 🟢
- technical pushback with evidence. 🟢
- escalation to the human partner when feedback conflicts with prior decisions. 🟢

## Execution Flow

### 1. Feedback Intake

```text
1. Read the complete feedback set.
2. Split feedback into atomic review items.
3. For each item, classify source:
   - human partner
   - external reviewer
   - GitHub inline review comment
   - automated/subagent review
4. Identify ambiguous items.
5. If any item is unclear, stop and ask for clarification before implementation.
```

The stop-on-ambiguity behavior is mandatory because review items can be related; implementing only understood items can create the wrong change sequence. 🟢

### 2. Technical Verification

```text
For each clear review item:
  1. Locate relevant code, tests, or docs.
  2. Check whether the suggestion is correct for this codebase.
  3. Check whether it breaks existing behavior.
  4. Check why current implementation exists.
  5. Check platform/version compatibility.
  6. Check whether the reviewer has full context.
```

External feedback receives stricter verification than direct human-partner feedback, but trusted human feedback still requires scope clarification when ambiguous. 🟢

### 3. YAGNI Review Gate

```text
If feedback asks for "proper" implementation:
  grep/search for actual usage.
  If unused:
    ask whether to remove the feature instead.
  If used:
    implement the requested hardening.
```

This gate prevents adding professional-looking but unused functionality. 🟢

### 4. Response Decision

| Condition | Response |
|-----------|----------|
| Feedback unclear | Ask a specific clarification question |
| Feedback correct | Implement and report the concrete change |
| Feedback wrong | Push back with code/test evidence |
| Feedback conflicts with prior human decision | Stop and ask the human partner |
| Feedback cannot be verified | State what evidence is missing and ask how to proceed |

All responses avoid performative praise and broad agreement language. 🟢

### 5. Implementation Order

```text
1. Blocking issues: security, correctness, broken behavior.
2. Simple fixes: typos, imports, direct cleanup.
3. Complex fixes: refactors, logic changes.
4. Test each fix independently.
5. Verify no regressions after all accepted items.
```

## Internal State

- `feedback_items[]` — atomic review comments. 🟡
- `unclear_items[]` — items requiring clarification. 🟡
- `verified_items[]` — suggestions checked against codebase reality. 🟡
- `accepted_items[]` — changes to implement. 🟡
- `rejected_items[]` — suggestions requiring technical pushback. 🟡
- `source_type` — human partner, external reviewer, GitHub comment, or subagent. 🟡

## Dependencies

- Code search capability, usually `rg` or harness-native search. 🟡
- Test runner for validating each accepted fix. 🟡
- GitHub API/CLI only when replying to inline GitHub review comments. 🟢

## Design Decisions

| Decision | Evidence | Confidence |
|----------|----------|------------|
| Clarify before implementing any unclear multi-item feedback | `Handling Unclear Feedback` section | 🟢 |
| External reviewer suggestions require skepticism and verification | `Source-Specific Handling` section | 🟢 |
| Unused "proper implementation" requests trigger YAGNI check | `YAGNI Check` section | 🟢 |
| Avoid performative agreement/gratitude language | `Forbidden Responses` and acknowledgement guidance | 🟢 |

## Observability

Useful trace messages:
- `Review intake: N items, M unclear`
- `Verified item X against files: ...`
- `Accepted item X: implemented in ...`
- `Pushed back on item Y: conflicts with ...`
- `Blocked: clarification required before implementation`

## Risks & Lacunas

- 🟡 Automated detection of performative language depends on the agent following prose guidance, not code enforcement.
- 🟡 "Technically correct for this codebase" can require project context not visible in a short review thread.
- 🔴 Exact GitHub API availability depends on harness permissions and authentication.
