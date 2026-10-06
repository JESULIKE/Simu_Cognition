/**
 * server/api/registro.post.ts
 * ───────────────────────────
 * Endpoint público para registrar un nuevo docente.
 * POST /api/registro  { nombre, email, password }
 */

import { prisma } from "../utils/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  nombre: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: "Datos de registro inválidos",
      data: parsed.error.flatten(),
    });
  }

  const { nombre, email, password } = parsed.data;

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) {
    throw createError({ statusCode: 409, message: "El email ya está registrado" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const usuario = await prisma.usuario.create({
    data: { nombre, email, passwordHash },
    select: { id: true, email: true, nombre: true, creadoEn: true },
  });

  return usuario;
});
