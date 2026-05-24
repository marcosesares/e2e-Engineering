# Setup & Configuration Module

## Overview

Distribution and bootstrap layer. Owns skill sync (git subtree), hook installation (SessionStart, PreToolUse), MCP registration, credential setup, version-tracking.

## Responsibilities

- Sync `published-skills` branch to consumer repos via git subtree 🟢
- Prevent edits to synced files via PreToolUse guard hook 🟢
- Detect available updates on session start (SessionStart hook) 🟢
- Bootstrap new users: 7 setup steps (MCP servers, credentials, hooks) 🟢
- Track template versions; detect drift in generated files 🟢

## Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| RF-01 | `sync-shared-skills.ps1` syncs published-skills to .claude/skills/, tracks in .sync-manifest | Must |
| RF-02 | `guard-shared-skills.ps1` PreToolUse hook blocks edits to synced files | Must |
| RF-03 | `check-updates.ps1` SessionStart hook detects new versions (4h TTL cache) | Should |
| RF-04 | `/onboard` orchestrates all 7 setup steps in order | Should |
| RF-05 | `/refresh-setup` audits version markers; detects drift | Should |

---

## Code Traceability

| Symbol | File |
|--------|------|
| sync | `sync-shared-skills.ps1` |
| guard | `guard-shared-skills.ps1` |
| check | `check-updates.ps1` |
| onboard | `onboard/SKILL.md` |
| refresh | `refresh-setup/SKILL.md` |
