# Flowchart — `sync-shared-skills.ps1`

> `claude-skills/setup/sync-shared-skills.ps1` lines 196–289. Confidence 🟢.

```mermaid
flowchart TD
    Start([sync-shared-skills.ps1<br/>-Remote -TargetPrefix -Force -UpdateCheck]) --> A1[Get-RepositoryRoot:<br/>walk up until .git/ found]
    A1 -->|null| Err1([Error: not in git repo])
    A1 -->|found| A2[RecordFile =<br/>RepoRoot/TargetPrefix/.sync-record]

    A2 --> A3[git fetch Remote published-skills]
    A3 --> A4[Get-RemoteHeadCommit:<br/>git rev-parse Remote/published-skills]
    A4 -->|null| Err2([Error: remote unreachable])
    A4 -->|sha| A5[Get-RemoteFileList:<br/>git ls-tree -r --name-only<br/>Remote/published-skills]
    A5 -->|empty| Err3([Error: no files in remote])

    A5 -->|list| B1[Get-SyncRecord:<br/>read .sync-record JSON]
    B1 --> B2[previousVersion, previousFiles]

    B2 --> C1[addedFiles = fileList - previousFiles<br/>removedFiles = previousFiles - fileList<br/>fileSetUnchanged = added.Count==0 AND removed.Count==0]

    C1 --> D1{-UpdateCheck<br/>flag?}
    D1 -->|yes| D2{newVersion ==<br/>previousVersion<br/>AND fileSetUnchanged?}
    D2 -->|yes| D3([exit 0<br/>no updates])
    D2 -->|no| D4([exit 1<br/>updates available])

    D1 -->|no| E1{newVersion ==<br/>previousVersion<br/>AND fileSetUnchanged<br/>AND NOT -Force?}
    E1 -->|yes| E2([up to date<br/>exit 0])
    E1 -->|no| F1[Sync-FilesFromRemote:<br/>see below]

    F1 --> G1[Save-SyncRecord:<br/>version, timestamp, files]
    G1 --> H1[Clean .temp-plan-*.json<br/>from repo root and .cache/]
    H1 --> I1([Print next steps:<br/>git diff/add/commit/push])

    subgraph SFR[Sync-FilesFromRemote]
        F1a[Create target dir if missing] --> F1b[Foreach file in remote list]
        F1b --> F1c{git show<br/>Remote/published-skills:<br/>file}
        F1c -->|ok| F1d[Write file UTF-8<br/>newSyncRecord[file]=true<br/>syncedCount++]
        F1c -->|fail| F1e[Warn + errorCount++]
        F1d --> F1f
        F1e --> F1f
        F1f[Next file] -.-> F1b

        F1b -->|done| F1g{previousSyncRecord<br/>has files not in<br/>newSyncRecord?}
        F1g -->|no| F1k([Return: Synced, Deleted,<br/>Errors, NewRecord])
        F1g -->|yes| F1h[Remove orphan file]
        F1h --> F1i[Walk up parents:<br/>remove empty dirs<br/>up to TargetPrefix]
        F1i --> F1g
    end
```

## Decision points

| Decision | True branch | False branch | Where |
|---|---|---|---|
| `Get-RepositoryRoot` returns null | Error + exit | continue | line 199–202 |
| `Get-RemoteHeadCommit` null | Error + exit | use sha | line 210–213 |
| `Get-RemoteFileList` empty | Error + exit | use list | line 215–218 |
| `-UpdateCheck` AND unchanged | exit 0 | check non-`-UpdateCheck` path | line 230–236 |
| `unchanged AND NOT -Force` | "up to date" + exit 0 | sync | line 238–241 |
| `git show` of file fails | warn + error counter | write file | line 104–112 |
| parent dir empty after delete | remove parent, recurse | stop | line 131–138 |
| Cleanup found temp files | remove each, warn on failure | skip | line 263–278 |
