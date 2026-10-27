# Notion Highlight Sync

> Seamlessly save web text highlights to Notion, automatically grouped by source article.

## Architecture

This repository is structured as a **pnpm monorepo**:

- **[`apps/api`](file:///d:/dhd/notion-highlight/apps/api)**: Fastify + TypeScript backend service managing authentication, URL canonicalization, and Notion API integration.
- **[`apps/extension`](file:///d:/dhd/notion-highlight/apps/extension)**: Chrome Extension Manifest V3 built with React, Vite, and TypeScript.
- **[`packages/shared`](file:///d:/dhd/notion-highlight/packages/shared)**: Shared domain types, Zod schemas, and utilities used by both Backend and Extension.

---

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9

### Installation

```bash
pnpm install
```

### Development

```bash
# Start all packages in dev mode
pnpm dev

# Or run separately:
pnpm --filter @notion-highlight/api dev
pnpm --filter @notion-highlight/extension dev
```

### Type Checking & Testing

```bash
# Typecheck across all workspace packages
pnpm typecheck

# Run tests
pnpm test

# Lint & Format
pnpm lint
pnpm format
```

### Loading Chrome Extension Unpacked

1. Build the extension: `pnpm --filter @notion-highlight/extension build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the `apps/extension/dist` directory.
