# PRD Management — Architecture Decisions

## ADR-1: Two-Skill Architecture (PRD Generator + Ralph Converter)

**Status:** ACCEPTED 🟢

**Problem:** Should PRD creation and JSON conversion be a single skill or two separate skills?

**Context:**
- PRD writing and validation are different concerns
- Some users may already have markdown PRDs and only need conversion
- Some users may start fresh and need both steps
- Two skills allow modular testing and independent updates

**Decision:** Implement as two separate Claude Code skills:
- `/prd` — PRD Generator: markdown creation
- `/ralph` — Ralph Converter: JSON transformation

**Rationale:**
- **Modularity:** Each skill has one job; easier to test and extend
- **Reusability:** Users can use converter on existing PRDs without generator
- **User choice:** Explicit invocation; user controls flow

**Consequences:**
- User must run two commands in sequence (minor friction)
- But user gains flexibility (can edit markdown between steps if needed)
- Skill can be updated independently

---

## ADR-2: Story Size Heuristic (2-3 Sentences)

**Status:** ACCEPTED 🟡

**Problem:** How to ensure each story fits in one Claude context window?

**Context:**
- Ralph spawns fresh agent per iteration with limited context
- No dynamic context window measurement available
- Need simple, deterministic rule

**Decision:** Use heuristic: **If a story cannot be described in 2-3 sentences, it is too large.**

**Rationale:**
- **Empirical:** 2-3 sentence story ≈ 150-250 words → ~500 tokens → leaves 90%+ context for implementation
- **Simple:** Easy for humans to apply; no tooling needed
- **Coercive:** Forces story decomposition (prevents monolithic stories)

**Consequences:**
- Some complex stories may genuinely need 4+ sentences (gap 🟡)
- Converter can warn but cannot auto-split (user decides)
- Risk of false positives (dense 2-sentence story may still be too big)

**Alternative considered:** Dynamic token counting — rejected (requires API access, non-deterministic)

---

## ADR-3: Priority Mapping (MoSCoW → Numeric)

**Status:** ACCEPTED 🟢

**Problem:** How to represent story priority in JSON for agent consumption?

