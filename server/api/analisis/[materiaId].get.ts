/**
 * server/api/analisis/[materiaId].get.ts
 * ───────────────────────────────────────
 * GET /api/analisis/:materiaId
 *
 * Consulta todas las ComparacionResultado de una materia,
 * llama a POST /analisis/agregado del microservicio Python,
 * y devuelve las métricas estadísticas (MAE, RMSE, Pearson, Spearman,
 * confirmación direccional) junto con la lista de evaluaciones individuales.
 */

import { getSafeSession } from "../../utils/session";
import { prisma } from "../../utils/prisma";

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
    select: { id: true, nombre: true, tipo: true },
  });
  if (!materia) {
    throw createError({ statusCode: 404, message: "Materia no encontrada" });
  }

  // 4. Cargar evaluaciones con su comparación y resultados
  const evaluaciones = await prisma.estudianteEvaluacion.findMany({
    where: { materiaId },
    include: { comparacion: true, resultados: true },
    orderBy: { creadaEn: "asc" },
  });

  // 5. Filtrar las que ya tienen comparación calculada
  const conComparacion = evaluaciones.filter((e) => e.comparacion !== null);

  if (conComparacion.length < 2) {
    return {
      materia,
      evaluaciones,
      metricas: null,
      mensaje: "Se necesitan al menos 2 evaluaciones con comparación calculada para obtener métricas agregadas.",
    };
  }

  // 6. Construir rows para el microservicio Python
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

  // 7. Llamar al microservicio Python
  const mlUrl = useRuntimeConfig().mlServiceUrl;
  type MLMetricasResponse = {
    n: number;
    mae: number;
    rmse: number;
    pearson_r: number;
    pearson_p: number;
    spearman_r: number;
    spearman_p: number;
    confirmacion_direccional: {
      variable: string;
      pendiente: number;
      r2: number;
      p_valor: number;
      direccion_confirmada: boolean;
    }[];
  };

  let metricas: MLMetricasResponse;
  try {
    metricas = await $fetch<MLMetricasResponse>(`${mlUrl}/analisis/agregado`, {
      method: "POST",
      body: { rows },
    });
  } catch (err) {
    console.error("[analisis] Error llamando al microservicio ML:", err);
    throw createError({
      statusCode: 502,
      message: "Error en el servicio de análisis. Intenta de nuevo.",
    });
  }

  return {
    materia,
    evaluaciones,
    metricas,
  };
});
