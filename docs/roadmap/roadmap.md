# Notion Highlight Sync — MVP Technical Roadmap

## 1. Project Overview

**Product:** Notion Highlight Sync  
**Goal:** Allow users to select text on a webpage and save it to Notion, automatically grouping highlights from the same source article into a single Notion page.

### Core User Flow

1. User installs the Chrome Extension.
2. User connects their Notion account.
3. User selects a Notion database as the destination.
4. User selects text on a webpage.
5. User clicks the "Send to Notion" context menu.
6. The Extension sends the selected text, page title, and URL to the Backend.
7. The Backend creates a Notion page if the source is new.
8. The Backend appends the highlight if the source already exists.
9. The Extension displays the sync result.

### MVP Scope

Included:

- Chrome Extension.
- Notion OAuth.
- Notion database selection.
- Save selected text.
- Automatic source grouping by URL.
- Create Notion page.
- Append highlight to existing page.
- Basic sync error handling.
- User authentication.
- Basic usage quota.

Excluded:

- AI features.
- Payment and subscription.
- Docker.
- CI/CD.
- Redis.
- Background job queue.
- Multi-browser support.
- Mobile application.
- PDF highlights.
- Advanced analytics.

---

## 2. Technical Stack

| Component          | Technology                     |
| ------------------ | ------------------------------ |
| Extension          | Chrome Extension Manifest V3   |
| Extension UI       | React + Vite + TypeScript      |
| Backend            | Node.js + Fastify + TypeScript |
| Database           | PostgreSQL                     |
| ORM                | Prisma                         |
| Validation         | Zod                            |
| Authentication     | Backend-managed authentication |
| Notion Integration | Notion OAuth 2.0 + Notion API  |
| Testing            | Vitest                         |
| Package Manager    | pnpm                           |

### Architecture Rules

- Backend is responsible for all Notion API operations.
- Extension must never contain Notion access tokens or client secrets.
- Extension must communicate with Backend through defined API endpoints.
- Backend must validate every incoming request.
- Shared request/response types must be placed in `packages/shared`.
- Database schema must be managed using Prisma migrations.
- Notion sync must not be considered successful until the corresponding Notion API operation succeeds.
- A source must be unique per user and canonical URL.
- Highlight content must be preserved exactly as selected, except for explicitly defined normalization such as trimming surrounding whitespace.

---

# Phase 0 — Project Foundation

## Objective

Initialize the repository, development environment, package structure, and basic Backend and Extension applications.

## Epic P0-E1 — Repository Setup

### Task P0-E1-T1 — Initialize Git repository

Description:

- Create the project repository.
- Initialize Git.
- Add `.gitignore`.
- Add README.md.

Acceptance Criteria:

- Repository can be cloned.
- Node.js project files are present.
- `.env` and generated files are excluded from Git.

### Task P0-E1-T2 — Configure pnpm workspace

Description:

- Configure pnpm workspace.
- Create `apps/api`.
- Create `apps/extension`.
- Create `packages/shared`.

Acceptance Criteria:

- Workspace dependencies can be installed using `pnpm install`.
- Workspace packages are recognized.
- Shared package can be imported by applications.

### Task P0-E1-T3 — Configure code quality tools

Description:

- Configure TypeScript.
- Configure ESLint.
- Configure Prettier.
- Configure basic scripts.

Acceptance Criteria:

- TypeScript compilation succeeds.
- Lint command runs.
- Format command runs.

## Epic P0-E2 — Backend Initialization

### Task P0-E2-T1 — Initialize Fastify application

Description:

- Create Fastify application.
- Configure application entry point.
- Configure environment variables.

Acceptance Criteria:

- Backend starts locally.
- Application can respond to HTTP requests.
- Environment variables are validated at startup.

### Task P0-E2-T2 — Implement health endpoint

Endpoint:
`GET /api/health`

Response:

```json
{
  "status": "ok"
}
```

Acceptance Criteria:

- Endpoint returns HTTP 200.
- Response schema is stable.

## Epic P0-E3 — Extension Initialization

### Task P0-E3-T1 — Initialize Chrome Extension

Description:

- Configure Manifest V3.
- Configure Vite build.
- Configure React popup.

Acceptance Criteria:

