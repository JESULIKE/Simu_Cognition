/**
 * server/api/materias/index.post.ts
 * ────────────────────────────────
 * Crea una nueva materia para el docente autenticado.
 * POST /api/materias  { nombre, tipo, dificultadDocente? }
 */

import { requireDocenteId } from "../../utils/session";
import { prisma } from "../../utils/prisma";
import { z } from "zod";

const schema = z.object({
  nombre: z.string().min(2).max(100),
  tipo: z.enum(["MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA"]),
  dificultadDocente: z.number().int().min(1).max(5).optional(),
});

export default defineEventHandler(async (event) => {
  const usuarioId = await requireDocenteId(event);

  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: "Datos inválidos", data: parsed.error.flatten() });
  }

  return prisma.materia.create({
    data: {
      nombre: parsed.data.nombre,
      tipo: parsed.data.tipo,
      dificultadDocente: parsed.data.dificultadDocente ?? 3,
      usuarioId,
      dataset: { create: { origen: "sintetico" } },
    },
    include: { dataset: true },
  });
});
