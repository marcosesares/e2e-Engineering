# Schema — progress.txt

Append-only learnings log for one Task. **caveman:ultra** style (max compression, full technical substance). Sole writer = orchestrator, at fan-in. Append-only WITHIN a task; reset (overwrite empty) when a new task begins. Lives at task root (e.g. `.e2e-engineering/progress.txt`).

Holds under parallelism because only the orchestrator writes it — subagents return summaries, never append directly.

## Layout (exactly three sections)

```
## Story Log
<id> | <one-line summary> | <files touched> | <learnings>
<id> | ...

## Pending Amendments
<durable learning staged for constitution — NOT yet approved>
<cleared in batch at human-QA gate: promoted to constitution OR dropped>

## Blocked
<id> | <why> | <last systematic-debugging 4-phase diagnosis>
```

## Rules
- Each fan-in: append one Story Log line.
- A durable, reusable learning (not story-specific) → also stage under Pending Amendments. Never auto-merge to constitution.
- 3-strike + systematic-debugging failure → append Blocked line, set story `status: blocked` in prd.json.
- Fresh session resuming a blocked story reads `## Blocked`: deps changed since? re-dispatch once. Else stalled → escalate human.
- caveman:ultra: drop all articles/filler, fragments, exact technical terms. This is machine scratch, not prose.
