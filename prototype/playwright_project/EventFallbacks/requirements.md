# Requirements — EventFallbacks Feature

**Unit:** EventFallbacks  
**Type:** Event Sourcing & Sync Resilience  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Overview

Verify event sourcing architecture: event store, aggregate replay, query DB sync, frozen entities, fallback mechanisms.

---

## Functional Requirements

### FR-01: Event Sourcing Replay
**Priority:** MUST

- Load all events for aggregate (e.g., BidProject)
- Replay events in order
- Verify final aggregate state matches DB

### FR-02: Domain→Query Entity Mapping
**Priority:** MUST

- Event handlers map domain events to query models
- Verify all fields sync correctly
- Test with 10+ events per aggregate

### FR-03: Frozen Entities
**Priority:** SHOULD

- System maintains snapshot of "frozen" (closed) entities
- Verify frozen state immutability (no further events applied)

### FR-04: Fallback Sync Trigger
**Priority:** SHOULD

- Simulate event bus failure
- Manually trigger sync fallback
- Verify query DB updated via sync (not events)

### FR-05: Event Store Integrity
**Priority:** MUST

- Verify no duplicate events
- Verify event ordering (timestamps, sequence numbers)
- Verify event bus publishing (all events delivered)

---

## Data Entities

| Entity | Fields | Validation |
|--------|--------|-----------|
| Event | AggregateId, EventType, Data, Timestamp, SequenceNumber | 🟢 CONFIRMADO |
| FrozenEntity | Id, AggregateState (snapshot) | 🟡 INFERIDO |
| QueryEntity | Hydrated from events or sync | 🟢 CONFIRMADO |

---

## Gaps

🔴 **Q1:** Snapshot strategy (frequency, when created)?  
🟡 **Q2:** Event versioning & migration?

