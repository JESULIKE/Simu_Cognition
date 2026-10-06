/**
 * GET /api/yo
 * Devuelve la identidad del docente con sesión válida, o 401.
 * Lo usa el middleware global de la app para decidir si redirige a /login.
 */

import { getSafeSession } from "../utils/session";

export default defineEventHandler(async (event) => {
  const session = await getSafeSession(event);
  if (!session) {
    throw createError({ statusCode: 401, message: "Sin sesión" });
  }
  return { id: session.user.id, nombre: session.user.name ?? null, email: session.user.email ?? null };
});
