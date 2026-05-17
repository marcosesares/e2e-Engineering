# AI-Engineering

## How to Build Software with AI Agents

### Core principle

The main lesson across the files is simple: **AI does not remove the need for software engineering discipline. It makes discipline more important.**

The workflow is not “ask the AI to build everything and hope.” The workflow is:

```text
Human clarifies the idea
Human and AI align on language and architecture
AI helps produce a PRD
PRD becomes small vertical issues
Agents implement with tests
Agents or humans review
Human performs QA
New issues are created
The loop repeats
```

AI changes the tools, but not the fundamentals: clear requirements, good modular design, small tasks, feedback loops, testing, QA, and review still matter.

---

## Part 1 — Prepare your mindset: AI agents are not magic engineers

The files repeatedly describe agents as useful but constrained. They can write code quickly, explore repositories, implement issues, and even review each other’s work, but they do not naturally carry long-term memory across sessions. That means you need to give them **process, structure, documentation, and feedback loops**.

A helpful mental model is:

```text
Human = strategic programmer
AI agent = tactical programmer
```

The human decides what matters, what trade-offs are acceptable, what the system should become, and where quality boundaries belong. The agent executes tactical work inside that structure. The “de-slop” file makes this very clear: architecture improvement is not something you simply run AFK; it requires judgment from the programmer above the agent.

---

## Part 2 — Make your codebase ready for AI

### 2.1 Why architecture matters more with AI

A messy codebase makes AI worse. If the file system does not reflect the mental model of the application, the AI enters the repo with no prior memory and sees only scattered files. It does not automatically know which modules belong together, which concepts are central, or where responsibilities live.

So before expecting good AI output, you need a codebase that is:

```text
Easy to navigate
Easy to test
Organized around meaningful modules
Built around clear interfaces
Protected by feedback loops
```

The files argue that the structure of the codebase is often more influential than prompts or instruction files. If the system is hard to change, the agent will struggle to change it safely.

---

### 2.2 Use deep modules

A central architectural idea is the **deep module**.

A module is a unit of application behavior: a group of components, functions, services, or capabilities. A module has an **interface**, which is what callers need to know to use it, and an **implementation**, which is the internal code that performs the work.

A **deep module** hides a lot of implementation behind a relatively simple interface. A **shallow module** exposes a complex interface while hiding very little implementation. Deep modules are better because they give the caller more capability with less surface area to understand.

A practical way to think about it:

```text
Bad for AI:
Many tiny files
Unclear relationships
Hidden dependencies
Business rules spread everywhere

Good for AI:
Larger meaningful modules
Clear public interfaces
Tests around module boundaries
Implementation details hidden inside
```

Deep modules give you two major benefits: **locality** and **leverage**. Locality means related changes and bugs concentrate in one place. Leverage means callers get more behavior per unit of interface they need to learn.

---

### 2.3 Define seams and adapters

A **seam** is the boundary where one module talks to another. It is often the best place to test. For example, if a service depends on time, you can define a clock interface and use a real clock in production but a fake clock in tests. The fake clock is an **adapter** that satisfies the same interface.

This matters because agents need reliable places to test behavior. If your seams are unclear, the AI does not know where to write tests or how to isolate behavior.

A good module should therefore have:

```text
A clear public interface
A small number of meaningful exported functions
Tests at the boundary
Adapters for external dependencies
Internal implementation hidden from callers
```

---

### 2.4 Run architecture improvement regularly

The “de-slop” workflow suggests using an architecture-improvement process to identify shallow modules, duplicated concepts, poor locality, missing seams, and untested parallel implementations. In the example, the AI identifies places where frontend and backend logic could drift because two parallel implementations lack a shared seam.

The important part: do not let the AI blindly refactor the whole codebase. Let it **surface candidates**, then you choose which refactor matters.

A useful prompt pattern:

```text
Explore this codebase for architecture-deepening opportunities.
Look for shallow modules, duplicated business rules, unclear seams,
poor locality, and places where tests cannot easily be written.
Do not implement yet. Give me candidates and explain the trade-offs.
```

Then choose one candidate and ask the AI to propose:

