/**
 * GET /api/calibracion/:materiaId
 * Devuelve la calibración guardada de la materia (o null si no hay).
 */

import { requireDocenteId } from "../../utils/session";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const docenteId = await requireDocenteId(event);
  const materiaId = getRouterParam(event, "materiaId");
  if (!materiaId) throw createError({ statusCode: 400, message: "materiaId requerido" });

  const materia = await prisma.materia.findFirst({
    where: { id: materiaId, usuarioId: docenteId },
    select: { calibracion: true },
  });
  if (!materia) throw createError({ statusCode: 404, message: "Materia no encontrada" });

  return materia.calibracion;
});
