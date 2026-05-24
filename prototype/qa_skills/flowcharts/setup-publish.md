# Flowchart — `publish-skills.ps1`

> `claude-skills/setup/publish-skills.ps1` lines 12–82. Confidence 🟢.

```mermaid
flowchart TD
    Start([publish-skills.ps1<br/>-NonMainOk]) --> A1{cwd contains<br/>claude-skills/?}
    A1 -->|no| Err1([Error: run from repo root])

    A1 -->|yes| A2[branch = git branch --show-current]
    A2 --> A3{branch in<br/>main, master?}
    A3 -->|no| A4{-NonMainOk?}
    A4 -->|yes| A5[Warn + continue]
    A4 -->|no| A6[Read-Host<br/>Continue anyway? - y/N]
    A6 -->|y| A5
    A6 -->|else| A7([Aborted exit 0])
    A3 -->|yes| B1

    A5 --> B1[generate-manifest.ps1]
    B1 -->|exit non-zero| Err2([generate-manifest failed])
    B1 -->|exit 0| B2[git status --porcelain<br/>SHARED_MANIFEST]

    B2 -->|non-empty| Err3([Manifest is dirty<br/>commit on a branch first])
    B2 -->|clean| C1{local branch<br/>published-skills<br/>exists?}

    C1 -->|yes| C2[git branch -D published-skills]
    C1 -->|no| D1
    C2 --> D1[git subtree split<br/>--prefix=claude-skills<br/>-b published-skills]

    D1 -->|fail| Err4([subtree split failed])
    D1 -->|ok| E1[git push origin<br/>published-skills --force]

    E1 -->|fail| Err5([push failed])
    E1 -->|ok| F1([Done.<br/>Print consumer pull cmd])
```

## Critical invariants

| Step | Invariant | Why |
|---|---|---|
| Manifest dirty check (line 48) | Must be clean before publish | Forces manifest regeneration to ship in the same PR as the file change |
| Force-delete local branch (line 59) | `git branch -D` if exists | `git subtree split -b` refuses to write into an existing branch |
| Force-push (line 71) | `--force` always | Publish branch is a rebuild from main, not additive |
| Branch gate (line 26) | Only main/master unless `-NonMainOk` | Prevents publishing stale or experimental subtree state |
