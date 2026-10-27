const CONTEXT_MENU_ID = 'send-to-notion';

// Register context menu when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Send to Notion',
      contexts: ['selection'],
    });
    console.log('✅ [Background] "Send to Notion" context menu created successfully.');
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) {
    return;
  }

  const selectedText = info.selectionText?.trim();
  if (!selectedText) {
    console.warn('⚠️ [Background] Context menu clicked, but selection text is empty.');
    return;
  }

  const pageTitle = tab?.title || 'Untitled Page';
  const pageUrl = tab?.url || info.pageUrl || '';

  console.log('📌 [Background] Captured highlight candidate:', {
    text: selectedText.substring(0, 80) + (selectedText.length > 80 ? '...' : ''),
    title: pageTitle,
    url: pageUrl,
    timestamp: new Date().toISOString(),
  });
});

console.log('⚡ [Background] Notion Highlight Sync service worker initialized.');
