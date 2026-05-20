# Ralph Project Inventory

**Generated:** 2026-05-20T00:00:00Z  
**Project:** Ralph  
**Primary Language:** TypeScript  
**Total Files:** ~310 (excluding node_modules, .git, test files)

---

## Directory Structure

### Root Level
```
ralph/
├── flowchart/                 # React + Vite interactive visualization
├── skills/                    # Custom skills for PRD management
├── .claude/                   # Claude Code configuration & skills
├── .agents/                   # Agent configuration
├── .github/                   # GitHub configuration
│   └── workflows/             # CI/CD pipelines
├── .reversa/                  # Reversa framework config
├── CLAUDE.md                  # Agent instructions for Claude Code
├── AGENTS.md                  # Agent learning documentation
├── README.md                  # Project documentation
├── prd.json.example           # PRD format reference
├── prompt.md                  # Amp prompt template
├── LICENSE                    # MIT License
└── ralph.sh                   # Main execution script
```

### flowchart/ (React Application)
```
flowchart/
├── src/
│   ├── App.tsx               # Main React component
│   ├── main.tsx              # React entry point
│   ├── index.css             # Global styles
│   └── assets/               # Static assets
├── public/                   # Public static files
├── index.html                # HTML template
├── package.json              # Dependencies for flowchart
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
├── eslint.config.js          # ESLint configuration
└── dist/                     # Build output (generated)
```

### skills/ (Custom Skills)
```
skills/
├── prd/                      # PRD generation skill
│   └── SKILL.md
└── ralph/                    # PRD to JSON conversion skill
    └── SKILL.md
```

### .claude/ & .agents/ (Reversa Skills)
Comprehensive Reversa framework with 40+ skills for:
- Code analysis (scout, archaeologist, detective, architect)
- Documentation generation (writer, reviewer)
- Migration planning (migrate, designer, translator)
- Architecture visualization (arquitetura-3d)
- And many more specialized agents

---

## File Statistics

| File Type | Count | Purpose |
|-----------|-------|---------|
| `.md` | 253 | Documentation, specs, skills |
| `.json` | 25 | Configuration, package manifests |
| `.yaml` | 10 | Workflow, configuration |
| `.py` | 8 | Reference/examples |
| `.tsx` | 2 | React components |
| `.ts` | 1 | TypeScript modules |
| `.js` | 1 | JavaScript modules |
| `.html` | 1 | HTML template |
| `.css` | 2 | Stylesheets |
| `.feature` | 2 | BDD test specifications |
| `.svg` | 2 | Vector graphics |
| `.sh` | 1 | Bash scripts |
| `.png` | 1 | Images |
| `.webp` | 1 | Images |

---

## Key Files & Roles

| File | Purpose | Type |
|------|---------|------|
| `ralph.sh` | Main execution loop spawning AI agents | Bash script |
| `prd.json` / `prd.json.example` | Task manifest for autonomous execution | JSON |
| `CLAUDE.md` | Instructions for Claude Code agent runner | Config |
| `AGENTS.md` | Learnings & patterns from previous runs | Documentation |
| `progress.txt` | Append-only progress log (if exists) | Log |
| `flowchart/package.json` | React + Vite dependencies | Config |
| `.github/workflows/deploy.yml` | GitHub Pages deployment pipeline | CI/CD |
| `flowchart/vite.config.ts` | Vite build configuration for flowchart | Config |
| `flowchart/tsconfig.json` | TypeScript compiler settings | Config |

---

## Languages Detected

1. **TypeScript** (Primary)
   - Extensions: `.ts`, `.tsx`
   - File count: 3
   - Primary framework: React, Vite

2. **JavaScript**
   - Extensions: `.js`, `.mjs`
   - File count: ~30 (mostly config files)
   - Package managers, build tools

3. **YAML**
   - Extensions: `.yaml`, `.yml`
   - File count: 10
   - Workflow definitions, configuration

4. **Markdown**
   - Extensions: `.md`
   - File count: 253
   - Extensive documentation & skills

5. **JSON**
   - Extensions: `.json`
   - File count: 25
   - Configuration files, package manifests

6. **CSS**
   - Extensions: `.css`
   - File count: 2
   - Application styling

---

## Technologies & Frameworks

