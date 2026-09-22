import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  initialized: boolean | undefined;
};

function getDatabaseUrl(): string {
  // If running on Vercel serverless platform
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      console.log('[DB] Cold start on Vercel: Copying pre-seeded SQLite database to /tmp/dev.db...');
      const candidatePaths = [
        path.join(process.cwd(), 'prisma', 'seed.db'),
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'seed.db'),
        path.join(process.cwd(), 'dev.db'),
      ];

      let copied = false;
      for (const srcPath of candidatePaths) {
        if (fs.existsSync(srcPath)) {
          try {
            fs.copyFileSync(srcPath, tmpDbPath);
            console.log(`[DB] Successfully copied seed database to ${tmpDbPath} from ${srcPath}`);
            copied = true;
            break;
          } catch (err) {
            console.error(`[DB] Error copying seed DB from ${srcPath}:`, err);
          }
        }
      }

      if (!copied) {
        console.warn('[DB] Warning: No pre-seeded database file found in candidate paths.');
      }
    }
    return `file:${tmpDbPath}`;
  }

  return process.env.DATABASE_URL || 'file:./dev.db';
}

/**
 * Ensures SQLite tables and seed data exist on serverless environments (Vercel)
 */
export async function ensureDbInitialized() {
  // getDatabaseUrl() handles synchronous copy to /tmp/dev.db on Vercel
  globalForPrisma.initialized = true;
}

const dbUrl = getDatabaseUrl();

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
