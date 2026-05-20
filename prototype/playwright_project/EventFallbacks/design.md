# Design — EventFallbacks Feature

**Unit:** EventFallbacks  
**Confidence:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

## Architecture

```
EventFallbacks Test Suite
  ├── Replay Test
  │   ├── LoadEventsFor(aggregateId)
  │   ├── ReplayAggregate()
  │   ├── GetAggregateState()
  │   └── Assert state == DB entity
  ├── QueryDbSync Test
  │   ├── TriggerEvent (domain) → EventStore
  │   ├── WaitFor EventHandler (async)
  │   ├── QueryDB entity
  │   └── Assert fields match
  ├── FrozenEntity Test
  │   ├── Close BidProject (final event)
  │   ├── Assert IsClosed = true
  │   └── Try to emit new event → Rejected
  └── Fallback Test
      ├── SimulateEventBusFailure()
      ├── TriggerSync(/api/sync-all)
      └── Assert query DB updated

Dependencies
  ├── Event Store (PostgreSQL)
  ├── Event Processor (async worker)
  ├── Query DB (Azure SQL)
  └── CommandService (domain API)
```

---

## State Machine

```
[New Aggregate] --Event1--> [S1] --Event2--> [S2] --Close--> [Frozen]
                                                                ↓
                                                        (No more events)

[Frozen] --TryEvent--> ❌ Rejected (aggregate immutable)
```

---

## Sync Flow

**Normal (Event-Driven):**
Event → EventStore → EventBus → EventProcessor → QueryDB

**Fallback (Direct Sync):**
Manual Sync → CommandService → Load Domain Entities → Mapper → QueryDB

