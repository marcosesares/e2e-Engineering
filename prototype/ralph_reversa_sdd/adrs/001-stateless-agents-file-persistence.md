# ADR 001: Stateless Agents with File-Based Persistence

**Status:** Accepted  
**Decided:** Early commits (commit 842e766: "Initial commit: Ralph autonomous agent loop")  
**Participants:** Ralph authors  
**Timestamp:** 2025 (inferred from git history)

---

## Context

Ralph needed to implement a **long-running loop** that spawns multiple AI agent instances, each implementing one user story. The challenge:

- AI agents have **finite context windows** — can't load entire codebase into memory each time
- Need **coordination across iterations** — later agents must know what earlier ones did
- **Simple architecture** — no server, no database available
- **Audit trail** — must track why each change was made

Decision: Each agent instance is **stateless** (fresh process per iteration), but **state persists via files**.

---

## Decision

**Agents are ephemeral; state is permanent.**

Each iteration:
1. **Spawn fresh agent process** (Amp or Claude Code) with clean memory
2. **Pass state via files:**
   - `prd.json` — current story list (which are done: `passes: true/false`)
   - `progress.txt` — append-only log of implementations, learnings, patterns
   - `git history` — what was changed and why (commit messages)
3. **Agent reads files, implements one story, commits, updates files**
4. **Terminate agent** — process dies; state saved to disk
5. **Next iteration:** spin up new agent, load files, repeat

---

## Rationale

### Why Stateless Agents?
- **Context efficiency:** Each agent starts fresh, no accumulated cruft
- **Isolation:** One agent's mistakes don't poison the next
- **Simplicity:** No server, session manager, or distributed state needed
- **Recoverability:** If an agent crashes, just re-run the iteration

### Why File Persistence?
- **Simple:** Text files in git; no external services
- **Auditable:** All decisions in git history or progress.txt
- **Offline-friendly:** Works without network (except git push)
- **Language-agnostic:** Works with Amp, Claude Code, any future AI tool
- **Append-only:** Can't lose data (progress.txt never shrinks)

---

## Alternatives Considered

### Alternative 1: Database (SQLite, PostgreSQL)
**Pros:**
- Structured queries for "next story" logic
- Real-time updates visible to all agents

**Cons:**
- Adds external dependency
- Not suitable for off-repo storage
- Requires migrations (complicates setup)
- Harder to version-control state

**Decision:** Rejected. Overkill for simple PRD + list of booleans.

---

### Alternative 2: Shared Memory (Redis, Memcached)
**Pros:**
- Fast reads/writes
- Good for real-time coordination

**Cons:**
- Requires running service (complexity for users)
- Ephemeral — no audit trail
- Doesn't work offline
- Tight coupling to Redis API

**Decision:** Rejected. Ralph must work standalone.

---

### Alternative 3: AI Agent with Long Session (No Restart)
**Pros:**
- Agent remembers everything; no re-reading files
- Faster (no process startup overhead)

**Cons:**
- Context window fills up over iterations
- One agent failure = whole loop fails
- Hard to parallelize future iterations
- No clean isolation between stories

**Decision:** Rejected. Violates single-responsibility per agent.

---

## Consequences

### Positive

✅ **Works offline.** No server, no network required (except git).  
✅ **Simple debugging.** User can inspect progress.txt, prd.json, git history.  
✅ **Recoverable.** If iteration N fails, user can fix and re-run without losing 1..N-1.  
✅ **Auditable.** Every change is in git; every decision logged in progress.txt.  
✅ **Tool-agnostic.** Works with Amp, Claude, or future AI backends.  
✅ **Scalable to multiple parallel runs.** Each branch has its own prd.json + progress.txt.

### Negative

❌ **File I/O overhead.** Each agent must read prd.json, progress.txt from disk.  
❌ **No real-time coordination.** If two agents run in parallel on the same branch, they could conflict.  
❌ **Manual merging if conflicts.** If progress.txt gets corrupted or conflicted, user must fix.  
❌ **Depends on git discipline.** All state is git-dependent; broken commits = broken state.

### Risks

🔴 **Risk:** Agent process dies mid-commit → prd.json left in inconsistent state.  
🔴 **Mitigation:** Commits are atomic (git guarantee); prd.json updates happen after commit.

🔴 **Risk:** User manually edits prd.json while agent is running → conflicts.  
🔴 **Mitigation:** ralph.sh owns the loop; user should not edit during execution.

---

## Implementation Notes

### File Locations
- `prd.json` — root of repo, sourced from user
- `progress.txt` — root of repo, appended to by each agent
- Git history — `.git/`, source of truth for past changes

### Data Format
```json
{
  "id": "US-001",
  "title": "Add priority field",
  "acceptanceCriteria": ["...", "..."],
  "passes": false
}
```

### Agent Responsibilities
1. Read prd.json, progress.txt, git log
2. Pick story where `passes: false`
3. Implement, test, commit
4. Update prd.json: set `passes: true`
5. Append to progress.txt with learnings
6. Return completion signal or let loop continue

---

## Related Decisions

- [[ADR 002: Dual Tool Support (Amp vs Claude)]] — stateless design enables tool swapping
- [[ADR 005: Branch-Isolated Runs]] — each branch has separate state files

---

## Validation

- ✅ Works in practice (commit 842e766 onward)
- ✅ Confirmed by CLAUDE.md agent instructions (reading prd.json, progress.txt)
- ✅ Archive mechanism (ralph.sh) proves state persistence works
- ⚠️ No formal test suite validating state consistency across iterations

