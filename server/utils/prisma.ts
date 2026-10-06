/**
 * server/utils/prisma.ts
 * ──────────────────────
 * Cliente Prisma singleton para Nitro (Nuxt server-side).
 *
 * En serverless (Vercel), cada función puede tener su propio proceso, por lo
 * que el patrón singleton con `globalThis` evita múltiples instancias en hot
 * reload de desarrollo sin sacrificar la reutilización en producción.
 *
 * Las credenciales NUNCA van en el código: se leen de variables de entorno
 * (.env en local; Project Settings → Environment Variables en Vercel).
 */

import { PrismaClient } from "@prisma/client";

// Las integraciones de Vercel/Supabase publican nombres alternativos.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || "";
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.POSTGRES_URL_NON_POOLING || "";
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL no está definida. Configúrala en .env (local) o en las variables de entorno de Vercel."
  );
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