```text
The new module boundary
The public interface
The implementation location
The tests needed
The migration plan
The risks
```

---

## Part 3 — Establish shared language before building

### 3.1 Why “Grill Me” is useful

The original **grill-me** skill asks the AI to interview the user relentlessly until both sides reach a shared understanding. It walks down the design tree and resolves dependencies between decisions one by one.

The goal is not to move fast immediately. The goal is to prevent the AI from implementing the wrong thing quickly.

A simple version of the prompt:

```text
Interview me relentlessly about every aspect of this plan
until we reach a shared understanding.
Walk down each branch of the design tree.
Resolve dependencies between decisions one by one.
If a question can be answered by exploring the codebase,
explore the codebase instead of asking me.
```

Use this when an idea is still vague.

---

### 3.2 Prefer “Grill with Docs” when there is a codebase

The newer workflow replaces pure grill-me with **grill-with-docs** when a codebase exists. The problem with grill-me alone is that good terminology may emerge during the conversation but not get documented. Then the user has to re-explain the same domain concepts again in future sessions.

Grill-with-docs adds documentation to the alignment process. It looks for a `context.md` file, uses existing shared language, challenges fuzzy terms, cross-references with code, and updates the documentation as the conversation progresses.

Use this structure:

```text
/context.md
  - Domain vocabulary
  - Core entities
  - Definitions
  - Relationships
  - Terms users see in the UI
  - Terms developers use in code
```

The purpose is to align:

```text
Human language
Code language
Agent language
User-facing language
```

When all four match, the AI needs fewer words to understand your intent and is more likely to generate code that fits the domain.

---

### 3.3 Create ADRs for important decisions

Some decisions are not just vocabulary. They are architectural trade-offs. For those, use **ADRs**: architectural decision records.

The files suggest creating ADRs when a decision is:

```text
Hard to reverse
Surprising without context
The result of a real trade-off
Likely to affect future implementation
```

This prevents future agents from undoing decisions because they do not understand why they were made.

A simple ADR template:

```markdown
## ADR: [Decision title]

### Context

What problem or trade-off led to this decision?

### Decision

What did we decide?

### Consequences

What becomes easier?
What becomes harder?
What should future agents avoid changing casually?
```

---

## Part 4 — Follow the 7 phases of AI-driven development

One file lays out seven phases of AI-driven development:

```text
1. Idea
2. Research
3. Prototype
4. PRD
5. Implementation planning
6. Execution
7. QA
```

These phases can be used for a full app, a feature, a bug fix, or a refactor.

---

### Phase 1 — Start with the idea

The idea can be broad or narrow. It might be a full application, a feature, a bug fix, or a refactor. The important thing is not to jump straight from idea to implementation. The idea is just the starting point.

Start by writing:

```text
What I want to change:
Why I want to change it:
Who it affects:
What must remain true:
What I am unsure about:
```

Then run a grill-with-docs session.

---

### Phase 2 — Research

Use research when the task depends on external APIs, unfamiliar libraries, complex integration details, or parts of the repo that are difficult to explore repeatedly. The research should be cached in a temporary asset like `research.md`, so future agents do not need to rediscover the same information from scratch.

But research can rot. The files warn that research usually belongs to the lifetime of a sprint or idea, not permanently. If it gets stale, it can mislead the agent.

A good `research.md` contains:

```text
External API behavior
Relevant docs
Constraints
Known gotchas
Example calls
Integration risks
Decisions already made
```

---

### Phase 3 — Prototype

Prototype when you need concrete feedback before writing the PRD. This is especially important for UI, UX, state machines, business logic, or external service integration.

The prototype is not the final implementation. It is a learning tool.

Use prototypes to answer questions like:

```text
Which UI direction feels right?
Does this state machine make sense?
Can this API integration actually work?
Is this interaction too confusing?
What implementation path has the fewest unknowns?
```

The changelog file also describes a `/prototype` skill for throwaway prototypes, including UI variations and small terminal apps for testing logic. The core philosophy is: prototype first, then hand off to an implementation agent.

---

### Phase 4 — Write the PRD

