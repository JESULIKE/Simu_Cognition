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

const simulaciones_get = defineEventHandler(async (event) => {
  var _a;
  const session = await getServerSession(event);
  const usuarioId = ((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) || "docente-local";
  const query = getQuery(event);
  const materiaId = query.materiaId;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const offset = Number(query.offset) || 0;
  const [simulaciones, total] = await prisma.$transaction([
    prisma.simulacion.findMany({
      where: {
        usuarioId,
        ...materiaId ? { materiaId } : {}
      },
      include: {
        materia: { select: { id: true, nombre: true, tipo: true } }
      },
      orderBy: { creadoEn: "desc" },
      take: limit,
      skip: offset
    }),
    prisma.simulacion.count({
      where: {
        usuarioId,
        ...materiaId ? { materiaId } : {}
      }
    })
  ]);
  return { simulaciones, total, limit, offset };
});

export { simulaciones_get as default };
//# sourceMappingURL=simulaciones.get.mjs.map
