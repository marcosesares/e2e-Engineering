# Stuck Flight Runs Report — UniVerse.Academy e2e-flight

Compiled from the harness's own session records for the client project and from the
committed postmortems under `.e2e-engineering/tasks/*/reports/`. Read-only investigation;
no client files were modified.

Sources:
- `%AppData%\reasonix\projects\c--views-universe.academy\sessions\*` (session/turns/events JSONL)
- `...sessions\subagents\sa_*.jsonl` + `.meta.json` (worker transcripts)
- `...sessions\<session-id>.jobs\task-*.json` (orchestrator job records)
- `.e2e-engineering\tasks\*\reports\*.md` (committed postmortems)

Method: enumerated all 70 session metas, filtered to headless `/e2e-flight` runs,
extracted the model's OWN tool results while excluding skill/KB text, then classified
"stuck" = a tool that returned `blocked: ... forbid state mutation`, `error: context
canceled`, a harness `status: killed/failed`, a bounded-run timeout, or a stuck incident
recorded in a committed postmortem.

---

## Recurring root signatures (every stuck run shows a subset)

1. **Permission posture fail-closed** — mutation-shaped calls return
   `blocked: the current constraints forbid state mutation` while read-shaped calls pass,
   even though `reasonix.toml` and the global `config.toml` both say `mode = "allow"`.
   The config comment names the trigger: `"ask" + no interactive approver = fail closed`.
2. **Unbounded / foreground command** — `find /`, a foreground sleep-poll, or an
   editor-prompting `git merge` blocks; the harness cancels the WHOLE turn
   (`error: context canceled`), and the parent keeps polling a dead worker
   (`jobs/*.json` already says `status: killed`, but `wait` still reports `running`).
3. **Silent-looks-stuck** — a long bounded producer with no interim heartbeat + a
   truncated final text reads as "hung" even while healthy.

---

## Individual stuck runs (chronological)

### 1. surface-api-error-messages-ui — concurrent-flight HEAD-thrash (earliest)
- **Issue:** two flights in one working directory. `admin-user-creation-saga` checked
  out `slice/admin-user-saga` as the MAIN repo branch mid-merge.
- **What got stuck:** orchestrator git ops — the api-error-body merge and the
  ui-error-surface commit landed on the WRONG branch; later `cd`-based git ran in the
  wrong directory.
- **Command shape:** in-command `cd` + `git merge` against a main-repo HEAD another
  flight had moved.
- **Resolution:** isolated task worktree + cherry-pick both commits; ~60–100k context
  tokens lost.
- **Source:** `tasks/surface-api-error-messages-ui/reports/flight-log.md` §INCIDENT.

### 2. payments-monetization (2026-08-19) — three hangs, one flight
- **A — tsc via in-command chdir + pipe-to-filter:**
  `Set-Location .claude/worktrees/slice-professor-pricing/frontend; npx tsc --noEmit -p
  tsconfig.app.json 2>&1 | Out-String; "EXIT: $LASTEXITCODE"` — zero streamed output,
  verdict invisible until exit; a failed chdir silently fell back to the main tree.
- **B — bare `git merge`:** 4 chained merges; a non-ff bare `git merge` (no `--no-edit`)
  opens the default editor and blocks a non-interactive shell forever.
- **C — stuck reviewer agent:** reviewer stuck thinking, cancelled, re-dispatched at
  halved scope → clean.
- **Source:** `tasks/payments-monetization/reports/flight-stall-postmortem-20260819.md`.

### 3. payments-monetization gradle-hang (same flight) — 2 worker stalls + 2 broken writes
- **Issue:** (a) PowerShell `"command 2>&1"` is a quoted STRING, not a redirect →
  evidence logs were 30 bytes of literal command text; (b) Gradle daemon contention
  (`--no-daemon` used inconsistently) → next invocation waits on the lock forever;
  (c) no explicit `timeout` → a hung daemon blocks the worker forever.
- **Commands stuck:** `./gradlew :backend:compileJava` (daemon-lock hang); the broken
  `"cmd 2>&1"` redirects.
- **Source:** `tasks/payments-monetization/reports/gradle-hang-postmortem.md`.

