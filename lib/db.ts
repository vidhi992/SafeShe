import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  initialized: boolean | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

/**
 * Ensures SQLite tables and seed data exist on production serverless environments (Vercel)
 */
export async function ensureDbInitialized() {
  if (globalForPrisma.initialized) return;
  try {
    await db.user.findFirst({ take: 1 });
    globalForPrisma.initialized = true;
  } catch (e: any) {
    console.log('[DB] Database uninitialized on serverless environment. Initializing schema and seed data...');
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'ignore' });
      execSync('npx tsx prisma/seed.ts', { stdio: 'ignore' });
      globalForPrisma.initialized = true;
    } catch (pushErr) {
      console.error('[DB] Auto-migration error:', pushErr);
    }
  }
}
