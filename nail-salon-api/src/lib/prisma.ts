// Prisma 7 with PostgreSQL adapter - Fixed configuration
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create PostgreSQL connection pool with explicit credentials
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    database: 'nail_salon',
    // No password - as per CONNECTIONS.md
    // Important: Don't use connectionString, use individual options
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Singleton pattern to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
