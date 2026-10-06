/**
 * server/api/evaluaciones/[id]/resultado.post.ts
 * ──────────────────────────────────────────────
 * POST /api/evaluaciones/:id/resultado
 *
 * Registra un ResultadoQuiz para un momento específico.
 * Si ya existe un resultado para ese momento en esta evaluación, lo reemplaza.
 *
 * Body (JSON):
 *   momento             "INICIAL" | "DIA_1" | "DIA_3" | "DIA_7" | "DIA_14"
 *   notaObtenida        number 0-100
 *   reestudioReportado  boolean  (¿el estudiante repasó antes de este re-test?)
 */

import { getSafeSession } from "../../../utils/session";
import { prisma } from "../../../utils/prisma";
import { z } from "zod";

const MOMENTOS_VALIDOS = ["INICIAL", "DIA_1", "DIA_3", "DIA_7", "DIA_14"] as const;

const schema = z.object({
  momento: z.enum(MOMENTOS_VALIDOS),
  notaObtenida: z.number().min(0).max(100),
  reestudioReportado: z.boolean().default(false),
});

export default defineEventHandler(async (event) => {
  // 1. Auth
  const session = await getSafeSession(event);
  const docenteId = (session?.user as { id?: string })?.id || "docente-local";

  // 2. Param
  const evaluacionId = getRouterParam(event, "id");
  if (!evaluacionId) {
    throw createError({ statusCode: 400, message: "ID de evaluación requerido" });
  }

  // 3. Verificar que la evaluación pertenece al docente
  const evaluacion = await prisma.estudianteEvaluacion.findFirst({
    where: { id: evaluacionId, docenteId },
    select: { id: true },
  });
  if (!evaluacion) {
    throw createError({ statusCode: 404, message: "Evaluación no encontrada" });
  }

  // 4. Validar body
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: "Parámetros inválidos",
      data: parsed.error.flatten(),
    });
  }
  const data = parsed.data;

  // 5. Upsert: si ya existe ese momento para esta evaluación, actualiza
  const existente = await prisma.resultadoQuiz.findFirst({
    where: { evaluacionId, momento: data.momento },
    select: { id: true },
  });

  if (existente) {
    const actualizado = await prisma.resultadoQuiz.update({
      where: { id: existente.id },
      data: {
        notaObtenida: data.notaObtenida,
        reestudioReportado: data.reestudioReportado,
        fechaAplicacion: new Date(),
      },
    });
    return actualizado;
  }

  const resultado = await prisma.resultadoQuiz.create({
    data: {
      evaluacionId,
      momento: data.momento,
      notaObtenida: data.notaObtenida,
      reestudioReportado: data.reestudioReportado,
    },
  });

  return resultado;
});
