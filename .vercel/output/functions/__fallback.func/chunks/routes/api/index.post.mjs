import { d as defineEventHandler, r as readBody, c as createError, b as prisma } from '../../_/nitro.mjs';
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
  nombre: z.string().min(2).max(100),
  tipo: z.enum(["MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA"])
});
const index_post = defineEventHandler(async (event) => {
  var _a;
  const session = await getServerSession(event);
  const usuarioId = ((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) || "docente-local";
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: "Datos inv\xE1lidos", data: parsed.error.flatten() });
  }
  const materia = await prisma.materia.create({
    data: {
      nombre: parsed.data.nombre,
      tipo: parsed.data.tipo,
      usuarioId,
      // Crear el dataset sintético por defecto para este tipo de materia
      dataset: {
        create: {
          origen: "sintetico"
        }
      }
    },
    include: { dataset: true }
  });
  return materia;
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
