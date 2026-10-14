import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './db/client.js';
import { seedDatabase } from './db/seed.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const app = createApp();

const server = app.listen(env.PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 Pehchaan (SKIT021) Backend Server Running`);
  console.log(`📡 Environment:  ${env.NODE_ENV}`);
  console.log(`🌐 API Base:     http://localhost:${env.PORT}${env.API_PREFIX}`);
  console.log(`📖 Swagger Docs: http://localhost:${env.PORT}${env.API_PREFIX}/docs`);
  console.log(`💚 Health Check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  console.log(`====================================================`);

  // Verify database connection and ensure seed records exist
  try {
    console.log('🌱 Verifying default institutional records in database...');
    await seedDatabase();
    console.log('✅ Institutional database connection & default accounts confirmed.');
  } catch (err: any) {
    console.warn('⚠️ Startup database check note:', err?.message || err);
  }
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
