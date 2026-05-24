# Agents, Fluxos

## Investigation Flow

```
fix-qa-bug [QA-1234]
  ├─ prepare investigation inputs (jira brief, task)
  ├─ invoke qa-investigate Agent
  │  └─ investigation.md written
  ├─ present findings to user
  └─ if user approves investigation:
     └─ proceed to plan-change
```

## Implementation Flow

```
plan-change approved by user
  ├─ user makes code changes manually, OR
  ├─ invoke qa-implement Agent
  │  ├─ read: plan, investigation, jira brief
  │  ├─ execute changes
  │  └─ return summary
  └─ review-change gate
```
