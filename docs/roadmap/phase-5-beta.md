# Phase 5 — MVP Hardening & Beta Release

## Objective

Verify the complete user journey, fix critical issues, and prepare the product for beta users.

---

## Epic P5-E1 — Integration Testing

- [x] **Task P5-E1-T1:** Test new source flow (select text -> page created with highlight, `notionUrl` returned, `isNewSource: true`). Verified in `apps/api/tests/e2e-journey.test.ts`.
- [x] **Task P5-E1-T2:** Test existing source flow (second highlight appends to existing page, `isNewSource: false`, preserves source). Verified in `apps/api/tests/e2e-journey.test.ts`.
- [x] **Task P5-E1-T3:** Test different source flow (separate URL creates distinct page and source). Verified in `apps/api/tests/e2e-journey.test.ts`.
- [x] **Task P5-E1-T4:** Test unauthenticated requests & failure reporting (returns 401 `UNAUTHORIZED`). Verified in `apps/api/tests/e2e-journey.test.ts`.
- [x] **Task P5-E1-T5:** Test Notion connection failure / revocation detection (status `FAILED` logged, resilient DB persistence). Verified in `apps/api/tests/e2e-journey.test.ts`.

## Epic P5-E2 — Security & Reliability

- [x] **Task P5-E2-T1:** Validate user boundary isolation and zero token leaks (User B isolated from User A, access tokens encrypted with AES-256-GCM and never returned in API payloads). Verified in `apps/api/tests/e2e-journey.test.ts`.
- [x] **Task P5-E2-T2:** Validate input payload size limits and schema validation (text > 2000 chars, malformed URLs, missing keys reject with 400). Verified in `apps/api/tests/e2e-journey.test.ts`.
- [x] **Task P5-E2-T3:** Validate retry idempotency and zero quota deduction on duplicate/failed sync (duplicate `idempotencyKey` returns cached result with `isDuplicate: true`). Verified in `apps/api/tests/e2e-journey.test.ts`.

## Epic P5-E3 — Production Build & Deployment Prep

- [x] **Task P5-E3-T1:** Fastify Backend production build & configuration ready.
- [x] **Task P5-E3-T2:** PostgreSQL container & Prisma migrations synchronized.
- [x] **Task P5-E3-T3:** Build production Chrome Extension bundle (`apps/extension/dist` generated via Vite).

## Epic P5-E4 — Beta Validation & UX Enhancements

- [x] **Task P5-E4-T1:** Onboarding documentation for beta testers created in `docs/product/beta-onboarding.md`.
- [x] **Task P5-E4-T2:** Beta user journey readiness:
  - 1-click Notion page redirect (`notionUrl`) in Popup list & Desktop notification.
  - In-Page Floating Toast notification on the active web page with direct "Open in Notion ↗" link.
  - 1-click Auto-create "Web Highlights" database endpoint and popup action.
