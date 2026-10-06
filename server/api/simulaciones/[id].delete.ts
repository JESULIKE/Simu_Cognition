/**
 * server/api/simulaciones/[id].delete.ts
 * ────────────────────────────────────────
 * Elimina una simulación del historial por ID.
 * Verifica que pertenezca al docente antes de borrar.
 *
 * DELETE /api/simulaciones/:id
 */

import { getServerSession } from "#auth";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const usuarioId = (session?.user as { id?: string })?.id || "docente-local";

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "ID de simulación requerido" });
  }

  // Verificar que la simulación pertenece al docente antes de eliminar
  const simulacion = await prisma.simulacion.findFirst({
    where: { id, usuarioId },
    select: { id: true },
  });

  if (!simulacion) {
    throw createError({ statusCode: 404, message: "Simulación no encontrada" });
  }

  await prisma.simulacion.delete({ where: { id } });

  return { ok: true };
});