### 4. fix-ac8-concurrent-create-idempotency — 14 incidents, two sessions (2026-09-01)
- **Session 1 (I1–I6):**
  - **I1 — false `sandbox-write-denied`:** the write probe `echo x > probe.tmp && rm ...`
    was blocked once by the ask-posture; declared `<e2e-stall reason="sandbox-write-denied" />`
    and stopped the flight, though posture was actually `allow` and self-healed next turn.
  - **I2 — truncated turn:** a huge reconcile burst ended mid-sentence, no runnable status.
  - **I3 — fan-out arg errors:** `use_capability(tool:fleet)` with an unknown `name` field
    → `json: unknown field "name"`; then `write_paths` workers lost `bash` (SPEC §3.12)
    → couldn't compile/test/commit; fleet blocking-dispatch masked a multi-min gradle run.
  - **I4 — wrong invocation shape:** `use_capability(action=call, capability_id="tool:task")`
    → `capability_id is required for action=call`.
  - **I5 — gate-5 infra collapse:** full suite 3× failed with 680 skipped +
    `password authentication failed for user "test"`; root cause only on pass 3 — a stale
    `youthful_galileo` DevServices postgres + a compose project run under a worktree-derived
    name that a repo-root `down` missed.
  - **I6 — skipped≠0 misread:** treated one legit `@EnabledIf` skip as a gate-5 failure.
- **Session 2 (I7–I14):**
  - **I7 — foreground poll killed:** `for i in $(seq 1 30); do ... sleep 10` foreground
    loop killed mid-wait (should have been background + watchdog).
  - **I8 — MAIN EVENT — three subagent workers wedged ≥75 min with ZERO disk output**
    (AC8 slice 1, workers 39/40/41). No heartbeat discipline for `tool:task` subagents
    (they stream no log); the 15-min host `stalled_warning` was ignored; ~60 min lost.
  - **I9 — invalid failing test caused the cascade:** worker 39's test used raw
    `CompletableFuture`+`CountDownLatch` on a reactive backend → HR000069/HR000068
    thread-affinity crashes; every re-dispatch hit the same wall.
  - **I10 — identical re-dispatch:** same brief 3× → same wedge.
  - **I11 — stranded uncommitted worker output (task-45):** 6 files uncommitted when killed.
  - **I12 — main-tree drift + 0-byte prd.json** (`git show <rev>` Windows path mangling).
  - **I13/I14 — contract + user-expectation gaps** (not literal stalls).
- **Source:** `tasks/fix-ac8-concurrent-create-idempotency/reports/session-painpoints-postmortem-20260901.md`.

### 5. fix-playwright-api-isolation (2026-08-28, session `...194037…`, 2385 tool calls)
- **Issue:** posture fail-closed + unbounded gradle in a worktree.
- **Exact stuck commands (turns ledger):**
  - `cd .../task-fix-playwright-api-isolation && git switch -c slice/pw-det-student-lookup && git stat…` → `blocked`
  - `cd .../task-fix-playwright-api-isolation && echo test > /tmp/xyz-test-write.txt && cat /tmp/xyz-t…` → `blocked`
  - `edit_file` on a worktree path → `blocked`
  - `cd .../task-fix-ac8-concurrent-create-idempotency && CI=1 QUARKUS_HTTP_TEST_PORT=18081 ./gradlew…` → `error: context canceled` (4×)
- Same disease as the mp-pix-tracer run: unbounded/foreground gradle + fail-closed posture
  + turn cancellation, then `wait` polling a corpse.

### 6. mp-pix-tracer (2026-09-06, session `...031622…`) — the run that sparked this report
- **Issue 1 — fail-closed posture:** mutation-shaped calls blocked
  (`cat reasonix.toml`, `sed -n`, `write_file .probe-worker-write`, `git add`,
  `kill_shell task-7`) while reads passed (`git status`, `ls`, `grep`, `read_file`).
- **Issue 2 — task-7 impl worker "ran" 2h34m dead.** Last command
  (subagents/sa_...033913.jsonl entry [40]):
  ```
  find / -name "quarkus-junit5-*.jar" 2>/dev/null | head -3;
  find ~ -path "*quarkus-junit5*jar" 2>/dev/null | head -3;
  find / -path "*io.quarkus/quarkus-junit5*" -name "*.jar" 2>/dev/null | head -5
  ```
  → `error: context canceled`. Harness `jobs/task-7.json` says `status: "killed"`,
  `finishedAt 06:13:47Z` (2h34m after start); `.meta.json` says `status: "failed"`;
  but `wait` kept returning `[task-7 (task)] running` the whole time.
  - Verified separately: the same `find` completes in ~8s when `timeout 20`-bounded —
    the command is not the blocker; unboundedness + turn cancellation is.
