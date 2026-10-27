# Notion Highlight Sync — Notion Integration & Sync Engine

## 1. Notion API Mechanics

### API Version & SDK

- Uses Notion REST API (API version `2022-06-28`).
- Managed via `@notionhq/client` or direct typed HTTP client.

### Page Creation

When a highlight arrives for a new source:

- Notion Endpoint: `POST https://api.notion.com/v1/pages`
- Parent: `{"database_id": "<user_database_id>"}`
- Properties:
  - Title: Webpage title
  - URL property: Canonical URL
  - Date property: Saved date / timestamp
- Children blocks:
  - Highlight text block (Paragraph or Quote block)

### Block Appending

When a highlight arrives for an existing source:

- Notion Endpoint: `PATCH https://api.notion.com/v1/blocks/{page_id}/children`
- Body:
  ```json
  {
    "children": [
      {
        "object": "block",
        "type": "quote",
        "quote": {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "<highlight_text>"
              }
            }
          ]
        }
      }
    ]
  }
  ```

---

## 2. Source Grouping & Canonical URL Algorithm

To ensure multiple highlights from the same article are appended to the same Notion page, the Backend executes deterministic canonicalization:

1. **Protocol & Host:** Lowercase protocol and hostname (`HTTPS://EXAMPLE.COM` -> `https://example.com`).
2. **Trailing Slashes:** Normalize trailing slashes on paths (remove trailing slash except root `/`).
3. **Tracking Parameters Removal:**
   - Strip standard tracking params: `utm_*`, `ref`, `fbclid`, `gclid`, `mc_cid`, `mc_eid`, `_ga`, etc.
4. **Preserve Content Query Params:**
   - Keep critical query params (e.g. `?v=...` for YouTube, `?id=...` or `?article=...` for query-based CMSs).
5. **Strip Hash/Fragment:** Discard URL fragments (e.g. `#section-2`).

---

## 3. Idempotency & Error Handling

- **Idempotency Key:** Extension generates a UUIDv4 for each highlight action. If a network blip causes a retry, backend checks `Highlight.idempotencyKey` and returns the existing result without appending a second block in Notion.
- **Transactional Notion Operations:** A highlight is only marked `SYNCED` after Notion API returns HTTP 200. If Notion returns an error (rate limit, permission revoked, page deleted), a `SyncLog` is recorded with `status: FAILED` and an error is sent back to the extension.
- **Transient Retries:** Retry on HTTP 429 (Rate Limit) and HTTP 500/502/503 with exponential backoff (up to 3 attempts).
