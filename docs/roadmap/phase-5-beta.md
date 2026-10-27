# Phase 5 — MVP Hardening & Beta Release

## Objective

Verify the complete user journey, fix critical issues, and prepare the product for beta users.

---

## Epic P5-E1 — Integration Testing

- **Task P5-E1-T1:** Test new source flow (select text -> page created with highlight).
- **Task P5-E1-T2:** Test existing source flow (second highlight appends to existing page).
- **Task P5-E1-T3:** Test different source flow (separate URL creates distinct page).
- **Task P5-E1-T4:** Test unauthenticated requests & failure reporting.
- **Task P5-E1-T5:** Test Notion connection failure / revocation detection.

## Epic P5-E2 — Security & Reliability

- **Task P5-E2-T1:** Validate user boundary isolation and zero token leaks.
- **Task P5-E2-T2:** Validate input payload size limits and schema validation.
- **Task P5-E2-T3:** Validate retry idempotency and zero quota deduction on failed sync.

## Epic P5-E3 — Deployment

- **Task P5-E3-T1:** Deploy Fastify Backend with HTTPS.
- **Task P5-E3-T2:** Deploy PostgreSQL and run Prisma migrations.
- **Task P5-E3-T3:** Build production Chrome Extension bundle.

## Epic P5-E4 — Beta Validation

- **Task P5-E4-T1:** Onboarding documentation for beta testers.
- **Task P5-E4-T2:** Initial beta testing group validation (5+ users).
