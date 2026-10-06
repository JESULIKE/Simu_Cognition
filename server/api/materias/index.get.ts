/**
 * server/api/materias/index.get.ts
 * ─────────────────────────────────
 * Lista las materias del docente autenticado.
 * GET /api/materias
 */

import { getSafeSession } from "../../utils/session";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const session = await getSafeSession(event);
    const usuarioId = (session?.user as { id?: string })?.id;

    // Si se solicitan materias públicas (para la encuesta de estudiantes) o no hay sesión de docente:
    if (query.publicas === "true" || !usuarioId) {
      const materiasPublicas = await prisma.materia.findMany({
        select: {
          id: true,
          nombre: true,
          tipo: true,
        },
        orderBy: { creadoEn: "desc" },
      });
      return materiasPublicas;
    }

    // Si hay sesión de docente, devolver las materias creadas por él
    const materias = await prisma.materia.findMany({
      where: { usuarioId },
      include: { dataset: { select: { origen: true, creadoEn: true } } },
      orderBy: { creadoEn: "desc" },
    });

    return materias;
  } catch (error) {
    console.error("[api/materias] Error al obtener materias:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error al cargar materias de la base de datos.",
      data: (error as Error)?.message,
    });
  }
});
