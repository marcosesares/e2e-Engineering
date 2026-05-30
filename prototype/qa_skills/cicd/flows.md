# CI/CD, Fluxos

## Skill Distribution Pipeline

```
developer: git push master (touching claude-skills/*)
  ↓
ADO Pipeline: publish-claude-skills.yml
  1. Trigger fires (path filter matches)
  2. git subtree split --prefix=claude-skills -b published-skills
  3. git push -f shared-skills published-skills
  ↓
Consumer repos detect update
  (SessionStart hook: check-updates.ps1)
  (User: /refresh-setup → sync-shared-skills.ps1)
```

## TestKit Release Pipeline

```
developer: git push master (touching dotnet/BeckTech.QA.TestKit/**)
  ↓
ADO Pipeline: publish-testkit.yml
  1. Trigger fires (path filter matches)
  2. dotnet build
  3. dotnet test (trx output)
  4. Publish test results
  5. dotnet pack (generates .nupkg)
  6. NuGetAuthenticate (DESTINI-Web feed)
  7. dotnet push (--skip-duplicate)
  ↓
NuGet packages available for consumers
```
