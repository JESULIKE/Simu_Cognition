import { d as defineEventHandler, a as getRouterParam, c as createError, b as prisma, e as useRuntimeConfig } from '../../../../_/nitro.mjs';
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

const MOMENTOS_DIAS = {
  INICIAL: 0,
  DIA_1: 1,
  DIA_3: 3,
  DIA_7: 7,
  DIA_14: 14
};
const comparar_post = defineEventHandler(async (event) => {
  var _a;
  const session = await getServerSession(event);
  const docenteId = ((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) || "docente-local";
  const evaluacionId = getRouterParam(event, "id");
  if (!evaluacionId) {
    throw createError({ statusCode: 400, message: "ID de evaluaci\xF3n requerido" });
  }
  const evaluacion = await prisma.estudianteEvaluacion.findFirst({
    where: { id: evaluacionId, docenteId },
    include: { resultados: true }
  });
  if (!evaluacion) {
    throw createError({ statusCode: 404, message: "Evaluaci\xF3n no encontrada" });
  }
  const inicial = evaluacion.resultados.find((r) => r.momento === "INICIAL");
  if (!inicial) {
    throw createError({
      statusCode: 422,
      message: "Se requiere el resultado INICIAL antes de generar la comparaci\xF3n."
    });
  }
  const puntosOlvidoReales = evaluacion.resultados.filter((r) => !r.reestudioReportado && r.momento in MOMENTOS_DIAS).map((r) => ({
    dia: MOMENTOS_DIAS[r.momento],
    retencion_real: r.momento === "INICIAL" ? 1 : inicial.notaObtenida > 0 ? r.notaObtenida / inicial.notaObtenida : 0
  }));
  const mlUrl = useRuntimeConfig().mlServiceUrl;
  let mlResult;
  try {
    mlResult = await $fetch(`${mlUrl}/comparar`, {
      method: "POST",
      body: {
        tipo_materia: evaluacion.tipoMateriaDocente,
        dificultad_docente: evaluacion.dificultadDocente,
        dificultad_percibida: evaluacion.dificultadPercibida,
        horas_estudio: evaluacion.horasEstudio,
        repasos_previos: evaluacion.repasosPrevios,
        calidad_estudio: evaluacion.calidadEstudio,
        calificacion_real: inicial.notaObtenida,
        puntos_olvido_reales: puntosOlvidoReales
      }
    });
  } catch (err) {
    console.error("[comparar] Error llamando al microservicio ML:", err);
    throw createError({
      statusCode: 502,
      message: "Error en el servicio de comparaci\xF3n. Intenta de nuevo."
    });
  }
  const retencionRealJson = JSON.stringify(puntosOlvidoReales);
  const retencionPredichaJson = JSON.stringify(mlResult.curva_olvido_predicha);
  const comparacion = await prisma.comparacionResultado.upsert({
    where: { evaluacionId },
    create: {
      evaluacionId,
      calificacionPredicha: mlResult.calificacion_predicha,
      calificacionReal: inicial.notaObtenida,
      errorAbsoluto: mlResult.error_absoluto,
      retencionPredichaJson,
      retencionRealJson,
      recomendacionTexto: mlResult.recomendacion
    },
    update: {
      calificacionPredicha: mlResult.calificacion_predicha,
      calificacionReal: inicial.notaObtenida,
      errorAbsoluto: mlResult.error_absoluto,
      retencionPredichaJson,
      retencionRealJson,
      recomendacionTexto: mlResult.recomendacion,
      generadaEn: /* @__PURE__ */ new Date()
    }
  });
  return {
    comparacion,
    curva_olvido_predicha: mlResult.curva_olvido_predicha,
    puntos_olvido_reales: puntosOlvidoReales,
    delta_retencion_promedio: mlResult.delta_retencion_promedio,
    recomendacion: mlResult.recomendacion
  };
});

export { comparar_post as default };
//# sourceMappingURL=comparar.post.mjs.map
