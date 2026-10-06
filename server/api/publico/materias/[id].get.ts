/**
 * server/api/publico/materias/[id].get.ts
 * ───────────────────────────────────────
 * GET /api/publico/materias/:id
 *
 * Endpoint público (sin sesión) que usa la encuesta de estudiantes.
 * Solo expone nombre y tipo de UNA materia, identificada por su id (cuid, no
 * adivinable) que el docente comparte mediante enlace o código QR.
 */

import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "Materia requerida" });
  }
  const materia = await prisma.materia.findUnique({
    where: { id },
    select: { id: true, nombre: true, tipo: true },
  });
  if (!materia) {
    throw createError({ statusCode: 404, message: "Enlace de encuesta no válido" });
  }
  return materia;
});