A PRD is the **destination document**. It describes where the work is going, not every tiny step to get there. The files describe PRDs as containing problem statements, proposed solutions, user stories, implementation decisions, and testing decisions.

A strong PRD should include:

```markdown
## PRD: [Feature Name]

### Problem

What is broken, missing, annoying, or valuable?

### Goal

What should be true when this is complete?

### Non-goals

What are we intentionally not doing?

### User stories

As a [user], I want [behavior], so that [outcome].

### Implementation decisions

What has already been decided?
What constraints must be respected?

### Testing decisions

What behaviors must be tested?
Which tests should be unit, integration, or visual?

### Risks

What could go wrong?

### Acceptance criteria

How will we know this is done?
```

The files emphasize that testing decisions inside the PRD help agents follow TDD and create feedback loops during implementation.

---

### Phase 5 — Turn the PRD into vertical issues

The PRD is the destination. The issues are the journey.

A major mistake is breaking work into horizontal layers:

```text
Task 1: database
Task 2: backend
Task 3: frontend
Task 4: tests
```

This delays feedback. Instead, the files recommend **vertical slices**: each task should cut through the necessary layers and produce something testable.

A vertical slice might include:

```text
Small schema change
Service function
UI behavior
Tests
Acceptance criteria
```

The files connect this to the “tracer bullet” idea: pick slices that reveal unknowns early. If a risky integration might fail, make that one of the first slices.

A good issue should include:

```markdown
## Issue: [Small vertical slice]

### Parent PRD

Link to PRD

### What to build

Precise task description

### Acceptance criteria

- [ ] Behavior A works
- [ ] Behavior B is tested
- [ ] Existing behavior is preserved

### Testing instructions

What tests to add or run

### Blocking relationships

Blocked by:
Blocks:

### Notes for agent

Important context, files, constraints, and risks
```

---

## Part 5 — Triage your backlog before agents touch it

The `/triage` workflow turns messy ideas, bug reports, and feature requests into actionable work. It uses labels as a state machine. Each issue should have a category and a state.

Common category labels:

```text
bug
enhancement
```

Common state labels:

```text
needs triage
needs info
ready for agent
ready for human
won’t fix
```

The key rule is: **an issue should not be picked up by an AFK agent unless it is explicitly ready for agent**.

This prevents the agent from wasting time on vague, low-quality, contradictory, or out-of-scope tasks.

A useful triage workflow:

```text
1. Pull all untriaged issues.
2. Categorize each as bug or enhancement.
3. Decide the state.
4. If unclear, mark needs info.
5. If out of scope, mark won’t fix and document why.
6. If actionable, write an agent brief.
7. Mark ready for agent only when fully specified.
```

The files also recommend documenting “out of scope” decisions so future agents can reject similar ideas consistently.

---

## Part 6 — Execute with TDD: Red, Green, Refactor

The TDD workflow is one of the strongest recommendations in the files. The agent should write a failing test first, then implement the minimum code to pass, then refactor.

The loop:

```text
Red: write one failing test
Green: write the minimum implementation to pass
Refactor: clean up while tests remain green
Repeat
```

The important detail is **one test at a time**. The files warn that LLMs tend to create huge horizontal layers: many tests at once, then a massive implementation attempt. That often produces weak tests and messy code.

A good agent instruction:

```text
Use red-green-refactor.
For each behavior:
1. Write exactly one failing test.
2. Run it and confirm it fails for the expected reason.
3. Implement the smallest change to pass.
4. Run the test again.
5. Only then move to the next behavior.
After all tests pass, look for refactor candidates.
Do not rewrite the test just to make the implementation pass.
```

This works especially well with agents because the human can see the test fail, then pass, which provides confidence that the implementation is grounded in real feedback.

---

## Part 7 — Build feedback loops everywhere

The files repeat one message: **without feedback loops, AI is coding blind**.

Useful feedback loops include:

```text
Unit tests
Integration tests
Type checking
Linting
Build checks
CI
Regression tests
Browser screenshots
Manual QA
Code review
```

