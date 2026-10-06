/**
 * middleware/auth.ts
 * ──────────────────
 * Middleware global de autenticación de Nuxt.
 * Las páginas protegidas deben declarar:
 *   definePageMeta({ middleware: "auth" })
 *
 * @sidebase/nuxt-auth provee el composable useAuth() que expone
 * el estado de sesión reactivo.
 */

export default defineNuxtRouteMiddleware(async (to) => {
  // Rutas públicas que no requieren autenticación
  const PUBLIC_ROUTES = ["/login", "/registro"];
  if (PUBLIC_ROUTES.includes(to.path)) return;

  const { status } = useAuth();
  if (status.value === "unauthenticated") {
    return navigateTo("/login");
  }
});
