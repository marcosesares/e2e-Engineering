# Explicit hard/soft gate taxonomy

e2e-engineering formalizes superpowers' gate distinction instead of leaving phase exit conditions implicit. Hard gates cannot be passed without explicit human consent: (1) PRD approved before implementation, (2) TDD red phase — a failing test before any production code, (3) debug escalation — after 3 failed fix attempts, stop and escalate, (4) E2E green before post-implementation, (5) verification-before-completion before marking work done. Soft gates can be overridden with logged justification: coverage %, lint, style.

We adopt this because superpowers' domain analysis identifies red-flags tables tied to hard gates as the highest-fidelity behavior-shaping tool — the thing that stops agents rationalizing past process steps. Each gate is rendered as a red-flags line in the relevant sub-skill. This pulls two previously-unlisted sub-skills into e2e-engineering: systematic-debugging (owns gate 3) and verification-before-completion (owns gate 5).
