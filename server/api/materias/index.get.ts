/**
 * server/api/materias/index.get.ts
 * ─────────────────────────────────
 * Lista las materias del docente autenticado.
 * GET /api/materias
 *
 * Las materias NO se listan públicamente: los estudiantes entran a la
 * encuesta por el enlace/QR de su materia (ver /api/publico/materias/:id).
 */

import { requireDocenteId } from "../../utils/session";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const usuarioId = await requireDocenteId(event);
  try {
    return await prisma.materia.findMany({
      where: { usuarioId },
      include: { dataset: { select: { origen: true, creadoEn: true } } },
      orderBy: { creadoEn: "desc" },
    });
  } catch (error) {
    console.error("[api/materias] Error al obtener materias:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error al cargar materias de la base de datos.",
    });
  }
});
