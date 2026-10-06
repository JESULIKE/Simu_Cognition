/**
 * server/utils/session.ts
 * ───────────────────────
 * Obtiene la sesión de forma segura sin romper la petición con 500 si
 * el servicio de autenticación no responde o la URL base tiene problemas en serverless.
 */

import { getServerSession } from "#auth";
import type { H3Event } from "h3";

export async function getSafeSession(event: H3Event) {
  try {
    return await getServerSession(event);
  } catch (error) {
    console.warn("[session] getServerSession fallo suavemente:", (error as Error)?.message || error);
    return null;
  }
}
