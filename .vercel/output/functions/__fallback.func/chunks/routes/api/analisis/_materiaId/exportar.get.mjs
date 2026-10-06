import { d as defineEventHandler, a as getRouterParam, c as createError, b as prisma, e as useRuntimeConfig, s as setResponseHeaders } from '../../../../_/nitro.mjs';
import { g as getServerSession } from '../../../../_/nuxtAuthHandler.mjs';
import '@prisma/client';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'next-auth/core';

const exportar_get = defineEventHandler(async (event) => {
  var _a;
  const session = await getServerSession(event);
  const docenteId = ((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) || "docente-local";
  const materiaId = getRouterParam(event, "materiaId");
  if (!materiaId) {
    throw createError({ statusCode: 400, message: "materiaId requerido" });
  }
  const materia = await prisma.materia.findFirst({
    where: { id: materiaId, usuarioId: docenteId },
    select: { id: true }
  });
  if (!materia) {
    throw createError({ statusCode: 404, message: "Materia no encontrada" });
  }
  const evaluaciones = await prisma.estudianteEvaluacion.findMany({
    where: { materiaId },
    include: { comparacion: true },
    orderBy: { codigoAnonimo: "asc" }
  });
  const conComparacion = evaluaciones.filter((e) => e.comparacion !== null);
  if (conComparacion.length === 0) {
    throw createError({
      statusCode: 422,
      message: "No hay evaluaciones con comparaci\xF3n calculada para exportar."
    });
  }
  const rows = conComparacion.map((e) => ({
    codigoAnonimo: e.codigoAnonimo,
    tipoMateriaDocente: e.tipoMateriaDocente,
    dificultadDocente: e.dificultadDocente,
    dificultadPercibida: e.dificultadPercibida,
    horasEstudio: e.horasEstudio,
    repasosPrevios: e.repasosPrevios,
    calidadEstudio: e.calidadEstudio,
    calificacionPredicha: e.comparacion.calificacionPredicha,
    calificacionReal: e.comparacion.calificacionReal,
    errorAbsoluto: e.comparacion.errorAbsoluto,
    retencionPredichaJson: e.comparacion.retencionPredichaJson,
    retencionRealJson: e.comparacion.retencionRealJson
  }));
  const mlUrl = useRuntimeConfig().mlServiceUrl;
  let csvContent;
  try {
    csvContent = await $fetch(`${mlUrl}/analisis/exportar`, {
      method: "POST",
      body: { rows },
      responseType: "text"
    });
  } catch (err) {
    console.error("[exportar] Error llamando al microservicio ML:", err);
    throw createError({
      statusCode: 502,
      message: "Error generando el CSV. Intenta de nuevo."
    });
  }
  setResponseHeaders(event, {
    "Content-Type": "text/csv",
    "Content-Disposition": `attachment; filename="validacion_${materiaId}.csv"`
  });
  return csvContent;
});

export { exportar_get as default };
//# sourceMappingURL=exportar.get.mjs.map
