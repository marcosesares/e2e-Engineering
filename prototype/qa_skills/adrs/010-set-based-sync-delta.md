# ADR-010: Set-Based Delta for Skill Sync (Not File Count)

- **Status:** Active
- **Date:** 2026-05-20 (PR 14747 sync hardening)
- **Confidence:** 🟢 CONFIRMADO (`sync-shared-skills.ps1:225-228`, code-analysis-setup.md)

## Contexto

`sync-shared-skills.ps1` compares the remote `published-skills` manifest against the local `.sync-record` to determine if the consumer is up to date. A naive count comparison (local files == remote files) is insufficient because **renames preserve file count** — a file could be removed and a new one added with the same net total.

## Decisão

Use set arithmetic to compute the delta:
- `addedFiles = remote file set − local-record file set`
- `removedFiles = local-record file set − remote file set`
- `fileSetUnchanged = (addedFiles.Count == 0 AND removedFiles.Count == 0)`

Only when both sets are empty is the consumer considered up to date.

## Alternativas Consideradas

| Alternative | Reason Rejected |
|-------------|-----------------|
| **File count comparison** | Renames (delete file A, add file B) produce the same count. Consumer would incorrectly appear up to date after a rename. | 🟢 |
| **Checksum/hash comparison** | Would require fetching all file content from remote to compute hashes — same overhead as a full sync. Defeats the purpose of a lightweight check. | 🟡 |
| **Git SHA comparison** | Comparing the remote branch SHA to the local `.sync-record` version (already stored as SHA) is viable — this is partially implemented. The set-based delta catches structural changes even if the SHA check was skipped. | 🟡 |

## Consequências

**Positivas:**
- Correctly detects renames that preserve file count.
- Accurately identifies both additions and removals in one pass.
- Works correctly after `SHARED_MANIFEST` grows or shrinks.

**Negativas / Trade-offs:**
- Requires loading both the remote file list and the local `.sync-record` into memory for comparison.
- If `.sync-record` is stale (mid-sync interrupt), the delta may be misleading — no transactional model for the sync operation itself.
