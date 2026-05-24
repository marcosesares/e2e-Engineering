# ADR-009: csproj <Version> as NuGet Release Version Source (Not Git Tags)

- **Status:** Active
- **Date:** 2026-05-07 (PR 14513)
- **Confidence:** 🟢 CONFIRMADO (`publish-testkit.yml:1-9` header comment, `src/*.csproj`)

## Contexto

The `publish-testkit.yml` pipeline needs to determine which version to publish for `BeckTech.QA.TestKit` and `BeckTech.QA.TestKit.Playwright`. Several release versioning strategies are possible.

## Decisão

Use `<Version>x.y.z</Version>` in each `src/*.csproj` file as the canonical release version source. `GeneratePackageOnBuild=true` in each `.csproj` produces `.nupkg` files automatically during `dotnet build`. The version is encoded directly in the package filename — no runtime lookup needed.

`--skip-duplicate` on `dotnet nuget push` makes same-version re-runs idempotent (no-op if version already exists on DESTINI-Web feed).

## Alternativas Consideradas

| Alternative | Reason Rejected |
|-------------|-----------------|
| **Git tags (`v1.0.0`)** | Requires an extra tagging step in the release workflow; tags can be created on wrong commits; adds overhead for small internal tooling packages. | 🟡 |
| **Build number as version (`1.0.$(Build.BuildId)`)** | Always increments — every build is a new release regardless of actual code changes. Feed gets polluted with trivial versions. | 🟢 |
| **Semantic release automation** | Overkill for an internal framework package. Requires additional tooling configuration. | 🟡 |
| **Manually specified pipeline parameter** | Would require manual input for each release — error-prone and not automated. | 🟡 |

## Consequências

**Positivas:**
- Version is self-contained in the csproj — no external version file or tag lookup needed.
- `--skip-duplicate` makes re-runs safe; pipeline can be re-triggered without side effects.
- Version is visible in source control history (csproj change = version bump intent).
- Stateless pipeline — no version state stored outside the source tree.

**Negativas / Trade-offs:**
- Version must be manually bumped in the csproj before each release — no automation.
- Forgetting to bump means a re-run produces a no-op push (silently publishes the same version).
- Two packages (`TestKit` and `TestKit.Playwright`) have independent `<Version>` fields — they can drift out of sync.
