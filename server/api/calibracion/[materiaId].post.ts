/**
 * server/api/calibracion/[materiaId].post.ts
 * ──────────────────────────────────────────
 * POST /api/calibracion/:materiaId
 *
 * Calibra la estabilidad de memoria S del grupo con sus quizzes reales:
 *  1. Reúne, por estudiante, las retenciones reales (nota_día_n / nota_inicial,
 *     recortada a [0, 1]) de los momentos sin re-estudio reportado.
 *  2. Llama al microservicio (/calibrar): MAP con shrinkage al prior teórico,
 *     IC95 por bootstrap y validación prospectiva.
 *  3. Si hay datos suficientes, guarda la calibración y el simulador la usa.
 */

import { requireDocenteId } from "../../utils/session";
import { prisma } from "../../utils/prisma";
import { mlFetch } from "../../utils/ml";

const DIAS: Record<string, number> = { DIA_1: 1, DIA_3: 3, DIA_7: 7, DIA_14: 14 };

type MLCalibrar = {
  suficiente: boolean;
  mensaje: string;
  n_estudiantes: number;
  n_puntos: number;
  escala_s: number;
  escala_s_ic95: [number, number];
  s_base_prior: number;
  s_base_calibrada: number;
  rmse_teorica: number;
  rmse_calibrada: number;
  validacion_prospectiva: {
    dia_corte: number;
    n_puntos_prueba: number;
    mae_teorica: number;
    mae_calibrada: number;
  } | null;
  curva_dias: number[];
  curva_teorica: number[];
  curva_calibrada: number[];
};

export default defineEventHandler(async (event) => {
  const docenteId = await requireDocenteId(event);
  const materiaId = getRouterParam(event, "materiaId");
  if (!materiaId) throw createError({ statusCode: 400, message: "materiaId requerido" });

  const materia = await prisma.materia.findFirst({
    where: { id: materiaId, usuarioId: docenteId },
    select: { id: true, tipo: true },
  });
  if (!materia) throw createError({ statusCode: 404, message: "Materia no encontrada" });

  const evaluaciones = await prisma.estudianteEvaluacion.findMany({
    where: { materiaId },
    include: { resultados: true },
  });

  const observaciones = evaluaciones
    .map((e) => {
      const inicial = e.resultados.find((r) => r.momento === "INICIAL");
      if (!inicial || inicial.notaObtenida <= 0) return null;
      const puntos = e.resultados
        .filter((r) => r.momento in DIAS && !r.reestudioReportado)
        .map((r) => ({
          dia: DIAS[r.momento],
          retencion_real: Math.min(1, Math.max(0, r.notaObtenida / inicial.notaObtenida)),
        }));
      if (puntos.length === 0) return null;
      return {
        dificultad: e.dificultadDocente,
        repasos_previos: e.repasosPrevios,
        calidad_estudio: e.calidadEstudio,
        puntos,
      };
    })
    .filter((o): o is NonNullable<typeof o> => o !== null);

  let ml: MLCalibrar;
  try {
    ml = await mlFetch<MLCalibrar>("/calibrar", {
      body: { tipo_materia: materia.tipo, observaciones },
    });
  } catch (err) {
    console.error("[calibracion] Error llamando al microservicio ML:", err);
    throw createError({ statusCode: 502, message: "Error en el servicio de calibración. Intenta de nuevo." });
  }

  if (ml.suficiente) {
    await prisma.calibracionGrupo.upsert({
      where: { materiaId },
      create: {
        materiaId,
        escalaS: ml.escala_s,
        icBajo: ml.escala_s_ic95[0],
        icAlto: ml.escala_s_ic95[1],
        nEstudiantes: ml.n_estudiantes,
        nPuntos: ml.n_puntos,
        rmseTeorica: ml.rmse_teorica,
        rmseCalibrada: ml.rmse_calibrada,
        aplicada: true,
      },
      update: {
        escalaS: ml.escala_s,
        icBajo: ml.escala_s_ic95[0],
        icAlto: ml.escala_s_ic95[1],
        nEstudiantes: ml.n_estudiantes,
        nPuntos: ml.n_puntos,
        rmseTeorica: ml.rmse_teorica,
        rmseCalibrada: ml.rmse_calibrada,
        aplicada: true,
        calculadaEn: new Date(),
      },
    });
  }

  return ml;
});
