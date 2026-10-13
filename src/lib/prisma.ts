import { PrismaClient } from '@prisma/client';
import path from 'path';

// Force absolute path so it never looks in the wrong folder again
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}?connection_limit=1`,
      },
    },
  });

globalForPrisma.prisma = prisma;
