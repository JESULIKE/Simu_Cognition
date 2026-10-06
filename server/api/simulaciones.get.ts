/**
 * server/api/simulaciones.get.ts
 * ──────────────────────────────
 * Lista el historial de simulaciones del docente autenticado.
 * GET /api/simulaciones?materiaId=<id>&limit=20&offset=0
 */

import { getServerSession } from "#auth";
import { prisma } from "../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
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
});
