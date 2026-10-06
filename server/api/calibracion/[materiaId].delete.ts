/**
 * DELETE /api/calibracion/:materiaId
 * Descarta la calibración: el simulador vuelve a la curva teórica por defecto.
 */

import { requireDocenteId } from "../../utils/session";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const docenteId = await requireDocenteId(event);
  const materiaId = getRouterParam(event, "materiaId");
  if (!materiaId) throw createError({ statusCode: 400, message: "materiaId requerido" });

  const materia = await prisma.materia.findFirst({
    where: { id: materiaId, usuarioId: docenteId },
    select: { id: true },
  });
  if (!materia) throw createError({ statusCode: 404, message: "Materia no encontrada" });

  await prisma.calibracionGrupo.deleteMany({ where: { materiaId } });
  return { ok: true };
});
