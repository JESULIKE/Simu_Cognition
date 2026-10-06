import { d as defineEventHandler, a as getRouterParam, c as createError, b as prisma } from '../../../_/nitro.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  var _a;
  const session = await getServerSession(event);
  const usuarioId = ((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) || "docente-local";
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "ID de simulaci\xF3n requerido" });
  }
  const simulacion = await prisma.simulacion.findFirst({
    where: { id, usuarioId },
    select: { id: true }
  });
  if (!simulacion) {
    throw createError({ statusCode: 404, message: "Simulaci\xF3n no encontrada" });
  }
  await prisma.simulacion.delete({ where: { id } });
  return { ok: true };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
