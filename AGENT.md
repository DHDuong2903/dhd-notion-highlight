# Notion Highlight Sync — AI Agent Guidelines & Project State

This document defines the agent instructions, project state, architectural guidelines, and execution tracker for the **Notion Highlight Sync** project.

---

## 1. Project Context & Mission

- **Goal:** Allow users to highlight text on any webpage and save it to Notion with 1-click via a Chrome extension context menu.
- **Key Feature:** Highlights from the same article/URL are automatically grouped into the same Notion page, avoiding duplicates and cluttered databases.
- **Package Manager:** `pnpm` workspace monorepo (`apps/api`, `apps/extension`, `packages/shared`).

---

## 2. Architecture & Security Rules

1. **Backend Owns Notion:** All Notion API operations are executed exclusively by `apps/api`.
2. **Zero Secrets on Client:** The extension (`apps/extension`) must **NEVER** hold Notion OAuth secrets or access tokens.
3. **Session-based Auth:** Extension authenticates with Backend via secure credentials/session. User context is strictly derived from the backend session.
4. **Canonical URLs:** Grouping must be deterministic across tracking query params (UTM tags, ref tags) and trailing slashes.
5. **Idempotency:** Highlights use an `idempotencyKey` (UUIDv4) to prevent duplicate highlight blocks on network retries.
6. **Strict Typing:** All shared request/response payloads, validation schemas, and domain types must reside in `packages/shared`.
7. **Database Migrations:** PostgreSQL schema managed via Prisma migrations.

---

## 3. Tech Stack

- **Monorepo:** pnpm workspaces
- **Backend:** Node.js + Fastify + TypeScript + Prisma + Zod
- **Database:** PostgreSQL
- **Extension:** Chrome Extension Manifest V3 (Vite + React + TypeScript)
- **Testing:** Vitest
- **Code Quality:** ESLint + Prettier + Strict TypeScript

---

## 4. Phase & Epic Progress Tracker

| Phase       | Description                                                              | Status         |
| ----------- | ------------------------------------------------------------------------ | -------------- |
| **Phase 0** | Project Foundation (Monorepo, Fastify TS, Vite MV3 Extension, Shared)    | ✅ Complete    |
| **Phase 1** | Notion API Prototype (Direct Integration Spike & Source Grouping)        | ✅ Complete    |
| **Phase 2** | Backend Core & Database (PostgreSQL, Prisma, Auth, Highlight API)        | ✅ Complete    |
| **Phase 3** | Chrome Extension (Selection, Context Menu, Popup Auth & Status)          | ⏳ Next Up     |
| **Phase 4** | Notion OAuth & Sync Integration (OAuth 2.0 flow, DB Picker, Sync Engine) | ⏳ Not Started |
| **Phase 5** | MVP Hardening & Beta Release (End-to-end integration tests & packaging)  | ⏳ Not Started |

---

## 5. Definition of Done (DoD)

An Epic is complete ONLY when:

1. All tasks within the Epic are implemented.
2. Acceptance criteria are met and verified.
3. Automated tests pass (`pnpm test`).
4. Type checking succeeds without errors (`pnpm typecheck`).
5. No credentials or secrets committed.
6. Relevant documentation files in `/docs` are updated.

---

## 6. Monorepo Structure

```
notion-highlight/
├── AGENT.md
├── README.md
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── apps/
│   ├── api/             # Fastify + TypeScript backend
│   └── extension/       # React + Vite Manifest V3 Chrome extension
├── packages/
│   └── shared/          # Shared types, Zod schemas, utilities
└── docs/
    ├── product/         # Product specs
    ├── architecture/    # Architecture & system design
    └── roadmap/         # Roadmaps and phase task breakdowns
```
