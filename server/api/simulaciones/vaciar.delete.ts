/**
 * server/api/simulaciones/vaciar.delete.ts
 * ───────────────────────────────────────
 * Borra todas las simulaciones del historial del docente autenticado.
 *
 * DELETE /api/simulaciones/vaciar
 */

import { getServerSession } from "#auth";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const usuarioId = (session?.user as { id?: string })?.id || "docente-local";

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
