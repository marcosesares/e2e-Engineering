# ADR-007: Enumerate .nupkg with Get-ChildItem Instead of Shell Glob

- **Status:** Active
- **Date:** 2026-05-07 (PR 14547, build failure 50713)
- **Confidence:** 🟢 CONFIRMADO (PR description, `publish-testkit.yml:81-86`)

## Contexto

The initial `publish-testkit.yml` used `dotnet nuget push *.nupkg` inside a PowerShell inline step. Pipeline build 50713 failed at the push step with `error: File does not exist (D:\a\1\a/nuget/*.nupkg)`. The prior `CopyFiles` step had successfully staged the packages. The root cause was that PowerShell single-quoted strings do not expand globs, and `pwsh` does not auto-glob native command arguments (unlike bash). Whether `dotnet nuget push` expands the wildcard internally depends on the NuGet SDK patch version — `9.0.313` (installed by `UseDotNet@2`) treats `*.nupkg` as a literal path.

## Decisão

Replace `dotnet nuget push *.nupkg` with:
```powershell
$packages = Get-ChildItem -Filter *.nupkg
if ($packages.Count -eq 0) { throw "No packages found" }
foreach ($p in $packages) {
    dotnet nuget push $p.FullName -k az --skip-duplicate
    if ($LASTEXITCODE -ne 0) { throw "Push failed" }
}
```

Pass concrete resolved paths to `dotnet nuget push`. Add explicit guards: throw on empty result, throw on non-zero exit.

## Alternativas Consideradas

| Alternative | Reason Rejected |
|-------------|-----------------|
| **Double-quoted string glob `"*.nupkg"`** | Still a literal string in PowerShell — `pwsh` does not expand globs in native command arguments regardless of quoting. | 🟢 |
| **Use bash step instead of pwsh** | Would work (bash expands globs), but inconsistent with other pipeline steps and team's PowerShell convention. | 🟡 |
| **Use `dotnet nuget push` with `-s` and directory** | Directory-level push not supported by `dotnet nuget push` v3 CLI. | 🟡 |
| **Pin to an older SDK that expanded globs** | Would create a dependency on SDK version behavior — exactly the problem being fixed. | 🟢 |

## Consequências

**Positivas:**
- Eliminates dependency on NuGet CLI glob expansion behavior across SDK patch versions.
- Explicit empty-result guard catches staging failures early.
- Explicit exit code check catches silent push failures.
- `--skip-duplicate` semantics preserved for idempotent re-runs.

**Negativas / Trade-offs:**
- Slightly more verbose pipeline step.
- If the number of packages grows, the loop is still correct but slightly slower than a single bulk push call.
