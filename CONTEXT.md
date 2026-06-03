# e2e-engineering

> **ADR 0022 redesign delta (2026-05-31) — current truth overrides older entries below.**
> - **TASK > SLICE** (pinned). **TASK** = one `/e2e-flight` spawn unit (one `queue.json` entry / `tasks/<id>/`). **SLICE / sub-task** = one fan-out sub-agent unit (one `prd.json stories[]` entry / DAG node). Older entries say "Goal" / "story" / "vertical slice" for the sub-unit — read them as SLICE.
> - **No loop, no context monitoring, no external driver.** `/e2e-flight` runs IN the current session and does ONE Task per spawn then exits; re-invoke for the next. No detached window, no `claude --print` driver, no lock/log file. These terms are **REMOVED**: [[Checkpoint]], [[Unconditional gate reset]], [[Phase transition]], AFK wrapper, Loop driver, E2E_DRIVER guard. The 65% hook is disabled. Supersedes ADR 0002/0014/0015.
> - **Flight IS the orchestrator.** [[Fan-out / fan-in]] + [[Sole writer]] now run INSIDE the `/e2e-flight` spawn, not an external/separate orchestrator.
> - **Forcing mechanism** (NEW): bootstrap `ToolSearch`-loads `Agent`+`EnterWorktree`; orchestrator doing slice-impl inline = hard STOP. The structural token fix — guarantees fan-out fires (it didn't last run → the 22.3M-token blowup).
> - **Expert agent** (NEW): role-prompted reviewer sub-agent (`ui-designer`, `backend-architect`, `dba`, `senior-qa` in `.claude/agents/`). A second fan-out wave reviews each green slice in its worktree before merge (findings Critical/Important/Minor, bounce cap 3), and advises the PRD in pre-impl planning.
> - **Gates 4 & 5 STUBBED** (pending E2E automation, not deleted). Interim verification net = gate 2 + gate 3 + expert review + lint/compile + self-review + human-QA checklist.
> - See [ADR 0022](docs/adr/0022-flight-one-task-per-spawn-no-loop-no-checkpoint.md) + [prototype/e2e-flight-process/design.md](prototype/e2e-flight-process/design.md).

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

**Hard gate**: Non-negotiable checkpoint an agent cannot pass without explicit human consent. The five: (1) PRD approved → implementation, (2) TDD red phase (failing test before production code), (3) debug escalation (after 3 failed fixes, stop + escalate), (4) E2E green → post-implementation, (5) verification-before-completion before marking done. Each surfaces as a red-flags line in its sub-skill. Concept from superpowers. _(ADR 0022: gates 4 & 5 are STUBBED pending E2E automation — not deleted; interim net = expert review + lint/compile + self-review + human-QA checklist.)_

**Soft gate**: Checkpoint overridable with logged justification — coverage %, lint, style. Override is allowed; silent skip is not.

**Per-slice review**: In-loop, orchestrator-run umbrella for two ordered stages at fan-in — [[spec-compliance check]] then [[quality check]] — followed by the [[merge-readiness check]] before merge. Checks a subagent's summary against the story's spec + [[constitution]] (+ [[ARCHITECTURE.md]] when present) before writing `status: done`. Cheap, incremental, catches slice-level drift early. Not a fresh-context review. Adapted from superpowers subagent-driven-development's two-stage review.
_Avoid_: calling the stages "gates" (the five [[hard gate]]s are a closed set; these stages are not hard gates).

**Spec-compliance check** (per-slice review stage 1): Does the slice satisfy the story's acceptanceCriteria EXACTLY — no missing behavior, no extra behavior? Verdict `✅ spec-compliant` / `❌ issues found`. Issues → bounce back to the subagent, re-run after fix. Must pass before [[quality check]]. From superpowers SDD spec-compliance reviewer.

**Quality check** (per-slice review stage 2): Slice checked against the [[constitution]] AND (when present) [[ARCHITECTURE.md]] ownership/naming/integration rules — catches a new class at a URL an existing class owns, a duplicate component file, a second API-client key for one endpoint, a naming break. Findings triaged Critical / Important / Minor; Critical/Important bounce back, Minor noted. Runs only after [[spec-compliance check]] passes. From superpowers SDD code-quality reviewer.

**Merge-readiness check**: Pre-merge gate (mechanical, not judgment) at fan-in after the two review stages: worktree has no uncommitted changes, the slice's feature E2E + affected tests pass, branch is ahead of baseBranch. Any fail → bounce back, do not merge. From superpowers finishing-a-development-branch readiness check. Distinct from [[verification-before-completion]] (gate 5): that's whole-feature + full-suite + live exercise; this is per-slice + narrow + at fan-in.

**Post-impl review**: Fresh-context, full-diff audit by a clean reviewer (no impl-loop baggage). Targets cross-slice architecture, seams, whole-feature spec/standards compliance that [[per-slice review]] structurally can't see. Findings ranked by severity. Maps to superpowers requesting/receiving-code-review.

**Verification-before-completion** (hard gate 5): Final impl-phase check after E2E green (gate 4). Distinct from gate 4: gate 4 = automated E2E suite green; gate 5 = full suite re-run (all tests, not just changed slices) + live exercise of the feature (browser for UI, per run/verify skills) + every PRD acceptance criterion ticked. Catches what automated E2E misses — visual/interaction regressions, criteria not encoded as tests. Passing = implementation done → hand to post-impl. Wired to existing harness skills: invokes /run (launch app) + /verify (exercise + observe), then adds the PRD acceptance-criteria checklist on top — does not reimplement app-launching.

**Checkpoint** _[DEPRECATED — ADR 0022; no context monitoring, 65% hook disabled]_: Snapshot saved + session ended so a fresh one resumes cleanly. Three files: handoff doc (narrative), `prd.json` (structured state), `progress.txt` (append-only learnings). Written in caveman:ultra. Two triggers: (1) **65% threshold** — in-phase safety net, flag-and-wait to next fan-in boundary; (2) **[[unconditional gate reset]]** — at phase-boundary gates 1/4/5, fire regardless of %. Signal carries `reason="threshold"` or `reason="gate-N"`. See ADR 0002, 0014.

**Unconditional gate reset** _[DEPRECATED — ADR 0022; no gate resets, no context monitoring]_: Hard session reset after each PHASE-BOUNDARY hard gate (1 = pre-impl→impl, 4 = before verification, 5 = impl→post-impl) REGARDLESS of context %. Each phase starts fresh → no cross-phase context contamination, deterministic, matches ralph stateless pattern. The per-slice gates (2 TDD red, 3 debug escalation) are subagent-internal and fire repeatedly/conditionally → they do NOT reset. Distinct from and composes with the [[Checkpoint]] 65% net (which fires between gates if a phase saturates). See ADR 0014.
_Avoid_: resetting after gates 2/3 (incoherent — they fire inside parallel slice subagents)

**Phase transition** _[DEPRECATED — ADR 0022; no phase-boundary resets, resume via state files]_: Ralph-pattern mechanism for starting a fresh session at phase boundary. Saves checkpoint, clears context. Now fires UNCONDITIONALLY at gates 1/4/5 ([[unconditional gate reset]]), not only at 65%. Fresh session read order: handoff doc → `prd.json` → `progress.txt` → invoke suggested skill.

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

**grill-with-docs**: The single pre-implementation brainstorm sub-skill (absorbed the old grill-me). Doc-aware: reads CONTEXT.md glossary + ARCHITECTURE.md + (brownfield) codebase-map §4 BEFORE asking, so every question is informed by existing functionality. Runs AFTER [[map-codebase]] in pre-impl. Stateless, one question at a time, no cap; reconciles language inline (pins canonical terms, updates CONTEXT.md as terms resolve); gates whether Research and Prototype fire; loops until the user approves the direction. Because language is settled here, Implementation skips straight to to-issues — there is NO second grill.
_Avoid_: asking what the code/glossary already answers; letting a term conflict survive into to-prd; re-grilling in Implementation (it was a separate impl-entry step — now folded into pre-impl)

**Research** (sub-skill): Conditional pre-impl step — fires only when the task leans on external APIs / unfamiliar libs. Output `research.md`: sprint-lifetime cache, may rot, flagged stale-able. Skipped cleanly when not needed.

**Prototype** (sub-skill): Conditional pre-impl step — fires when taste/UX/state-machine uncertainty needs concrete feedback. Throwaway experiment, not the final implementation. Two branches (from mattpocock): **ui** (visual variants, browser-driven feedback) and **logic** (state machine / terminal app, textual feedback) — different feedback loops; grill-with-docs picks which fires.

**triage** (sub-skill): 5-state intake machine (needs-triage → needs-info → ready-for-agent / ready-for-human / won't-fix). In e2e-engineering's forward flow, to-issues output is born `ready-for-agent` and SKIPS triage. triage gates only EXTERNALLY-sourced work (bug reports, feature requests) and walled [[refactor candidates]] from map-codebase. Preserves "never AFK an un-triaged issue" where it matters.

**map-codebase** (sub-skill): Conditional pre-impl step — fires only on brownfield (task targets existing code). Produces `codebase-map.md`, SCOPED to *this* change (sprint-lifetime, can rot like [[Research]]), with 5 sections: (1) blast-radius modules, (2) seams/adapters (where tests attach), (3) local impact list, (4) existing language — terms only, fed to grill-with-docs (durable structure/ownership/naming live in [[ARCHITECTURE.md]], NOT §4), (5) refactor candidates. Also reconciles the code against [[ARCHITECTURE.md]] and proposes additions/corrections for human review. NOT a global C4/ERD/NxN matrix. See ADR 0009.
_Avoid_: full C4/ERD/spec-impact matrices (too heavy, rots per slice); the global reverse-engineering artifacts the prototypes were studied with

**Refactor candidates** (map section 5): Shallow modules, missing seams, duplicated rules surfaced during map-codebase. SURFACE-ONLY and WALLED: tagged `NOT THIS TASK`, routed to NEW issues via triage, human-gated into their own refactor Task, and EXCLUDED from slice-subagent context. The wall protects scope discipline ([[testing principles]] BR-PL-02); orchestrator enforces it. README "de-slop" = a refactor Task fed by these candidates, never an AFK whole-repo refactor.

**Pre-impl sequence**: [map-codebase? (brownfield)] → grill-with-docs → [Research?] → [Prototype?] → to-prd. Bracketed steps are conditional; greenfield skips map-codebase. map-codebase runs FIRST (gated by taskType, not by grilling) so grill-with-docs walks in familiar with existing functionality.

**Task type**: e2e-engineering handles greenfield app, feature, bug fix, AND refactor — on new or existing codebases. README's architecture-improvement / "de-slop" flow is a refactor Task using map-codebase to surface candidates; human picks which refactor matters (not blind AFK refactor).

**Refactor Task**: Runs the FULL flow, same phases as a feature — no lite path (ADR 0012). map-codebase → full PRD → to-issues → slices+TDD → mandatory e2e → review → human-QA. PRD carries **refactor-shaped stories** (behavior-preservation + structural goal, not forced `As a user…`). e2e is the safety net proving behavior preserved. Old code is **transformed** — modified OR removed depending on the refactor — captured as explicit acceptance criteria + migration-step slices (introduce new → migrate callers → modify/remove old). Hard gate 1 still applies (high blast radius).
_Avoid_: "lite PRD" for refactors (superseded); skipping/lightening e2e on a refactor (it's the whole safety net)

**Adopt mode**: One-time onboarding of e2e-engineering into an in-progress project (`/e2e-engineering adopt`). Two halves of different risk: (1) DOCS — auto-DRAFTS CONTEXT.md glossary + constitution + ADRs from existing code/docs, presented for human review/edit, NOT silently committed; (2) CODE — repo-wide map-codebase produces a prioritized refactor BACKLOG → triaged issues; code is NEVER auto-refactored. Human picks candidates; each conforms incrementally as a gated refactor Task. Docs conform now, code conforms over time. See ADR 0011.
_Avoid_: auto-committing unreviewed standards docs (wrong domain language gets injected into every future subagent); whole-repo AFK refactor (README + [[constitution]] forbid it)

**Dual-runtime migration**: Four-phase incremental plan for evolving from single-runtime (`.claude/skills/` only) to [[dual-runtime skill tree]]. Each phase leaves ≥1 runtime working and is independently reviewable. Phase order separates layout changes from adapter additions from state-schema changes — they must not move in the same step. (1) **Extract shared core** — move runtime-neutral content from `.claude/skills/e2e-engineering/` to `skills/e2e-engineering/`; update Claude Code entry-point SKILL.md files to thin wrappers; verify Claude Code green before adding Codex. (2) **Add Codex runtime** — add `.agents/skills/e2e-engineering/SKILL.md`, `.agents/skills/e2e-flight/SKILL.md`, and AGENTS.md routing block; Codex entry points reference shared core, do not duplicate it. (3) **Add expert agent adapters** — add `skills/e2e-engineering/agents/*.md`, `agents.manifest.json`, generation script; emit `.claude/agents/` and `~/.codex/agents/` wrappers. (4) **Add [[evidence sidecar]]s** — add `manifests/<story-id>/` directory and update `prd.json` schema with manifest pointers; cross-runtime improvement, not Codex-specific.
_Avoid_: bundling layout changes with state-schema changes (hard to isolate regressions); big-bang migration (path breakage, wrapper drift, and sidecar regressions all land at once)

**Vertical slice**: Implementation unit ordered by: tracer bullet → schema → business logic → API → UI. Ordering is expressed as `depends_on` edges in the DAG, not a fixed per-iteration count.

**depends_on DAG**: Dependency graph over stories emitted by to-issues. The tracer→schema→logic→api→ui ordering IS the edge set — each feature stays sequential along its chain; independent branches run in parallel.

**Ready set**: Stories whose `depends_on` are all satisfied AND `passes: false`. The orchestrator fans the ready set out to parallel subagents each iteration.

**Fan-out / fan-in**: Explicit orchestration pattern — orchestrator owns the DAG, computes the [[ready set]], spawns one worker per slice into an isolated worktree/fork, and is the [[sole writer]] of `prd.json` + `progress.txt`. Fan-in = orchestrator serially receives each worker's [[slice result manifest]], validates gate evidence (RED + GREEN), enforces bounce limits, then writes `status: done` or `blocked`. Transport is runtime-specific (Claude Code: `EnterWorktree` + `Agent`; Codex: manifest-driven spawn — see [[Codex fan-out]]). Natural-language fan-out is not used for gated implementation slices — it weakens worktree isolation, result collection, sole-writer guarantees, and bounce-ceiling enforcement. Pattern shared by superpowers `dispatching-parallel-agents` and spec_kit workflow DAG.

**Codex fan-out**: Codex-runtime implementation of [[fan-out / fan-in]]. Orchestrator writes a ready-set manifest (JSON/NDJSON preferred over CSV — nested fields like acceptanceCriteria, testCases, writeScope, and gate evidence don't flatten cleanly), spawns one worker agent per slice via explicit spawn primitive (`spawn_agents_on_csv` if available, else `spawn_agent`/`wait_agent`), and requires each worker to return a [[slice result manifest]]. Worktree isolation is managed internally by Codex per spawned agent. Sole-writer, bounce ceiling, and gate evidence validation run in the orchestrator at fan-in, same as Claude Code variant.
_Avoid_: natural-language fan-out as primary path (weakens auditability); treating CSV as the load-bearing idea (manifest schema is the contract, transport is an impl detail)

**Slice result manifest**: Structured result every fan-out worker returns to the orchestrator at fan-in. Fields: `storyId`, `status` (done/blocked), `attempts`, `changedFiles[]`, `red` (command + outcome + summary), `green` (command + outcome + summary), `e2eDocPath`, `blockedReason`, `notes[]`. Orchestrator validates RED + GREEN evidence before accepting green — missing evidence = bounce. [[Sole writer]] then writes authoritative `status` to `prd.json` (status authority lives there, not in sidecar) and persists full evidence to [[evidence sidecar]] at `manifests/<story-id>/slice-result.json`.

**Review manifest**: Structured result an [[expert agent]] returns to the orchestrator. Fields: `reviewerRole`, `sliceIds[]`, `findings[]` — each finding: `severity` (Critical/Important/Minor), `file`, `location`, `issue`, `rationale`, `suggestedFix`, `blocking`. Persisted to [[evidence sidecar]] at `manifests/<story-id>/review-result.json`. Orchestrator deduplicates across reviewers, enforces severity gates, applies bounce ceiling (3 round-trips → `blocked`), writes authoritative status to `prd.json`.

**Evidence sidecar**: Durable gate evidence record living at `.e2e-engineering/manifests/<story-id>/` — three files: `slice-result.json` ([[slice result manifest]]), `review-result.json` ([[review manifest]]), `verification-result.json`. `prd.json` holds lightweight pointers (`resultManifestPath`, `reviewManifestPath`) + authoritative status; sidecars hold the heavy evidence (test output, file lists, findings). Cross-runtime — applies to both Claude Code and Codex variants. Status authority always in `prd.json`; [[sole writer]] reconciles sidecar status at fan-in and writes the authoritative story status there.
_Avoid_: treating sidecar status as authoritative (prd.json owns it); bloating prd.json with raw test output or file lists (sidecar concern)

**Expert agent**: Independent, fresh-context reviewer sub-agent spawned AFTER the impl wave, BEFORE merge. Role-based: `backend-architect`, `dba`, `frontend-reviewer`, `test-reviewer`. Also advises the PRD in pre-impl planning. Reviewer independence is the core value — reviewers must not share the implementation thread's context. Input is artifact-driven: each reviewer receives PRD, constitution, relevant test-case docs, slice IDs, changed file list, diff/patch summary, and test output evidence. Reviewer is read-only by contract — never edits files. Returns a [[review manifest]]. Fan-out by expertise area (not per slice) catches cross-slice integration issues. Runtime files are generated from [[canonical expert spec]] — not hand-maintained.
_Avoid_: giving reviewers worktree paths as primary input; sequential inline orchestrator self-review as default (loses independence); hand-maintaining dual runtime files (they drift)

**Canonical expert spec**: Runtime-neutral expert review definition living at `skills/e2e-engineering/agents/*.md`. Contains review rubric, expertise scope, output contract — pure prose, no runtime primitives. Source of truth for [[expert agent]] behavior. Runtime-specific wrappers (`.claude/agents/*.md`, `~/.codex/agents/*.toml`) are generated from this source via [[agent wrapper generation]]. Expertise is canonical; runtime policy (model, sandbox_mode, mcp_servers, invocation format) lives only in the generated adapter.
_Avoid_: putting model selection or sandbox policy into canonical spec (adapter concerns); relying on path references in generated Codex TOML `developer_instructions` (resolve silently fails — inline instead)

**Agent wrapper generation**: Script (`skills/e2e-engineering/scripts/generate-agent-wrappers.ps1`) that reads `skills/e2e-engineering/agents/*.md` + `agents.manifest.json` (runtime metadata: model, sandbox_mode, mcp_servers per role) and emits self-contained runtime adapter files: `.claude/agents/<role>.md` and `~/.codex/agents/<role>.toml`. Generated files inline the canonical expert instructions rather than path-referencing them. Checked into source and regenerated when canonical specs change — never edited by hand.

**Expert-review wave**: Second [[fan-out / fan-in]] wave in e2e-flight, after impl wave, before merge. Orchestrator spawns [[expert agent]]s in parallel by expertise area, each receiving review artifacts (not worktrees). Fan-in collects [[review manifest]]s, deduplicates, enforces severity gates. Sequential inline fallback allowed only when sub-agent spawning is unavailable or change is trivially small — not the default.

**Sole writer**: Only the orchestrator writes prd.json + progress.txt. Subagents return a summary and never touch shared state. Preserves single-writer invariant and keeps progress.txt genuinely append-only even under parallelism.

**Slice dispatch**: Orchestrator delegates each vertical slice to a fresh subagent that runs red-green-refactor for that slice, returns a [[slice result manifest]], which the orchestrator validates before marking the story done. Keeps orchestrator context lean (sees manifests, not raw TDD churn). Borrowed from superpowers `subagent-driven-development`; rejected inline TDD (`executing-plans`). Runtime-specific: Claude Code uses `EnterWorktree` + `Agent`; Codex uses [[Codex fan-out]] manifest-driven spawn.
_Avoid_: "inline TDD" (orchestrator does not write slice code itself)

**Forcing mechanism**: Bootstrap guard that proves fan-out works before any slice work begins. Fail-closed — any failure → `<e2e-stall reason="fanout-unavailable" />` + EXIT; inline slice-impl = hard STOP. Protocol: (1) static capability hint — use tool-discovery primitive if available in runtime, not sufficient alone; (2) live no-op probe — spawn trivial worker, wait for `{"status":"ok","capability":"fanout-probe"}`, close worker; short timeout; any step fails → stall + exit. Claude Code variant: `ToolSearch` loads `Agent`+`EnterWorktree`; Codex variant: static hint (if any) + live spawn probe. The structural token fix — guarantees fan-out fires rather than silently falling back to inline work (the 22.3M-token blowup cause). Skill trigger should declare sub-agent usage explicitly so runtimes requiring user authorization can prompt before Step 0 runs.
_Avoid_: treating static capability check as sufficient (proves configuration, not runtime); proceeding past Step 0 when probe fails; natural-language fallback as the backup path

**Dual-runtime skill tree**: Directory layout supporting Claude Code and Codex runtimes from one canonical source. Three-zone structure: (1) `skills/` (repo root) — runtime-neutral shared sub-skills, schemas, constitution, [[canonical expert spec]]s; (2) `.claude/skills/` — Claude Code entry-point `SKILL.md` files only (runtime-coupled); (3) `.agents/skills/` — Codex entry-point `SKILL.md` files only (runtime-coupled). Expert agent runtime wrappers generated via [[agent wrapper generation]] into `.claude/agents/` and `~/.codex/agents/`. Rule: if a file contains no runtime primitives, it lives in `skills/`; if it references `EnterWorktree`/`Agent`/`spawn_agent`/etc., it lives in the runtime-specific entry point.
_Avoid_: symlinked or copied shared content (drifts); writing runtime primitives into `skills/` shared files; hand-maintaining both entry-point SKILL.md files without a shared sub-skill tree

**AGENTS.md router**: Repo-local `AGENTS.md` block that routes natural trigger phrases to Codex skills. Tiny by design — trigger phrases only, no workflow content. Example: "when user says 'ship it' or 'implement feature X', use e2e-engineering skill." Generated from skill `description` frontmatter if possible, to prevent drift between AGENTS.md triggers and SKILL.md trigger list. Codex reads this at session start; skills remain the implementation layer. Claude Code equivalent: harness auto-reads SKILL.md `description` for trigger matching — no separate routing file needed.
_Avoid_: duplicating workflow logic into AGENTS.md (it is a router, not a spec); omitting capability gate note for e2e-flight (Step 0 probe fires even when routed from AGENTS.md — fanout-unavailable exits cleanly)

**Slice gap-check**: Subagent's FIRST move before TDD — validate the story is implementable (clear acceptance criteria? `testCases` present? `depends_on` real?). Gap → escalate ONE question to orchestrator, do not guess. Catches upstream under-spec before a wasted TDD attempt. Distinct from [[grill-with-docs]] (which handles LANGUAGE in pre-impl, before gate 1 — not per-slice). The TDD red phase catches remaining behavioral ambiguity.

**grill-with-docs placement**: Runs ONCE in pre-implementation, AFTER map-codebase and before to-prd — reconciles PRD direction + (brownfield) codebase-map existing-language against CONTEXT.md glossary while it brainstorms. Implementation does NOT re-grill; slices inherit shared language via CONTEXT + [[constitution]]. Per-slice gap-finding is the [[slice gap-check]]'s job, not re-grilling language. Runtime-agnostic — lives in `skills/grill-with-docs/` in the [[dual-runtime skill tree]].

**Pre-impl expert consultation**: Expert advisory input during the to-prd phase, before PRD approval. Three-tier model: (1) **Default — inline** — orchestrator loads [[canonical expert spec]] files as advisory context while drafting PRD, synthesizes tradeoffs and testing decisions into `prd.json`; no fan-out probe required. (2) **Escalated — manifest-driven fan-out** — for high-risk PRDs (schema-heavy, security-sensitive, cross-service architecture, complex UX/state machines, or user-requested expert review); orchestrator spawns advisor agents, collects advisory manifests, synthesizes into PRD before gate 1. (3) **Required — independent fan-out** — post-impl [[expert-review wave]] only; never sequential inline there. Fan-out [[forcing mechanism]] probe runs only when implementation starts, not during pre-impl.
_Avoid_: running fan-out probe at pre-impl time (premature — impl may never start); mandating fan-out for every PRD (most are inline-adequate); sequential inline for post-impl review (independence is load-bearing there)

## Multi-task flight

**/e2e-flight**: Headless implementation worker, sibling to [[/e2e-engineering]] (ADR 0022). Implements exactly ONE Task from the [[Task queue]] per invocation, then exits — no driver loop, no context monitoring; re-invoke for the next Task. WITHIN the spawn it IS the orchestrator: Step 0 forces fan-out (`ToolSearch`-loads `Agent`+`EnterWorktree`; inline slice-impl = hard STOP), then per slice → impl sub-agent wave → [[Expert agent]] review wave (in worktree, before merge) → merge → record. After the DAG drains: e2e-QA stub (gates 4/5 stubbed) → self-review → write qa-signoff.md → exit.
_Avoid_: "the orchestrator" (that's [[/e2e-engineering]]'s interactive role), "external driver" / "detached window" (flight runs in the current session, no loop)

**/e2e-engineering**: Interactive, human-driven front door. Owns pre-implementation per feature ([map-codebase?] → grill-with-docs → … → to-prd → hard gate 1), appends each approved feature to the [[Task queue]] (born `selected:false`), and at launch shows the [[Run selection]] checkbox as a HARD interactive stop — never pre-checks all, never auto-launches — then invokes [[/e2e-flight]] ONCE for the chosen set. Also auto-detects [[pending-qa]] Tasks on entry and offers the [[QA sign-off session]]. The only skill a human types (though a human may also type [[/e2e-flight]] directly to drain an existing selection).

**Task queue** (`.e2e-engineering/queue.json`): Cross-Task ordering layer ABOVE per-Task `prd.json` — the repo's documented backlog of [[Task]]s. Each entry: `id`, `priority`, `dependsOn` ([[Task dependsOn]]), `status`, `selected` ([[Run selection]]). Two disjoint-field writers, never concurrent: [[/e2e-engineering]] creates entries (at gate 1); [[/e2e-flight]] flips `status`. Each Task's body lives in `.e2e-engineering/tasks/<id>/` (prd.json, progress.txt, codebase-map.md, research.md, test-cases/, handoff.md, [[qa-signoff.md]]) — the **Task root**.

**Task root**: The dir every per-Task artifact is written into — `.e2e-engineering/tasks/<id>/` in multi-Task mode, `.e2e-engineering/` single-Task legacy. The orchestrator fixes it ONCE at pre-impl start (SKILL.md Step 1, `<id>` = feature slug); map-codebase / grill-with-docs / research / to-prd / to-issues / checkpoint all write DIRECTLY into it. Never write to base `.e2e-engineering/` then copy into `tasks/<id>/` — that leaves dirty duplicate prd/progress/test-cases at the root. Gate-1 queueing appends only the [[Task queue]] entry; the body is already in place.
_Avoid_: writing prd/progress/test-cases to base then moving them; deciding `<id>` only at gate 1 (too late — artifacts already landed at base)
_Avoid_: "backlog" (overloaded — story-level work is the issue tracker), "feature list"

**Task `dependsOn`**: Cross-Task dependency edge in [[Task queue]] (camelCase). DISTINCT from story-level `depends_on` (snake_case, the within-PRD tracer→schema→logic→ui DAG). The casing IS the scope signal. Selecting a Task auto-includes its unmet `dependsOn` Tasks.
_Avoid_: writing it `depends_on` (collides with the story-level field)

**Run selection** (`selected` flag in queue.json): Which queued Tasks THIS flight drains. Orthogonal to `priority` (ordering) and `status` (lifecycle). Set via the checkbox [[/e2e-engineering]] shows at launch; flight drains only `selected:true` + `status:todo`, in priority + `dependsOn` order.

**pending-qa**: Task [[status]] between `in-progress` and `done`. Flight has run everything automatable (gates 4, automated half of 5, review) and parked human sign-off in [[qa-signoff.md]]. Only the [[QA sign-off session]] flips `pending-qa → done`. `<e2e-complete>` fires when no selected Task is `todo`/`in-progress` (all are pending-qa/done/blocked).

**qa-signoff.md** (`tasks/<id>/qa-signoff.md`): Per-Task human checklist written by flight when it defers human-QA. Holds manual test cases to walk, auto-verified ACs to eyeball, pending amendments to promote/drop, and a [[QA finding]]s section. The audit record; [[Task queue]] holds the actionable state.

**QA sign-off session**: Batched post-flight human pass (option B), entered via bare [[/e2e-engineering]] (auto-detected) or `/e2e-engineering qa`. Walks every [[pending-qa]] Task's [[qa-signoff.md]], approves (→ `done`) and clears pending amendments in one touch. Wraps the existing post-impl human-qa sub-skill across multiple Tasks.

**QA finding**: An issue logged during the [[QA sign-off session]]. Routed through the existing `triage` sub-skill into a NEW [[Task]] in the queue — a bug becomes a linked bugfix Task (the built Task still goes `done`, not reopened); a new idea becomes a feature Task (`status:todo`, unselected). Closes the loop: findings re-enter the queue for a future flight.

## Relationships

- **e2e-engineering** detects entry **Phase** and sequences sub-skills
- **Task** owns one `prd.json` and one `progress.txt`; resets both on new task
- **Phase** contains exactly one **Loop**
- **Loop** iterates over **Goals**; exits when exit condition met
- _[SUPERSEDED — ADR 0022]_ ~~**Checkpoint** saves at 65% context within any **Phase**~~ — no checkpoint / context monitoring; resume via state files
- **Phase transition** saves **Checkpoint** then starts fresh session
- **E2E gate** is exit condition for **Implementation** loop (not just post-impl)
- **Implementation** loop dispatches the [[ready set]] from the depends_on DAG to parallel subagents; orchestrator is [[sole writer]] of prd.json + progress.txt at fan-in
- Every implementation subagent is injected with the [[constitution]]
- **Post-implementation** human-QA gate is the single human-approval chokepoint: clears QA sign-off AND [[pending amendment]]s in one touch — human routes each amendment to [[constitution]] (generic) or [[ARCHITECTURE.md]] (project-specific) or drops it
- **[[ARCHITECTURE.md]]** is read by to-issues (pins [[integration decision]]), fan-out (scoped slice per subagent), and [[quality check]]; written only in human phases (pre-impl seed, post-impl amend) — never by the implementation loop
- **grill-with-docs** drives the **Pre-implementation** loop (after [[map-codebase]] on brownfield); output = caveman:ultra notes + conflict-free language handed to **to-prd**
- **to-prd** converts grill-with-docs notes into formal PRD; owns its own interview step (no double-interview)
- **Implementation** starts at **to-issues** — no grill step (language was settled in pre-impl grill-with-docs)
- **Fresh session bootstrap** sequence applies to both phase transitions AND mid-phase context restarts
- **[[/e2e-engineering]]** (interactive) produces [[Task queue]] entries; **[[/e2e-flight]]** (headless) consumes them — disjoint writers, sequential in time
- **[[Task queue]]** holds many **[[Task]]**s; each Task still owns one prd.json + progress.txt under `tasks/<id>/`
- **[[/e2e-flight]]** holds at most ONE Task `in-progress` — Task-to-Task drain is serial; parallelism lives INSIDE a Task (fan-out/fan-in slices)
- **NO loops, NO external driver** (ADR 0022). `/e2e-flight` runs in the current session, one Task per spawn; within it, fan-out to slice + expert sub-agents is the only iteration.
- **[[QA finding]]** flows QA sign-off → triage → new **[[Task]]** in the [[Task queue]] — the cycle closes back on itself
- Fresh **[[/e2e-flight]]** bootstrap = read [[Task queue]] (which Task) THEN the existing **Fresh session bootstrap** (handoff → prd.json → progress.txt)

## Flagged ambiguities

- "task" vs "goal" — task = business unit (owns files), goal = loop-level work unit. Never swap.
- "E2E" scope — E2E tests are both implementation loop exit gate AND post-impl verification artifact. Not post-impl only.
- "progress.txt append-only" — true within a task; reset when new task begins. Holds under parallelism because the orchestrator is the [[sole writer]] — subagents return summaries, never append directly.
- "one slice per iteration" — SUPERSEDED. The unit per iteration is the [[ready set]] (DAG-driven), which may fan out to multiple parallel subagents. See ADR 0006.
- "depends_on" — scope-overloaded. Story-level = snake_case `depends_on` (within one PRD); Task-level = camelCase `dependsOn` (across the [[Task queue]]). Casing disambiguates; never write Task deps as snake_case. See ADR 0017.
- "single e2e-engineering skill" — REFINED. Split into interactive [[/e2e-engineering]] + headless [[/e2e-flight]] along the human/headless seam. See ADR 0016.
- "loop" — _SUPERSEDED by ADR 0022._ No external Task-drain loop and no in-session impl loop survive: `/e2e-flight` runs one Task per spawn and exits. The only "iteration" is the per-slice fan-out (impl wave + expert-review wave) inside that single spawn. ADR 0005/0015 two-loop model is retired.
