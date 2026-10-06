/**
 * server/api/simulaciones.get.ts
 * ──────────────────────────────
 * Lista el historial de simulaciones del docente autenticado.
 * GET /api/simulaciones?materiaId=<id>&limit=20&offset=0
 */

import { getSafeSession } from "../utils/session";
import { prisma } from "../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const session = await getSafeSession(event);
    const usuarioId = (session?.user as { id?: string })?.id || "docente-local";

    const query = getQuery(event);
    const materiaId = query.materiaId as string | undefined;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const offset = Number(query.offset) || 0;

    const [simulaciones, total] = await prisma.$transaction([
      prisma.simulacion.findMany({
        where: {
          usuarioId,
          ...(materiaId ? { materiaId } : {}),
        },
        include: {
          materia: { select: { id: true, nombre: true, tipo: true } },
        },
        orderBy: { creadoEn: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.simulacion.count({
        where: {
          usuarioId,
          ...(materiaId ? { materiaId } : {}),
        },
      }),
    ]);

    return { simulaciones, total, limit, offset };
  } catch (error) {
    console.error("[api/simulaciones] Error al cargar simulaciones:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error al cargar historial de simulaciones.",
      data: (error as Error)?.message,
    });
  }
});
