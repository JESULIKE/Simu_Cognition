/**
 * server/api/materias/index.post.ts
 * ────────────────────────────────
 * Crea una nueva materia para el docente autenticado.
 * POST /api/materias  { nombre, tipo }
 */

import { getSafeSession } from "../../utils/session";
import { prisma } from "../../utils/prisma";
import { z } from "zod";

const schema = z.object({
  nombre: z.string().min(2).max(100),
  tipo: z.enum(["MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA"]),
});

export default defineEventHandler(async (event) => {
  const session = await getSafeSession(event);
  const usuarioId = (session?.user as { id?: string })?.id || "docente-local";

  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: "Datos inválidos", data: parsed.error.flatten() });
  }

  const materia = await prisma.materia.create({
    data: {
      nombre: parsed.data.nombre,
      tipo: parsed.data.tipo,
      usuarioId,
      // Crear el dataset sintético por defecto para este tipo de materia
      dataset: {
        create: {
          origen: "sintetico",
        },
      },
    },
    include: { dataset: true },
  });

  return materia;
});
