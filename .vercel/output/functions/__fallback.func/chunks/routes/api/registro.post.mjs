import { d as defineEventHandler, r as readBody, c as createError, b as prisma } from '../../_/nitro.mjs';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import '@prisma/client';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const schema = z.object({
  nombre: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8)
});
const registro_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: "Datos de registro inv\xE1lidos",
      data: parsed.error.flatten()
    });
  }
  const { nombre, email, password } = parsed.data;
  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) {
    throw createError({ statusCode: 409, message: "El email ya est\xE1 registrado" });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const usuario = await prisma.usuario.create({
    data: { nombre, email, passwordHash },
    select: { id: true, email: true, nombre: true, creadoEn: true }
  });
  return usuario;
});

export { registro_post as default };
//# sourceMappingURL=registro.post.mjs.map
