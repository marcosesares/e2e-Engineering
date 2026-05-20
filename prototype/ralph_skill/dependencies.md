# Ralph Project Dependencies

**Generated:** 2026-05-20T00:00:00Z  
**Package Manager:** npm (Node.js)  
**Node Version (CI):** 20.x LTS

---

## Production Dependencies

### flowchart/package.json

| Package | Version | Purpose | Type |
|---------|---------|---------|------|
| `@xyflow/react` | ^12.10.0 | Flowchart visualization library | UI |
| `react` | ^19.2.0 | React framework | UI |
| `react-dom` | ^19.2.0 | React DOM renderer | UI |

**Total Production Dependencies:** 3

---

## Development Dependencies

### flowchart/package.json

| Package | Version | Purpose | Type |
|---------|---------|---------|------|
| `@eslint/js` | ^9.39.1 | ESLint configuration | Linting |
| `@types/node` | ^24.10.1 | Node.js type definitions | Types |
| `@types/react` | ^19.2.5 | React type definitions | Types |
| `@types/react-dom` | ^19.2.3 | React DOM type definitions | Types |
| `@vitejs/plugin-react` | ^5.1.1 | React plugin for Vite | Build |
| `eslint` | ^9.39.1 | JavaScript linter | Linting |
| `eslint-plugin-react-hooks` | ^7.0.1 | ESLint rules for React Hooks | Linting |
| `eslint-plugin-react-refresh` | ^0.4.24 | ESLint rules for React Fast Refresh | Linting |
| `globals` | ^16.5.0 | Global variable definitions | Utilities |
| `typescript` | ~5.9.3 | TypeScript compiler | Language |
| `typescript-eslint` | ^8.46.4 | TypeScript support for ESLint | Linting |
| `vite` | ^7.2.4 | Build tool & dev server | Build |

**Total Development Dependencies:** 12

---

## System Dependencies (CI/CD)

| Tool | Version | Source | Purpose |
|------|---------|--------|---------|
| Node.js | 20.x | GitHub Actions setup-node@v4 | Runtime |
| npm | (latest) | Bundled with Node 20 | Package manager |
| GitHub Actions | (latest) | `.github/workflows/deploy.yml` | CI/CD platform |

---

## Dependency Hierarchy

```
flowchart (React App)
├── @xyflow/react@12.10.0
│   └── react@19.2.0 (peer)
├── react@19.2.0 (primary)
│   └── (core runtime)
├── react-dom@19.2.0
│   └── react@19.2.0 (peer)
├── vite@7.2.4 (build time)
│   ├── @vitejs/plugin-react@5.1.1
│   └── typescript@5.9.3
├── eslint@9.39.1 (dev time)
│   ├── @eslint/js@9.39.1
│   ├── typescript-eslint@8.46.4
│   ├── eslint-plugin-react-hooks@7.0.1
│   └── eslint-plugin-react-refresh@0.4.24
└── TypeScript@~5.9.3
    └── @types/* (all type packages)
```

---

## Version Strategy

| Package | Strategy | Rationale |
|---------|----------|-----------|
| `react` | Caret (^19.2.0) | Minor version updates safe |
| `react-dom` | Caret (^19.2.0) | Minor version updates safe |
| `@xyflow/react` | Caret (^12.10.0) | Minor updates expected |
| `vite` | Caret (^7.2.4) | Minor updates for features |
| `typescript` | Tilde (~5.9.3) | Lock to 5.9.x, restrict major |
| `eslint` | Caret (^9.39.1) | Minor updates for rules |
| Others | Caret (^...) | Standard semver pinning |

---

## Installation & Caching

**CI/CD Strategy** (`.github/workflows/deploy.yml`):
- Cache key: `npm` cache with path `flowchart/package-lock.json`
- Install: `npm ci` (clean install from lockfile)
- **Rationale:** Reproducible builds, exact dependency versions

**Development Setup**:
```bash
cd flowchart
npm install              # Install from package-lock.json
npm run dev             # Start dev server (HMR enabled)
npm run build           # Production build
npm run lint            # Run ESLint
```

---

## Build Artifacts & Output

| Source | Output | Size |
|--------|--------|------|
| `flowchart/src/` (TypeScript + CSS) | `flowchart/dist/` | TBD (after build) |
| `flowchart/public/` (static assets) | `flowchart/dist/` | TBD |

**Build Process:**
1. TypeScript compilation (`tsc -b`)
2. Vite bundling with React plugin
3. Output to `dist/` folder
4. Uploaded to GitHub Pages as artifact

---

## Known Compatibility

### Peer Dependencies
- React 19.2.0 is required by `@xyflow/react` (satisfied)
- TypeScript ~5.9.x is recommended for type safety

### Node Version Compatibility
- **Min Node:** 18.x (Vite 7 requires Node 18+)
- **CI Node:** 20.x LTS (used in GitHub Actions)
- **Latest:** 22.x available, not yet tested

### Browser Compatibility (Vite Default)
- Modern browsers (ES2020 target)
- No IE11 support (default Vite configuration)

---

## Security Considerations

| Package | Risk | Notes |
|---------|------|-------|
| `@xyflow/react` | Low | Well-maintained, stable |
| `react` | Low | Well-maintained, widely used |
| `vite` | Low | Well-maintained, widely used |
| `eslint` | Low | Well-maintained |

**Update Cadence:** No active security advisories as of 2026-05-20  
**Recommendation:** Monitor for updates quarterly via `npm audit`

---

## Optional Dependencies

| Package | Why Not Used | Reason |
|---------|--------------|--------|
| Next.js | Not used | Vite sufficient for static SPA |
| tailwindcss | Not used | Custom CSS adequate |
| Jest / Vitest | Not used | Framework focus, no unit tests |
| React Query | Not used | No API calls (static content) |

---

## Reversa Framework Dependencies (External)

Ralph includes the Reversa framework (installed in `.claude/` & `.agents/`):
- **Version:** 1.2.43 (from `.reversa/version`)
- **Status:** Installed and configured
- **Purpose:** Legacy code analysis capabilities
- **Not in package.json:** Installed separately via Reversa installer

---

## Summary

- **3 runtime dependencies** (React ecosystem)
- **12 dev dependencies** (linting, types, build)
- **Lightweight footprint** — no backend/database libraries
- **Modern stack** — React 19, Vite 7, TypeScript 5.9
- **Well-maintained** — all packages actively developed
- **Zero database** — file-based + Git for persistence

