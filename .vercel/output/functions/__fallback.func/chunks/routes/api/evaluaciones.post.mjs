import { d as defineEventHandler, r as readBody, c as createError, b as prisma } from '../../_/nitro.mjs';
import { z } from 'zod';
import { g as getServerSession } from '../../_/nuxtAuthHandler.mjs';
import '@prisma/client';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'next-auth/core';

const TIPOS_VALIDOS = ["MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA"];
const schema = z.object({
  materiaId: z.string().min(1),
  dificultadDocente: z.number().int().min(1).max(5),
  tipoMateriaDocente: z.enum(TIPOS_VALIDOS),
  horasEstudio: z.number().min(0.5).max(10),
  repasosPrevios: z.number().int().min(0).max(5),
  calidadEstudio: z.number().min(0).max(1),
  dificultadPercibida: z.number().int().min(1).max(5),
  codigoAnonimo: z.string().min(1).optional()
});
const evaluaciones_post = defineEventHandler(async (event) => {
  var _a;
  const session = await getServerSession(event);
  const sessionDocenteId = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id;
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: "Par\xE1metros inv\xE1lidos",
      data: parsed.error.flatten()
    });
  }
  const data = parsed.data;
  const materia = await prisma.materia.findUnique({
    where: { id: data.materiaId },
    select: { id: true, usuarioId: true }
  });
  if (!materia) {
    throw createError({ statusCode: 404, message: "Materia no encontrada" });
  }
  const docenteId = sessionDocenteId || materia.usuarioId;
  if (docenteId === "docente-local") {
    await prisma.usuario.upsert({
      where: { id: "docente-local" },
      update: {},
      create: {
        id: "docente-local",
        email: "docente@simucognition.local",
        nombre: "Docente Simu-Cognition"
      }
    }).catch(() => {
    });
  }
  let codigoAnonimo = data.codigoAnonimo;
  if (!codigoAnonimo) {
    const count = await prisma.estudianteEvaluacion.count({
      where: { materiaId: data.materiaId }
    });
    codigoAnonimo = `EST-${String(count + 1).padStart(3, "0")}`;
  }
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
      dificultadPercibida: data.dificultadPercibida
    }
  });
  return evaluacion;
});

export { evaluaciones_post as default };
//# sourceMappingURL=evaluaciones.post.mjs.map
