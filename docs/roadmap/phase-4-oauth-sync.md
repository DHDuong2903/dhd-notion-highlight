# Phase 4 — Notion OAuth & Sync Integration

## Objective

Implement user-specific Notion OAuth, database selection, and production sync logic.

---

## Epic P4-E1 — Notion OAuth

- **Task P4-E1-T1:** Configure OAuth application (client ID, client secret, redirect URI).
- **Task P4-E1-T2:** Authorization URL endpoint (`GET /api/notion/connect`).
- **Task P4-E1-T3:** OAuth callback endpoint (`GET /api/notion/callback`), code exchange, token encryption.
- **Task P4-E1-T4:** Disconnect endpoint (`DELETE /api/notion/connection`).

## Epic P4-E2 — Notion Database Selection

- **Task P4-E2-T1:** Database listing endpoint (`GET /api/notion/databases`).
- **Task P4-E2-T2:** Database selection endpoint (`POST /api/notion/database`).
- **Task P4-E2-T3:** Connection status endpoint (`GET /api/notion/status`).

## Epic P4-E3 — Full Sync Logic

- **Task P4-E3-T1:** Implement new source sync (create page, store `notionPageId`).
- **Task P4-E3-T2:** Implement existing source sync (append block to existing `notionPageId`).
- **Task P4-E3-T3:** Idempotency enforcement via `idempotencyKey`.
- **Task P4-E3-T4:** Persist sync status & SyncLog entries.
- **Task P4-E3-T5:** Retry handling for transient Notion failures and rate limits.
