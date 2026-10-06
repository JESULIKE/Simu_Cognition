/**
 * server/api/simulaciones/guardar.post.ts
 * ────────────────────────────────────────
 * Guarda explícitamente una simulación en el historial.
 * Se llama solo cuando el docente pulsa "Guardar en Historial" desde el simulador.
 *
 * POST /api/simulaciones/guardar
 */

import { requireDocenteId } from "../../utils/session";
import { prisma } from "../../utils/prisma";
import { z } from "zod";

const schema = z.object({
  materiaId: z.string().min(1),
  horas_estudio: z.number().min(0.5).max(10),
  dificultad: z.number().int().min(1).max(5),
  repasos_previos: z.number().int().min(0).max(5),
  calidad_estudio: z.number().min(0.3).max(1),
  umbral_retencion: z.number().min(0.1).max(0.99),
  calificacion_predicha: z.number().min(0).max(100),
  dia_repaso_optimo: z.number().min(0).max(60),
  etiqueta: z.string().max(100).optional().nullable(),
});

export default defineEventHandler(async (event) => {
  const usuarioId = await requireDocenteId(event);

  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: "Parámetros de simulación inválidos",
      data: parsed.error.flatten(),
    });
  }

  const d = parsed.data;

  // Verificar que la materia pertenece al docente
  const materia = await prisma.materia.findFirst({
    where: { id: d.materiaId, usuarioId },
    select: { id: true },
  });
  if (!materia) {
    throw createError({ statusCode: 404, message: "Materia no encontrada" });
  }

  const simulacion = await prisma.simulacion.create({
    data: {
      usuarioId,
      materiaId: d.materiaId,
      dificultad: d.dificultad,
      horasEstudio: d.horas_estudio,
      repasosPrevios: d.repasos_previos,
      calidadEstudio: d.calidad_estudio,
      umbralRetencion: d.umbral_retencion,
      calificacionPredicha: d.calificacion_predicha,
      diaRepasoOptimo: d.dia_repaso_optimo,
      etiqueta: d.etiqueta || null,
    },
  });

  return { ok: true, id: simulacion.id };
});
