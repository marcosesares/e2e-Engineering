# CI/CD — Design

## Workflow File

**Location:** `.github/workflows/deploy.yml`

**Trigger:**
```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:  # Manual trigger
```

## Pipeline Stages

### Stage 1: Build

**Runs on:** ubuntu-latest

**Steps:**
1. **Checkout code**
   ```yaml
   uses: actions/checkout@v4
   ```

2. **Setup Node 20**
   ```yaml
   uses: actions/setup-node@v4
   with:
     node-version: '20'
     cache: 'npm'
   ```
   → Installs Node v20, npm, and enables npm cache

3. **Install dependencies**
   ```bash
   cd flowchart
   npm ci
   ```
   → npm ci (not npm install) for reproducible installs

4. **Lint** (Q3 — enforced gate)
   ```bash
   cd flowchart
   npm run lint
   ```
   → Executes ESLint on `src/`
   → Non-zero exit blocks deploy

5. **Test** (Q3 — enforced gate, when test script exists)
   ```bash
   cd flowchart
   npm run test --if-present
   ```
   → `--if-present` skips silently if no `test` script defined
   → Non-zero exit blocks deploy when script exists

6. **Build**
   ```bash
   npm run build
   ```
   → Executes `tsc` (TypeScript compile) + `vite build` (bundle)
   → Output: `flowchart/dist/`

7. **Upload artifact**
   ```yaml
   uses: actions/upload-artifact@v4
   with:
     name: dist
     path: flowchart/dist/
   ```

### Stage 2: Deploy

**Runs on:** ubuntu-latest (separate job)

**Depends on:** Build (needs: build)

**Steps:**
1. **Download artifact from Build stage**
   ```yaml
   uses: actions/download-artifact@v4
   with:
     name: dist
   ```

2. **Deploy to GitHub Pages**
   ```yaml
   uses: peaceiris/actions-gh-pages@v3
   with:
     github_token: ${{ secrets.GITHUB_TOKEN }}
     publish_dir: ./flowchart/dist
   ```

   → Pushes dist/ to gh-pages branch
   → GitHub Pages automatically serves from that branch

## Environment

**Node version:** 20.x (LTS)

**npm cache:** Automatically managed by setup-node action

**GitHub token:** Built-in ${{ secrets.GITHUB_TOKEN }} (no manual secret needed)

**Base path:** `/ralph/` (configured in `flowchart/vite.config.ts` → should match repo name)

## Deployment Flow

```
Commit pushed to main
  ↓
GitHub Actions detects push
  ↓
Checkout code
  ↓
Setup Node 20 + npm cache
  ↓
npm ci → install dependencies
  ↓
npm run lint → ESLint check (BLOCKS on failure)
  ↓
npm run test --if-present → run tests if defined (BLOCKS on failure)
  ↓
npm run build → compile + bundle → dist/
  ↓
Upload dist/ artifact
  ↓
Download artifact
  ↓
Deploy to GitHub Pages (push to gh-pages branch)
  ↓
Site live at https://[user].github.io/ralph/
```

## Build Scripts (flowchart/package.json)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src/",
    "preview": "vite preview"
  }
}
```

**The `build` script:**
- `tsc`: TypeScript type-check (no emit; purely validation)
- `vite build`: Bundle for production (minify, tree-shake, optimize)

## Vite Configuration (flowchart/vite.config.ts)

**Key settings:**
```typescript
export default defineConfig({
  base: '/ralph/',          // Base path for deployed site
  build: {
    target: 'ES2020',        // Target modern browsers
    outDir: 'dist',          // Output directory
    minify: 'terser'         // Minify JS
  }
})
```

## Design Decisions

| Decision | Rationale | Confidence |
|----------|-----------|-----------|
| npm ci instead of npm install | CI best practice; locked versions from package-lock.json | 🟢 |
| Separate Build/Deploy jobs | Build produces artifact; Deploy uses artifact; clear separation | 🟢 |
| Node 20 LTS | Stable, widely-supported, matches project's target | 🟢 |
| npm cache via setup-node | Built-in action; reduces CI time; simple | 🟢 |
| Base path /ralph/ | Matches GitHub repo URL structure | 🟢 |
| No conditional deploy | Always deploy if build succeeds (simple, safe) | 🟡 |

## Risks & Gaps

- 🔴 **No rollback:** If deployment breaks site, no automated rollback. Must revert commit + push.
- 🔴 **No staging environment:** Deploy directly to production (GitHub Pages).
- 🟡 **Cache invalidation:** Browser caching may serve old assets; need versioning or cache-busting.
- 🟡 **Performance monitoring:** No metrics on site performance (Lighthouse, WebVitals).
- 🟡 **Secrets management:** No env vars for API keys, feature flags, etc. (if needed in future).
