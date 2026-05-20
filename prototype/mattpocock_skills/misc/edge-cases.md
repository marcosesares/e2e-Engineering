# Edge Cases: Misc Skills Bucket

> Identificador: `003-misc-skills`
> Data: `2026-05-15`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

---

## EC-01 — `setup-pre-commit`: Prettier config in `package.json` (🟢)

**Skill**: `setup-pre-commit`
**Scenario**: The repo has no standalone `.prettierrc` file, but has a `"prettier"` key inside `package.json`.
**Expected behaviour**: Skill detects the `package.json#prettier` key as an existing Prettier config and skips `.prettierrc` creation.
**Risk if unhandled**: Skill creates a `.prettierrc` that conflicts with the `package.json#prettier` config — Prettier picks one arbitrarily depending on resolution order.
**Source**: `domain.md#pre-commit-shoehorn-rules`

---

## EC-02 — `setup-pre-commit`: husky v8+ vs v9 breaking changes (🟡)

**Skill**: `setup-pre-commit`
**Scenario**: The skill installs husky, but the latest version (v9) has a different configuration format than v8 (e.g., different hook file locations, different init command).
**Expected behaviour**: 🟡 INFERIDO — Skill should pin to the version it was written for, or detect installed version and adapt. Currently undocumented.
**Risk if unhandled**: Installed hooks don't fire; pre-commit checks silently skipped.

---

## EC-03 — `migrate-to-shoehorn`: factory call in shared test utility file (🟡)

**Skill**: `migrate-to-shoehorn`
**Scenario**: A factory call exists in `tests/helpers/factories.ts` — a shared utility file that is neither a `*.test.*` nor `*.spec.*` file, but is only used in test code.
**Expected behaviour**: 🟡 INFERIDO — Unclear. The file is production-excluded by naming convention, but the skill's file-pattern filter would not match it.
**Risk if unhandled**: Shared test utility files are skipped, leaving old factory calls that test files now depend on — migration is partial.

---

## EC-04 — `migrate-to-shoehorn`: factory call produces a type that shoehorn doesn't support (🟡)

**Skill**: `migrate-to-shoehorn`
**Scenario**: A factory call creates a type using generics or conditional types that `fromPartial`, `fromAny`, and `fromExact` cannot represent correctly.
**Expected behaviour**: 🟡 INFERIDO — Skill should flag the call as "cannot migrate automatically" and present it to the developer for manual review rather than producing incorrect code.
**Risk if unhandled**: Incorrect shoehorn call replaces factory; test may pass due to type erasure but silently test the wrong thing.

---

## EC-05 — `scaffold-exercises`: lint loop runs indefinitely (🟡)

**Skill**: `scaffold-exercises`
**Scenario**: The student's solution has a lint error that cannot be fixed without understanding the exercise (e.g., a required import they don't know about).
**Expected behaviour**: 🟡 INFERIDO — No maximum retry count defined. The lint loop could run indefinitely or until the session times out. Skill should offer a hint after N failed attempts.
**Risk if unhandled**: Student is stuck in a lint loop with no guidance — poor learning experience.

---

## EC-06 — `git-guardrails-claude-code`: config conflicts with existing Claude Code settings (🟡)

**Skill**: `git-guardrails-claude-code`
**Scenario**: The repo already has a `.claude/settings.json` or equivalent with custom configuration. The skill writes its guardrail config and overwrites or conflicts with existing settings.
**Expected behaviour**: 🟡 INFERIDO — Skill should merge guardrail settings with existing config rather than overwriting. Currently undocumented.
**Risk if unhandled**: Existing Claude Code configuration (e.g., allowed tools, custom prompts) is lost.
