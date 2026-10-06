import { d as defineEventHandler, f as getQuery, b as prisma } from '../../_/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  var _a;
  const query = getQuery(event);
  const session = await getServerSession(event);
  const usuarioId = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id;
  if (query.publicas === "true" || !usuarioId) {
    const materiasPublicas = await prisma.materia.findMany({
      select: {
        id: true,
        nombre: true,
        tipo: true
      },
      orderBy: { creadoEn: "desc" }
    });
    return materiasPublicas;
  }
  const materias = await prisma.materia.findMany({
    where: { usuarioId },
    include: { dataset: { select: { origen: true, creadoEn: true } } },
    orderBy: { creadoEn: "desc" }
  });
  return materias;
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
