# Flowchart — `check-updates.ps1`

> `claude-skills/setup/check-updates.ps1` lines 11–73. Confidence 🟢.
> Hook type: SessionStart. Output JSON only when updates exist.

```mermaid
flowchart TD
    Start([SessionStart hook fires]) --> A1[ScriptDir = MyInvocation parent<br/>ClaudeDir = ScriptDir parent]
    A1 --> A2[RepoRoot = walk up<br/>parents of ClaudeDir<br/>until .git/ found]
    A2 -->|never found| Exit0a([exit 0 silently])

    A2 -->|found| A3[Prefix =<br/>ClaudeDir.Substring RepoRoot.Length<br/>TrimStart slashes]
    A3 -->|empty| Exit0a

    A3 -->|value| B1[CacheDir =<br/>USERPROFILE/.claude/cache<br/>mkdir if missing]
    B1 --> B2[RepoKey = RepoRoot with<br/>backslash slash : * ? quote etc → '_']
    B2 --> B3[CacheFile = CacheDir/<br/>shared-skills-check-RepoKey.txt]

    B3 --> C1{CacheFile exists?}
    C1 -->|yes| C2{Now - LastWriteTime<br/>< 4h?}
    C2 -->|yes| Exit0b([exit 0 cache fresh])
    C2 -->|no| D1
    C1 -->|no| D1

    D1[SyncScript =<br/>ClaudeDir/setup/<br/>sync-shared-skills.ps1]
    D1 -->|missing| Exit0a

    D1 -->|exists| E1[Push-Location RepoRoot]
    E1 --> E2[Invoke SyncScript<br/>-Remote shared-skills<br/>-TargetPrefix Prefix<br/>-UpdateCheck]
    E2 --> E3[updateAvailable =<br/>LASTEXITCODE -eq 1]
    E3 --> E4[Pop-Location]

    E4 --> F1[Touch CacheFile<br/>regardless of result]

    F1 --> G1{updateAvailable?}
    G1 -->|no| Exit0c([exit 0 silent])
    G1 -->|yes| G2[Build syncCmd string]
    G2 --> G3[payload =<br/>hookSpecificOutput:<br/>  hookEventName: SessionStart<br/>  additionalContext: msg]
    G3 --> G4([Write-Output payload JSON<br/>injected into chat context])
```

## Key constants

| Constant | Value | Where |
|---|---|---|
| Cache TTL | 4 hours | line 35 (`[TimeSpan]::FromHours(4)`) |
| Cache root | `$env:USERPROFILE/.claude/cache` | line 28 |
| Cache key sanitizer | regex `[\\/:*?"<>|]` → `'_'` | line 30 |
| Sync remote (hardcoded) | `shared-skills` | line 48 |

## Side effects

1. **Creates `~/.claude/cache/`** if missing (uses `New-Item -Force`).
2. **Touches `CacheFile`** with current timestamp on every non-cached run, even if the sync check errors.
3. **Emits one JSON object** to stdout iff updates available. Otherwise silent (no `Write-Output`).

## Error posture

`$ErrorActionPreference = 'SilentlyContinue'` at top (line 8). Combined with `2>$null` redirects on `git fetch`/sync, the hook is engineered to never produce stderr noise during session startup.
