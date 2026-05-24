# Flowcharts — Setup & Configuration Module

> Module-level flow. Per-function flowcharts: `setup-sync.md`, `setup-publish.md`, `setup-guard.md`, `setup-check-updates.md`.
> Confidence: 🟢 CONFIRMADO unless noted.

## Distribution lifecycle (producer → consumer)

```mermaid
flowchart LR
    subgraph Producer[BeckTech.QA.Tools repo]
        A[Edit files under<br/>claude-skills/] --> B[git commit on main]
        B --> C[generate-manifest.ps1]
        C --> D[git commit<br/>SHARED_MANIFEST]
        D --> E[publish-skills.ps1]
        E --> F[git subtree split<br/>--prefix=claude-skills<br/>-b published-skills]
        F --> G[git push --force<br/>origin published-skills]
    end

    subgraph Consumer[Consuming repo]
        H[SessionStart hook] --> I[check-updates.ps1]
        I --> J{cache<br/>< 4h?}
        J -->|yes| K[exit 0 silently]
        J -->|no| L[sync-shared-skills.ps1<br/>-UpdateCheck]
        L --> M{newer<br/>HEAD or<br/>files set<br/>changed?}
        M -->|no| K
        M -->|yes| N[emit hookSpecificOutput<br/>JSON to chat]
        N --> O[User runs<br/>sync-shared-skills.ps1]
        O --> P[Diff/replace files<br/>under .claude/]
        P --> Q[Write .sync-record]
    end

    G -.published-skills.-> O

    subgraph Guard[Edit-time protection]
        R[Edit/Write/MultiEdit] --> S[PreToolUse hook]
        S --> T[guard-shared-skills.ps1]
        T --> U{file in<br/>SHARED_MANIFEST?}
        U -->|yes| V[stderr BLOCKED<br/>exit 2]
        U -->|no| W[exit 0 allow]
    end
```

## Onboarding flow (per user, per repo)

```mermaid
flowchart TD
    Start([User runs /onboard]) --> Pre1{shared-skills<br/>remote configured?}
    Pre1 -->|no| Pre1a[git remote add shared-skills]
    Pre1 -->|yes| Pre2
    Pre1a --> Pre2{repo-context<br/>filled in?}
    Pre2 -->|no| Pre2a[Offer /setup-repo-context]
    Pre2 -->|yes| Pre3
    Pre2a --> Pre3{CLAUDE.md in<br/>QA-owned dir?}
    Pre3 -->|no| Pre3a[Offer /setup-claude-md]
    Pre3 -->|yes| Pre4
    Pre3a --> Pre4[git fetch shared-skills]
    Pre4 --> Pre5{updates<br/>available?}
    Pre5 -->|yes| Pre5a[Offer sync]
    Pre5 -->|no| S1
    Pre5a --> S1

    S1{hooks<br/>installed AND<br/>_qaHookVersion<br/>== current?} -->|no| S1a[Invoke<br/>setup-claude-hooks]
    S1 -->|yes| S2
    S1a --> S2{atlassian<br/>MCP listed?}
    S2 -->|no| S2a[Invoke<br/>setup-atlassian-mcp]
    S2 -->|yes| S3
    S2a --> S3{ATLASSIAN_EMAIL<br/>and TOKEN set?}
    S3 -->|no| S3a[Invoke<br/>setup-atlassian-credentials]
    S3 -->|yes| S4
    S3a --> S4{ado MCP<br/>listed?}
    S4 -->|no| S4a[Invoke<br/>setup-azure-devops-mcp]
    S4 -->|yes| S5
    S4a --> S5{ADO_PAT set?}
    S5 -->|no| S5a[Invoke<br/>setup-ado-credentials]
    S5 -->|yes| S6
    S5a --> S6{playwright<br/>MCP listed?}
    S6 -->|no| S6a[Ask user; if yes:<br/>setup-playwright-mcp]
    S6 -->|yes| S7
    S6a --> S7{notify.ps1 +<br/>Stop/Notification<br/>hooks present?}
    S7 -->|no| S7a[Ask user; if yes:<br/>setup-notifications]
    S7 -->|yes| Done
    S7a --> Done([Print summary<br/>with ✓ + - ! markers])
```

## Drift audit (`/refresh-setup`)

```mermaid
flowchart TD
    A([/refresh-setup]) --> B[Locate .claude/]
    B --> C[Read target versions<br/>from setup skills' frontmatter]
    C --> D1[Read CLAUDE.md marker<br/>&lt;!-- qa-version: claude-md=N --&gt;]
    C --> D2[Read repo-context<br/>frontmatter qa-version: N]
    C --> D3[Read settings.json<br/>_qaHookVersion: N]

    D1 --> E[Classify status]
    D2 --> E
    D3 --> E

    E --> F{For each artifact}
    F -->|equal| G1[✓ current]
    F -->|lower OR unversioned| G2[! stale]
    F -->|missing| G3[+ missing]
    F -->|higher| G4[? ahead - flag anomaly]

    G1 --> H[Compact report to user]
    G2 --> H
    G3 --> H
    G4 --> H

    H --> I{user<br/>approves<br/>refresh?}
    I -->|yes, one at a time| J[Invoke owning skill]
    J --> K[Owning skill: detect → diff → user-approve → write → stamp version]
    K --> L([Print done; never auto-commit])
    I -->|no| L
```
