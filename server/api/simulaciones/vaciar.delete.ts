/**
 * server/api/simulaciones/vaciar.delete.ts
 * ───────────────────────────────────────
 * Borra todas las simulaciones del historial del docente autenticado.
 *
 * DELETE /api/simulaciones/vaciar
 */

import { requireDocenteId } from "../../utils/session";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const usuarioId = await requireDocenteId(event);

  const query = getQuery(event);
  const materiaId = query.materiaId as string | undefined;

  await prisma.simulacion.deleteMany({
    where: {
      usuarioId,
      ...(materiaId ? { materiaId } : {}),
    },
  });

  return { ok: true };
});