- Extension can be loaded through Chrome Load unpacked.
- Popup renders.
- No manifest errors occur.

### Task P0-E3-T2 — Implement basic context menu

Description:

- Register context menu named "Send to Notion".
- Enable menu when text is selected.

Acceptance Criteria:

- Context menu appears on selected text.
- Menu click event is handled.

---

# Phase 1 — Notion API Prototype

## Objective

Verify that Notion API supports creating pages and appending multiple highlights into the same page before implementing full user authentication.

## Epic P1-E1 — Notion API Setup

### Task P1-E1-T1 — Create Notion integration

Description:

- Create a Notion integration.
- Configure required API capabilities.
- Create a test database.
- Share the database with the integration.

Acceptance Criteria:

- Integration can access the test database.
- Database ID is available.
- Internal integration token is stored only in local Backend environment variables.

### Task P1-E1-T2 — Implement Notion API client

Description:

- Create a Notion API client module.
- Configure API version.
- Configure error handling.

Acceptance Criteria:

- Client can communicate with Notion API.
- API errors are converted into structured application errors.

## Epic P1-E2 — Create Notion Page

### Task P1-E2-T1 — Create page in database

Description:

- Create a page using the Notion database ID.
- Populate title, URL, and saved date.

Acceptance Criteria:

- New page appears in the test database.
- Page properties are correctly populated.

### Task P1-E2-T2 — Append highlight block

Description:

- Append selected text as a paragraph or quote block.
- Preserve the text content.

Acceptance Criteria:

- Highlight is visible in the Notion page body.
- Text is not truncated.

## Epic P1-E3 — Source Grouping Prototype

### Task P1-E3-T1 — Implement source lookup

Description:

- Search for an existing page by URL.

Acceptance Criteria:

- Existing source is found.
- Unknown source returns no match.

### Task P1-E3-T2 — Implement source grouping

Description:

- Create a page for a new source.
- Append highlight to an existing source.

Acceptance Criteria:

- Saving two highlights from the same URL creates one page.
- Saving a highlight from a different URL creates another page.

### Task P1-E3-T3 — Validate Notion API behavior

Description:

- Test invalid token.
- Test inaccessible database.
- Test API rate limiting.
- Test append failure.

Acceptance Criteria:

- Errors are detectable.
- No success result is returned after failed Notion operations.

---

# Phase 2 — Backend Core & Database

## Objective

Build the Backend API, data model, user authentication, and core business logic.

## Epic P2-E1 — Database Setup

### Task P2-E1-T1 — Configure PostgreSQL

Description:

- Configure local PostgreSQL connection.
- Add database environment variables.
- Configure Prisma.

Acceptance Criteria:

- Backend can connect to PostgreSQL.
- Database connection is validated at startup.

### Task P2-E1-T2 — Create User model

Fields:

- `id`
- `email`
- `passwordHash`
- `plan`
- `createdAt`
- `updatedAt`

Acceptance Criteria:

- User model supports account creation.
- Email is unique.

### Task P2-E1-T3 — Create NotionConnection model

Fields:

- `id`
- `userId`
- `workspaceId`
- `databaseId`
- `accessTokenEncrypted`
- `createdAt`
- `updatedAt`

Acceptance Criteria:

- Connection belongs to a user.
- User can have at most one active Notion connection for MVP.

### Task P2-E1-T4 — Create Source model

Fields:

- `id`
- `userId`
- `canonicalUrl`
- `originalUrl`
- `title`
- `notionPageId`
- `createdAt`
- `updatedAt`

Acceptance Criteria:

- Source belongs to a user.
- Unique constraint exists on `(userId, canonicalUrl)`.

### Task P2-E1-T5 — Create Highlight model

Fields:

- `id`
- `userId`
- `sourceId`
- `content`
- `status`
- `idempotencyKey`
- `createdAt`
- `updatedAt`

Acceptance Criteria:

- Highlight belongs to a user and source.
- Duplicate idempotency keys cannot create duplicate highlights.

### Task P2-E1-T6 — Create SyncLog model

Fields:

- `id`
- `userId`
- `highlightId`
- `status`
- `errorCode`
- `createdAt`

Acceptance Criteria:

- Sync attempts can be recorded.
- Failed syncs can be identified.

