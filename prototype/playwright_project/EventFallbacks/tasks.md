# Tasks — EventFallbacks Feature

**Unit:** EventFallbacks  
**Status:** 🟢 CONFIRMADO  
**Date:** 2026-05-20

---

| Task ID | Title | Priority | Est. Time |
|---------|-------|----------|-----------|
| EF-001 | Replay Events & Verify Aggregate State | MUST | 3m |
| EF-002 | Event Handler Async Processing | MUST | 3m |
| EF-003 | Domain→Query Entity Field Mapping | MUST | 2m |
| EF-004 | Frozen Entity Immutability | SHOULD | 2m |
| EF-005 | Event Bus Failure & Fallback Sync | SHOULD | 3m |
| EF-006 | Event Store Integrity (No Dups, Order) | MUST | 2m |

**Total:** ~15 minutes

---

## Critical Tests

### EF-001: Replay & Verify
1. Create BidProject with 5 events: created, renamed, bidder added, closed
2. Load event stream from EventStore
3. Replay all 5 events in order
4. Assert: Aggregate state matches DB entity (IsClosed=true, bidder count=1, etc.)

### EF-005: Fallback Sync
1. Create BidProject with 3 events
2. Simulate EventBus failure (disconnect/timeout)
3. Query DB: Project NOT synced (EventProcessor never ran)
4. Manually trigger sync endpoint
5. Assert: QueryDB project now synced
6. Assert: All fields match domain aggregate

