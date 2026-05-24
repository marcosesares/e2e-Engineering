# Setup, Design Técnico

## Fluxo: /onboard

```
1. Repo checks: git remote, CLAUDE.md, repo-context
2. Per-user setup (7 steps in order):
   - step 1: setup-claude-hooks
   - step 2: setup-atlassian-mcp
   - step 3: setup-atlassian-credentials
   - step 4: setup-azure-devops-mcp
   - step 5: setup-ado-credentials
   - step 6: setup-playwright-mcp
   - step 7: setup-notifications
3. Return completion report
```

## Fluxo: Sync

```
sync-shared-skills.ps1
  1. Clone published-skills branch into temp dir
  2. List files from published-skills
  3. For each file: fetch from remote, write to .claude/skills/
  4. Track in .sync-manifest (JSON hash map)
  5. Cleanup orphaned local files
```

## Fluxo: Guard

```
PreToolUse hook: guard-shared-skills.ps1
  1. Check if target file in .sync-manifest
  2. If synced: block edit, return error
  3. If not synced: allow
  4. On error (missing manifest): fail-open (allow)
```

## Hooks

- **SessionStart:** check-updates.ps1 → detect new versions
- **PreToolUse:** guard-shared-skills.ps1 → prevent synced file edits
- **Stop / Notification (user-scope, opt-in):** `claude-skills/setup-skills/setup-notifications/hooks/notify.ps1` — 13-line Windows-only balloon toast via `System.Windows.Forms.NotifyIcon`. Hardcoded title `'Claude Code'`, body `'Waiting for your input'`. No network call, no PII. 5-second balloon, immediate dispose. macOS/Linux users have no equivalent; users on those platforms skip `/onboard` Step 7. 🟢
