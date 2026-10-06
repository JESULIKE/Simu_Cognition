/**
 * middleware/auth.global.ts
 * ─────────────────────────
 * Middleware GLOBAL: toda página exige sesión salvo las públicas listadas.
 *
 * No depende de `useAuth().status`: en SSR ese estado llegaba como
 * "unauthenticated" aunque la cookie fuera válida (verificado con una prueba
 * de extremo a extremo), así que consultamos /api/yo (que decodifica el JWT en el
 * servidor) reenviando la cookie. La seguridad real está en el servidor (requireDocenteId en cada
 * endpoint); esto solo evita mostrar pantallas vacías sin sesión.
 */

const RUTAS_PUBLICAS = ["/login", "/registro", "/encuesta"];

export default defineNuxtRouteMiddleware(async (to) => {
  if (RUTAS_PUBLICAS.includes(to.path)) return;

  // En el navegador, si Auth.js ya sabe que hay sesión, no hace falta preguntar.
  if (import.meta.client && useAuth().status.value === "authenticated") return;

  const headers = import.meta.server ? useRequestHeaders(["cookie"]) : undefined;
  const yo = await $fetch<{ id?: string }>("/api/yo", { headers }).catch(() => null);
  if (!yo?.id) {
    return navigateTo("/login");
  }
});