## Epic P2-E2 — User Authentication

### Task P2-E2-T1 — Implement user registration

Endpoint:
`POST /api/auth/register`

Acceptance Criteria:

- Valid email and password can register.
- Duplicate email is rejected.
- Password is hashed before storage.

### Task P2-E2-T2 — Implement user login

Endpoint:
`POST /api/auth/login`

Acceptance Criteria:

- Valid credentials return an authenticated session.
- Invalid credentials return HTTP 401.
- Password is never returned in API responses.

### Task P2-E2-T3 — Implement session authentication

Description:

- Use secure authentication cookies or an equivalent secure session mechanism.
- Protect authenticated routes.

Acceptance Criteria:

- Unauthenticated requests cannot access protected endpoints.
- User identity is derived from the authenticated session.
- Client cannot specify another user's ID to access their data.

### Task P2-E2-T4 — Implement logout

Endpoint:
`POST /api/auth/logout`

Acceptance Criteria:

- Session is invalidated.
- User becomes unauthenticated.

## Epic P2-E3 — Highlight API

### Task P2-E3-T1 — Implement request validation

Endpoint:
`POST /api/highlights`

Request:

```json
{
  "idempotencyKey": "uuid",
  "text": "Selected text",
  "title": "Article title",
  "url": "https://example.com/article"
}
```

Acceptance Criteria:

- Text is required.
- URL must be valid.
- Title is required.
- Maximum text length is enforced.
- Invalid requests return HTTP 400.

### Task P2-E3-T2 — Implement URL canonicalization

Description:

- Normalize hostname.
- Remove fragment.
- Remove known tracking parameters.
- Preserve meaningful query parameters.
- Normalize trailing slash according to defined rules.

Acceptance Criteria:

- Tracking variants of the same URL resolve to the same canonical URL.
- Distinct article identifiers are not incorrectly merged.

### Task P2-E3-T3 — Implement source lookup

Description:

- Find source using authenticated user ID and canonical URL.

Acceptance Criteria:

- Source lookup is scoped to the current user.
- Existing source is returned when matched.

### Task P2-E3-T4 — Implement quota validation

Description:

- Track highlight count for the current user.
- Define Free plan quota.

Acceptance Criteria:

- User cannot exceed configured quota.
- Quota check occurs before writing to Notion.
- Quota is not consumed by failed sync attempts.

## Epic P2-E4 — Backend Error Handling

### Task P2-E4-T1 — Implement application error structure

Description:

- Define standard error codes.
- Define HTTP status mapping.
- Define response schema.

Acceptance Criteria:

- Errors have consistent response structure.
- Sensitive information is not returned.

### Task P2-E4-T2 — Implement request logging

Description:

- Log request ID.
- Log operation status.
- Log error codes.

Acceptance Criteria:

- Sync failures can be diagnosed.
- Tokens and highlight content are not written to application logs.

---

# Phase 3 — Chrome Extension

## Objective

Implement user-facing text selection, context menu interaction, authentication UI, and Backend communication.

## Epic P3-E1 — Selection Capture

### Task P3-E1-T1 — Capture selected text

Description:

- Use Chrome context menu selection information.
- Retrieve selected text.

Acceptance Criteria:

- Selected text is captured accurately.
- Empty selection is rejected.

### Task P3-E1-T2 — Capture page metadata

Description:

- Retrieve active tab title.
- Retrieve active tab URL.

Acceptance Criteria:

- Title and URL correspond to the selected page.
- Metadata is included in the Backend request.

## Epic P3-E2 — Context Menu

### Task P3-E2-T1 — Register context menu

Description:

- Register "Send to Notion".

Acceptance Criteria:

- Menu is visible for text selection.
- Menu click triggers save flow.

### Task P3-E2-T2 — Handle menu interaction

Description:

- Send selected text and metadata to the Extension background service worker.

Acceptance Criteria:

- Background handler receives the correct payload.
- Invalid payload is rejected.

## Epic P3-E3 — Backend Communication

### Task P3-E3-T1 — Implement API client

Description:

- Create typed API client.
- Configure Backend base URL.
- Handle authenticated requests.

Acceptance Criteria:

- Requests use the configured Backend URL.
- API response types are validated.

### Task P3-E3-T2 — Implement sync request

