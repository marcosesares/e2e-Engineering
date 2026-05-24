# CI/CD, Decisões

## ADR-007: PowerShell NuGet Glob Resolution

Decision: Use PowerShell Get-ChildItem (not shell glob) for .nupkg globbing in publish-testkit.yml.

Rationale: Shell glob depends on NuGet SDK version; PowerShell is platform-neutral.

Status: ✅

---

## ADR-009: CSPROJ Version as Release Source

Decision: NuGet package versions driven by \<Version\> in src/*.csproj, not Git tags or build numbers.

Rationale: Central authority in code; pipeline reads version once.

Status: ✅

---

## No PR Validation

Decision: Both pipelines disable PR validation (pr: none).

Rationale: Releases are post-merge only; PRs don't trigger builds.

Status: ✅