For backend work, feedback is usually textual. Tests, logs, type errors, and build failures are easy for the AI to read. For frontend work, this is harder because the feedback is visual: spacing, layout, scrolling, animation, hover states, dark mode, and interaction feel.

So frontend agents need browser access. The files describe using Chrome DevTools-style tooling so the agent can open the local app, inspect pages, take screenshots, emulate dark mode, and verify rendering.

For frontend or full-stack work, add:

```text
Browser automation
Screenshot inspection
Light/dark mode checks
Responsive layout checks
Ad hoc interaction testing
Accessibility checks when relevant
```

This makes the AI more like a human frontend developer because it can inspect the actual execution environment, not just the code.

---

## Part 8 — Run agents safely with sandboxes

The Sandcastle file introduces a way to run agents AFK in isolated sandboxes. The problem it addresses is permissions: if agents constantly ask for permission, they cannot work autonomously; if you give them unrestricted access, they can do dangerous things. Sandboxing gives them a controlled environment.

Sandcastle is described as a TypeScript library for orchestrating coding agents in isolated sandboxes. It can run prompts with agents, use GitHub issues as a backlog manager, and run agents in parallel.

A typical Sandcastle-style setup has:

```text
A .sandcastle directory
A Dockerfile or sandbox definition
Environment variables
A backlog source such as GitHub issues
A planner agent
One or more implementer agents
A reviewer agent
Possibly a merger agent
```

The workflow described in the file:

```text
1. Planner reads open labeled issues.
2. Planner identifies unblocked tasks.
3. Implementer agents work in sandboxes.
4. Agents run tests and type checks.
5. Reviewer analyzes the changes.
6. Merger can combine or select branches.
```

The Sandcastle file also shows that agents can be prompted to use red-green-refactor during implementation, tying autonomous execution back to TDD.

---

## Part 9 — Use worktrees for parallel development

Git worktrees let multiple branches of the same repository be checked out in separate folders. This allows multiple agents to work independently without interfering with each other.

The basic idea:

```text
main repo
feature-worktree-1
feature-worktree-2
bugfix-worktree-3
```

Each worktree can have its own branch, its own changes, and its own agent.

The files describe this as a powerful way to make parallelization easier. One agent can work on one idea, another agent can work on another, and each can produce a PR back to main.

But there is an important warning: protect your main branch and make sure the agent pushes to the specific branch name. Otherwise, an agent may accidentally push work to main if the setup is wrong.

A safe instruction for agents:

```text
You are working in a git worktree.
Before committing, run git status and confirm the branch name.
Do not push to main.
Push only to the current feature branch.
Open a PR back to main.
If branch identity is unclear, stop and report.
```

---

## Part 10 — Review in a fresh context

The files recommend reviewing AI-generated code in a fresh context. If the same agent that wrote the code reviews it inside a bloated context, it may be less effective. A fresh context gives the reviewer a cleaner view.

The newer skills changelog also describes a planned `/review` skill with two parallel review modes:

```text
Standards review:
Does the code follow repository conventions?

Spec review:
Does the implementation match the issue or PRD?
```

This distinction is useful. A change can be well-written but solve the wrong problem, or it can solve the right problem while violating project standards.

A good review prompt:

```text
Review this PR in a fresh context.

Check two things separately:

1. Spec compliance:
- Does the implementation satisfy the issue?
- Are all acceptance criteria met?
- Are user stories preserved?

2. Code standards:
- Does the code match existing conventions?
- Are module boundaries respected?
- Are tests meaningful?
- Are there unnecessary abstractions?
- Are there risky changes outside scope?

Do not rewrite code yet. First produce findings ranked by severity.
```

---

## Part 11 — Use handoff when context gets too large

Long sessions consume context. The `/handoff` skill creates a temporary handoff document that summarizes the current conversation, intent, artifacts, decisions, and suggested next skills. This lets another agent continue the work without carrying the entire original conversation.

Use handoff when:

```text
The session is getting long
You want a fresh agent to continue
You want to delegate a subtask
You want another agent to review or prototype independently
You want to preserve intent without copying everything
```

A handoff document should include:

