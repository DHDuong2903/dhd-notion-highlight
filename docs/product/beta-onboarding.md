# Notion Highlight Sync — Beta Tester Onboarding Guide

Welcome to the **Notion Highlight Sync** beta release! This guide walks you through setting up and using the Chrome extension to effortlessly capture web highlights into your Notion workspace.

---

## 🚀 1. Extension Installation (Chrome / Brave / Edge)

1. Open your browser and navigate to:
   - Chrome: `chrome://extensions`
   - Brave: `brave://extensions`
   - Edge: `edge://extensions`
2. Enable **Developer mode** (toggle switch in the top right corner).
3. Click the **"Load unpacked"** button (top left).
4. Select the built distribution folder:
   ```
   <repo-root>/apps/extension/dist
   ```
5. Pin the **Notion Highlight** extension icon to your browser toolbar for easy access.

---

## 🔐 2. Account Sign-In / Registration

1. Click the **Notion Highlight** icon in your browser toolbar to open the popup.
2. If this is your first time:
   - Click the **Register** tab.
   - Enter your email and password (minimum 8 characters).
   - Click **Create Account**.
3. If already registered, simply sign in with your credentials. Your session is securely stored in your browser session cookies.

---

## ⚡ 3. Notion Connection & 1-Click Database Setup

1. In the extension popup, click **"Connect with Notion"**.
2. A new browser tab will open the Notion OAuth authorization page:
   - Choose the workspace you want to connect.
   - Select the parent page(s) you want to grant access to.
   - Click **Allow Access**.
3. Once redirected back with "Notion Connected!":
   - Return to the extension popup (or re-open it).
   - Click the **"+ Create / Link Database"** button:
     - You can enter a custom name (e.g. `Web Highlights`, `Tech Notes`, `Reading List`). If left empty, it defaults to `Web Highlights`.
     - **Smart Deduplication:** If a database with that name already exists in your workspace, the extension will automatically link and select it instead of creating duplicates!
   - Alternatively, you can select an existing database from the dropdown menu.

---

## 📝 4. Highlighting & Syncing to Notion

1. Navigate to any article, documentation page, or blog post on the web.
2. **Select / Highlight** any text snippet you want to save.
3. **Right-click** on the selected text and choose **"Send to Notion"** from the context menu.
4. **Immediate Visual Feedback:**
   - **In-Page Floating Toast:** A notification toast appears smoothly at the bottom-right corner of your current webpage showing:
     - ✅ **"Highlight Synced!"**
     - An **"Open in Notion ↗"** link to jump directly to the synced Notion page.
   - **Desktop Notification:** A native Chrome notification appears. Clicking it immediately opens the Notion page in a new tab.
   - **Extension Badge:** Displays `OK` (green) or `ERR` (red) briefly.

---

## 🔄 5. Source Grouping & Duplicate Handling

- **Same Article / Page:** If you highlight multiple passages on the same webpage, they are automatically grouped under the **same Notion page** as bulleted quotes!
- **Idempotent Retry:** If a network blip causes a retry, duplicate highlights are detected and handled without creating duplicate blocks.

---

## 📚 6. Viewing Highlights in Popup

- Open the extension popup anytime to view your **"Saved Highlights"** list.
- Each highlight snippet displays the source title and an **"Open in Notion ↗"** button for 1-click navigation to your Notion notes.

---

## 🛠️ Feedback & Bug Reporting

Found an issue or have a feature request?
- File an issue on GitHub or reach out to the project maintainer.
- Include your browser version and the URL of the webpage where the issue occurred.
