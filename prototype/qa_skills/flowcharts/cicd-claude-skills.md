# Flowchart — `publish-claude-skills.yml`

> Source: `publish-claude-skills.yml` (63 lines)
> Type: Azure DevOps Pipelines YAML
> Trigger: push to `master` touching `claude-skills/*`

## Pipeline flow

```mermaid
flowchart TD
    A([Push to master<br/>path: claude-skills/*]) --> B{pr: none}
    B -->|never on PR| C[checkout self<br/>fetchDepth: 0<br/>persistCredentials: true]
    C --> D[git config user.email/name<br/>= Build Service]
    D --> E{git show-ref<br/>refs/heads/published-skills}
    E -->|exists| F[git branch -D published-skills]
    E -->|absent| G[skip delete]
    F --> H
    G --> H[git subtree split<br/>--prefix=claude-skills<br/>-b published-skills]
    H --> I{LASTEXITCODE == 0?}
    I -->|no| Z1([Write-Error<br/>exit 1])
    I -->|yes| J[git push origin<br/>published-skills --force]
    J --> K{LASTEXITCODE == 0?}
    K -->|no| Z2([Write-Error<br/>exit 1])
    K -->|yes| L([Write-Output<br/>updated successfully])

    style A fill:#bbf,stroke:#333
    style L fill:#9f9,stroke:#333
    style Z1 fill:#f99,stroke:#333
    style Z2 fill:#f99,stroke:#333
```

## Step-level decisions

| Decision | Branch a | Branch b |
|---|---|---|
| Local `published-skills` exists? | delete with `branch -D` | continue |
| `git subtree split` exit code | non-zero → fail job | zero → push |
| `git push --force` exit code | non-zero → fail job | zero → success |

## Why force-push?

`published-skills` is a **projection** of `claude-skills/`, not an additive history. Every release recomputes the entire branch via `git subtree split` and overwrites the remote. Consumers `git subtree pull` from this branch, so they expect a flattened, rewritable history.
