import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './db/client.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Pehchaan (SKIT021) Backend Server Running`);
  console.log(`📡 Environment:  ${env.NODE_ENV}`);
  console.log(`🌐 API Base:     http://localhost:${env.PORT}${env.API_PREFIX}`);
  console.log(`📖 Swagger Docs: http://localhost:${env.PORT}${env.API_PREFIX}/docs`);
  console.log(`💚 Health Check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  console.log(`====================================================`);
});

// Graceful Shutdown Handler
async function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('🔒 HTTP server closed.');
    try {
      await prisma.$disconnect();
      console.log('📦 Database connections closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database disconnect:', err);
      process.exit(1);
    }
  });

  // Force shutdown if taking too long
  setTimeout(() => {
    console.error('⚠️ Forcefully terminating process after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
