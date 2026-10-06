/**
 * server/api/reset-model.post.ts
 * ──────────────────────────────
 * Restaura el modelo matemático al modelo base sintético.
 *
 * POST /api/reset-model
 */

import { requireDocenteId } from "../utils/session";
import { prisma } from "../utils/prisma";
import { mlFetch } from "../utils/ml";
import { z } from "zod";

const schema = z.object({
  materiaId: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const usuarioId = await requireDocenteId(event);

  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: "materiaId inválido" });
  }

  const { materiaId } = parsed.data;

  const materia = await prisma.materia.findFirst({
    where: { id: materiaId, usuarioId },
    select: { id: true, tipo: true },
  });

  if (!materia) {
    throw createError({ statusCode: 404, message: "Materia no encontrada" });
  }

  try {
    await mlFetch("/reset-model", { query: { tipo_materia: materia.tipo, materia_id: materiaId } });
  } catch (err: any) {
    console.error("[reset-model] Error llamando a /reset-model:", err);
    throw createError({
      statusCode: 502,
      message: err?.data?.detail || "Error restaurando modelo en el microservicio ML",
    });
  }

  // Actualizar dataset en base de datos
  await prisma.dataset.upsert({
    where: { materiaId },
    create: {
      materiaId,
      origen: "sintetico",
    },
    update: {
      origen: "sintetico",
      creadoEn: new Date(),
    },
  });

  return { ok: true, message: "Modelo restablecido con éxito a la configuración base" };
});
