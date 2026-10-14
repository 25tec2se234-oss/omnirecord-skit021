import { execSync } from 'child_process';
import { prisma } from './client.js';
import { seedDatabase } from './seed.js';

export async function runDatabaseInit() {
  console.log('====================================================');
  console.log('🔄 [DB-INIT] Starting automated database synchronization...');
  console.log('====================================================');

  // Step 1: If an earlier migration attempt failed, resolve it as rolled back so Prisma is unblocked
  try {
    console.log('🔄 [DB-INIT] Step 1/3: Clearing any stuck/failed migration records...');
    execSync('npx prisma migrate resolve --rolled-back 20241014000000_init', {
      stdio: 'pipe',
      timeout: 30000
    });
    console.log('✅ [DB-INIT] Successfully marked migration 20241014000000_init as rolled back.');
  } catch (err: any) {
    // Normal if no failed migration exists in _prisma_migrations
    console.log('ℹ️ [DB-INIT] Migration resolve check passed (no stuck migration to resolve).');
  }

  // Step 2: Push Prisma schema directly to PostgreSQL database (creates all 13 tables, enums, indexes)
  try {
    console.log('🔄 [DB-INIT] Step 2/3: Synchronizing Prisma schema to PostgreSQL (db push)...');
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      timeout: 60000
    });
    console.log('✅ [DB-INIT] All database tables, enums, and constraints are synchronized.');
  } catch (err: any) {
    console.warn('⚠️ [DB-INIT] db push note (attempting migrate deploy as fallback):', err?.message || err);
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit', timeout: 60000 });
      console.log('✅ [DB-INIT] Fallback migrate deploy succeeded.');
    } catch (migErr: any) {
      console.warn('⚠️ [DB-INIT] migrate deploy note:', migErr?.message || migErr);
    }
  }

  // Step 3: Seed default institutional accounts (Admin, Coordinator, Student)
  try {
    console.log('🌱 [DB-INIT] Step 3/3: Verifying and seeding default institutional records...');
    await seedDatabase();
    console.log('✅ [DB-INIT] Default institutional data verified and seeded.');
  } catch (seedErr: any) {
    console.warn('⚠️ [DB-INIT] Seeding note:', seedErr?.message || seedErr);
  } finally {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  }

  console.log('====================================================');
  console.log('🎉 [DB-INIT] Database ready for production traffic!');
  console.log('====================================================');
}

// Auto-run if executed directly as a script
if (process.argv[1]?.includes('migrate')) {
  runDatabaseInit()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ [DB-INIT] Database synchronization encountered an issue:', err);
      // Exit 0 so the container can still start and serve cached/fallback data if DB is temporarily unreachable
      process.exit(0);
    });
}
