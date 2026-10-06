/**
 * server/utils/session.ts
 * ───────────────────────
 * Identidad del docente a partir de la cookie JWT de Auth.js.
 *
 * Se usa `getToken` y no `getServerSession`: con @sidebase/nuxt-auth 1.3.1,
 * `getServerSession` devuelve null aunque la cookie sea válida (verificado con
 * una prueba de extremo a extremo), lo que dejaba todas las peticiones "sin
 * sesión". `getToken` decodifica el mismo JWT y sí funciona.
 */

import { getServerSession, getToken } from "#auth";
import type { H3Event } from "h3";

export interface SesionDocente {
  user: { id: string; name?: string | null; email?: string | null };
}

export async function getSafeSession(event: H3Event): Promise<SesionDocente | null> {
  try {
    const token = await getToken({ event });
    const id = (token?.id as string | undefined) || token?.sub;
    if (id) {
      return { user: { id, name: token?.name as string | undefined, email: token?.email as string | undefined } };
    }
  } catch (error) {
    console.warn("[session] getToken falló:", (error as Error)?.message || error);
  }

  try {
    const s = await getServerSession(event);
    const id = (s?.user as { id?: string } | undefined)?.id;
    if (id) return { user: { id, name: s?.user?.name, email: s?.user?.email } };
  } catch (error) {
    console.warn("[session] getServerSession falló suavemente:", (error as Error)?.message || error);
  }
  return null;
}

/**
 * Devuelve el id del docente autenticado o responde 401.
 * Usar en todo endpoint que lea o modifique datos de un docente.
 */
export async function requireDocenteId(event: H3Event): Promise<string> {
  const session = await getSafeSession(event);
  if (!session?.user.id) {
    throw createError({ statusCode: 401, message: "Debes iniciar sesión." });
  }
  return session.user.id;
}
