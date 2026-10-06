/**
 * server/api/evaluaciones/[id]/comparar.post.ts
 * ──────────────────────────────────────────────
 * POST /api/evaluaciones/:id/comparar
 *
 * Flujo:
 *  1. Lee la EstudianteEvaluacion + sus ResultadoQuiz desde Prisma.
 *  2. Construye los puntos de olvido reales desde los resultados disponibles.
 *  3. Llama a POST /comparar del microservicio Python.
 *  4. Guarda el ComparacionResultado en Prisma (upsert).
 *  5. Devuelve la comparación al cliente.
 */

import { getSafeSession } from "../../../utils/session";
import { prisma } from "../../../utils/prisma";

const MOMENTOS_DIAS: Record<string, number> = {
  INICIAL: 0,
  DIA_1: 1,
  DIA_3: 3,
  DIA_7: 7,
  DIA_14: 14,
};

export default defineEventHandler(async (event) => {
  // 1. Auth
  const session = await getSafeSession(event);
  const docenteId = (session?.user as { id?: string })?.id || "docente-local";

  // 2. Param
  const evaluacionId = getRouterParam(event, "id");
  if (!evaluacionId) {
    throw createError({ statusCode: 400, message: "ID de evaluación requerido" });
  }

  // 3. Cargar evaluación + resultados
  const evaluacion = await prisma.estudianteEvaluacion.findFirst({
    where: { id: evaluacionId, docenteId },
    include: { resultados: true },
  });
  if (!evaluacion) {
    throw createError({ statusCode: 404, message: "Evaluación no encontrada" });
  }

  // 4. Verificar que existe el resultado INICIAL (necesario para H1)
  const inicial = evaluacion.resultados.find((r) => r.momento === "INICIAL");
  if (!inicial) {
    throw createError({
      statusCode: 422,
      message: "Se requiere el resultado INICIAL antes de generar la comparación.",
    });
  }

  // 5. Construir puntos de olvido reales (H2)
  //    retencion_real = notaObtenida(momento) / notaObtenida(INICIAL)
  //    Se excluyen los momentos con reestudioReportado = true
  const puntosOlvidoReales = evaluacion.resultados
    .filter((r) => !r.reestudioReportado && r.momento in MOMENTOS_DIAS)
    .map((r) => ({
      dia: MOMENTOS_DIAS[r.momento],
      retencion_real:
        r.momento === "INICIAL"
          ? 1.0
          : (inicial.notaObtenida > 0 ? r.notaObtenida / inicial.notaObtenida : 0.0),
    }));

  // 6. Llamar al microservicio Python /comparar
  const mlUrl = useRuntimeConfig().mlServiceUrl;

  type MLCompararResponse = {
    calificacion_predicha: number;
    error_absoluto: number;
    curva_olvido_predicha: { dia: number; retencion_predicha: number }[];
    delta_retencion_promedio: number;
    recomendacion: string;
  };

  let mlResult: MLCompararResponse;
  try {
    mlResult = await $fetch<MLCompararResponse>(`${mlUrl}/comparar`, {
      method: "POST",
      body: {
        tipo_materia: evaluacion.tipoMateriaDocente,
        dificultad_docente: evaluacion.dificultadDocente,
        dificultad_percibida: evaluacion.dificultadPercibida,
        horas_estudio: evaluacion.horasEstudio,
        repasos_previos: evaluacion.repasosPrevios,
        calidad_estudio: evaluacion.calidadEstudio,
        calificacion_real: inicial.notaObtenida,
        puntos_olvido_reales: puntosOlvidoReales,
      },
    });
  } catch (err) {
    console.error("[comparar] Error llamando al microservicio ML:", err);
    throw createError({
      statusCode: 502,
      message: "Error en el servicio de comparación. Intenta de nuevo.",
    });
  }

  // 7. Construir JSON de retención real (para guardar en DB)
  const retencionRealJson = JSON.stringify(puntosOlvidoReales);
  const retencionPredichaJson = JSON.stringify(mlResult.curva_olvido_predicha);

  // 8. Upsert ComparacionResultado
  const comparacion = await prisma.comparacionResultado.upsert({
    where: { evaluacionId },
    create: {
      evaluacionId,
      calificacionPredicha: mlResult.calificacion_predicha,
      calificacionReal: inicial.notaObtenida,
      errorAbsoluto: mlResult.error_absoluto,
      retencionPredichaJson,
      retencionRealJson,
      recomendacionTexto: mlResult.recomendacion,
    },
    update: {
      calificacionPredicha: mlResult.calificacion_predicha,
      calificacionReal: inicial.notaObtenida,
      errorAbsoluto: mlResult.error_absoluto,
      retencionPredichaJson,
      retencionRealJson,
      recomendacionTexto: mlResult.recomendacion,
      generadaEn: new Date(),
    },
  });

  return {
    comparacion,
    curva_olvido_predicha: mlResult.curva_olvido_predicha,
    puntos_olvido_reales: puntosOlvidoReales,
    delta_retencion_promedio: mlResult.delta_retencion_promedio,
    recomendacion: mlResult.recomendacion,
  };
});
