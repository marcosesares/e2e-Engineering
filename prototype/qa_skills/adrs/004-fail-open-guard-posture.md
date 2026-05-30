# ADR-004: Fail-Open Posture for the Path Guard Hook

- **Status:** Active
- **Date:** ~2026-04 (PR 14305)
- **Confidence:** 🟢 CONFIRMADO (`guard-shared-skills.ps1:25-46`, `code-analysis-setup.md`)

## Contexto

The `guard-shared-skills.ps1` PreToolUse hook must decide whether to block a file edit. In error scenarios (missing manifest, malformed JSON stdin, path resolution exception, target outside `.claude/`), it must choose between blocking all edits (safe but breaks the user) or allowing them (risky but non-disruptive).

## Decisão

The guard exits `0` (allow) in all exceptional cases:
- Empty stdin
- Malformed JSON payload
- Missing or corrupt `SHARED_MANIFEST`
- Path resolution exception
- Target path outside `.claude/`

Only a confirmed manifest match triggers `exit 2` (block).

## Alternativas Consideradas

| Alternative | Reason Rejected |
|-------------|-----------------|
| **Fail-closed (block on any error)** | Would break legitimate edits whenever the manifest is temporarily missing, the hook environment is malformed, or a new Claude Code version changes the hook payload schema. Unacceptable UX risk. | 🟢 |
| **Log error to stderr + allow** | Current behavior — stderr is used for the BLOCKED message only; other errors are silently ignored. Adding error logging was considered too noisy for routine sessions. | 🟡 |
| **Require manifest to exist (hard fail if missing)** | Breaks fresh consumer setups where the manifest hasn't been synced yet. | 🟢 |

## Consequências

**Positivas:**
- Hook never breaks a valid edit session.
- Robust against Claude Code version changes that alter hook payload schemas.
- Allows fresh consumer repos to function before initial sync.

**Negativas / Trade-offs:**
- If the manifest is accidentally deleted or corrupt, all shared files become editable without warning. There is no alerting mechanism for this condition.
- A subtle path normalization bug in the hook could silently allow edits to shared files.
- The escape hatch `QA_ALLOW_SHARED_EDIT=1` and the fail-open posture together mean shared file protection is advisory, not enforced at the git level.
