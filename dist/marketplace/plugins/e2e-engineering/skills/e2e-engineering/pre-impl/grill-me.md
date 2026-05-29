# grill-me — pre-impl brainstorm loop

Karpathy-style brainstorm. Greenfield only. Stateless, one question at a time, NO external doc dependencies (distinct from grill-with-docs, which reconciles against existing docs/codebase for brownfield). Loops until the user approves the direction. Provenance: mattpocock grill + superpowers brainstorming gate.

## What to do

Interview the user relentlessly about the idea until you reach a shared, concrete understanding. Walk down each branch of the design tree, resolving dependencies one at a time. For each question, give your recommended answer.

- Ask ONE question at a time. Wait for the answer before the next.
- If a question can be answered by reading the code, read the code instead of asking.
- Stress-test with concrete scenarios. Probe edge cases. Force precision on boundaries.
- Push back: if you see a simpler approach, say so (constitution: think-before-coding).
- No documents produced here — output is caveman:ultra brainstorm notes handed to [to-prd](./to-prd.md).

## Gate the conditional pre-impl steps

Before exiting, decide and record (in the notes) which conditional steps fire:

- **research?** — YES if the task leans on external APIs / unfamiliar libs / unknown protocols. Else NO.
- **prototype?** — YES if there is taste/UX or state-machine uncertainty that needs concrete feedback. Pick the branch: **ui** (visual variants) or **logic** (state machine / terminal). Else NO.

(map-codebase is predetermined by the orchestrator: greenfield = no, brownfield = yes. grill-me only runs for greenfield.)

## Exit
User approves the direction → hand caveman:ultra notes + the conditional-step decisions to the orchestrator, which sequences map-codebase / research / prototype / to-prd.

## Red flags (stop)
- Running grill-me for brownfield (use grill-with-docs instead; it reconciles brainstorm against existing code/docs).
- Building anything here — this is brainstorm only.
- Asking a question the codebase already answers (greenfield → no codebase, but don't ask about things the user just said).
- Moving on while the user is still uncertain about the core direction.
