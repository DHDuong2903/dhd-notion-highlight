# Phase 0 — Project Foundation

## Objective

Initialize the repository, development environment, package structure, and basic Backend and Extension applications.

**Status:** ✅ Complete

---

## Epic P0-E1 — Repository Setup (Completed)

### Task P0-E1-T1 — Initialize Git repository

- **Status:** ✅ Completed
- **Description:** Initialize Git, configure `.gitignore` (excluding node_modules, dist, .env, build artifacts), add README.md.
- **Acceptance Criteria Verification:**
  - [x] Repository initialized with Git.
  - [x] Node.js project files present.
  - [x] `.env` and build artifacts excluded in `.gitignore`.

### Task P0-E1-T2 — Configure pnpm workspace

- **Status:** ✅ Completed
- **Description:** Configure pnpm workspace with `pnpm-workspace.yaml`, create `apps/api`, `apps/extension`, `packages/shared`.
- **Acceptance Criteria Verification:**
  - [x] Workspace dependencies installed cleanly using `pnpm install`.
  - [x] Workspace packages recognized across `apps/*` and `packages/*`.
  - [x] Shared package `@notion-highlight/shared` imported and resolved by both `apps/api` and `apps/extension`.

### Task P0-E1-T3 — Configure code quality tools

- **Status:** ✅ Completed
- **Description:** Configure TypeScript, ESLint, Prettier, and root scripts.
- **Acceptance Criteria Verification:**
  - [x] TypeScript compilation succeeds (`pnpm typecheck`).
  - [x] Format command runs (`pnpm format`).
  - [x] Test command runs (`pnpm test`).

---

## Epic P0-E2 — Backend Initialization (Completed)

### Task P0-E2-T1 — Initialize Fastify application

- **Status:** ✅ Completed
- **Description:** Fastify application in TypeScript, application entry point, environment variables validated at startup.
- **Acceptance Criteria Verification:**
  - [x] Backend starts locally (`pnpm --filter @notion-highlight/api dev` or `build`).
  - [x] Application handles HTTP requests.
  - [x] Environment variables validated via Zod schema at startup.

### Task P0-E2-T2 — Implement health endpoint

- **Status:** ✅ Completed
- **Endpoint:** `GET /api/health`
- **Response:**
  ```json
  {
    "status": "ok"
  }
  ```
- **Acceptance Criteria Verification:**
  - [x] Endpoint returns HTTP 200.
  - [x] Response schema validated with `@notion-highlight/shared` Zod schema.
  - [x] Vitest automated test passing.

---

## Epic P0-E3 — Extension Initialization (Completed)

### Task P0-E3-T1 — Initialize Chrome Extension

- **Status:** ✅ Completed
- **Description:** Configure Manifest V3, Vite build, React popup with TypeScript.
- **Acceptance Criteria Verification:**
  - [x] Extension loads through Chrome "Load unpacked" from `apps/extension/dist`.
  - [x] React popup UI renders with health status badge, modern aesthetics, and quick guide.
  - [x] No manifest errors; valid MV3 schema with action, background worker, icons, and permissions.

### Task P0-E3-T2 — Implement basic context menu

- **Status:** ✅ Completed
- **Description:** Register context menu named "Send to Notion" when text is selected.
- **Acceptance Criteria Verification:**
  - [x] Context menu registered for `selection` contexts via `chrome.runtime.onInstalled`.
  - [x] Menu click event handled in background service worker (`chrome.contextMenus.onClicked`).
