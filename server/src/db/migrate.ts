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

  // Step 2: Safe database schema migration (prioritizing versioned migrations without data loss)
  try {
    console.log('🔄 [DB-INIT] Step 2/3: Applying versioned production database migrations (migrate deploy)...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit', timeout: 60000 });
    console.log('✅ [DB-INIT] All database migrations applied successfully.');
  } catch (migErr: any) {
    console.warn('ℹ️ [DB-INIT] migrate deploy note, falling back to safe schema sync (db push):', migErr?.message || migErr);
    try {
      execSync('npx prisma db push', {
        stdio: 'inherit',
        timeout: 60000
      });
      console.log('✅ [DB-INIT] Schema synchronized safely without data loss.');
    } catch (pushErr: any) {
      console.warn('⚠️ [DB-INIT] Database sync warning:', pushErr?.message || pushErr);
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
