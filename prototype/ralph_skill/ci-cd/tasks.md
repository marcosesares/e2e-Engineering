# CI/CD — Tasks

## Prerequisites

- [ ] GitHub repository created with Actions enabled
- [ ] GitHub Pages enabled in repo settings
- [ ] `flowchart/package.json` has `build` script
- [ ] `flowchart/vite.config.ts` configured with base path `/ralph/`
- [ ] `.github/workflows/` directory exists

## Tasks

- [ ] **T-01: Create deploy.yml workflow file**
  - Origin: `.github/workflows/deploy.yml` (entire file)
  - Write YAML with on: push + workflow_dispatch triggers
  - Criterion: File created; valid YAML syntax
  - Confidence: 🟢

- [ ] **T-02: Configure Build job (checkout)**
  - Origin: `.github/workflows/deploy.yml` → jobs → build → steps[0]
  - Use actions/checkout@v4; checkout main branch
  - Criterion: Code checked out; git history available
  - Confidence: 🟢

- [ ] **T-03: Configure Build job (setup Node)**
  - Origin: `.github/workflows/deploy.yml` → jobs → build → steps[1]
  - Use actions/setup-node@v4 with node-version: '20', cache: 'npm'
  - Criterion: Node 20.x installed; npm cache enabled
  - Confidence: 🟢

- [ ] **T-04: Configure Build job (install dependencies)**
  - Origin: `.github/workflows/deploy.yml` → jobs → build → steps[2]
  - Run: `cd flowchart && npm ci`
  - Criterion: All npm packages installed from package-lock.json
  - Confidence: 🟢

- [ ] **T-05a: Configure Build job (lint)** — Q3
  - Origin: `.github/workflows/deploy.yml` → jobs → build → steps[3]
  - Run: `cd flowchart && npm run lint`
  - Criterion: ESLint executes; non-zero exit fails the job and blocks deploy
  - Confidence: 🟢

- [ ] **T-05b: Configure Build job (test)** — Q3
  - Origin: `.github/workflows/deploy.yml` → jobs → build → steps[4]
  - Run: `cd flowchart && npm run test --if-present`
  - Criterion: When `test` script defined, runs it; non-zero exit fails the job. When absent, step is no-op.
  - Confidence: 🟢

- [ ] **T-05: Configure Build job (build)**
  - Origin: `.github/workflows/deploy.yml` → jobs → build → steps[5]
  - Run: `cd flowchart && npm run build`
  - Criterion: TypeScript compiles; Vite bundles; dist/ created
  - Confidence: 🟢

- [ ] **T-06: Configure Build job (upload artifact)**
  - Origin: `.github/workflows/deploy.yml` → jobs → build → steps[6]
  - Use actions/upload-artifact@v4; upload dist/
  - Criterion: Artifact named "dist"; path: flowchart/dist/
  - Confidence: 🟢

- [ ] **T-07: Configure Deploy job (download artifact)**
  - Origin: `.github/workflows/deploy.yml` → jobs → deploy → steps[0]
  - Use actions/download-artifact@v4; download "dist"
  - Criterion: Artifact downloaded to working directory
  - Confidence: 🟢

- [ ] **T-08: Configure Deploy job (GitHub Pages)**
  - Origin: `.github/workflows/deploy.yml` → jobs → deploy → steps[1]
  - Use peaceiris/actions-gh-pages@v3; push dist/ to gh-pages branch
  - Criterion: GitHub Pages deployment triggered; site live
  - Confidence: 🟡

- [ ] **T-09: Set Deploy job dependency on Build**
  - Origin: `.github/workflows/deploy.yml` → jobs → deploy → needs
  - Add: needs: build
  - Criterion: Deploy waits for Build completion before starting
  - Confidence: 🟢

- [ ] **T-10: Enable GitHub Pages in repo settings**
  - Origin: GitHub repo Settings → Pages
  - Configure: source = gh-pages branch, deploy from root
  - Criterion: GitHub Pages enabled; URL shows https://[user].github.io/ralph/
  - Confidence: 🟢

- [ ] **T-11: Verify Vite base path configuration**
  - Origin: `flowchart/vite.config.ts` → base: '/ralph/'
  - Confirm base path matches repo name
  - Criterion: Base path set correctly; site assets load from /ralph/
  - Confidence: 🟢

- [ ] **T-12: Verify npm build script**
  - Origin: `flowchart/package.json` → scripts → build
  - Confirm: "build": "tsc && vite build"
  - Criterion: Script compiles TypeScript, then bundles with Vite
  - Confidence: 🟢

## Test Tasks

- [ ] **TT-01: Trigger workflow on main push**
  - Make commit to main branch
  - Expected: GitHub Actions workflow starts within 1 minute
  - Confidence: 🟢

- [ ] **TT-01a: Lint failure blocks deploy** — Q3
  - Introduce ESLint violation in `flowchart/src/`
  - Push to main
  - Expected: Workflow fails at `npm run lint` step; deploy job skipped
  - Confidence: 🟢

- [ ] **TT-01b: Test failure blocks deploy** — Q3
  - (When test script exists) introduce failing assertion
  - Push to main
  - Expected: Workflow fails at `npm run test --if-present`; deploy job skipped
  - Confidence: 🟢

- [ ] **TT-02: Build succeeds**
  - Verify Build job completes (green checkmark)
  - Expected: TypeScript compiles without errors; Vite bundles successfully
  - Confidence: 🟢

- [ ] **TT-03: Deploy succeeds**
  - Verify Deploy job completes
  - Expected: Site live at https://[user].github.io/ralph/
  - Confidence: 🟡

- [ ] **TT-04: Manual workflow dispatch**
  - Navigate to GitHub Actions tab; click "Run workflow"
  - Expected: Workflow starts without pushing; same build → deploy executed
  - Confidence: 🟢

- [ ] **TT-05: Build fails on TypeScript error**
  - Introduce type error in src/ code
  - Push to main
  - Expected: Workflow fails at "npm run build" step (red X)
  - Confidence: 🟢

## Tasks Order

1. **T-01 → T-09:** Configure workflow YAML — sequential
2. **T-10 → T-12:** Verify environment — sequential, independent
3. **TT-01 → TT-05:** Integration tests — after workflow created

**Suggested sequence:** T-01 → T-02 → T-03 → T-04 → **T-05a → T-05b** → T-05 → T-06 → T-07 → T-08 → T-09 → T-10 → T-11 → T-12 → TT-01 → **TT-01a → TT-01b** → TT-02 → TT-03 → TT-04 → TT-05

## Open Gaps (🔴)

- **Rollback procedure:** No automated rollback on failed deployment. Manual process only.
- **Canary/staged deployment:** Always deploy to production immediately (no staging).
- **Build caching:** Could cache Vite build artifacts across runs (future optimization).
- **Notification on failure:** No Slack/email alert if workflow fails.
- **Cache busting:** No versioning strategy for assets (may serve stale JS/CSS).
