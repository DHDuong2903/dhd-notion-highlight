import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Look for .env in current directory or apps/api
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'apps/api/.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const apiKey = process.env.POSTHOG_API_KEY;
const host = (process.env.POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/+$/, '');

console.log('🔍 Testing PostHog connection...');
console.log('Host:', host);
console.log(
  'API Key configured:',
  apiKey ? `${apiKey.slice(0, 8)}... (length: ${apiKey.length})` : 'MISSING',
);

if (!apiKey) {
  console.error('❌ POSTHOG_API_KEY not found in apps/api/.env');
  process.exit(1);
}

async function runTest() {
  try {
    const payload = {
      api_key: apiKey,
      event: 'extension_test_event',
      properties: {
        distinct_id: 'extension_tester_user_01',
        source: 'chrome_extension_test_runner',
        test_message: 'Hello PostHog from Notion Highlight Extension verification!',
        timestamp: new Date().toISOString(),
      },
    };

    console.log('📤 Sending test event to PostHog:', payload.event);

    const res = await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = await res.text();
    console.log('📥 Response status:', res.status, res.statusText);
    console.log('📥 Response body:', body);

    if (res.ok) {
      console.log('🎉 SUCCESS! Event successfully sent to PostHog!');
      console.log(
        '👉 Check your PostHog dashboard -> Activity / Events tab to see "extension_test_event" live!',
      );
    } else {
      console.error('❌ PostHog rejected the event:', body);
    }
  } catch (err: any) {
    console.error('❌ Connection failed:', err?.message);
  }
}

runTest();
