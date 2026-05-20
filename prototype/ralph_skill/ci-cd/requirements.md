# CI/CD — Requirements

## Overview

GitHub Actions workflow for automated build and deployment of Ralph's flowchart SPA to GitHub Pages. Trigger on main branch push or manual workflow_dispatch. Two-stage pipeline: Build (compile TypeScript + bundle with Vite) → Deploy (upload dist/ artifact to GitHub Pages).

## Responsibilities

- Trigger on push to main or manual workflow_dispatch
- Checkout code and setup Node.js environment
- Install dependencies via npm ci
- **Run lint** (`npm run lint`) — enforced gate (resolved Q3)
- **Run tests** (`npm run test` when test suite exists) — enforced gate (resolved Q3)
- Compile TypeScript (typecheck via `npm run build`)
- Bundle SPA with Vite (minified production build)
- Upload build artifacts (dist/) to GitHub Pages
- Report build success/failure

## Business Rules

- Build only on main branch (not feature branches) 🟢
- Node 20.x is LTS and stable for this project 🟢
- npm ci used instead of npm install (CI best practice) 🟢
- Build artifacts cached (npm dependencies) to reduce CI time 🟢
- GitHub Pages deployment uses official GitHub action 🟢
- Base path for site is `/ralph/` (from Vite config) 🟢
- **CI is the enforced quality gate** — `npm run lint` and `npm run test` (when present) MUST pass before deploy 🟢 (Q3)
- Lint/test failures BLOCK deployment to GitHub Pages 🟢 (Q3)
- Defense-in-depth: agent also runs lint/test locally (advisory), CI re-runs (enforced). Independent verification. 🟢 (Q3)

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| RF-01 | Trigger workflow on push to main | Must | Workflow starts within 1 minute of push |
| RF-02 | Trigger workflow on manual dispatch | Must | User can click "Run workflow" in GitHub UI; workflow starts |
| RF-03 | Setup Node.js 20 | Must | Node v20.x installed; `node --version` shows 20.x |
| RF-04 | Install dependencies with npm ci | Must | All npm packages installed from package-lock.json |
| RF-05 | Compile TypeScript | Must | `npm run build` executes tsc; reports errors if type mismatches |
| RF-06 | Bundle with Vite | Must | `npm run build` bundles to `flowchart/dist/` directory |
| RF-07 | Upload dist/ to GitHub Pages | Must | GitHub Pages deployment action triggered; site live at repo URL |
| RF-08 | Cache npm dependencies | Should | npm cache used on subsequent runs; faster CI (skip download) |
| RF-09 | Report build status | Should | GitHub Actions UI shows pass/fail; status badge available |
| RF-10 | Notify on failure | Could | Email or Slack notification on build failure |
| RF-11 | **Run `npm run lint`** | Must | ESLint executed before bundle step; non-zero exit blocks deploy. (Q3) |
| RF-12 | **Run `npm run test`** when test script exists | Must | If `package.json` defines `test` script and is not a placeholder, run it; non-zero exit blocks deploy. (Q3) |

## Non-Functional Requirements

| Type | Requirement | Evidence | Confidence |
|------|-----------|----|---|
| Speed | Total build time < 5 minutes | Typical npm ci + vite build on modern CI | 🟡 |
| Reliability | 99.5% uptime (GitHub Actions status) | GitHub SLA | 🟢 |
| Security | No secrets in logs; token isolation | GitHub Actions token management | 🟢 |
| Artifact retention | Build artifacts kept for 90 days | GitHub Actions default | 🟢 |

## Acceptance Criteria

```gherkin
Scenario: Push to main triggers build
  Given developer pushes commit to main branch
  When GitHub Actions detects push
  Then workflow starts within 1 minute
  And Build job runs: install deps, compile, bundle
  And Deploy job uploads dist/ to GitHub Pages
  And site live at https://[user].github.io/ralph/

Scenario: Build fails on TypeScript error
  Given developer pushes code with type error
  When npm run build executes
  Then TypeScript compilation fails
  And workflow marked as failed (red X in GitHub UI)
  And no deployment to GitHub Pages

Scenario: Manual workflow dispatch
  Given user navigates to GitHub Actions tab
  When user clicks "Run workflow" button
  Then workflow starts with main branch code
  And same build → deploy sequence executed
  And site updated (if successful)

Scenario: Node version compatibility
  Given workflow installs Node 20.x
  When npm run build executes
  Then dependencies compatible with Node 20.x
  And no deprecation warnings for modern npm features
```

## Priority (MoSCoW)

| Requirement | MoSCoW | Justification |
|---|---|---|
| Trigger on main + build + deploy | Must | Core CI/CD; without this, no automation |
| Node 20, npm ci | Must | Standard practice for Node projects |
| TypeScript compilation | Must | Prevent type errors from reaching prod |
| Vite bundling | Must | Minify and optimize assets for performance |
| GitHub Pages deploy | Must | Deliver site to users |
| npm caching | Should | Performance optimization; nice-to-have |
| Failure notification | Could | Useful for alerting; not blocking |

## Code Traceability

| File | Section | Coverage |
|-----|---------|----------|
| `.github/workflows/deploy.yml` | Full workflow definition | 🟢 |
| `flowchart/package.json` | Scripts (build, dev, lint) | 🟢 |
| `flowchart/vite.config.ts` | Build configuration | 🟢 |
| `flowchart/tsconfig.json` | TypeScript compilation settings | 🟢 |

## Resolved Gaps (was 🔴, now 🟢 after user validation 2026-05-19)

- ✅ **Lint/test gates:** Resolved (Q3). RF-11 + RF-12 add enforced lint + test steps to the workflow before bundle/deploy.
- ✅ **Conditional deployment:** Resolved (Q3). Deployment is conditional on lint + test + build all passing.

## Outstanding Gaps (🟡 — non-blocking, future enhancements)

- **Rollback mechanism:** No automated rollback if deployment causes issues. Manual `git revert` + push required.
- **Canary deployment:** No staged rollout (deploy to staging first, then prod).
- **Performance monitoring:** No tracking of site performance metrics (Lighthouse, WebVitals).
- **Secrets management:** No support for sensitive env vars (API keys, tokens).
