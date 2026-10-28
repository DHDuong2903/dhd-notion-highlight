# Phase 4 — Notion OAuth & Sync Integration

## Objective

Implement user-specific Notion OAuth, database selection, and production sync logic.

---

## Status: ✅ Complete

---

## Epic P4-E1 — Notion OAuth

- [x] **Task P4-E1-T1:** Configure OAuth application (`NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, `NOTION_REDIRECT_URI`) in environment and `env.ts`.
- [x] **Task P4-E1-T2:** Authorization URL endpoint (`GET /api/notion/connect`) with HMAC-signed state for CSRF protection.
- [x] **Task P4-E1-T3:** OAuth callback endpoint (`GET /api/notion/callback`), authorization code exchange, AES-256-GCM token encryption, upserting `NotionConnection`.
- [x] **Task P4-E1-T4:** Disconnect endpoint (`DELETE /api/notion/connection`).

---

## Epic P4-E2 — Notion Database Selection

- [x] **Task P4-E2-T1:** Database listing endpoint (`GET /api/notion/databases`) searching accessible Notion databases via `searchDatabases()`.
- [x] **Task P4-E2-T2:** Database selection endpoint (`POST /api/notion/database`) validating access and persisting `databaseId` to `NotionConnection`.
- [x] **Task P4-E2-T3:** Connection status endpoint (`GET /api/notion/status`) returning `isConnected`, `workspaceId`, `databaseId`, `databaseTitle`.

---

## Epic P4-E3 — Full Sync Logic

- [x] **Task P4-E3-T1:** Implement new source sync in `POST /api/highlights` (creates page in selected database, stores `notionPageId` on `Source`).
- [x] **Task P4-E3-T2:** Implement existing source sync in `POST /api/highlights` (appends highlight quote block to existing `notionPageId`).
- [x] **Task P4-E3-T3:** Idempotency enforcement via `idempotencyKey` UUIDv4.
- [x] **Task P4-E3-T4:** Persist sync status (`SYNCED` / `PENDING` / `FAILED`) & `SyncLog` entries with error codes.
- [x] **Task P4-E3-T5:** Error handling and rate limit management in `NotionService` and `highlights` route.
