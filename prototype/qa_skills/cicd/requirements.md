# CI/CD Pipelines Module

## Overview

Two Azure DevOps YAML pipelines: publish-claude-skills.yml (git subtree split → published-skills branch), publish-testkit.yml (build/test/pack NuGet packages).

## Responsibilities

- Publish claude-skills/ to published-skills branch on each push to master 🟢
- Build, test, pack, push BeckTech.QA.TestKit NuGet packages on master push 🟢
- Gate releases: path filters, no PR validation, idempotency 🟢

## Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| RF-01 | publish-claude-skills.yml runs git subtree split; force-pushes published-skills branch | Must |
| RF-02 | publish-testkit.yml builds .NET, runs tests, pushes .nupkg to DESTINI-Web feed | Should |
| RF-03 | Both pipelines run only on master (not PRs) | Must |
| RF-04 | Path filters prevent unnecessary runs | Should |
| RF-05 | publish-testkit is idempotent at same version (--skip-duplicate) | Should |

---

## Code Traceability

| File | Lines | Role |
|------|-------|------|
| publish-claude-skills.yml | 63 | Subtree publisher |
| publish-testkit.yml | 87 | NuGet publisher |
