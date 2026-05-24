# CI/CD, Design Técnico

## publish-claude-skills.yml

```
trigger: master, claude-skills/* path filter
pool: windows-latest
steps:
  1. git subtree split --prefix=claude-skills -b published-skills
  2. git push -f shared-skills published-skills
  3. (optional) Notify on completion
```

## publish-testkit.yml

```
trigger: master, dotnet/BeckTech.QA.TestKit/** path filter
pool: windows-latest
steps:
  1. Setup .NET 9 SDK
  2. dotnet build BeckTech.QA.TestKit.sln
  3. dotnet test (with trx logger)
  4. Publish TestResults to ADO
  5. dotnet pack
  6. NuGetAuthenticate
  7. dotnet push to DESTINI-Web feed (--skip-duplicate)
```

## Decisões

- No PR validation (pr: none) 🟢
- Path filters prevent unnecessary runs 🟢
- Windows agent for .NET toolchain 🟢
- persistCredentials: true for git operations 🟢
- NuGetAuthenticate@1 for package feed 🟢
