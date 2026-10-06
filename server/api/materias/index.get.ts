/**
 * server/api/materias/index.get.ts
 * ─────────────────────────────────
 * Lista las materias del docente autenticado.
 * GET /api/materias
 */

import { getServerSession } from "#auth";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const session = await getServerSession(event);
  const usuarioId = (session?.user as { id?: string })?.id;

  // Si se solicitan materias públicas (para la encuesta de estudiantes) o no hay sesión de docente:
  if (query.publicas === "true" || !usuarioId) {
    const materiasPublicas = await prisma.materia.findMany({
      select: {
        id: true,
        nombre: true,
        tipo: true,
      },
      orderBy: { creadoEn: "desc" },
    });
    return materiasPublicas;
  }

  // Si hay sesión de docente, devolver las materias creadas por él
  const materias = await prisma.materia.findMany({
    where: { usuarioId },
    include: { dataset: { select: { origen: true, creadoEn: true } } },
    orderBy: { creadoEn: "desc" },
  });

  return materias;
});
