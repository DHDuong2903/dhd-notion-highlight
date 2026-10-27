import { api } from '../api/client.js';

const CONTEXT_MENU_ID = 'send-to-notion';

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
function showNotification(id: string, title: string, message: string) {
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

    const groupInfo = result.isNewSource ? 'Created new page' : 'Grouped into existing page';
    showNotification(
      `highlight-${Date.now()}`,
      'Highlight Saved to Notion',
      `${groupInfo}: "${pageTitle.slice(0, 45)}${pageTitle.length > 45 ? '...' : ''}"`,
    );
  } catch (error: any) {
    console.error('❌ [Background] Failed to save highlight:', error);

    if (error?.status === 401 || error?.code === 'UNAUTHORIZED') {
      setBadge('AUTH', '#f59e0b', 5000);
      showNotification(
        `auth-required-${Date.now()}`,
        'Authentication Required',
        'Please click the Notion Highlight Sync icon to sign in to your account.',
      );
    } else if (error?.status === 429 || error?.code === 'QUOTA_EXCEEDED') {
      setBadge('MAX', '#ef4444', 5000);
      showNotification(
        `quota-${Date.now()}`,
        'Highlight Quota Exceeded',
        'You have reached your Free plan highlight limit (100 highlights).',
      );
    } else {
      setBadge('ERR', '#ef4444', 4000);
      showNotification(
        `err-${Date.now()}`,
        'Sync Failed',
        error?.message || 'Could not connect to backend server. Make sure it is running.',
      );
    }
  }
});

console.log('⚡ [Background] Notion Highlight Sync Service Worker active.');
