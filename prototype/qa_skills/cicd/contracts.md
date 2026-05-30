# CI/CD, Contratos Externos

## Git Triggers

- **Trigger:** Push to master branch
- **Path filters:**
  - publish-claude-skills: `claude-skills/*`
  - publish-testkit: `dotnet/BeckTech.QA.TestKit/**`

---

## NuGet Feed Contract

- **Feed:** DESTINI-Web (Azure Artifacts)
- **Auth:** NuGetAuthenticate@1 service task
- **Package name:** BeckTech.QA.TestKit (and .Playwright)
- **Version source:** \<Version\> in .csproj
- **Idempotency:** dotnet push --skip-duplicate

---

## Git Remote Contract (publish-claude-skills)

- **Remote:** shared-skills (registered in consumer repos)
- **Branch:** published-skills (exported subtree, disposable history)
- **Force-push:** Yes (history is not authoritative on published-skills)
