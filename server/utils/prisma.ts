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

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
