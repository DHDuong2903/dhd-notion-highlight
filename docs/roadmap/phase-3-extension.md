# Phase 3 — Chrome Extension

## Objective

Implement user-facing text selection, context menu interaction, authentication UI, and Backend communication.

---

## Epic P3-E1 — Selection Capture

- **Task P3-E1-T1:** Capture selected text via Chrome context menu selection info.
- **Task P3-E1-T2:** Capture active tab metadata (title, URL).

## Epic P3-E2 — Context Menu

- **Task P3-E2-T1:** Register context menu "Send to Notion" for selection contexts.
- **Task P3-E2-T2:** Handle menu click event and pass payload to background service worker.

## Epic P3-E3 — Backend Communication

- **Task P3-E3-T1:** Typed API client with base URL configuration and session cookies / auth headers.
- **Task P3-E3-T2:** Execute sync requests to `POST /api/highlights`.
- **Task P3-E3-T3:** Display sync notifications (Chrome notifications or badge status).

## Epic P3-E4 — Extension Authentication UI

- **Task P3-E4-T1:** Login UI in popup.
- **Task P3-E4-T2:** Display connection status (Logged in, Notion connected, target database).
- **Task P3-E4-T3:** Logout UI in popup.
