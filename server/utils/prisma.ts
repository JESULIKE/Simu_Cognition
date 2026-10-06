/**
 * server/utils/prisma.ts
 * ──────────────────────
 * Cliente Prisma singleton para Nitro (Nuxt server-side).
 *
 * En serverless (Vercel), cada función puede tener su propio proceso, por lo
 * que el patrón singleton con `globalThis` evita múltiples instancias en hot
 * reload de desarrollo sin sacrificar la reutilización en producción.
 *
 * Uso en cualquier route handler de server/:
 *   import { prisma } from "~/server/utils/prisma"
 */

import { PrismaClient } from "@prisma/client";

// Garantizar que las variables de base de datos existan en serverless (Vercel)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    "postgres://postgres.oqkiglsiufaynvyybhbj:7nMwbgZfGPuqvHyj@aws-1-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true";
}

if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL =
    process.env.POSTGRES_URL_NON_POOLING ||
    "postgres://postgres.oqkiglsiufaynvyybhbj:7nMwbgZfGPuqvHyj@aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require";
}

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

globalThis.__prisma = prisma;
