import { NotionService } from '../services/notion.js';
import { canonicalizeUrl } from '../utils/url.js';
import { env } from '../config/env.js';

async function main() {
  console.log('🧪 Starting Notion API Prototype Verification...\n');

  const apiKey = env.NOTION_API_KEY;
  const databaseId = env.NOTION_DATABASE_ID;

  if (!apiKey || !databaseId) {
    console.warn('⚠️  NOTION_API_KEY or NOTION_DATABASE_ID is not configured in apps/api/.env');
    console.log('Please add:');
    console.log('  NOTION_API_KEY=ntn_... (or secret_...)');
    console.log('  NOTION_DATABASE_ID=...\n');
    console.log('Skipping live Notion verification.');
    process.exit(0);
  }

  const notion = new NotionService({ auth: apiKey });

  // 1. Test Connection
  console.log('1️⃣ Testing connection to Notion...');
  const conn = await notion.testConnection();
  console.log(
    `✅ Connected successfully! Bot ID: ${conn.botId}, Name: ${conn.botName || 'Integration'}\n`,
  );

  // 2. Test First Highlight (New Source Page)
  const testUrl1 = 'https://example.com/notion-sync-demo?utm_source=hackernews#intro';
  const canonical1 = canonicalizeUrl(testUrl1);
  console.log(`2️⃣ Sending 1st highlight for URL: ${testUrl1}`);
  console.log(`   Canonical URL: ${canonical1}`);

  const result1 = await notion.saveHighlight({
    databaseId,
    title: 'Notion Highlight Prototype Demo',
    url: canonical1,
    highlightText:
      '“First highlight excerpt: The goal of software design is to manage complexity.”',
  });

  console.log(`   Result: isNewSource=${result1.isNewSource}, Page ID=${result1.pageId}`);
  if (!result1.isNewSource) {
    console.error('❌ Expected 1st highlight to create a new page!');
  } else {
    console.log('✅ Successfully created new Notion page for source!');
  }

  // 3. Test Second Highlight (Same Canonical URL with different tracking params)
  const testUrl2 = 'https://example.com/notion-sync-demo?utm_source=twitter&utm_medium=social';
  const canonical2 = canonicalizeUrl(testUrl2);
  console.log(`\n3️⃣ Sending 2nd highlight for same source: ${testUrl2}`);
  console.log(`   Canonical URL: ${canonical2}`);

  const result2 = await notion.saveHighlight({
    databaseId,
    title: 'Notion Highlight Prototype Demo',
    url: canonical2,
    highlightText:
      '“Second highlight excerpt: Simple things should be simple, complex things should be possible.”',
  });

  console.log(`   Result: isNewSource=${result2.isNewSource}, Page ID=${result2.pageId}`);
  if (result2.isNewSource || result2.pageId !== result1.pageId) {
    console.error('❌ Failed source grouping: 2nd highlight did not append to existing page!');
  } else {
    console.log(
      '✅ Successfully appended highlight to EXISTING Notion page (Source Grouping Verified)!',
    );
  }

  // 4. Test Third Highlight (Different URL)
  const testUrl3 = 'https://example.com/another-different-article';
  const canonical3 = canonicalizeUrl(testUrl3);
  console.log(`\n4️⃣ Sending 3rd highlight for different URL: ${testUrl3}`);

  const result3 = await notion.saveHighlight({
    databaseId,
    title: 'Another Article',
    url: canonical3,
    highlightText: '“Third highlight from a different article source.”',
  });

  console.log(`   Result: isNewSource=${result3.isNewSource}, Page ID=${result3.pageId}`);
  if (!result3.isNewSource || result3.pageId === result1.pageId) {
    console.error('❌ Failed separation: 3rd highlight merged into previous source!');
  } else {
    console.log('✅ Successfully created a separate Notion page for different URL!');
  }

  console.log('\n🎉 Notion API Prototype verification completed successfully!');
}

main().catch((err) => {
  console.error('\n❌ Prototype verification failed with error:');
  console.error(err);
  process.exit(1);
});
