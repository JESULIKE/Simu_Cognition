import { d as defineEventHandler, r as readBody, c as createError, b as prisma, e as useRuntimeConfig } from '../../_/nitro.mjs';
import { z } from 'zod';
import { g as getServerSession } from '../../_/nuxtAuthHandler.mjs';
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
  materiaId: z.string().cuid(),
  horas_estudio: z.number().min(0.5).max(10),
  dificultad: z.number().int().min(1).max(5),
  repasos_previos: z.number().int().min(0).max(5),
  calidad_estudio: z.number().min(0.3).max(1),
  umbral_retencion: z.number().min(0.1).max(0.99)
});
const simulate = defineEventHandler(async (event) => {
  var _a;
  const session = await getServerSession(event);
  const usuarioId = ((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) || "docente-local";
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: "Par\xE1metros inv\xE1lidos",
      data: parsed.error.flatten()
    });
  }
  const { materiaId, ...params } = parsed.data;
  const materia = await prisma.materia.findFirst({
    where: { id: materiaId, usuarioId },
    select: { tipo: true }
  });
  if (!materia) {
    throw createError({ statusCode: 404, message: "Materia no encontrada" });
  }
  const mlUrl = useRuntimeConfig().mlServiceUrl;
  let mlResult;
  try {
    const res = await $fetch(`${mlUrl}/simulate`, {
      method: "POST",
      body: {
        tipo_materia: materia.tipo,
        horas_estudio: params.horas_estudio,
        dificultad: params.dificultad,
        repasos_previos: params.repasos_previos,
        calidad_estudio: params.calidad_estudio,
        umbral_retencion: params.umbral_retencion
      }
    });
    mlResult = res;
  } catch (err) {
    console.error("[simulate] Error llamando al microservicio ML:", err);
    throw createError({
      statusCode: 502,
      message: "Error en el servicio de predicci\xF3n. Intenta de nuevo."
    });
  }
  return mlResult;
});

export { simulate as default };
//# sourceMappingURL=simulate.mjs.map
