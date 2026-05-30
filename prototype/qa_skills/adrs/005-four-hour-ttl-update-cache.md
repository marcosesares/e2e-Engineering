# ADR-005: 4-Hour TTL Cache for Session-Start Update Check

- **Status:** Active
- **Date:** ~2026-04 (PR 14285, refined PR 14305)
- **Confidence:** 🟢 CONFIRMADO (`check-updates.ps1:28-36`)

## Contexto

The `SessionStart` hook runs `check-updates.ps1` every time a Claude Code session opens. Querying `published-skills` on every session would generate noisy remote calls, add latency to session startup, and annoy engineers who open multiple sessions in a day.

## Decisão

Cache the last update-check timestamp per repo root in `$USERPROFILE/.claude/cache/shared-skills-check-<RepoKey>.txt`. If the cache file is younger than 4 hours, the check is silently skipped. The cache file is touched on every check (success or failure) to reset the TTL.

The cache key is derived from the repo root path with special characters (`\`, `/`, `:`, `*`, `?`, `"`, `<`, `>`, `|`) replaced by `_`.

## Alternativas Consideradas

| Alternative | Reason Rejected |
|-------------|-----------------|
| **Check every session (no cache)** | Too noisy for engineers with multiple daily sessions. Remote call latency at session start degrades experience. | 🟡 |
| **Check once per day** | Too slow to surface updates that ship mid-day. 4 hours is a reasonable "same working day" window. | 🟡 |
| **User-triggered only (`/refresh-setup`)** | Updates would go unnoticed. The automatic check is the primary discovery mechanism. | 🟡 |
| **File hash comparison instead of TTL** | Would require fetching the remote manifest on every session to compare — same problem as no cache. | 🟡 |

## Consequências

**Positivas:**
- Session startup stays fast (no remote call in the common case).
- Engineers naturally see updates within a half-workday.
- Per-repo cache key means multi-repo setups each get their own TTL.

**Negativas / Trade-offs:**
- Cache can suppress the first useful check after adding a new `shared-skills` remote. Workaround: delete the cache file manually.
- If an update ships and is immediately critical, engineers won't see it until their next check window (up to 4 hours).
- Cache file content (ISO 8601 timestamp) is touched but never read by the check script — only `LastWriteTime` matters.
