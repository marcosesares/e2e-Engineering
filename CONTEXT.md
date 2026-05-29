# e2e-engineering

## Language

**e2e-engineering**: Master orchestrator skill. Detects current phase, sequences sub-skills, loops until all exit conditions met.
_Avoid_: "engineering flow", "dev loop", "full pipeline"

**Task**: Atomic unit of business intent that owns its own `prd.json` + `progress.txt`. New task = reset both files. Within a task, progress.txt is append-only.
_Avoid_: "project", "feature" (ambiguous scope)

**Phase**: One of three meta-stages a task moves through — Pre-implementation, Implementation, Post-implementation. Each phase has its own loop and exit condition.
_Avoid_: "step", "stage" (used loosely elsewhere)

**Pre-implementation**: Phase covering Idea → Research → Prototype → PRD. Exit condition: user approval.

**Implementation**: Phase covering Planning → Execution (vertical slices). Exit condition: TDD green + all stories `passes: true` + E2E passing.

**Post-implementation**: Phase covering code review + human QA. Entry condition: implementation loop already exited with E2E green.

**Goal**: Atomic unit of work inside a loop iteration. One goal = one agent run.
_Avoid_: "task" (reserved for business-level unit), "story" (implementation-phase specific)

**Loop**: Phase-specific iteration mechanism. Each phase has exactly one loop type — Karpathy brainstorm loop (pre-impl), vertical slice TDD loop (impl), review loop (post-impl).

**Hard gate**: Non-negotiable checkpoint an agent cannot pass without explicit human consent. The five: (1) PRD approved → implementation, (2) TDD red phase (failing test before production code), (3) debug escalation (after 3 failed fixes, stop + escalate), (4) E2E green → post-implementation, (5) verification-before-completion before marking done. Each surfaces as a red-flags line in its sub-skill. Concept from superpowers.

**Soft gate**: Checkpoint overridable with logged justification — coverage %, lint, style. Override is allowed; silent skip is not.

**Per-slice review**: In-loop, orchestrator-run umbrella for two ordered stages at fan-in — [[spec-compliance check]] then [[quality check]] — followed by the [[merge-readiness check]] before merge. Checks a subagent's summary against the story's spec + [[constitution]] (+ [[ARCHITECTURE.md]] when present) before writing `status: done`. Cheap, incremental, catches slice-level drift early. Not a fresh-context review. Adapted from superpowers subagent-driven-development's two-stage review.
_Avoid_: calling the stages "gates" (the five [[hard gate]]s are a closed set; these stages are not hard gates).

**Spec-compliance check** (per-slice review stage 1): Does the slice satisfy the story's acceptanceCriteria EXACTLY — no missing behavior, no extra behavior? Verdict `✅ spec-compliant` / `❌ issues found`. Issues → bounce back to the subagent, re-run after fix. Must pass before [[quality check]]. From superpowers SDD spec-compliance reviewer.

**Quality check** (per-slice review stage 2): Slice checked against the [[constitution]] AND (when present) [[ARCHITECTURE.md]] ownership/naming/integration rules — catches a new class at a URL an existing class owns, a duplicate component file, a second API-client key for one endpoint, a naming break. Findings triaged Critical / Important / Minor; Critical/Important bounce back, Minor noted. Runs only after [[spec-compliance check]] passes. From superpowers SDD code-quality reviewer.

**Merge-readiness check**: Pre-merge gate (mechanical, not judgment) at fan-in after the two review stages: worktree has no uncommitted changes, the slice's feature E2E + affected tests pass, branch is ahead of baseBranch. Any fail → bounce back, do not merge. From superpowers finishing-a-development-branch readiness check. Distinct from [[verification-before-completion]] (gate 5): that's whole-feature + full-suite + live exercise; this is per-slice + narrow + at fan-in.

**Post-impl review**: Fresh-context, full-diff audit by a clean reviewer (no impl-loop baggage). Targets cross-slice architecture, seams, whole-feature spec/standards compliance that [[per-slice review]] structurally can't see. Findings ranked by severity. Maps to superpowers requesting/receiving-code-review.

