# Setup, Fluxos

## First Sync (Consumer Repo)

```
git remote add shared-skills {BeckTech.QA.Tools URL}
/onboard
  └─ (all 7 setup steps)
  └─ setup-claude-hooks
     └─ install SessionStart + PreToolUse hooks
     └─ sync-shared-skills.ps1 (first sync)
```

## Regular Updates

```
SessionStart hook
  └─ check-updates.ps1
     └─ Detect new published-skills commits
     └─ If updates: prompt user
     └─ User: /refresh-setup
        └─ sync-shared-skills.ps1 (pull updates)
```

## Version Drift Detection

```
refresh-setup
  └─ Compare `version` in CLAUDE.md, settings.json, repo-context
  └─ If < current version: flag as stale
  └─ Recommend regeneration
```
