import { api } from '../api/client.js';

const CONTEXT_MENU_ID = 'send-to-notion';
const notifUrlMap = new Map<string, string>();

// Register context menu when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Send to Notion',
      contexts: ['selection'],
    });
    console.log('✅ [Background] Context menu "Send to Notion" registered.');
  });
});

// Set badge helper with timeout
function setBadge(text: string, color: string, durationMs = 3500) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });

  if (durationMs > 0) {
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, durationMs);
  }
}

// Show desktop notification helper
function showNotification(id: string, title: string, message: string, notionUrl?: string) {
  if (notionUrl) {
    notifUrlMap.set(id, notionUrl);
  }

  if (chrome.notifications) {
    chrome.notifications.create(id, {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title,
      message,
      priority: 1,
    });
  }
}

// Handle notification click to open Notion directly
if (chrome.notifications?.onClicked) {
  chrome.notifications.onClicked.addListener((notificationId) => {
    const url = notifUrlMap.get(notificationId);
    if (url) {
      chrome.tabs.create({ url });
      notifUrlMap.delete(notificationId);
    }
  });
}

// Show in-page floating toast
function showInPageToast(
  tabId: number | undefined,
  type: 'success' | 'error' | 'auth',
  message: string,
  notionUrl?: string,
) {
  if (!tabId || !chrome.scripting) return;
  const logoUrl = chrome.runtime.getURL('icons/icon48.png');

  chrome.scripting
    .executeScript({
      target: { tabId },
      func: (toastType, toastMsg, targetUrl, logoIcon) => {
        const existing = document.getElementById('notion-highlight-toast-container');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.id = 'notion-highlight-toast-container';
        container.style.cssText = `
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 2147483647;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
          line-height: 1.4;
          pointer-events: auto;
          animation: nhFadeIn 0.25s ease-out;
        `;

        const isSuccess = toastType === 'success';
        const isAuth = toastType === 'auth';
        const borderColor = isSuccess ? '#10b981' : isAuth ? '#f59e0b' : '#ef4444';

        container.innerHTML = `
          <style>
            @keyframes nhFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          </style>
          <div style="
            display: flex;
            align-items: center;
            gap: 10px;
            background: #0f172a;
            color: #f8fafc;
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.15);
            border-left: 4px solid ${borderColor};
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.3);
          ">
            <img src="${logoIcon}" alt="Logo" style="width: 22px; height: 22px; border-radius: 5px; object-fit: cover; flex-shrink: 0;" />
            <div style="display: flex; flex-direction: column;">
              <span style="font-weight: 600;">${toastMsg}</span>
              ${
                targetUrl
                  ? `<a href="${targetUrl}" target="_blank" style="color: #818cf8; text-decoration: underline; font-size: 11px; margin-top: 2px;">Open in Notion ↗</a>`
                  : ''
              }
            </div>
            <button id="nh-close-btn" style="
              margin-left: 8px;
              background: transparent;
              border: none;
              color: #94a3b8;
              cursor: pointer;
              font-size: 14px;
            ">✕</button>
          </div>
        `;

        document.body.appendChild(container);

        const closeBtn = document.getElementById('nh-close-btn');
        if (closeBtn) {
          closeBtn.onclick = () => container.remove();
        }

        setTimeout(() => {
          container.remove();
        }, 4500);
      },
      args: [type, message, notionUrl || '', logoUrl],
    })
    .catch(() => {
      // Silently ignore restricted tabs like chrome://
    });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) {
    return;
  }

  const selectedText = info.selectionText?.trim();
  if (!selectedText) {
    console.warn('⚠️ [Background] Selection text is empty.');
    return;
  }

  const pageTitle = tab?.title?.trim() || 'Web Highlight';
  const pageUrl = tab?.url || info.pageUrl || '';

  if (!pageUrl) {
    console.warn('⚠️ [Background] Missing page URL.');
    return;
  }

  const idempotencyKey = crypto.randomUUID();

  // Indicate in-flight sync
  setBadge('...', '#3b82f6', 0);

  try {
    const result = await api.highlights.create({
      idempotencyKey,
      text: selectedText,
      title: pageTitle,
      url: pageUrl,
    });

    console.log('✅ [Background] Highlight saved successfully:', result);

    setBadge('OK', '#10b981', 3500);

    const groupInfo = result.isNewSource
      ? 'Created new Notion page'
      : 'Grouped into existing Notion page';
    const notifId = `highlight-${Date.now()}`;

    // Desktop notification (click to open Notion)
    showNotification(
      notifId,
      'Highlight Saved to Notion',
      `${groupInfo}: "${pageTitle.slice(0, 40)}${pageTitle.length > 40 ? '...' : ''}" (Click to view)`,
      result.notionUrl,
    );

    // In-page floating toast
    showInPageToast(tab?.id, 'success', `${groupInfo}!`, result.notionUrl);
  } catch (error: any) {
    console.error('❌ [Background] Failed to save highlight:', error);

    if (error?.status === 401 || error?.code === 'UNAUTHORIZED') {
      setBadge('AUTH', '#f59e0b', 5000);
      showNotification(
        `auth-required-${Date.now()}`,
        'Authentication Required',
        'Please click the Notion Highlight Sync icon to sign in to your account.',
      );
      showInPageToast(tab?.id, 'auth', 'Please sign in to save highlights.');
    } else if (error?.status === 429 || error?.code === 'QUOTA_EXCEEDED') {
      setBadge('MAX', '#ef4444', 5000);
      showNotification(
        `quota-${Date.now()}`,
        'Highlight Quota Exceeded',
        'You have reached your Free plan highlight limit (100 highlights).',
      );
      showInPageToast(tab?.id, 'error', 'Highlight quota exceeded (100).');
    } else {
      setBadge('ERR', '#ef4444', 4000);
      showNotification(
        `err-${Date.now()}`,
        'Sync Failed',
        error?.message || 'Could not connect to backend server. Make sure it is running.',
      );
      showInPageToast(tab?.id, 'error', error?.message || 'Sync failed.');
    }
  }
});

console.log('⚡ [Background] Notion Highlight Sync Service Worker active.');
