/**
 * server/api/retrain.post.ts
 * ──────────────────────────
 * BFF: Reentrenamiento del modelo de Machine Learning con datos personalizados.
 *
 * Flujo:
 *  1. Valida sesión docente.
 *  2. Resuelve materiaId y verifica titularidad.
 *  3. Envía datos al microservicio ML /retrain.
 *  4. Actualiza Dataset en la base de datos a origen = "csv_subido".
 *  5. Devuelve métricas R² y MAE al frontend.
 */

import { getSafeSession } from "../utils/session";
import { prisma } from "../utils/prisma";
import { z } from "zod";

const datoSchema = z.object({
  horas_estudio: z.number().min(0.1).max(24),
  dificultad: z.number().int().min(1).max(5),
  repasos_previos: z.number().int().min(0).max(10),
  calidad_estudio: z.number().min(0.1).max(1.0),
  calificacion: z.number().min(0).max(100),
});

const schema = z.object({
  materiaId: z.string(),
  datos: z.array(datoSchema).min(5, "Se requieren al menos 5 registros"),
});

export default defineEventHandler(async (event) => {
  const session = await getSafeSession(event);
  const usuarioId = (session?.user as { id?: string })?.id || "docente-local";

  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: "Datos de entrenamiento inválidos",
      data: parsed.error.flatten(),
    });
  }

  const { materiaId, datos } = parsed.data;

  const materia = await prisma.materia.findFirst({
    where: { id: materiaId, usuarioId },
    select: { id: true, tipo: true },
  });

  if (!materia) {
    throw createError({ statusCode: 404, message: "Materia no encontrada" });
  }

  const mlUrl = useRuntimeConfig().mlServiceUrl;
  let retrainResult: {
    status: string;
    tipo_materia: string;
    muestras: number;
    r2_score: number;
    mae: number;
  };

  try {
    retrainResult = await $fetch(`${mlUrl}/retrain`, {
      method: "POST",
      query: { tipo_materia: materia.tipo },
      body: datos,
    });
  } catch (err: any) {
    console.error("[retrain] Error llamando a /retrain en microservicio:", err);
    throw createError({
      statusCode: 502,
      message: err?.data?.detail || "Error al reentrenar modelo en el microservicio ML",
    });
  }

  // Actualizar o crear registro de dataset en Prisma
  await prisma.dataset.upsert({
    where: { materiaId },
    create: {
      materiaId,
      origen: "csv_subido",
    },
    update: {
      origen: "csv_subido",
      creadoEn: new Date(),
    },
  });

  return retrainResult;
});
