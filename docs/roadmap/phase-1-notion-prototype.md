# Phase 1 — Notion API Prototype

## Objective

Verify that the Notion API supports creating pages and appending multiple highlights into the same page before implementing full user authentication.

**Status:** ✅ Complete

---

## Epic P1-E1 — Notion API Setup (Completed)

### Task P1-E1-T1 — Create Notion integration
- **Status:** ✅ Completed
- **Description:** Configure Notion internal integration, test database, and local environment variables.
- **Acceptance Criteria Verification:**
  - [x] Internal integration token and test database configuration supported via `apps/api/.env` (`NOTION_API_KEY`, `NOTION_DATABASE_ID`).
  - [x] Token is isolated in Backend environment only; never exposed to Extension client.
  - [x] Connection verification supported via `testConnection()` and `GET /api/prototype/status`.

### Task P1-E1-T2 — Implement Notion API client
- **Status:** ✅ Completed
- **Description:** Create Notion API client module with structured error handling.
- **Acceptance Criteria Verification:**
  - [x] Implemented [`NotionService`](file:///d:/dhd/notion-highlight/apps/api/src/services/notion.ts) wrapping `@notionhq/client`.
  - [x] Notion API errors (`Unauthorized`, `ObjectNotFound`, `RateLimited`, `ValidationError`) mapped to application [`NotionAppError`](file:///d:/dhd/notion-highlight/apps/api/src/services/notion.ts) with `AppErrorCode`.

---

## Epic P1-E2 — Create Notion Page (Completed)

### Task P1-E2-T1 — Create page in database
- **Status:** ✅ Completed
- **Description:** Create a page in the Notion database with Title, URL, and initial highlight.
- **Acceptance Criteria Verification:**
  - [x] Implemented `createPage` dynamically resolving title property (e.g. `Name` or `title`) and URL property.
  - [x] Page creation tested with mock and live options.

### Task P1-E2-T2 — Append highlight block
- **Status:** ✅ Completed
- **Description:** Append selected text as a quote or paragraph block to the page body.
- **Acceptance Criteria Verification:**
  - [x] Implemented `appendHighlight` appending a formatted `quote` block to existing Notion pages.
  - [x] Implemented `splitTextForNotion` chunking text safely up to 2000 chars per block to ensure text is never truncated.

---

## Epic P1-E3 — Source Grouping Prototype (Completed)

### Task P1-E3-T1 — Implement source lookup
- **Status:** ✅ Completed
- **Description:** Search Notion database for an existing page matching the source URL.
- **Acceptance Criteria Verification:**
  - [x] Implemented `findPageByUrl` querying Notion database by URL.
  - [x] Returns page ID when found; returns `null` when no matching source exists.

### Task P1-E3-T2 — Implement source grouping
- **Status:** ✅ Completed
- **Description:** Create a page for a new source, or append highlight to an existing source.
- **Acceptance Criteria Verification:**
  - [x] Implemented `saveHighlight` orchestrating lookup -> create / append.
  - [x] Implemented deterministic [`canonicalizeUrl`](file:///d:/dhd/notion-highlight/apps/api/src/utils/url.ts) stripping UTM and tracking tags.
  - [x] Verified via automated tests: Saving 2 highlights from same canonical URL appends to one page (`isNewSource: false`). Saving from a different URL creates a new page (`isNewSource: true`).

### Task P1-E3-T3 — Validate Notion API behavior
- **Status:** ✅ Completed
- **Description:** Test error conditions (invalid token, inaccessible DB, rate limits, append failure).
- **Acceptance Criteria Verification:**
  - [x] Automated tests covering 401 Unauthorized, 404 Not Found, and 429 Rate Limited.
  - [x] Interactive verification script created in [`apps/api/src/scripts/test-notion.ts`](file:///d:/dhd/notion-highlight/apps/api/src/scripts/test-notion.ts) (`pnpm --filter @notion-highlight/api test:notion`).
