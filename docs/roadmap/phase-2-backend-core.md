# Phase 2 — Backend Core & Database

## Objective

Build the Backend API, data model, user authentication, and core business logic.

---

## Status: ✅ Complete

---

## Epic P2-E1 — Database Setup

### Task P2-E1-T1 — Configure PostgreSQL ✅

- [x] Connect to PostgreSQL (`docker-compose.yml` on port 5433 to avoid conflicts).
- [x] Configure environment variables (`DATABASE_URL`, `SESSION_SECRET`).
- [x] Initialize Prisma ORM schema and generate Prisma Client.

### Task P2-E1-T2 — Create User model ✅

- [x] Fields: `id`, `email`, `passwordHash`, `plan`, `createdAt`, `updatedAt`. Unique email.

### Task P2-E1-T3 — Create NotionConnection model ✅

- [x] Fields: `id`, `userId`, `workspaceId`, `databaseId`, `accessTokenEncrypted`, `createdAt`, `updatedAt`.

### Task P2-E1-T4 — Create Source model ✅

- [x] Fields: `id`, `userId`, `canonicalUrl`, `originalUrl`, `title`, `notionPageId`, `createdAt`, `updatedAt`.
- [x] Unique compound constraint on `(userId, canonicalUrl)`.

### Task P2-E1-T5 — Create Highlight model ✅

- [x] Fields: `id`, `userId`, `sourceId`, `content`, `status`, `idempotencyKey`, `createdAt`, `updatedAt`.
- [x] Unique constraint on `idempotencyKey`.

### Task P2-E1-T6 — Create SyncLog model ✅

- [x] Fields: `id`, `userId`, `highlightId`, `status`, `errorCode`, `createdAt`.

---

## Epic P2-E2 — User Authentication

### Task P2-E2-T1 — Implement user registration (`POST /api/auth/register`) ✅

- [x] Secure password hashing with Argon2.
- [x] Input validation via Zod shared schema (`registerSchema`).
- [x] Creates user and initializes session cookie.

### Task P2-E2-T2 — Implement user login (`POST /api/auth/login`) ✅

- [x] Password verification with Argon2.
- [x] Sets session cookie upon success.

### Task P2-E2-T3 — Implement session authentication (secure cookie / session) ✅

- [x] Integrated `@fastify/cookie` and `@fastify/session`.
- [x] Created `requireAuth` preHandler hook in `src/middleware/auth.ts`.
- [x] Augmented Fastify types in `src/types/fastify.d.ts`.
- [x] Implemented `GET /api/auth/me`.

### Task P2-E2-T4 — Implement logout (`POST /api/auth/logout`) ✅

- [x] Session destruction on logout.

---

## Epic P2-E3 — Highlight API

### Task P2-E3-T1 — Implement request validation (`POST /api/highlights`) ✅

- [x] Validate `idempotencyKey`, `text`, `title`, `url` via shared `createHighlightSchema`.

### Task P2-E3-T2 — Implement URL canonicalization ✅

- [x] Strip tracking params (UTM, ref, fbclid, etc.), hash, normalize trailing slashes and hostnames.

### Task P2-E3-T3 — Implement source lookup ✅

- [x] Scope lookup by current `userId` and `canonicalUrl` in PostgreSQL.
- [x] Group multiple highlights on same page into existing source record.

### Task P2-E3-T4 — Implement quota validation ✅

- [x] Enforce Free plan highlight caps (100) prior to saving.

---

## Epic P2-E4 — Backend Error Handling

### Task P2-E4-T1 — Implement application error structure ✅

- [x] Standard error responses `{ "error": { "code": string, "message": string } }` using `AppErrorCode`.

### Task P2-E4-T2 — Implement request logging ✅

- [x] Fastify structured logging.