Description:

- Call `POST /api/highlights`.

Acceptance Criteria:

- Valid requests reach Backend.
- Backend error responses are handled.

### Task P3-E3-T3 — Implement sync result notification

Description:

- Display success or failure notification.

Acceptance Criteria:

- Successful sync displays confirmation.
- Failed sync displays a useful error.
- Notification does not expose sensitive data.

## Epic P3-E4 — Extension Authentication UI

### Task P3-E4-T1 — Implement login UI

Description:

- Allow user to enter credentials.
- Call Backend login endpoint.

Acceptance Criteria:

- Login success updates Extension state.
- Login failure displays error.

### Task P3-E4-T2 — Implement connection status

Description:

- Display whether user is authenticated.
- Display whether Notion is connected.

Acceptance Criteria:

- Popup shows correct connection status.
- User can initiate Notion connection.

### Task P3-E4-T3 — Implement logout UI

Description:

- Call Backend logout endpoint.
- Clear local authentication state.

Acceptance Criteria:

- User can log out.
- Protected operations require login again.

---

# Phase 4 — Notion OAuth & Sync Integration

## Objective

Implement user-specific Notion OAuth, database selection, and production sync logic.

## Epic P4-E1 — Notion OAuth

### Task P4-E1-T1 — Configure OAuth application

Description:

- Configure OAuth client ID.
- Configure client secret.
- Configure redirect URI.
- Define required Notion capabilities.

Acceptance Criteria:

- OAuth application is configured.
- Redirect URI matches Backend configuration.

### Task P4-E1-T2 — Implement authorization URL

Endpoint:
`GET /api/notion/connect`

Description:

- Generate authorization URL.
- Include state parameter.
- Redirect user to Notion authorization.

Acceptance Criteria:

- OAuth state is generated securely.
- State is validated during callback.

### Task P4-E1-T3 — Implement OAuth callback

Endpoint:
`GET /api/notion/callback`

Description:

- Receive authorization code.
- Exchange code for access token.
- Store token securely.

Acceptance Criteria:

- Valid callback creates NotionConnection.
- Invalid state is rejected.
- Token is encrypted at rest.

### Task P4-E1-T4 — Implement disconnect

Endpoint:
`DELETE /api/notion/connection`

Acceptance Criteria:

- User can disconnect Notion.
- Connection is removed or invalidated.
- Future sync requires reconnection.

## Epic P4-E2 — Notion Database Selection

### Task P4-E2-T1 — Implement database listing

Endpoint:
`GET /api/notion/databases`

Description:

- Retrieve accessible databases.

Acceptance Criteria:

- Only databases accessible to the connected user are returned.
- API response contains database ID and title.

### Task P4-E2-T2 — Implement database selection

Endpoint:
`POST /api/notion/database`

Description:

- Save selected database ID.

Acceptance Criteria:

- Database must be accessible through the user's connection.
- User cannot configure another user's database.

### Task P4-E2-T3 — Implement connection status

Endpoint:
`GET /api/notion/status`

Acceptance Criteria:

- Returns connection status.
- Returns selected database information.
- Does not return access token.

## Epic P4-E3 — Full Sync Logic

### Task P4-E3-T1 — Implement new source sync

Description:

- Create Notion page for new source.
- Store Notion page ID.

Acceptance Criteria:

- New URL creates one page.
- Source and page ID are persisted.

### Task P4-E3-T2 — Implement existing source sync

Description:

- Append highlight to existing Notion page.

Acceptance Criteria:

- Same canonical URL appends to existing page.
- Different canonical URL creates a new page.

### Task P4-E3-T3 — Implement idempotency

Description:

- Check idempotency key before sync.
- Return existing result for repeated requests.

Acceptance Criteria:

- Retried requests do not duplicate highlights.
- Duplicate request returns a consistent result.

### Task P4-E3-T4 — Implement sync status

Description:

- Persist sync status.
- Record failures.
- Return sync result to Extension.

Acceptance Criteria:

- Success is reported only after Notion API succeeds.
- Failed operations are recorded.
- User receives actionable error messages.

### Task P4-E3-T5 — Implement retry handling

Description:

- Retry transient Notion API failures.
- Respect rate limits.
- Limit retry attempts.

