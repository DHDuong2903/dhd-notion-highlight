# Phase 1 — Notion API Prototype

## Objective

Verify that the Notion API supports creating pages and appending multiple highlights into the same page before implementing full user authentication.

---

## Epic P1-E1 — Notion API Setup

### Task P1-E1-T1 — Create Notion integration

- **Description:** Configure Notion internal integration, test database, and local environment variables.
- **Acceptance Criteria:**
  - Integration can access the test database.
  - Database ID is available.
  - Internal integration token is stored only in local Backend environment variables.

### Task P1-E1-T2 — Implement Notion API client

- **Description:** Create Notion API client module with version `2022-06-28` and error translation.
- **Acceptance Criteria:**
  - Client can communicate with Notion API.
  - API errors are converted into structured application errors.

---

## Epic P1-E2 — Create Notion Page

### Task P1-E2-T1 — Create page in database

- **Description:** Create a page in the Notion database with Title, URL, and saved date properties.
- **Acceptance Criteria:**
  - New page appears in the test database.
  - Page properties are correctly populated.

### Task P1-E2-T2 — Append highlight block

- **Description:** Append selected text as a quote or paragraph block to the page body.
- **Acceptance Criteria:**
  - Highlight is visible in the Notion page body.
  - Text is not truncated.

---

## Epic P1-E3 — Source Grouping Prototype

### Task P1-E3-T1 — Implement source lookup

- **Description:** Search Notion database for an existing page matching the source URL.
- **Acceptance Criteria:**
  - Existing source is found.
  - Unknown source returns no match.

### Task P1-E3-T2 — Implement source grouping

- **Description:** Create a page for a new source, or append highlight to an existing source.
- **Acceptance Criteria:**
  - Saving two highlights from the same URL creates one page.
  - Saving a highlight from a different URL creates another page.

### Task P1-E3-T3 — Validate Notion API behavior

- **Description:** Test error conditions (invalid token, inaccessible DB, rate limits, append failure).
- **Acceptance Criteria:**
  - Errors are detectable.
  - No success result is returned after failed Notion operations.
