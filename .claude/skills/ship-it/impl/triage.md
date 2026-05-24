# triage — 5-state intake (external work + walled candidates only)

5-state intake machine. In ship-it's FORWARD flow, to-issues output is born `ready-for-agent` and SKIPS triage. triage gates only EXTERNALLY-sourced work (bug reports, feature requests arriving from outside) and the WALLED refactor candidates from map-codebase §5. Preserves "never AFK an un-triaged issue" where it matters. Provenance: mattpocock triage (ADO/Jira routing stripped — out of core).

## States
```
needs-triage → needs-info → ready-for-agent
                          → ready-for-human
                          → won't-fix
```
- **needs-triage** — just arrived, unassessed.
- **needs-info** — under-specified; ask for the missing detail, then re-triage.
- **ready-for-agent** — clear enough to become a Task / slice. (to-issues output starts here directly.)
- **ready-for-human** — needs a human decision/action an agent can't make.
- **won't-fix** — out of scope / rejected, with reason.

## What feeds triage
1. External bug reports / feature requests.
2. Refactor candidates from [map-codebase](../pre-impl/map-codebase.md) §5 — each becomes a NEW issue here, human-gated into its own refactor Task. NEVER auto-actioned.

## Red flags (stop)
- Sending forward-flow to-issues slices through triage (they skip it).
- Auto-promoting a refactor candidate to work without human gating.
- Leaving an external issue in needs-triage indefinitely (the rule is: never AFK an un-triaged issue).
