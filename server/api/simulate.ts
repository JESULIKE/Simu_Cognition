/**
 * server/api/simulate.ts
 * ──────────────────────
 * BFF: orquesta la simulación.
 *
 * Flujo:
 *  1. Exige sesión del docente.
 *  2. Verifica que la materia es SUYA y obtiene su tipo.
 *  3. Si la materia tiene una calibración aplicada, usa su escala de S
 *     (la curva de olvido pasa a ser la del grupo, no la teórica).
 *  4. Llama al microservicio Python; si no responde, usa el espejo en TS del
 *     mismo modelo teórico (server/utils/teoria.ts) y lo indica en la respuesta.
 *
 * POST /api/simulate
 */

import { requireDocenteId } from "../utils/session";
import { prisma } from "../utils/prisma";
import { mlFetch } from "../utils/ml";
import { simularLocal, type TipoMateria } from "../utils/teoria";
import { z } from "zod";

const schema = z.object({
  materiaId: z.string().min(1),
  horas_estudio: z.number().min(0.5).max(10),
  dificultad: z.number().int().min(1).max(5),
  repasos_previos: z.number().int().min(0).max(5),
  calidad_estudio: z.number().min(0.3).max(1),
  umbral_retencion: z.number().min(0.1).max(0.99),
  // false: ignora la calibración y muestra la curva teórica por defecto
  usar_calibracion: z.boolean().default(true),
});

type MLSimulate = {
  curva_aprendizaje: { x: number[]; y: number[] };
  curva_olvido: { x_dias: number[]; retencion: number[] };
  calificacion_predicha: number;
  dia_repaso_optimo: number;
  estabilidad_dias: number;
  escala_s: number;
};

export default defineEventHandler(async (event) => {
  const usuarioId = await requireDocenteId(event);

  const parsed = schema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: "Parámetros inválidos", data: parsed.error.flatten() });
  }
  const { materiaId, usar_calibracion, ...params } = parsed.data;

  const materia = await prisma.materia.findFirst({
    where: { id: materiaId, usuarioId },
    select: { tipo: true, calibracion: true, dataset: { select: { origen: true } } },
  });
  if (!materia) {
    throw createError({ statusCode: 404, message: "Materia no encontrada" });
  }

  const calibracion = usar_calibracion && materia.calibracion?.aplicada ? materia.calibracion : null;
  const escala_s = calibracion?.escalaS ?? 1;
  const tipo = materia.tipo as TipoMateria;

  let resultado: MLSimulate;
  let origen: "ml" | "respaldo_ts" = "ml";
  try {
    resultado = await mlFetch<MLSimulate>("/simulate", {
      body: {
        tipo_materia: tipo,
        ...params,
        escala_s,
        // Modelo sustituto reentrenado por el docente para ESTA materia (si existe)
        materia_id: materia.dataset?.origen === "csv_subido" ? materiaId : undefined,
      },
      timeout: 4000,
    });
  } catch (err) {
    console.warn("[simulate] Microservicio ML no disponible; usando respaldo TS:", (err as Error)?.message);
    resultado = simularLocal({ tipo, ...params, escala_s });
    origen = "respaldo_ts";
  }

  return {
    ...resultado,
    origen,
    calibrado: calibracion !== null,
    calibracion: calibracion
      ? {
          escala_s: calibracion.escalaS,
          ic95: [calibracion.icBajo, calibracion.icAlto],
          n_estudiantes: calibracion.nEstudiantes,
        }
      : null,
  };
});
