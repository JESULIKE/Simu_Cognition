// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",

  // El scaffold minimal pone app.vue/pages/layouts/etc. dentro de app/
  srcDir: "app/",
  // server/ permanece en la raíz del proyecto (fuera de srcDir)
  serverDir: "server/",

  // ── Módulos ───────────────────────────────────────────────────────────────
  modules: [
    "@sidebase/nuxt-auth",
    "@pinia/nuxt",
    "@vueuse/nuxt",
  ],

  // ── Runtime Config ────────────────────────────────────────────────────────
  runtimeConfig: {
    // Variables PRIVADAS (solo server-side) — se sobreescriben con env vars.
    // Sin secreto por defecto en producción: Auth.js falla si falta AUTH_SECRET.
    authSecret:
      process.env.AUTH_SECRET ||
      (process.env.NODE_ENV === "production" ? "" : "solo-desarrollo-local-no-usar-en-produccion"),
    mlServiceUrl: process.env.ML_SERVICE_URL || "http://127.0.0.1:8000",
    // Clave compartida BFF -> microservicio ML (opcional; ver ml-service/main.py)
    mlApiKey: process.env.ML_API_KEY || "",
    // Variables PÚBLICAS (expuestas al cliente)
    public: {
      appName: "Simu-Cognition",
    },
  },

  // ── Auth (@sidebase/nuxt-auth) ────────────────────────────────────────────
  auth: {
    // IMPORTANTE: por defecto el módulo trata la variable AUTH_ORIGIN como la URL
    // base COMPLETA (con /api/auth). Nuestro AUTH_ORIGIN es solo el origen
    // (http://localhost:3000), así que el módulo calculaba la ruta de sesión como
    // "/session" (404) y TODA sesión llegaba vacía en el servidor. Usamos una
    // variable que no existe para desactivar ese override y construimos la URL
    // completa abajo.
    originEnvKey: "SC_AUTH_BASE_URL_NO_USADA",
    // Autodetección de origen: NUXT_AUTH_ORIGIN > AUTH_ORIGIN > VERCEL_URL > localhost
    baseURL: (() => {
      const origin =
        process.env.NUXT_AUTH_ORIGIN ||
        process.env.AUTH_ORIGIN ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");
      return `${origin.replace(/\/+$/, "")}/api/auth`;
    })(),
    provider: {
      type: "authjs",
    },
    // Redirigir al login si la sesión expira
    sessionRefresh: {
      enablePeriodically: false,
      enableOnWindowFocus: true,
    },
  },

  // ── Nitro (despliegue Vercel) ─────────────────────────────────────────────
  nitro: {
    preset: "vercel",
  },

  // ── CSS global ────────────────────────────────────────────────────────────
  css: ["~/assets/css/main.css"],

  // ── App head ──────────────────────────────────────────────────────────────
  app: {
    head: {
      title: "Simu-Cognition",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Simulador de curvas de aprendizaje y olvido para docentes. Optimiza tus estrategias de repaso con modelos de Machine Learning.",
        },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700&display=swap",
        },
      ],
    },
  },

  devtools: { enabled: true },
});
