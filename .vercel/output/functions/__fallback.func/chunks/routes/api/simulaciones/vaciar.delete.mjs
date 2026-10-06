import { d as defineEventHandler, f as getQuery, b as prisma } from '../../../_/nitro.mjs';
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

const vaciar_delete = defineEventHandler(async (event) => {
  var _a;
  const session = await getServerSession(event);
  const usuarioId = ((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) || "docente-local";
  const query = getQuery(event);
  const materiaId = query.materiaId;
  await prisma.simulacion.deleteMany({
    where: {
      usuarioId,
      ...materiaId ? { materiaId } : {}
    }
  });
  return { ok: true };
});

export { vaciar_delete as default };
//# sourceMappingURL=vaciar.delete.mjs.map
