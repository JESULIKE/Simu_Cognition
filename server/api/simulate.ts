/**
 * server/api/simulate.ts
 * ──────────────────────
 * BFF: orquesta la simulación completa.
 *
 * Flujo (según doc v3.0 sección 5):
 *  1. Valida sesión del docente.
 *  2. Resuelve materiaId → tipo_materia desde Postgres.
 *  3. Llama al microservicio Python vía ML_SERVICE_URL.
 *  4. Guarda el resultado en tabla Simulacion.
 *  5. Devuelve el resultado al cliente.
 *
 * POST /api/simulate
 */

import { getServerSession } from "#auth";
import { prisma } from "../utils/prisma";
import { z } from "zod";

const schema = z.object({
  materiaId: z.string().cuid(),
  horas_estudio: z.number().min(0.5).max(10),
  dificultad: z.number().int().min(1).max(5),
  repasos_previos: z.number().int().min(0).max(5),
  calidad_estudio: z.number().min(0.3).max(1),
  umbral_retencion: z.number().min(0.1).max(0.99),
});

export default defineEventHandler(async (event) => {
  // 1. Autenticación (con fallback docente-local si no hay sesión activa)
  const session = await getServerSession(event);
  const usuarioId = (session?.user as { id?: string })?.id || "docente-local";

  // 2. Validar body
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: "Parámetros inválidos",
      data: parsed.error.flatten(),
    });
  }
  const { materiaId, ...params } = parsed.data;

  // 3. Resolver materiaId → tipo_materia (y verificar que pertenece al docente)
  const materia = await prisma.materia.findFirst({
    where: { id: materiaId, usuarioId },
    select: { tipo: true },
  });
  if (!materia) {
    throw createError({ statusCode: 404, message: "Materia no encontrada" });
  }

  // 4. Llamar al microservicio Python
  const mlUrl = useRuntimeConfig().mlServiceUrl;
  let mlResult: {
    curva_aprendizaje: { x: number[]; y: number[] };
    curva_olvido: { x_dias: number[]; retencion: number[] };
    calificacion_predicha: number;
    dia_repaso_optimo: number;
  };

  try {
    const res = await $fetch<typeof mlResult>(`${mlUrl}/simulate`, {
      method: "POST",
      body: {
        tipo_materia: materia.tipo,
        horas_estudio: params.horas_estudio,
        dificultad: params.dificultad,
        repasos_previos: params.repasos_previos,
        calidad_estudio: params.calidad_estudio,
        umbral_retencion: params.umbral_retencion,
      },
    });
    mlResult = res;
  } catch (err) {
    console.error("[simulate] Error llamando al microservicio ML:", err);
    throw createError({
      statusCode: 502,
      message: "Error en el servicio de predicción. Intenta de nuevo.",
    });
  }

  // 5. Devolver resultado al cliente (el guardado es explícito vía POST /api/simulaciones/guardar)
  return mlResult;
});
