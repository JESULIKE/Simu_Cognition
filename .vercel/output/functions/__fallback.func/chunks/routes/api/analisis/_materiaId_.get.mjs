import { d as defineEventHandler, a as getRouterParam, c as createError, b as prisma, e as useRuntimeConfig } from '../../../_/nitro.mjs';
import { g as getServerSession } from '../../../_/nuxtAuthHandler.mjs';
import '@prisma/client';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'next-auth/core';

const _materiaId__get = defineEventHandler(async (event) => {
  var _a;
  const session = await getServerSession(event);
  const docenteId = ((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) || "docente-local";
  const materiaId = getRouterParam(event, "materiaId");
  if (!materiaId) {
    throw createError({ statusCode: 400, message: "materiaId requerido" });
  }
  const materia = await prisma.materia.findFirst({
    where: { id: materiaId, usuarioId: docenteId },
    select: { id: true, nombre: true, tipo: true }
  });
  if (!materia) {
    throw createError({ statusCode: 404, message: "Materia no encontrada" });
  }
  const evaluaciones = await prisma.estudianteEvaluacion.findMany({
    where: { materiaId },
    include: { comparacion: true, resultados: true },
    orderBy: { creadaEn: "asc" }
  });
  const conComparacion = evaluaciones.filter((e) => e.comparacion !== null);
  if (conComparacion.length < 2) {
    return {
      materia,
      evaluaciones,
      metricas: null,
      mensaje: "Se necesitan al menos 2 evaluaciones con comparaci\xF3n calculada para obtener m\xE9tricas agregadas."
    };
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
  let metricas;
  try {
    metricas = await $fetch(`${mlUrl}/analisis/agregado`, {
      method: "POST",
      body: { rows }
    });
  } catch (err) {
    console.error("[analisis] Error llamando al microservicio ML:", err);
    throw createError({
      statusCode: 502,
      message: "Error en el servicio de an\xE1lisis. Intenta de nuevo."
    });
  }
  return {
    materia,
    evaluaciones,
    metricas
  };
});

export { _materiaId__get as default };
//# sourceMappingURL=_materiaId_.get.mjs.map
