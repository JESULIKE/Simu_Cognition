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

const datoSchema = z.object({
  horas_estudio: z.number().min(0.1).max(24),
  dificultad: z.number().int().min(1).max(5),
  repasos_previos: z.number().int().min(0).max(10),
  calidad_estudio: z.number().min(0.1).max(1),
  calificacion: z.number().min(0).max(100)
});
const schema = z.object({
  materiaId: z.string(),
  datos: z.array(datoSchema).min(5, "Se requieren al menos 5 registros")
});
const retrain_post = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getServerSession(event);
  const usuarioId = ((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) || "docente-local";
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: "Datos de entrenamiento inv\xE1lidos",
      data: parsed.error.flatten()
    });
  }
  const { materiaId, datos } = parsed.data;
  const materia = await prisma.materia.findFirst({
    where: { id: materiaId, usuarioId },
    select: { id: true, tipo: true }
  });
  if (!materia) {
    throw createError({ statusCode: 404, message: "Materia no encontrada" });
  }
  const mlUrl = useRuntimeConfig().mlServiceUrl;
  let retrainResult;
  try {
    retrainResult = await $fetch(`${mlUrl}/retrain`, {
      method: "POST",
      query: { tipo_materia: materia.tipo },
      body: datos
    });
  } catch (err) {
    console.error("[retrain] Error llamando a /retrain en microservicio:", err);
    throw createError({
      statusCode: 502,
      message: ((_b = err == null ? void 0 : err.data) == null ? void 0 : _b.detail) || "Error al reentrenar modelo en el microservicio ML"
    });
  }
  await prisma.dataset.upsert({
    where: { materiaId },
    create: {
      materiaId,
      origen: "csv_subido"
    },
    update: {
      origen: "csv_subido",
      creadoEn: /* @__PURE__ */ new Date()
    }
  });
  return retrainResult;
});

export { retrain_post as default };
//# sourceMappingURL=retrain.post.mjs.map