**Verification-before-completion** (hard gate 5): Final impl-phase check after E2E green (gate 4). Distinct from gate 4: gate 4 = automated E2E suite green; gate 5 = full suite re-run (all tests, not just changed slices) + live exercise of the feature (browser for UI, per run/verify skills) + every PRD acceptance criterion ticked. Catches what automated E2E misses — visual/interaction regressions, criteria not encoded as tests. Passing = implementation done → hand to post-impl. Wired to existing harness skills: invokes /run (launch app) + /verify (exercise + observe), then adds the PRD acceptance-criteria checklist on top — does not reimplement app-launching.

**Checkpoint**: Snapshot saved + session ended so a fresh one resumes cleanly. Three files: handoff doc (narrative), `prd.json` (structured state), `progress.txt` (append-only learnings). Written in caveman:ultra. Two triggers: (1) **65% threshold** — in-phase safety net, flag-and-wait to next fan-in boundary; (2) **[[unconditional gate reset]]** — at phase-boundary gates 1/4/5, fire regardless of %. Signal carries `reason="threshold"` or `reason="gate-N"`. See ADR 0002, 0014.

**Unconditional gate reset**: Hard session reset after each PHASE-BOUNDARY hard gate (1 = pre-impl→impl, 4 = before verification, 5 = impl→post-impl) REGARDLESS of context %. Each phase starts fresh → no cross-phase context contamination, deterministic, matches ralph stateless pattern. The per-slice gates (2 TDD red, 3 debug escalation) are subagent-internal and fire repeatedly/conditionally → they do NOT reset. Distinct from and composes with the [[Checkpoint]] 65% net (which fires between gates if a phase saturates). See ADR 0014.
_Avoid_: resetting after gates 2/3 (incoherent — they fire inside parallel slice subagents)

**Phase transition**: Ralph-pattern mechanism for starting a fresh session at phase boundary. Saves checkpoint, clears context. Now fires UNCONDITIONALLY at gates 1/4/5 ([[unconditional gate reset]]), not only at 65%. Fresh session read order: handoff doc → `prd.json` → `progress.txt` → invoke suggested skill.

**Fresh session bootstrap**: Sequence a restarted session must follow before any work — read handoff doc first (self-contained primer: domain language, current state, next action, artifacts, suggested skill), then `prd.json`, then `progress.txt`, then invoke the suggested skill.
_Avoid_: reading `CONTEXT.md` first (handoff doc already contains domain language summary; full glossary pulled on-demand via path reference)

**E2E gate**: Condition requiring E2E tests passing before implementation loop exits. Tests generated in project's language stack (not assumed TypeScript).

**Test case**: Markdown doc describing one behavior to verify. Authored UPFRONT from PRD testing-decisions; to-issues attaches `testCases[]` ids per story. Two shapes (from qa_skills): **feature** (story-level journey) and **regression** (app-wide, spans stories). Canonical human-readable spec. Sink is `.md` files only — no ADO, no Jira. Each case is Automated (has an E2E) or Manual.

**E2E test**: Executable automation of a Test case in the project stack (Playwright when web UI). Authoring splits by shape (ADR 0010): **feature** cases automated IN-SLICE by the slice subagent as part of its TDD (incremental, parallel); **regression** cases (cross-slice journeys) automated by a FINAL e2e-loop pass after fan-in, when the whole feature exists. [[E2E gate]] runs the full suite. Traceability: each E2E test maps back to a Test case ID.

**Disposition** (lite): A Test case is **Automated** (covered by an E2E test) or **Manual** (walked by a human). The Manual set is the post-implementation human-QA script. Borrowed from qa_skills dispositions, stripped of ADO coverage fields.

