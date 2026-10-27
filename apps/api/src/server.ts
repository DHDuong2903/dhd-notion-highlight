import { buildApp } from './app.js';
import { env } from './config/env.js';

const server = buildApp({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

async function start() {
  try {
    const address = await server.listen({
      port: env.PORT,
      host: env.HOST,
    });
    server.log.info(`🚀 Notion Highlight Sync Backend running on ${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
