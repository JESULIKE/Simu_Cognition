/**
 * server/api/evaluaciones.post.ts
 * ────────────────────────────────
 * POST /api/evaluaciones
 *
 * Crea una EstudianteEvaluacion (ficha docente + cuestionario estudiante).
 *
 * Lo usan dos tipos de cliente:
 *  - El docente autenticado (pestaña "Registrar Estudiante").
 *  - El estudiante, sin sesión, desde la encuesta pública (/encuesta?materia=ID).
 *
 * Reglas de integridad:
 *  - El tipo de materia SIEMPRE se toma de la materia (no del body).
 *  - La dificultad docente la fija el docente; un estudiante anónimo hereda la
 *    de la materia y no puede alterarla.
 *  - codigoAnonimo es único por materia; si no se envía se autogenera EST-001...
 *
 * Body (JSON):
 *   materiaId            string
 *   dificultadDocente?   number 1-5 (solo se respeta con sesión del docente dueño)
 *   horasEstudio         number 0.5-10
 *   repasosPrevios       number 0-5
 *   calidadEstudio       number 0-1   (derivado del cuestionario Likert en el cliente)
 *   dificultadPercibida  number 1-5
 *   codigoAnonimo?       string       (opcional)
 */

import { getSafeSession } from "../utils/session";
import { prisma } from "../utils/prisma";
import { z } from "zod";

const schema = z.object({
  materiaId: z.string().min(1),
  dificultadDocente: z.number().int().min(1).max(5).optional(),
  horasEstudio: z.number().min(0.5).max(10),
  repasosPrevios: z.number().int().min(0).max(5),
  calidadEstudio: z.number().min(0).max(1),
  dificultadPercibida: z.number().int().min(1).max(5),
  codigoAnonimo: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{1,20}$/, "Código inválido: usa letras, números, guion (máx. 20)")
    .optional(),
});

const MAX_REINTENTOS = 5;

function esConflictoUnico(err: unknown): boolean {
  return (err as { code?: string })?.code === "P2002";
}

export default defineEventHandler(async (event) => {
  const session = await getSafeSession(event);
  const sessionDocenteId = (session?.user as { id?: string } | undefined)?.id;

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

  const materia = await prisma.materia.findUnique({
    where: { id: data.materiaId },
    select: { id: true, usuarioId: true, tipo: true, dificultadDocente: true },
  });
  if (!materia) {
    throw createError({ statusCode: 404, message: "Materia no encontrada" });
  }

  // Un docente con sesión solo puede registrar en SUS materias.
  const esDocenteDueno = sessionDocenteId === materia.usuarioId;
  if (sessionDocenteId && !esDocenteDueno) {
    throw createError({ statusCode: 403, message: "Esta materia pertenece a otro docente." });
  }

  const dificultadDocente =
    esDocenteDueno && data.dificultadDocente ? data.dificultadDocente : materia.dificultadDocente;

  const base = {
    materiaId: materia.id,
    docenteId: materia.usuarioId,
    dificultadDocente,
    tipoMateriaDocente: materia.tipo,
    horasEstudio: data.horasEstudio,
    repasosPrevios: data.repasosPrevios,
    calidadEstudio: data.calidadEstudio,
    dificultadPercibida: data.dificultadPercibida,
  };

  // Código explícito: un único intento; si choca, el cliente debe cambiarlo.
  if (data.codigoAnonimo) {
    try {
      return await prisma.estudianteEvaluacion.create({
        data: { ...base, codigoAnonimo: data.codigoAnonimo },
      });
    } catch (err) {
      if (esConflictoUnico(err)) {
        throw createError({
          statusCode: 409,
          message: `El código "${data.codigoAnonimo}" ya existe en esta materia.`,
        });
      }
      throw err;
    }
  }

  // Autogenerado: siguiente número libre (robusto ante borrados y concurrencia).
  for (let intento = 0; intento < MAX_REINTENTOS; intento++) {
    const existentes = await prisma.estudianteEvaluacion.findMany({
      where: { materiaId: materia.id, codigoAnonimo: { startsWith: "EST-" } },
      select: { codigoAnonimo: true },
    });
    const maxNum = existentes.reduce((max, e) => {
      const n = Number(e.codigoAnonimo.slice(4));
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    const codigoAnonimo = `EST-${String(maxNum + 1 + intento).padStart(3, "0")}`;
    try {
      return await prisma.estudianteEvaluacion.create({ data: { ...base, codigoAnonimo } });
    } catch (err) {
      if (!esConflictoUnico(err)) throw err;
    }
  }
  throw createError({ statusCode: 503, message: "No se pudo asignar un código. Intenta de nuevo." });
});
