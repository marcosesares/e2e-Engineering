# Explicit hard/soft gate taxonomy

> **AMENDED by ADR 0024 (Fork Y).** Hard-gate set is now {1, 2, 3, 5} — gate 4 (E2E green) retired; gate 5 rescoped to full unit+API suite green + AC-checklist-vs-code (no live-UI exercise), executed in self-review. Gate 2 extended: API/integration red-green via Playwright `request`. Labels kept stable (4 retired, not renumbered).

e2e-engineering formalizes superpowers' gate distinction instead of leaving phase exit conditions implicit. Hard gates cannot be passed without explicit human consent: (1) PRD approved before implementation, (2) TDD red phase — a failing test before any production code, (3) debug escalation — after 3 failed fix attempts, stop and escalate, (4) E2E green before post-implementation, (5) verification-before-completion before marking work done. Soft gates can be overridden with logged justification: coverage %, lint, style.

We adopt this because superpowers' domain analysis identifies red-flags tables tied to hard gates as the highest-fidelity behavior-shaping tool — the thing that stops agents rationalizing past process steps. Each gate is rendered as a red-flags line in the relevant sub-skill. This pulls two previously-unlisted sub-skills into e2e-engineering: systematic-debugging (owns gate 3) and verification-before-completion (owns gate 5).
