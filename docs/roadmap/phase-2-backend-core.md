# Phase 2 — Backend Core & Database

## Objective

Build the Backend API, data model, user authentication, and core business logic.

---

## Epic P2-E1 — Database Setup

### Task P2-E1-T1 — Configure PostgreSQL

- Connect to PostgreSQL, configure environment variables, initialize Prisma ORM.

### Task P2-E1-T2 — Create User model

- Fields: `id`, `email`, `passwordHash`, `plan`, `createdAt`, `updatedAt`. Unique email.

### Task P2-E1-T3 — Create NotionConnection model

- Fields: `id`, `userId`, `workspaceId`, `databaseId`, `accessTokenEncrypted`, `createdAt`, `updatedAt`.

### Task P2-E1-T4 — Create Source model

- Fields: `id`, `userId`, `canonicalUrl`, `originalUrl`, `title`, `notionPageId`, `createdAt`, `updatedAt`. Unique constraint on `(userId, canonicalUrl)`.

### Task P2-E1-T5 — Create Highlight model

- Fields: `id`, `userId`, `sourceId`, `content`, `status`, `idempotencyKey`, `createdAt`, `updatedAt`. Unique `idempotencyKey`.

### Task P2-E1-T6 — Create SyncLog model

- Fields: `id`, `userId`, `highlightId`, `status`, `errorCode`, `createdAt`.

---

## Epic P2-E2 — User Authentication

### Task P2-E2-T1 — Implement user registration (`POST /api/auth/register`)

### Task P2-E2-T2 — Implement user login (`POST /api/auth/login`)

### Task P2-E2-T3 — Implement session authentication (secure cookie / session)

### Task P2-E2-T4 — Implement logout (`POST /api/auth/logout`)

---

## Epic P2-E3 — Highlight API

### Task P2-E3-T1 — Implement request validation (`POST /api/highlights`)

- Validate `idempotencyKey`, `text`, `title`, `url` via Zod.

### Task P2-E3-T2 — Implement URL canonicalization

- Strip tracking params, hash, normalize trailing slashes and hostnames.

### Task P2-E3-T3 — Implement source lookup

- Scope lookup by current `userId` and `canonicalUrl`.

### Task P2-E3-T4 — Implement quota validation

- Enforce Free plan highlight caps prior to executing sync.

---

## Epic P2-E4 — Backend Error Handling

### Task P2-E4-T1 — Implement application error structure

- Standard error responses `{ "error": { "code": string, "message": string } }`.

### Task P2-E4-T2 — Implement request logging

- Log `reqId`, status, avoid leaking sensitive auth tokens and highlight text.
