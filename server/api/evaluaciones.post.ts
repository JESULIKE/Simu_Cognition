/**
 * server/api/evaluaciones.post.ts
 * ────────────────────────────────
 * POST /api/evaluaciones
 *
 * Crea una EstudianteEvaluacion (ficha docente + cuestionario estudiante).
 * Genera codigoAnonimo automáticamente como EST-XXX si no se provee.
 *
 * Body (JSON):
 *   materiaId            string (cuid)
 *   dificultadDocente    number 1-5
 *   tipoMateriaDocente   "MEMORISTICA" | "LOGICO_MATEMATICA" | "MIXTA"
 *   horasEstudio         number 0.5-10
 *   repasosPrevios       number 0-5
 *   calidadEstudio       number 0-1   (derivado del cuestionario Likert en el cliente)
 *   dificultadPercibida  number 1-5
 *   codigoAnonimo?       string       (opcional, si el docente quiere asignarlo)
 */

import { getServerSession } from "#auth";
import { prisma } from "../utils/prisma";
import { z } from "zod";

const TIPOS_VALIDOS = ["MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA"] as const;

const schema = z.object({
  materiaId: z.string().min(1),
  dificultadDocente: z.number().int().min(1).max(5),
  tipoMateriaDocente: z.enum(TIPOS_VALIDOS),
  horasEstudio: z.number().min(0.5).max(10),
  repasosPrevios: z.number().int().min(0).max(5),
  calidadEstudio: z.number().min(0).max(1),
  dificultadPercibida: z.number().int().min(1).max(5),
  codigoAnonimo: z.string().min(1).optional(),
});

export default defineEventHandler(async (event) => {
  // 1. Auth & Materia check
  const session = await getServerSession(event);
  const sessionDocenteId = (session?.user as { id?: string })?.id;

  // 2. Validar body
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

  // 3. Buscar la materia para validar existencia y obtener el docenteId propietario
  const materia = await prisma.materia.findUnique({
    where: { id: data.materiaId },
    select: { id: true, usuarioId: true },
  });
  if (!materia) {
    throw createError({ statusCode: 404, message: "Materia no encontrada" });
  }

  // Si hay sesión de docente, usamos su ID; si es una encuesta pública respondida por un alumno, asociamos al docente de la materia
  const docenteId = sessionDocenteId || materia.usuarioId;

  if (docenteId === "docente-local") {
    await prisma.usuario.upsert({
      where: { id: "docente-local" },
      update: {},
      create: {
        id: "docente-local",
        email: "docente@simucognition.local",
        nombre: "Docente Simu-Cognition",
      },
    }).catch(() => {});
  }

  // 4. Generar codigoAnonimo si no se provee
  let codigoAnonimo = data.codigoAnonimo;
  if (!codigoAnonimo) {
    // Contar cuántas evaluaciones ya existen para esta materia
    const count = await prisma.estudianteEvaluacion.count({
      where: { materiaId: data.materiaId },
    });
    codigoAnonimo = `EST-${String(count + 1).padStart(3, "0")}`;
  }

  // 5. Crear
  const evaluacion = await prisma.estudianteEvaluacion.create({
    data: {
      codigoAnonimo,
      materiaId: data.materiaId,
      docenteId,
      dificultadDocente: data.dificultadDocente,
      tipoMateriaDocente: data.tipoMateriaDocente,
      horasEstudio: data.horasEstudio,
      repasosPrevios: data.repasosPrevios,
      calidadEstudio: data.calidadEstudio,
      dificultadPercibida: data.dificultadPercibida,
    },
  });

  return evaluacion;
});
