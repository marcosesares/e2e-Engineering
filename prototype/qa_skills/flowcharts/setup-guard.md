# Flowchart — `guard-shared-skills.ps1`

> `claude-skills/setup/guard-shared-skills.ps1` lines 14–74. Confidence 🟢.
> Hook type: PreToolUse with matcher `Edit|Write|MultiEdit`.

```mermaid
flowchart TD
    Start([stdin: PreToolUse JSON payload]) --> A1{env<br/>QA_ALLOW_SHARED_EDIT<br/>== '1'?}
    A1 -->|yes| Allow([exit 0 allow])

    A1 -->|no| A2[Read stdin to rawInput]
    A2 -->|empty| Allow

    A2 -->|content| A3{ConvertFrom-Json<br/>parse?}
    A3 -->|fail| Allow

    A3 -->|ok| A4[filePath =<br/>payload.tool_input.file_path]
    A4 -->|null/empty| Allow

    A4 -->|value| B1[ScriptDir = MyInvocation parent<br/>ClaudeDir = ScriptDir parent]
    B1 --> B2[manifestFile =<br/>ClaudeDir/SHARED_MANIFEST]
    B2 -->|missing| Allow

    B2 -->|exists| C1{Path.GetFullPath<br/>filePath ok?}
    C1 -->|throw| Allow
    C1 -->|ok| C2[absTarget = backslash → forward<br/>absClaude = full(ClaudeDir) backslash → forward]

    C2 --> D1{absTarget startsWith<br/>absClaude + '/'<br/>OrdinalIgnoreCase?}
    D1 -->|no| Allow

    D1 -->|yes| E1[relative =<br/>absTarget after absClaude/]
    E1 --> E2[manifest = read lines<br/>skip blank<br/>skip startsWith '#']
    E2 --> E3{any manifest line<br/>Trim equals<br/>relative case-insensitive?}

    E3 -->|no| Allow
    E3 -->|yes| Block([stderr BLOCKED message<br/>exit 2 - halt tool call])
```

## Fail-open principle

Every "?" branch with an ambiguous answer routes to **exit 0 (allow)**. The hook MUST NOT be the reason a valid edit fails. Trade-off: a missing/corrupt manifest silently drops protection. The blast radius is bounded — only Edit/Write/MultiEdit on `.claude/*` are even routed through this hook.

## Block payload (stderr)

```text
BLOCKED: '<relative>' is a shared QA automation file pulled in via git subtree from BeckTech.QA.Tools. Local edits here get overwritten by the next subtree pull and never reach the rest of the team.

To change this file, open a PR against BeckTech.QA.Tools in the claude-skills/ directory. After it merges, run the subtree pull in this repo.

If you genuinely need to edit locally for debugging, set env var QA_ALLOW_SHARED_EDIT=1 and restart this Claude Code session.
```

`exit 2` is the Claude Code contract for "stop the tool call and surface stderr to the user".