### Frontend
- **React** 19.2.0 — UI framework
- **React DOM** 19.2.0 — React renderer
- **@xyflow/react** 12.10.0 — Flowchart visualization library
- **Vite** 7.2.4 — Build tool & dev server
- **TypeScript** ~5.9.3 — Language

### Development
- **ESLint** 9.39.1 — Linter
- **@types/react** 19.2.5 — Type definitions
- **@vitejs/plugin-react** 5.1.1 — React plugin for Vite

### Build & Deployment
- **npm** — Package manager
- **GitHub Actions** — CI/CD platform
- **GitHub Pages** — Hosting for flowchart

---

## Entry Points

1. **Web UI:** `flowchart/src/main.tsx`
   - React component entry point
   - Mounts to `#root` element
   - Uses StrictMode for development warnings

2. **Execution Script:** `ralph.sh`
   - Bash entry point for agent loop
   - Spawns new AI agent instances
   - Manages PRD iteration cycle

3. **HTML Template:** `flowchart/index.html`
   - Static HTML host for React app
   - Base path: `/ralph/` (GitHub Pages)

---

## Configuration Files

- `flowchart/package.json` — Dependencies, scripts, project metadata
- `flowchart/tsconfig.json` — TypeScript compiler options
- `flowchart/tsconfig.app.json` — App-specific TS config
- `flowchart/tsconfig.node.json` — Build tools TS config
- `flowchart/vite.config.ts` — Vite build & dev configuration
- `flowchart/eslint.config.js` — ESLint rules & configuration
- `.gitignore` — Git exclusions
- `package-lock.json` (in flowchart/) — Dependency lock file
- `.claude-plugin/marketplace.json` — Claude Code marketplace plugin config
- `.claude-plugin/plugin.json` — Plugin metadata

---

## CI/CD Pipeline

**File:** `.github/workflows/deploy.yml`

**Trigger:**
- Push to `main` branch
- Manual trigger via `workflow_dispatch`

**Stages:**
1. **Build**
   - Checkout code (v4)
   - Setup Node.js 20
   - Install dependencies via npm ci
   - Build with `npm run build` (TypeScript compilation + Vite bundling)
2. **Deploy**
   - Configure GitHub Pages
   - Upload artifact from `flowchart/dist`
   - Deploy to GitHub Pages

**Output:** Deployed to GitHub Pages at `/ralph/` path

---

## Development Scripts

```bash
npm run dev        # Start Vite dev server (HMR enabled)
npm run build      # TypeScript + Vite production build
npm run lint       # ESLint check
npm run preview    # Preview production build locally
```

---

## Database & Storage

**Status:** No database present  
**Reason:** Ralph is a framework/tool project, not a data-driven application  
**Storage:** Uses Git for version control and state management

---

## Testing Infrastructure

**Test Framework Hints:**
- `.feature` files detected (2 files) — suggests BDD testing capability
- No Jest/Vitest configuration found in root
- Testing likely handled per-module or via external CI/CD

---

## External Integrations

1. **GitHub Actions** — Workflow automation
2. **GitHub Pages** — Static site hosting
3. **npm Registry** — Dependency management
4. **Claude Code / Amp** — AI agent runtimes

---

## Documentation Artifacts

- `README.md` — Project overview, setup, usage guide
- `CLAUDE.md` — Agent instructions for Claude Code automation
- `AGENTS.md` — Learnings and patterns from agent iterations
- `prompt.md` — Prompt template for Amp agent runner
- `prd.json.example` — Example PRD structure
- `ralph.sh` — Executable documentation via comments
- 250+ markdown files in `.claude/` & `.agents/` — Reversa framework documentation

---

## Key Observations

1. **Monorepo Structure:** Root-level orchestration with specialized `flowchart/` submodule
2. **Documentation-Heavy:** 253 markdown files indicate extensive knowledge capture
3. **Framework as Product:** Ralph itself is the product; no application backend
4. **AI-Native Design:** Built explicitly for autonomous agent execution
5. **Reversa Integration:** Comprehensive Reversa framework installed for legacy code analysis
6. **No Database:** Stateless tool; relies on Git + file system
7. **GitHub Pages Deployment:** Static site hosting for interactive flowchart

