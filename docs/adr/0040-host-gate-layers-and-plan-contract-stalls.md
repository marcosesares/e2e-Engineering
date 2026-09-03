# Host gate layers and plan-contract stalls

**Status:** accepted — refines ADR 0038 (DSH runtime profile: replaces the config-read Tier-1 write probe and the single-cause `sandbox-write-denied` doctrine). Amends Step-0 probe 4 and the DSH gate taxonomy only; gates 1/2/3/5, dispatch mechanics, and the finding state machine unchanged.

A 2026-09-02 DSH flight against `fix-keycloak-worker-token-expiry` (UniVerse.Academy) burned two full sessions — 104 and 179 host blocks respectively — before stalling. Every block read `blocked: the current constraints forbid state mutation`. The orchestrator ran probe 4 Tier 1, read `reasonix.toml` `[permissions] mode = "allow"`, concluded "Tier 1 LOOKS writable", and then attributed the denials to the sandbox — emitting `sandbox-write-denied` and advising the operator to "re-run in a session whose shell allows workspace writes". That advice was unactionable: the shell was never the gate, and the operator had already set every config the skill told it to check. Toggling YOLO did not clear it either.

The message is emitted by the host's plan/phase contract, which is enforced **before** Permissions and Sandbox. A config read can therefore never establish write capability, and the operator's fix (exit Plan mode / approve the plan) is nothing like the fix for a sandbox denial.

## Context

- **The host has three independent gates, not one.** Reasonix v1.32.1 documents the ordering directly: "Plan mode […] workflow, not an all-tools read-only mode. **Before Permissions/Sandbox, the host enforces explicit phase opt-outs**." An outer block never reaches the inner layers.
- **The plan contract owns a distinct message family** (`reasonix/internal/agent/planned_mutation_policy.go`, alongside `plan_contract.go`): `blocked: the current constraints forbid state mutation` / `forbid verification commands` / `forbid push/publish/deploy-style actions`, plus the pre-approval `blocked: plan mode forbids workspace mutations until the plan is approved`. These four strings are a reliable discriminator.
- **Layer 2 is itself two sub-layers.** `reasonix.toml [permissions] mode` is only the rule-miss fallback; the session runtime mode (`--permission-mode`, default `ask`) is separate and the config file cannot set it. A worker has no interactive approver, so `ask` fails closed for workers even when the orchestrator is interactive.
- **Config reads are not capability proofs.** ADR 0038's Tier 1 asserted that `mode="allow"` + `allow_dynamic_bash=true` + workspace-root confinement *is* the full-access writer posture. It is necessary, not sufficient, and it is silent about layers 1 and 2b.
- **The two failures need opposite operator actions.** A sandbox denial means the session cannot write and must be replaced. A plan-contract block clears in one keystroke inside the running session. Collapsing them into one stall reason misroutes the operator every time.

## Decision

1. **Probe 4 Tier 1 becomes a real mutation.** Create + delete one throwaway file under the workspace root. `reasonix.toml [permissions] mode` is retained only as a fast negative — `ask`/`deny` stalls early; `allow` advances nothing on its own.
2. **Classify every write denial by the host's exact message before stalling.** The four plan-contract strings above → `plan-contract-active`. Any other repeated denial → `sandbox-write-denied`.
3. **New stall reason `plan-contract-active`.** Its remediation is in-session: exit Plan mode or approve the plan, then re-run. It must never be reworded as a sandbox or permissions fault, and must never advise re-running in a different shell.
4. **`impl/dsh-runtime.md` §Sandbox modes becomes §Host gate layers**, recording all three gates, their messages, and which layer each config actually reaches.
5. **Both stalls stay FINAL.** Neither is retried or looped. A single denial before classification is diagnosis, not a stall.

## Considered Options

- **Reword `sandbox-write-denied` instead of adding a reason.** Rejected: one reason cannot carry two opposite remediations, and existing `resume.json` sidecars would silently change meaning.
- **Keep the config read and add a second config read for the runtime mode.** Rejected: the runtime permission mode is not exposed in any file, and layer 1 is not a permissions concept at all. No amount of reading proves a write.
- **Probe layer 1 by name (detect Plan mode directly).** Rejected: no tool surfaces the active phase contract, and reasonix retired automatic plan mode, so the state is operator-driven and can change mid-session. The message string is the only reliable signal.

## Consequences

- Step 0 costs one extra real file write. Negligible, and it is the only honest proof.
- Operators hitting layer 1 now get a one-keystroke fix instead of being told to rebuild their session.
- `plan-contract-active` joins `fanout-unavailable`, `worker-changes-unavailable`, `shared-skills-missing`, `sandbox-write-denied`, and `unbounded-shell` in the flight stall vocabulary. Additive — no existing sidecar changes meaning.
- Layer detection is message-string-based and therefore host-version-coupled. Strings verified against reasonix v1.32.1; a host that reworded them degrades to `sandbox-write-denied`, which is the pre-ADR behaviour, not a regression.
- ADR 0038's "Sandbox modes constrain the shell" framing is superseded for diagnosis purposes; its ConstrainedLanguage facts remain correct and now live under layer 3.
- Claude Code and Codex entries are untouched — `.claude/skills/e2e-flight/SKILL.md` has no capability probe, and the DSH probe set is DSH-only.
