# E2E tests are an implementation loop exit condition, not post-implementation only

E2E tests must pass before the implementation loop exits — alongside TDD green and all stories `passes: true`. This was chosen over the conventional pattern of E2E as a separate post-implementation phase because the skill's loop needs a single unambiguous exit condition that covers both code correctness and user-visible behavior. Deferring E2E to post-impl would allow broken UI to exit the implementation loop and require a second loop, adding a phase transition with no benefit.
