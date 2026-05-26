# verification — verify-before-completion (gate 5)

Final Implementation-phase check, AFTER E2E green (gate 4). Distinct from gate 4: gate 4 = automated E2E suite green; gate 5 = full suite re-run + LIVE exercise of the feature + every PRD acceptance criterion ticked. Catches what automated E2E misses — visual/interaction regressions, criteria not encoded as tests. Provenance: superpowers verification-before-completion. Wires existing harness skills — does NOT reimplement app launching.

## Context check — mandatory before starting

Before any step below, check current context size.

- If context ≥ 65%: write handoff + flush prd.json + progress.txt, then end session per [context-checkpoint](../cross/context-checkpoint.md). Do NOT enter the Playwright loop. Fresh session picks up GATE 5 from handoff at ~20% context.
- Live browser verification adds ~2–4K tokens per call (navigate + snapshot + screenshot + evaluate). A full acceptance-criteria walk runs 15–30 calls = 30–90K tokens. Entering at ≥ 65% guarantees compaction mid-flow (see BR-PLAYWRIGHT-01).

## What to do
1. **Full suite re-run** — ALL tests (not just changed slices). Confirm green from a clean state.
2. **Live exercise** — invoke `/run` (launch the app) + `/verify` (exercise + observe). For web UI, drive the real browser; for CLI/server/lib, use the run/verify skill's per-project pattern. Watch the golden path AND edge cases; watch for regressions in other features.
3. **PRD acceptance-criteria checklist** — walk every story's `acceptanceCriteria[]` and tick each against observed behavior. Untick-able = not done.

## HARD GATE 5 — verification-before-completion
Passing ALL THREE = implementation done → hand to post-implementation. If the UI/feature can't be exercised, SAY SO explicitly — do not claim success on tests alone.

## Red flags (stop)
- Marking done on a green test suite without live exercise (gate 4 ≠ gate 5).
- Claiming a UI works without driving it in a browser.
- An acceptance criterion with no evidence it's met.
- Re-running only changed slices instead of the full suite.
