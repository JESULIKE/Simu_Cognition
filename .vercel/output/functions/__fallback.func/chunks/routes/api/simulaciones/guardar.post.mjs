import { d as defineEventHandler, r as readBody, c as createError, b as prisma } from '../../../_/nitro.mjs';
import { z } from 'zod';
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

const schema = z.object({
  materiaId: z.string().min(1),
  horas_estudio: z.number().min(0.5).max(10),
  dificultad: z.number().int().min(1).max(5),
  repasos_previos: z.number().int().min(0).max(5),
  calidad_estudio: z.number().min(0.3).max(1),
  umbral_retencion: z.number().min(0.1).max(0.99),
  calificacion_predicha: z.number().min(0).max(100),
  dia_repaso_optimo: z.number().min(0).max(60),
  etiqueta: z.string().max(100).optional().nullable()
});
const guardar_post = defineEventHandler(async (event) => {
  var _a;
  const session = await getServerSession(event);
  const usuarioId = ((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) || "docente-local";
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: "Par\xE1metros de simulaci\xF3n inv\xE1lidos",
      data: parsed.error.flatten()
    });
  }
  const d = parsed.data;
  const materia = await prisma.materia.findFirst({
    where: { id: d.materiaId, usuarioId },
    select: { id: true }
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
      etiqueta: d.etiqueta || null
    }
  });
  return { ok: true, id: simulacion.id };
});

export { guardar_post as default };
//# sourceMappingURL=guardar.post.mjs.map
