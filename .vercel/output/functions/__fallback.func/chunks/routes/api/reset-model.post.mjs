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
  materiaId: z.string().min(1)
});
const resetModel_post = defineEventHandler(async (event) => {
  var _a, _b;
  const session = await getServerSession(event);
  const usuarioId = ((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) || "docente-local";
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: "materiaId inv\xE1lido" });
  }
  const { materiaId } = parsed.data;
  const materia = await prisma.materia.findFirst({
    where: { id: materiaId, usuarioId },
    select: { id: true, tipo: true }
  });
  if (!materia) {
    throw createError({ statusCode: 404, message: "Materia no encontrada" });
  }
  const mlUrl = useRuntimeConfig().mlServiceUrl;
  try {
    await $fetch(`${mlUrl}/reset-model`, {
      method: "POST",
      query: { tipo_materia: materia.tipo }
    });
  } catch (err) {
    console.error("[reset-model] Error llamando a /reset-model:", err);
    throw createError({
      statusCode: 502,
      message: ((_b = err == null ? void 0 : err.data) == null ? void 0 : _b.detail) || "Error restaurando modelo en el microservicio ML"
    });
  }
  await prisma.dataset.upsert({
    where: { materiaId },
    create: {
      materiaId,
      origen: "sintetico"
    },
    update: {
      origen: "sintetico",
      creadoEn: /* @__PURE__ */ new Date()
    }
  });
  return { ok: true, message: "Modelo restablecido con \xE9xito a la configuraci\xF3n base" };
});

export { resetModel_post as default };
//# sourceMappingURL=reset-model.post.mjs.map