```markdown
## Handoff

### Current goal

What are we trying to accomplish?

### Current state

What has been decided or built?

### Important artifacts

Links to PRD, issues, context.md, ADRs, prototypes, branches

### Domain language

Terms the next agent must understand

### Constraints

What must not change?

### Recommended next action

What should the next agent do?

### Suggested skill

grill-with-docs / prototype / tdd / review / triage / etc.
```

---

## Part 12 — Human QA closes the loop

Even after AFK implementation, tests, and review, the human still performs QA. The seven-phase workflow explicitly ends with the agent producing a QA plan and the human walking through the completed work. That QA often creates more tickets, which go back into the implementation loop.

A good QA plan includes:

```text
Core happy path
Edge cases
Regression checks
Visual checks
Data integrity checks
Error states
Performance concerns
Accessibility concerns if relevant
Manual steps to reproduce
```

The loop becomes:

```text
Execute issue
Run tests
Review
Human QA
Find problems
Create new issues
Triage
Execute again
```

This is why the process is iterative, not one-shot.

---

## The complete workflow

Here is the combined tutorial workflow from the files:

```text
1. Prepare the codebase
   - Improve architecture
   - Create deep modules
   - Define seams and adapters
   - Add tests around boundaries

2. Establish shared language
   - Create or update context.md
   - Use grill-with-docs
   - Add ADRs for hard-to-reverse decisions

3. Start from an idea
   - Describe the goal
   - Explain why it matters
   - Identify uncertainty

4. Research when needed
   - Cache temporary research in research.md
   - Avoid stale permanent research

5. Prototype when taste or uncertainty matters
   - UI prototypes
   - Logic prototypes
   - API experiments

6. Write the PRD
   - Problem
   - Goal
   - User stories
   - Implementation decisions
   - Testing decisions
   - Acceptance criteria

7. Break into vertical issues
   - Avoid horizontal layers
   - Create tracer-bullet tasks
   - Add blocking relationships
   - Reference the parent PRD

8. Triage the backlog
   - Label category and state
   - Mark only clear tasks as ready for agent
   - Document out-of-scope decisions

9. Execute with agents
   - Use sandboxes
   - Use worktrees
   - Use one agent per unblocked task when useful
   - Protect main

10. Use TDD
   - One failing test
   - Minimal implementation
   - Refactor
   - Repeat

11. Add feedback loops
   - Tests
   - Type checks
   - Lint
   - Builds
   - Browser screenshots for frontend

12. Review in fresh context
   - Spec review
   - Standards review

13. Human QA
   - Walk through the completed work
   - Create new issues
   - Repeat the loop
```

---

## Practical “minimum viable” version

If someone is not ready for the full multi-agent workflow, the simplest version is:

```text
1. Use grill-with-docs to clarify the feature.
2. Write a PRD.
3. Break the PRD into 3–6 vertical issues.
4. Pick one issue.
5. Ask the agent to use red-green-refactor.
6. Run tests and type checks.
7. Review the diff.
8. QA manually.
9. Create follow-up issues.
```

This gives most of the benefit without needing a full Sandcastle-style AFK factory.

---

## Advanced version: AI software factory

The advanced version combines everything:

```text
Architecture-ready codebase
+
context.md and ADRs
+
PRDs
+
GitHub issues
+
triage labels
+
Sandcastle or equivalent sandbox orchestration
+
Git worktrees
+
TDD prompts
+
review agents
+
human QA
```

At that point, the human does the “day shift”: thinking, deciding, grilling, documenting, prioritizing, and reviewing. The agents do the “night shift”: implementing, testing, reviewing, and reporting. This “human day shift / AI night shift” idea appears as the final shape of the workflow.

---

## Final takeaway

The combined message of the files is:

```text
Do not use AI to avoid engineering.
Use engineering to make AI useful.
```

Good AI-driven development is not about the perfect prompt. It is about creating a system where agents can succeed:

```text
Clear language
Clear architecture
Clear tasks
Clear tests
Clear feedback
Clear review
Clear human ownership
```

When those pieces are in place, AI agents can become genuinely powerful collaborators. When they are missing, AI simply accelerates entropy and produces code that is faster to write but harder to maintain.
