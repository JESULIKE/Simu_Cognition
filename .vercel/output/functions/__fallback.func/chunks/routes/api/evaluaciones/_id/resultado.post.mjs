import { d as defineEventHandler, a as getRouterParam, c as createError, b as prisma, r as readBody } from '../../../../_/nitro.mjs';
import { z } from 'zod';
import { g as getServerSession } from '../../../../_/nuxtAuthHandler.mjs';
import '@prisma/client';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'next-auth/core';

const MOMENTOS_VALIDOS = ["INICIAL", "DIA_1", "DIA_3", "DIA_7", "DIA_14"];
const schema = z.object({
  momento: z.enum(MOMENTOS_VALIDOS),
  notaObtenida: z.number().min(0).max(100),
  reestudioReportado: z.boolean().default(false)
});
const resultado_post = defineEventHandler(async (event) => {
  var _a;
  const session = await getServerSession(event);
  const docenteId = ((_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) || "docente-local";
  const evaluacionId = getRouterParam(event, "id");
  if (!evaluacionId) {
    throw createError({ statusCode: 400, message: "ID de evaluaci\xF3n requerido" });
  }
  const evaluacion = await prisma.estudianteEvaluacion.findFirst({
    where: { id: evaluacionId, docenteId },
    select: { id: true }
  });
  if (!evaluacion) {
    throw createError({ statusCode: 404, message: "Evaluaci\xF3n no encontrada" });
  }
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
  const existente = await prisma.resultadoQuiz.findFirst({
    where: { evaluacionId, momento: data.momento },
    select: { id: true }
  });
  if (existente) {
    const actualizado = await prisma.resultadoQuiz.update({
      where: { id: existente.id },
      data: {
        notaObtenida: data.notaObtenida,
        reestudioReportado: data.reestudioReportado,
        fechaAplicacion: /* @__PURE__ */ new Date()
      }
    });
    return actualizado;
  }
  const resultado = await prisma.resultadoQuiz.create({
    data: {
      evaluacionId,
      momento: data.momento,
      notaObtenida: data.notaObtenida,
      reestudioReportado: data.reestudioReportado
    }
  });
  return resultado;
});

export { resultado_post as default };
//# sourceMappingURL=resultado.post.mjs.map
