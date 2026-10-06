/**
 * server/api/analisis/[materiaId]/exportar.get.ts
 * ──────────────────────────────────────────────────
 * GET /api/analisis/:materiaId/exportar
 *
 * Proxy al endpoint POST /analisis/exportar del microservicio Python.
 * Devuelve el CSV directamente al cliente con Content-Disposition: attachment,
 * listo para descargar y usar en el análisis del paper.
 */

import { getSafeSession } from "../../../utils/session";
import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  // 1. Auth
  const session = await getSafeSession(event);
  const docenteId = (session?.user as { id?: string })?.id || "docente-local";

  // 2. Param
  const materiaId = getRouterParam(event, "materiaId");
  if (!materiaId) {
    throw createError({ statusCode: 400, message: "materiaId requerido" });
  }

  // 3. Verificar que la materia pertenece al docente
  const materia = await prisma.materia.findFirst({
    where: { id: materiaId, usuarioId: docenteId },
    select: { id: true },
  });
  if (!materia) {
    throw createError({ statusCode: 404, message: "Materia no encontrada" });
  }

  // 4. Cargar evaluaciones con comparación
  const evaluaciones = await prisma.estudianteEvaluacion.findMany({
    where: { materiaId },
    include: { comparacion: true },
    orderBy: { codigoAnonimo: "asc" },
  });

  const conComparacion = evaluaciones.filter((e) => e.comparacion !== null);
  if (conComparacion.length === 0) {
    throw createError({
      statusCode: 422,
      message: "No hay evaluaciones con comparación calculada para exportar.",
    });
  }

  // 5. Construir rows
  const rows = conComparacion.map((e) => ({
    codigoAnonimo: e.codigoAnonimo,
    tipoMateriaDocente: e.tipoMateriaDocente,
    dificultadDocente: e.dificultadDocente,
    dificultadPercibida: e.dificultadPercibida,
    horasEstudio: e.horasEstudio,
    repasosPrevios: e.repasosPrevios,
    calidadEstudio: e.calidadEstudio,
    calificacionPredicha: e.comparacion!.calificacionPredicha,
    calificacionReal: e.comparacion!.calificacionReal,
    errorAbsoluto: e.comparacion!.errorAbsoluto,
    retencionPredichaJson: e.comparacion!.retencionPredichaJson,
    retencionRealJson: e.comparacion!.retencionRealJson,
  }));

  // 6. Llamar al microservicio Python para generar el CSV
  const mlUrl = useRuntimeConfig().mlServiceUrl;
  let csvContent: string;
  try {
    csvContent = await $fetch<string>(`${mlUrl}/analisis/exportar`, {
      method: "POST",
      body: { rows },
      responseType: "text",
    });
  } catch (err) {
    console.error("[exportar] Error llamando al microservicio ML:", err);
    throw createError({
      statusCode: 502,
      message: "Error generando el CSV. Intenta de nuevo.",
    });
  }

  // 7. Devolver CSV al cliente
  setResponseHeaders(event, {
    "Content-Type": "text/csv",
    "Content-Disposition": `attachment; filename="validacion_${materiaId}.csv"`,
  });

  return csvContent;
});