**Constitution**: Single versioned standards doc = karpathy coding guidelines (think-before-coding, simplicity-first, surgical-changes, goal-driven-execution) + qa [[testing principles]]. Injected into every implementation subagent so all slices share the same rails. The static "how we write code/tests here" contract — GENERIC, cross-project. Distinct from CONTEXT.md (glossary), ADRs (decisions), and [[ARCHITECTURE.md]] (project-specific structure). See ADR 0008.
_Avoid_: putting these rules in CLAUDE.md (mixes with setup, unversioned, not harness-agnostic); putting project-specific structure/ownership/naming here (that's [[ARCHITECTURE.md]])

**ARCHITECTURE.md**: Durable, repo-root project-architecture map — project-SPECIFIC structure + conventions (5 sections: layering/boundaries, ownership rules, naming, integration patterns, anti-patterns). The "right route" map: to-issues pins each story's [[integration decision]] from it, fan-out injects a scoped slice into each subagent, [[quality check]] checks against it. Lazy-created; written ONLY in human phases (pre-impl seed via adopt/map-codebase/to-prd; post-impl human-QA amend); the implementation loop is READ-ONLY for it. Same blast radius as [[constitution]] → same human-gated governance. Synthesized current state; ADRs are the changelog behind it. See ADR 0013.
_Avoid_: generic standards (→ [[constitution]]); glossary terms (→ CONTEXT.md); a pile of decisions (→ ADRs); per-task scope (→ [[map-codebase]] codebase-map.md); subagents/orchestrator writing it mid-loop

**Integration decision**: Per-story field in prd.json set by to-issues (reading [[ARCHITECTURE.md]] §1-2) — which existing owner/seam the story extends, e.g. "extend EnrollmentResource, no new class". The single place the brownfield ownership decision is made — once, by the orchestrator — then injected into the slice subagent at fan-out so N parallel subagents don't each guess differently. Empty for greenfield / no ARCHITECTURE.md. Fixes the reverted-incident root cause (parallel subagents inventing a duplicate resource class).

**Testing principles**: General testing standards absorbed from qa_skills (BR-PL-01..06): real-interface interaction (UI clicks / HTTP, not property poking) for actions; diagnosable failures over silent catch; no hardcoded sleeps when a wait condition exists; scope discipline (no "while I'm here" fixes); readability over defensive coding in test code.

**Out of core**: ADO test-case creation, Jira routing/fetch, git-subtree skill distribution. BeckTech-org-specific — excluded per superpowers' "domain-specific skills belong in plugins, not core" rule.

**Pattern promotion**: At task close the orchestrator extracts durable learnings from progress.txt and stages them as **pending constitution amendments** (transitive state) — NOT auto-merged, NOT approved task-by-task. They sit pending until the post-impl human-QA gate, where the human approves QA sign-off AND constitution amendments in one batched touch. progress.txt itself stays per-task scratch and resets.
_Avoid_: per-task human approval of patterns (batched at human-QA gate instead); auto-appending to a separate AGENTS.md (rots, per Ralph)

**Pending amendment**: A durable learning staged for the constitution but not yet approved. Lives in a transitive state from task close until the human-QA gate clears it (promote to [[constitution]]) or drops it.

**Blocked story**: A story whose subagent failed 3 fix attempts AND a follow-up systematic-debugging re-dispatch. Marked `blocked` in prd.json (third state beyond `passes:false`/`passes:true`). Orchestrator keeps draining the rest of the [[ready set]] rather than interrupting.

**Debug escalation** (hard gate 3): subagent 3 strikes → orchestrator re-dispatches ONCE with systematic-debugging (4-phase root-cause, not blind retries) → still red → mark [[blocked story]], keep working. Escalate to human only on **stall**: no ready work remains, or every remaining story depends on a blocked one. Honors the human-consent gate without interrupting on each stumble.
_Avoid_: blind retry loops; escalating on first 3-strike; silently deferring blocks to human-QA (E2E gate could deadlock)

**grill-me**: Pre-implementation brainstorm sub-skill. Stateless, one question at a time, no external doc dependencies. Loops until user approves. Also gates whether Research and Prototype fire.
_Avoid_: confusing with "grill-with-docs" (grill-with-docs requires existing docs; grill-me does not)

**Research** (sub-skill): Conditional pre-impl step — fires only when the task leans on external APIs / unfamiliar libs. Output `research.md`: sprint-lifetime cache, may rot, flagged stale-able. Skipped cleanly when not needed.

**Prototype** (sub-skill): Conditional pre-impl step — fires when taste/UX/state-machine uncertainty needs concrete feedback. Throwaway experiment, not the final implementation. Two branches (from mattpocock): **ui** (visual variants, browser-driven feedback) and **logic** (state machine / terminal app, textual feedback) — different feedback loops; grill-me picks which fires.

**triage** (sub-skill): 5-state intake machine (needs-triage → needs-info → ready-for-agent / ready-for-human / won't-fix). In e2e-engineering's forward flow, to-issues output is born `ready-for-agent` and SKIPS triage. triage gates only EXTERNALLY-sourced work (bug reports, feature requests) and walled [[refactor candidates]] from map-codebase. Preserves "never AFK an un-triaged issue" where it matters.

**map-codebase** (sub-skill): Conditional pre-impl step — fires only on brownfield (task targets existing code). Produces `codebase-map.md`, SCOPED to *this* change (sprint-lifetime, can rot like [[Research]]), with 5 sections: (1) blast-radius modules, (2) seams/adapters (where tests attach), (3) local impact list, (4) existing language — terms only, fed to grill-with-docs (durable structure/ownership/naming live in [[ARCHITECTURE.md]], NOT §4), (5) refactor candidates. Also reconciles the code against [[ARCHITECTURE.md]] and proposes additions/corrections for human review. NOT a global C4/ERD/NxN matrix. See ADR 0009.
_Avoid_: full C4/ERD/spec-impact matrices (too heavy, rots per slice); the global reverse-engineering artifacts the prototypes were studied with

**Refactor candidates** (map section 5): Shallow modules, missing seams, duplicated rules surfaced during map-codebase. SURFACE-ONLY and WALLED: tagged `NOT THIS TASK`, routed to NEW issues via triage, human-gated into their own refactor Task, and EXCLUDED from slice-subagent context. The wall protects scope discipline ([[testing principles]] BR-PL-02); orchestrator enforces it. README "de-slop" = a refactor Task fed by these candidates, never an AFK whole-repo refactor.

**Pre-impl sequence**: grill-me → [map-codebase? (brownfield)] → [Research?] → [Prototype?] → to-prd. Bracketed steps are conditional; greenfield skips map-codebase.

**Task type**: e2e-engineering handles greenfield app, feature, bug fix, AND refactor — on new or existing codebases. README's architecture-improvement / "de-slop" flow is a refactor Task using map-codebase to surface candidates; human picks which refactor matters (not blind AFK refactor).

**Refactor Task**: Runs the FULL flow, same phases as a feature — no lite path (ADR 0012). map-codebase → full PRD → to-issues → slices+TDD → mandatory e2e → review → human-QA. PRD carries **refactor-shaped stories** (behavior-preservation + structural goal, not forced `As a user…`). e2e is the safety net proving behavior preserved. Old code is **transformed** — modified OR removed depending on the refactor — captured as explicit acceptance criteria + migration-step slices (introduce new → migrate callers → modify/remove old). Hard gate 1 still applies (high blast radius).
_Avoid_: "lite PRD" for refactors (superseded); skipping/lightening e2e on a refactor (it's the whole safety net)

**Adopt mode**: One-time onboarding of e2e-engineering into an in-progress project (`/e2e-engineering adopt`). Two halves of different risk: (1) DOCS — auto-DRAFTS CONTEXT.md glossary + constitution + ADRs from existing code/docs, presented for human review/edit, NOT silently committed; (2) CODE — repo-wide map-codebase produces a prioritized refactor BACKLOG → triaged issues; code is NEVER auto-refactored. Human picks candidates; each conforms incrementally as a gated refactor Task. Docs conform now, code conforms over time. See ADR 0011.
_Avoid_: auto-committing unreviewed standards docs (wrong domain language gets injected into every future subagent); whole-repo AFK refactor (README + [[constitution]] forbid it)

**Vertical slice**: Implementation unit ordered by: tracer bullet → schema → business logic → API → UI. Ordering is expressed as `depends_on` edges in the DAG, not a fixed per-iteration count.

**depends_on DAG**: Dependency graph over stories emitted by to-issues. The tracer→schema→logic→api→ui ordering IS the edge set — each feature stays sequential along its chain; independent branches run in parallel.

**Ready set**: Stories whose `depends_on` are all satisfied AND `passes: false`. The orchestrator fans the ready set out to parallel subagents each iteration.

**Fan-out / fan-in**: Fan-out = dispatch each ready story to its own worktree + subagent. Fan-in = orchestrator (serially) merges the branch, writes `passes: true`, appends progress.txt. Pattern shared by superpowers `dispatching-parallel-agents` and spec_kit workflow DAG.

**Sole writer**: Only the orchestrator writes prd.json + progress.txt. Subagents return a summary and never touch shared state. Preserves single-writer invariant and keeps progress.txt genuinely append-only even under parallelism.

**Slice dispatch**: Orchestrator delegates each vertical slice to a fresh subagent that runs red-green-refactor for that slice, returns a summary, which the orchestrator reviews before marking the story `passes: true`. Keeps orchestrator context lean (sees summaries, not raw TDD churn). Borrowed from superpowers `subagent-driven-development`; rejected inline TDD (`executing-plans`) to delay checkpointing.
_Avoid_: "inline TDD" (orchestrator does not write slice code itself)

**Slice gap-check**: Subagent's FIRST move before TDD — validate the story is implementable (clear acceptance criteria? `testCases` present? `depends_on` real?). Gap → escalate ONE question to orchestrator, do not guess. Catches upstream under-spec before a wasted TDD attempt. Distinct from [[grill-with-docs]] (which handles LANGUAGE, once at impl entry — not per-slice). The TDD red phase catches remaining behavioral ambiguity.

**grill-with-docs placement**: Runs ONCE at implementation entry — reconciles PRD + (brownfield) codebase-map existing-language against CONTEXT.md glossary, before to-issues. NOT per-slice; slices inherit shared language via CONTEXT + [[constitution]]. Per-slice gap-finding is the [[slice gap-check]]'s job, not re-grilling language.

**Loop driver**: The orchestrator skill itself, in-session — not an external shell script. Iterates slices, checkpoints at 65%, fresh session resumes from artifacts. Ralph's `ralph.sh` + `<promise>COMPLETE</promise>` rejected; COMPLETE maps to "all stories `passes: true`". See [[skill-driven-loop]] ADR 0005.
_Avoid_: "ralph.sh", "shell loop" (no external bash driver in default path)

**AFK wrapper**: Optional external script (`scripts/afk.ps1`) that drives unattended e2e-engineering runs. Spawns fresh `claude --print --dangerously-skip-permissions` sessions in a loop. Restarts on `<e2e-checkpoint>`, stops on `<e2e-stall>` or `<e2e-complete>`. Runs only after gate 1 (PRD approved). Not the default path — default is the in-session [[Loop driver]]. Supports claude (default), opencode, codex via preset commands.
_Avoid_: "ralph loop", "ralph.sh", "session manager"

## Relationships

- **e2e-engineering** detects entry **Phase** and sequences sub-skills
- **Task** owns one `prd.json` and one `progress.txt`; resets both on new task
- **Phase** contains exactly one **Loop**
- **Loop** iterates over **Goals**; exits when exit condition met
- **Checkpoint** saves at 65% context within any **Phase**
- **Phase transition** saves **Checkpoint** then starts fresh session
- **E2E gate** is exit condition for **Implementation** loop (not just post-impl)
- **Implementation** loop dispatches the [[ready set]] from the depends_on DAG to parallel subagents; orchestrator is [[sole writer]] of prd.json + progress.txt at fan-in
- Every implementation subagent is injected with the [[constitution]]
- **Post-implementation** human-QA gate is the single human-approval chokepoint: clears QA sign-off AND [[pending amendment]]s in one touch — human routes each amendment to [[constitution]] (generic) or [[ARCHITECTURE.md]] (project-specific) or drops it
- **[[ARCHITECTURE.md]]** is read by to-issues (pins [[integration decision]]), fan-out (scoped slice per subagent), and [[quality check]]; written only in human phases (pre-impl seed, post-impl amend) — never by the implementation loop
- **grill-me** drives **Pre-implementation** loop; output = caveman:ultra notes handed to **to-prd**
- **to-prd** converts grill-me notes into formal PRD; owns its own interview step (no double-interview)
- **grill-with-docs** drives **Implementation** loop start (CONTEXT.md + ADRs already exist at this point)
- **Fresh session bootstrap** sequence applies to both phase transitions AND mid-phase context restarts

## Flagged ambiguities

- "task" vs "goal" — task = business unit (owns files), goal = loop-level work unit. Never swap.
- "E2E" scope — E2E tests are both implementation loop exit gate AND post-impl verification artifact. Not post-impl only.
- "progress.txt append-only" — true within a task; reset when new task begins. Holds under parallelism because the orchestrator is the [[sole writer]] — subagents return summaries, never append directly.
- "one slice per iteration" — SUPERSEDED. The unit per iteration is the [[ready set]] (DAG-driven), which may fan out to multiple parallel subagents. See ADR 0006.