- **Issue 3 — task-8/task-9 rescue workers landed with only a system message** (1 entry,
  never received their prompt) → also `status: killed`, `Subagent reference (failed)`.

---

## The recurring "which command" ledger

| Command / pattern | Failure | Seen in |
|---|---|---|
| `cat reasonix.toml`, `sed -n …`, `echo > …` (mutation-shaped bash) | `blocked: forbid state mutation` | I1, mp-pix, fix-playwright |
| `write_file` / `edit_file` / `git add` / `kill_shell` | `blocked: forbid state mutation` | mp-pix, fix-playwright |
| `find / -name …` (bare, unbounded) | `error: context canceled` → 2h34m corpse | mp-pix task-7 |
| `CI=1 QUARKUS_HTTP_TEST_PORT=… ./gradlew …` (foreground, no timeout) | `error: context canceled` | fix-playwright, fix-ac8 |
| `Set-Location …; npx tsc … \| Out-String` | silent-hang / wrong-tree verdict | payments flight-stall |
| bare `git merge` (no `--no-edit`) | editor-prompt block | payments flight-stall |
| `./gradlew :backend:compileJava` (daemon lock, no `--no-daemon`/timeout) | indefinite wait | payments gradle-hang |
| `"cmd 2>&1"` as a quoted PowerShell string | 30-byte fake logs | payments gradle-hang |
| two flights in one dir (`cd` + git against moved HEAD) | wrong-branch commits, 60–100k tokens | surface-api-error-messages-ui |
| `for i in $(seq 1 30); do … sleep 10` (foreground poll) | killed mid-wait | fix-ac8 I7 |

---

## Summary table

| Flight | Date / session | Primary stuck mechanism | Resolved by |
|---|---|---|---|
| surface-api-error-messages-ui | earliest | concurrent-flight HEAD-thrash | isolated task worktree |
| payments-monetization | 2026-08-19 | tsc pipe-filter + bare merge + stuck reviewer | log-file redirect, `--no-edit`, bounded budget |
| payments-monetization (gradle) | 2026-08-19 | daemon lock + broken PS redirect | `--no-daemon`, `cmd /c` (later: `--stop` banned) |
| fix-ac8-concurrent-create-idempotency | 2026-09-01 (2 sessions) | posture false-stall; wedged workers 39/40/41; foreground poll | two-tier write probe, disk-snapshot watchdog, background+bounded poll |
| fix-playwright-api-isolation | 2026-08-28 (`…194037`) | posture block + canceled gradle runs | (session wrote the postmortem) |
| mp-pix-tracer | 2026-09-06 (`…031622`) | posture block + task-7 `find /` cancel (2h34m corpse) + empty rescue workers | not fixed in-flight — fixes proposed: write-triad probe + read `jobs/*.json` status |

---

## Notes on "0-tool-call" sessions

`20260902-193008`, `20260903-001624`, `20260903-003214`, `20260903-204335`,
`20260904-021335`, `20260904-202043`, `20260904-215800` are early probe / abandoned
launches: the model's first turn produced no tool calls (probably bailed / empty), so
there is no stuck command to name for them. Listed here as attempted launches, not
stuck flights.

## Proposed fixes (from chains 1–4; do not edit client skill files here)

1. **Write-triad Step-0 probe** — three canaries (shell write, `write_file`,
   `kill_shell` on a dummy job); any `forbid state mutation` → named stall
   (`permission-posture-ask`) and stop, instead of mid-flight discovery.
2. **Watchdog reads the harness job records** — primary kill signal =
   `jobs/*.json` `status: killed/failed` and `Subagent reference (failed)`,
   not `wait`-reported `running`.
3. **Disk-snapshot liveness** for subagents (heartbeat mtime + `git status` delta;
   15-min no-change → kill).
4. **Bounded + background** for every wait > 60s; never foreground sleep-loops or
   bare `find /` / editor-prompting git.
5. All skill changes belong in C:\Views\e2e-Engineering (authoring project), never in
   the client UniVerse.Academy.