**Context:**
- Markdown PRDs use human-readable MoSCoW (Must/Should/Could/Won't)
- Ralph agents need sortable, comparable priority
- JSON constraints favor numeric representations

**Decision:** Map MoSCoW → 1-4:
- **Must** → 1 (highest priority)
- **Should** → 2
- **Could** → 3
- **Won't** → 4 (lowest/excluded)

**Rationale:**
- **Sortable:** Agent can `sort(stories, by: priority)` to pick highest
- **Human-readable in markdown:** MoSCoW is well-understood
- **Reversible:** Can convert 1 → Must for display

**Consequences:**
- Two-way conversion required (MoSCoW ↔ numeric)
- prd.json always stores numeric; markdown always uses MoSCoW
- Clear separation of concerns (human vs. machine format)

---

## ADR-4: Story ID Format (US-XXX Sequential)

**Status:** ACCEPTED 🟢

**Problem:** How to uniquely identify stories in prd.json?

**Context:**
- Stories added/removed over time (IDs must be stable)
- Agent loops reference stories by ID
- IDs appear in commits, branch names, logs

**Decision:** Use format `US-NNN` where NNN is zero-padded sequential (US-001, US-002, ...)

**Rationale:**
- **Simple:** No complex encoding; human-readable
- **Sortable:** Lexicographic sort matches execution order
- **Unique:** No duplicates possible (enforced by validation)
- **Stable:** Once assigned, ID does not change

**Consequences:**
- Renumbering when stories deleted (e.g., delete US-003 → renumber US-004 to US-003?)
  - **Decision:** Do NOT renumber; preserve original IDs even with gaps
  - Rationale: Git history, logs, and branches reference old IDs; renumbering breaks traceability

---

## ADR-5: Branch Naming (ralph/[kebab-case])

**Status:** ACCEPTED 🟢

**Problem:** What branch name convention for feature development?

**Context:**
- Ralph spawns fresh agent per story
- Each PRD specifies single feature branch
- All stories in one PRD live on same branch
- Branch names appear in git, CI/CD, and documentation

**Decision:** Format: `ralph/[feature-name-kebab-case]`

**Examples:**
- `ralph/dark-mode`
- `ralph/add-user-authentication`
- `ralph/performance-optimization`

**Rationale:**
- **Consistent:** All feature branches start with `ralph/` prefix
- **Safe:** Kebab-case avoids special characters, spaces, git conflicts
- **Readable:** Self-documenting feature name

**Consequences:**
- Requires sanitization logic (convert "Add User Auth" → "add-user-authentication")
- Potential collisions if two features have same kebab name (rare; warn on collision)

---

## ADR-6: passes Field Initialization (Always false)

**Status:** ACCEPTED 🟢

**Problem:** What should `passes` boolean default to for new stories?

**Context:**
- ralph.sh loop picks stories where `passes: false`
- Agent updates to `passes: true` after successful implementation
- New stories must be available for iteration immediately

**Decision:** All newly-created stories initialize with `passes: false`.

**Rationale:**
- **Correct semantics:** Story not yet completed → false
- **Opt-in completion:** Agent must explicitly complete story (safer than defaulting to true)
- **Loop continuity:** Ensures agent always has work until all stories complete

**Consequences:**
- No pre-completed stories (cannot skip initial story)
- Must update prd.json after each successful agent iteration
- Cannot manually mark story complete without agent involvement (by design)

---

## ADR-7: Acceptance Criteria Format (Free-form, Gherkin Preferred)

**Status:** ACCEPTED 🟡

**Problem:** What format for acceptance criteria?

**Context:**
- Different teams have different standards (BDD/Gherkin, checklist, narrative)
- Need flexibility for existing PRD templates
- Criteria consumed by humans (for testing) and agents (for understanding)

**Decision:** Accept any format, but **recommend Gherkin (Given/When/Then)**.

**Format examples (all valid):**
```gherkin
✅ PREFERRED:
Scenario: User enables dark mode
  Given settings page is open
  When user toggles "Enable Dark Mode"
  Then UI switches to dark color scheme

✅ ACCEPTABLE (checklist):
- Dark mode toggle visible in settings
- All UI colors inverted
- Persistence across session

✅ ACCEPTABLE (narrative):
User can toggle dark mode in settings; UI responds immediately; preference persists.
```

**Rationale:**
- **Flexibility:** Existing PRDs don't need rewriting
- **Clarity:** Gherkin is most explicit for agents (Given → When → Then = state machine)
- **Validation:** Free-form allows any structure; human reviews for quality

**Consequences:**
- Acceptance criteria quality varies (gap 🟡)
- Agent interpretation depends on clarity (some criteria may be ambiguous)
- No automated test generation from criteria (manual)

---

## ADR-8: State Persistence (prd.json File-Based)

**Status:** ACCEPTED 🟢

**Problem:** Where to persist PRD state and story progress?

**Context:**
- Ralph is stateless (fresh agent per iteration)
- Need to track which stories are complete
- Need deterministic, human-readable state

**Decision:** Use `prd.json` file in project root as single source of truth.

**State tracked:**
- `passes: false` → not started/in progress
- `passes: true` → completed
- Story order determines execution order
- Field `notes` (optional) for agent comments

**Rationale:**
- **Git-friendly:** File can be versioned; history visible in blame
- **Human-readable:** JSON is clear; can be edited manually if needed
- **Simple:** No database, no state server
- **Auditable:** Every change is a commit

**Consequences:**
- Merge conflicts if multiple humans/agents update prd.json simultaneously (rare)
- Manual merge resolution may be needed (document strategy in CLAUDE.md)
- No automated rollback (manual `git revert` required)

---

## ADR-9: Clarifying Questions (3-5, A/B/C/D Format)

**Status:** ACCEPTED 🟢

**Problem:** How many questions? What format?

**Context:**
- Too few questions → ambiguous PRD
- Too many questions → friction, user gives up
- Ideally user responds quickly (single line: "1A, 2C, 3B")

**Decision:** Ask **3-5 critical questions** in **A/B/C/D multiple choice format**, with optional "Other: [custom]" option.

**Examples:**
```
1. Primary goal?
   A. Reduce eye strain (accessibility)
   B. Increase engagement
   C. Technical debt
   D. Other: [specify]

2. Target users?
   A. All users
   B. Power users only
   C. Admin users
   D. Other: [specify]
```

**Rationale:**
- **Quick:** User responds with single line; no back-and-forth
- **Structured:** Forces user to consider key dimensions (goal, audience, scope)
- **Flexible:** "Other" option allows custom answers
- **Sufficient:** 3-5 questions cover most ambiguities without overwhelming

**Consequences:**
- Some edge cases not covered (user provides "Other" answers requiring follow-up)
- Quality of PRD depends on question design (gap 🟡 — requires careful question authoring)