Acceptance Criteria:

- Retry does not create duplicate pages.
- Permanent errors are not retried indefinitely.
- Failed operations remain diagnosable.

---

# Phase 5 — MVP Hardening & Beta Release

## Objective

Verify the complete user journey, fix critical issues, and prepare the product for beta users.

## Epic P5-E1 — Integration Testing

### Task P5-E1-T1 — Test new source flow

Acceptance Criteria:

- User can select text.
- Extension sends request.
- Backend creates Notion page.
- Highlight is visible in Notion.

### Task P5-E1-T2 — Test existing source flow

Acceptance Criteria:

- Second highlight from same URL appends to existing page.
- No duplicate page is created.

### Task P5-E1-T3 — Test different source flow

Acceptance Criteria:

- Different URL creates a separate page.
- Existing highlights remain unchanged.

### Task P5-E1-T4 — Test authentication failure

Acceptance Criteria:

- Unauthenticated requests are rejected.
- Extension displays login requirement.

### Task P5-E1-T5 — Test Notion connection failure

Acceptance Criteria:

- Invalid or revoked connection is detected.
- User receives reconnection instructions.

## Epic P5-E2 — Security & Reliability

### Task P5-E2-T1 — Validate authentication boundaries

Acceptance Criteria:

- User can access only their own data.
- Notion tokens cannot be retrieved through API endpoints.

### Task P5-E2-T2 — Validate input limits

Acceptance Criteria:

- Oversized text is rejected.
- Invalid URL is rejected.
- Malformed requests are rejected.

### Task P5-E2-T3 — Validate failure recovery

Acceptance Criteria:

- Failed sync does not consume quota.
- Retried requests do not create duplicate highlights.

## Epic P5-E3 — Deployment

### Task P5-E3-T1 — Deploy Backend

Description:

- Configure production environment.
- Configure database connection.
- Configure OAuth secrets.
- Configure HTTPS.

Acceptance Criteria:

- Backend is publicly accessible through HTTPS.
- Health endpoint works.

### Task P5-E3-T2 — Deploy PostgreSQL

Description:

- Create production database.
- Run Prisma migrations.
- Verify connection.

Acceptance Criteria:

- Backend connects to production database.
- Migration completes successfully.

### Task P5-E3-T3 — Configure Chrome Extension release

Description:

- Configure production Backend URL.
- Build Extension.
- Prepare Chrome Web Store package.

Acceptance Criteria:

- Extension uses production API.
- No development token or secret is included.

## Epic P5-E4 — Beta Validation

### Task P5-E4-T1 — Prepare onboarding

Description:

- Explain installation.
- Explain Notion connection.
- Explain how to save a highlight.

Acceptance Criteria:

- New user can complete onboarding without developer assistance.

### Task P5-E4-T2 — Run beta test

Description:

- Invite initial beta users.
- Collect feedback.
- Record sync failures.

Acceptance Criteria:

- At least 5 users complete the core workflow.
- Feedback is documented.
- Critical issues are resolved before wider release.

---

# 3. Dependency Order

Recommended implementation order:

1. P0-E1 → P0-E2 → P0-E3
2. P1-E1 → P1-E2 → P1-E3
3. P2-E1 → P2-E2 → P2-E3 → P2-E4
4. P3-E1 → P3-E2 → P3-E3 → P3-E4
5. P4-E1 → P4-E2 → P4-E3
6. P5-E1 → P5-E2 → P5-E3 → P5-E4

---

# 4. Definition of Done

An Epic is considered complete only when:

- All tasks in the Epic are implemented.
- Acceptance criteria are satisfied.
- Relevant tests pass.
- TypeScript compilation succeeds.
- No secrets are committed.
- Documentation is updated if behavior or architecture changes.
- No unrelated feature is added.

---

# 5. MVP Release Criteria

MVP is ready when:

- User can register and log in.
- User can connect Notion using OAuth.
- User can select a Notion database.
- User can select text on a webpage.
- User can save the highlight through the context menu.
- Backend creates a page for a new source.
- Backend appends highlights for existing sources.
- Source grouping works using canonical URL.
- Failed sync is reported correctly.
- Duplicate requests do not create duplicate highlights.
- Extension can be installed and used by beta users.
