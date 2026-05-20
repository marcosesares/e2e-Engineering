# ADR 004: Interactive Visualization Strategy

**Status:** Accepted  
**Decided:** Commit 7636770 ("feat: add interactive flowchart visualization and AGENTS.md")  
**Participants:** Ralph authors  
**Timestamp:** 2025 (inferred)

---

## Context

Ralph's loop is conceptually simple (4 steps: pick story → implement → test → commit). But for users **unfamiliar with autonomous agents**, the flow can seem magical.

Challenge:
- New users don't understand what Ralph does
- README alone can't convey the iterative flow
- Need a **visual, interactive** way to teach the loop

Decision: Build a **React-based flowchart** that steps through the Ralph loop visually, with annotations.

---

## Decision

**Create an interactive React SPA (flowchart/) that visualizes the Ralph loop step-by-step.**

Technology:
- **React 19** (modern, lightweight)
- **@xyflow/react** (node-link diagram library)
- **Vite** (fast bundler)
- **TypeScript** (type safety)
- **GitHub Pages** (free static hosting)

Features:
- 10-step diagram (Setup → Loop → Decision → Done)
- Color-coded phases (setup: blue, loop: gray, decision: yellow, done: green)
- Next/Previous/Reset buttons for navigation
- Animated edge transitions
- Annotated notes with code examples (e.g., prd.json structure)

Deployment:
- GitHub Actions workflow (`.github/workflows/deploy.yml`)
- Auto-builds on push to main
- Serves to GitHub Pages at `/ralph/` path

---

## Rationale

### Why a Visual Flowchart?
- **Engagement:** Interactive beats static docs
- **Clarity:** Flow is self-evident; no reading required
- **Onboarding:** New users understand Ralph in 2 minutes
- **Presentation:** Can use in talks/demos without explaining code

### Why React + @xyflow?
- **React:** Community support, JSX is clean, component-based
- **@xyflow:** Purpose-built for node-link diagrams; handles layout, dragging, animation
- **TypeScript:** Catch errors early; Self-documenting code
- **Vite:** Fast dev loop, minimal config

### Why GitHub Pages?
- **Free:** No hosting costs
- **Automatic:** Integrates with Actions CI/CD
- **Accessible:** Anyone can access via link
- **Verifiable:** Publicly visible source (github.com)

### Why 10 Steps?
- **Completeness:** Covers all phases (Setup, Loop, Decision, Exit)
- **Granularity:** Each step is actionable; not abstract
- **Learnable:** Human working memory (~5-7 items); 10 is stretch but within range
- **Flowchart conventions:** Matches standard flowchart templates

---

## Alternatives Considered

### Alternative 1: Static Diagram (PNG, SVG)
**Pros:**
- Simple to create once
- No build complexity

**Cons:**
- Not interactive
- Hard to update
- Can't explore at own pace
- Takes up space in docs

**Decision:** Rejected. Static doesn't teach as well.

---

### Alternative 2: Video Tutorial
**Pros:**
- Engaging, shows real execution
- Can narrate

**Cons:**
- Maintenance burden (re-record if flow changes)
- Not searchable
- Requires viewing time (not scannable)
- Hosting cost (YouTube mitigation)

**Decision:** Rejected. Interactive diagram is faster to consume.

---

### Alternative 3: ASCII Art Diagram in README
**Pros:**
- Zero dependencies
- Always in sync with repo

**Cons:**
- Not interactive
- ASCII art is dense and hard to follow
- Limited visual appeal
- Can't zoom/pan

**Decision:** Rejected. Too low-fidelity.

---

### Alternative 4: Diagram-as-Code (Mermaid, PlantUML)
**Pros:**
- Version-controlled; easy to edit
- Renderers exist for GitHub, Confluence
- Simple syntax

**Cons:**
- Not as interactive as React
- Limited customization (colors, layout)
- Mermaid/PlantUML rendering is server-side (GitHub-dependent)

**Decision:** Rejected. Want full client-side interactivity.

---

## Consequences

### Positive

✅ **Excellent onboarding.** New users understand Ralph in 2–3 minutes.  
✅ **Reproducible.** React code is in git; easy to update.  
✅ **Interactive.** Users explore at own pace (Next/Previous).  
✅ **Accessible.** Works offline (after first load); no external dependencies.  
✅ **Shareable.** Single link: "here's how Ralph works."  
✅ **Future-proof.** Can add more animations, step details as Ralph evolves.

### Negative

❌ **Build complexity.** Added vite, npm dependencies, GitHub Actions workflow.  
❌ **Maintenance burden.** If loop changes, must update flowchart code.  
❌ **JavaScript overhead.** React bundle adds ~50KB (gzipped).  
❌ **Requires npm install.** Developers must run `npm install` before local dev.

### Risks

🔴 **Risk:** Flowchart goes out of sync with actual ralph.sh loop.  
🔴 **Mitigation:** Add comment in App.tsx linking to ralph.sh steps. Make it obvious when updating.

🔴 **Risk:** GitHub Pages path is `/ralph/` (from index.html base path); confusing if users expect `/`.  
🔴 **Mitigation:** Document in README; keep index.html comment clear.

---

## Implementation Notes

### File Structure
```
flowchart/
  ├── src/
  │   ├── App.tsx        (main component, 380 lines)
  │   ├── App.css        (styling)
  │   ├── main.tsx       (React entry point)
  │   └── index.css      (global styles)
  ├── index.html         (base path: /ralph/)
  ├── package.json       (deps: React, @xyflow, TypeScript, ESLint)
  ├── vite.config.ts     (build config)
  └── tsconfig.*         (TypeScript config)
```

### Key Data Structures (App.tsx)

```typescript
type Phase = 'setup' | 'loop' | 'decision' | 'done';

const allSteps = [
  { id, label, description, phase },  // 10 steps
  ...
];

const phaseColors: Record<Phase, { bg, border }>;
const notes = [{ id, appearsWithStep, position, color, content }];
const edgeConnections = [{ source, target, sourceHandle, targetHandle, label }];
```

### UI Controls
- **Next:** Increment `visibleCount`, reveal next step + edges
- **Previous:** Decrement `visibleCount`, hide current step
- **Reset:** Set `visibleCount = 1`, clear user-dragged positions
- **Dragging:** @xyflow allows manual repositioning (persisted locally, not in git)

### Deployment
1. GitHub Actions (`.github/workflows/deploy.yml`) runs `npm run build` on push to main
2. Output committed to `gh-pages` branch
3. GitHub Pages serves from root of `gh-pages` branch → accessible at organization URL + `/ralph/`

---

## Related Decisions

- [[ADR 001: Stateless Agents]] — flowchart is tool-agnostic; works with Amp or Claude
- [[ADR 003: Branch-Isolated Runs]] — flowchart doesn't change per branch; same for all

---

## Validation

- ✅ Implemented and live (commit 7636770 onward)
- ✅ GitHub Actions deploy workflow verified
- ✅ Accessible at published URL
- ⚠️ No automated test that flowchart matches actual ralph.sh steps

---

## Future Enhancements

### Level 1: More Interactivity
- Click on a step to expand details
- Show code snippets for each phase
- Allow playback (auto-step through loop)

### Level 2: Simulation
- Add a simulated "story" to the flowchart
- Show what prd.json looks like after each step
- Demonstrate state transitions

### Level 3: Dynamic Documentation
- Embed flowchart directly in README (iframe)
- Version the flowchart per release (tag)
- Show link to live version in AGENTS.md

