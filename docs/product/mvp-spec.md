# Notion Highlight Sync — MVP Product Specification

## 1. Product Summary

**Notion Highlight Sync** is a lightweight productivity tool composed of a Chrome Extension and a Fastify Backend. It enables users reading articles, documentation, or news online to select text, right-click, and send the highlight directly to a specified Notion database. Highlights originating from the same article are automatically clustered under a single Notion page.

---

## 2. Core User Personas & Problems

- **Knowledge Workers & Researchers:** Frequently read online articles and want to store insights in Notion without having to manually copy-paste back and forth or create separate fragmented pages for every single quote.
- **Students & Lifelong Learners:** Need a fast, unobtrusive way to clip quotes while maintaining the source URL and article title.

---

## 3. End-to-End User Journey

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Ext as Chrome Extension
    participant API as Fastify Backend
    participant DB as PostgreSQL
    participant Notion as Notion API

    User->>Ext: Installs extension, opens Popup
    User->>API: Logs in / Registers
    User->>API: Connects Notion (OAuth 2.0)
    API->>Notion: Exchange Auth Code for Token
    API->>DB: Store encrypted access token
    User->>API: Selects destination Notion Database
    API->>DB: Save selected databaseId

    Note over User, Ext: Reading an article on the web
    User->>Ext: Selects text & clicks context menu "Send to Notion"
    Ext->>API: POST /api/highlights (text, title, url, idempotencyKey)
    API->>DB: Normalize URL & check existing Source
    alt Source exists
        API->>Notion: Append block to existing notionPageId
    else Source is new
        API->>Notion: Create new page in user's Database
        API->>DB: Save new Source (canonicalUrl, notionPageId)
    end
    API->>DB: Persist Highlight & SyncLog
    API-->>Ext: Return sync success
    Ext-->>User: Display success notification
```

---

## 4. Scope Boundaries

### In Scope for MVP

- **Chrome Extension (MV3):** Popup with Auth and Notion status, Context Menu on text selection, sync result notifications.
- **Backend API:** Fastify TypeScript server, session management, URL canonicalization, error handling, rate/quota guards.
- **PostgreSQL Database:** Prisma ORM for Users, NotionConnections, Sources, Highlights, and SyncLogs.
- **Notion Integration:** OAuth 2.0 flow, database picker, page creation, and block appending.
- **Free Quota:** Configurable highlight count per user.

### Out of Scope (Deferred to Post-MVP)

- AI summarization or auto-tagging
- Multi-browser extensions (Firefox, Safari)
- PDF highlight extraction
- Paid subscription / Stripe billing
- Background queues (BullMQ / Redis)
- Docker & CI/CD pipelines
