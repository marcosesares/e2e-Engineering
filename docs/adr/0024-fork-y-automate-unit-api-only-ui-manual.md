# Fork Y — automate unit + API/integration only; UI E2E stays manual; retire gate 4, rescope gate 5

**Status:** accepted — supersedes ADR 0001; amends ADR 0007, ADR 0010, ADR 0018.

Gates 4 (E2E suite green = implementation-loop exit) and 5 (verification-before-completion, incl. live-UI exercise) have been **stubbed since ADR 0022** and never ran; the skill ships on the interim net (gate 2 + gate 3 + expert review + lint/compile + self-review + human-QA checklist). Moving to finally implement E2E surfaced a fork: automate UI E2E (Playwright UI — POM/locators/`getByRole`) or keep UI verification manual.

## Context

An autonomous/headless agent maintaining UI locators across parallel slices is a flake source — Playwright's own guidance flags E2E as slow, brittle, "critical flows, not coverage padding." Agent live-UI verification (opening the app, `/run` + `/verify`) is costly. The stable, fast layers (unit, API) carry most of the assurance at a fraction of the maintenance.

## Decision (Fork Y)

1. **Automate only unit + API/integration.** Unit → Vitest/Jest (red-green unchanged). Every implemented API call gets **red-green Playwright `request` tests** (API/integration) under **gate 2**.
2. **UI E2E is not automated.** UI test cases carry disposition **Manual** and become the human-QA walk script (ADR 0018). Playwright in this flow drives API/integration, not browser UI.
3. **Retire gate 4.** The "E2E suite green before impl exit" condition is dropped for UI; the automated unit+API full-suite-green check moves into gate 5. Hard-gate set becomes **{1, 2, 3, 5}**. Label "5" is kept (4 retired, **not** renumbered — avoids churning every ADR cross-reference).
4. **Rescope gate 5 (still a HARD gate, agent-enforced).** = run the full automated suite (unit + API) green **+** AC-checklist against code (every PRD acceptance criterion maps to implementation). **Drop** the live-UI exercise (`/run` + `/verify`). Executed inside **self-review**. Blocks `done` on a red suite or an unmet AC. Hard ≠ needs-human — like gates 2/3 it is agent-internal and non-overridable.
5. **Test architecture is seeded in pre-impl, read in flight.** How the project runs unit/API, where the Playwright config + API-test layout live, is recognized/defined in **e2e-engineering pre-impl** (human phase) and written to **ARCHITECTURE.md**; **e2e-flight reads it, never writes it** (ADR 0013).
6. **Fix loop honors gate 3.** The "read Playwright report → loop fixing the failing TC" cycle runs under gate 3's 3-strike escalation; no blind retry past the cap.

## Considered Options

- **Fork X — automate UI E2E** — rejected: brittle locators maintained AFK across parallel slices = flake factory; high maintenance for low marginal assurance over a human walk; agent live-UI verification is costly.
- **Renumber gate 5 → 4** — rejected: cosmetic, churns every ADR cross-reference.
- **Delete gate 5 entirely** — rejected: nothing would then block `done` on a red suite or an unimplemented AC.

## API/integration mechanic + standard

- **Mechanic = M1 (run against the real stack).** API/integration tests hit a running docker-compose stack (`baseURL` + auth + stack-up defined per-project in ARCHITECTURE.md §4.1) — real integration, no boundary mocking. Slice worktrees inherit docker env files (flight Step 2/3). Parallel slices share one stack → each test seeds/cleans its own data (namespaced); if isolation impossible, API-test slices serialize via `depends_on`. Rejected: in-process harness (framework-specific), boundary mocking (not integration), shared-instance-no-isolation (parallel contention).
- **Standard = dedicated doc** (`skills/e2e-engineering/standards/api-testing.md`), injected into every slice sub-agent beside the constitution and handed to `test-reviewer`. Holds the `request`-fixture baseline, context flavors, data-isolation + traceability rules. **Override:** a project's existing API-test conventions (recorded in ARCHITECTURE.md §4.1) win over the baseline — no parallel harness.
- **Pre-impl seeds, gate 1 enforces.** ARCHITECTURE.md §4.1 (test architecture) is filled in pre-impl (to-prd, human phase); an API-bearing Task with empty §4.1 stalls at gate 1. Flight READS §4.1, never writes it (ADR 0013).

## Consequences

- **ADR 0001 superseded.** E2E is no longer the implementation-loop exit; UI correctness is verified manually post-impl (`pending-qa` → human-QA walk). The broken-UI-exits risk ADR 0001 guarded against is now caught by the human walk — accepted as the trade for zero UI-automation maintenance.
- **ADR 0010 amended.** Feature-UI-in-slice and regression-final-pass authoring are dropped for UI; per-call API red-green replaces the in-slice executable layer. Markdown UI test cases (Manual) replace automated UI journeys.
- **ADR 0018 amended.** Gate-5's automatable half loses `/run` + `/verify`; keeps full-suite-green + AC checklist.
- **CONTEXT.md** updated: `Hard gate`, `E2E test`, `E2E gate`, `Disposition`, `verification-before-completion`.
- **Carve-out left OFF.** Optional UI smoke via headless Playwright (pre-impl authored, not AFK-maintained) is deliberately not enabled; revisit per-feature only if a make-or-break journey warrants it.
