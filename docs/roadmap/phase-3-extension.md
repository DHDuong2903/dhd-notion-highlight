# Phase 3 — Chrome Extension

## Objective

Implement user-facing text selection, context menu interaction, authentication UI, and Backend communication.

---

## Status: ✅ Complete

---

## Epic P3-E1 — Selection Capture

- [x] **Task P3-E1-T1:** Capture selected text via Chrome context menu selection info (`info.selectionText`).
- [x] **Task P3-E1-T2:** Capture active tab metadata (title: `tab.title`, URL: `tab.url || info.pageUrl`).

---

## Epic P3-E2 — Context Menu

- [x] **Task P3-E2-T1:** Register context menu "Send to Notion" for selection contexts on `runtime.onInstalled`.
- [x] **Task P3-E2-T2:** Handle menu click event in background service worker (`src/background/index.ts`).

---

## Epic P3-E3 — Backend Communication

- [x] **Task P3-E3-T1:** Typed API client with base URL configuration (`chrome.storage.local`) and session cookies (`credentials: 'include'`) in `src/api/client.ts`.
- [x] **Task P3-E3-T2:** Execute sync requests to `POST /api/highlights` with generated `idempotencyKey` (`crypto.randomUUID()`).
- [x] **Task P3-E3-T3:** Display sync notifications (Chrome notifications with page title / error details and badge statuses: `OK`, `AUTH`, `MAX`, `ERR`).

---

## Epic P3-E4 — Extension Authentication UI

- [x] **Task P3-E4-T1:** Sign In & Create Account tabbed UI in popup with validation, loading spinner, and error banners.
- [x] **Task P3-E4-T2:** Display connection status:
  - User profile with email & Plan badge (`FREE` / `PRO`).
  - Backend Server connectivity & latency.
  - Context Menu status.
  - Notion Integration status (pointing to Phase 4).
  - Recent saved highlights list with status badges (`PENDING`, `SYNCED`, `FAILED`).
- [x] **Task P3-E4-T3:** Logout UI in popup (`POST /api/auth/logout`) with state reset.
