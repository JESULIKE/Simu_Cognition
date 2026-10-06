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
    // Variables PRIVADAS (solo server-side) — se sobreescriben con env vars
    authSecret: process.env.AUTH_SECRET || "cambia-este-secreto-en-produccion",
    databaseUrl: process.env.DATABASE_URL || "",
    mlServiceUrl: process.env.ML_SERVICE_URL || "http://127.0.0.1:8000",
    // Variables PÚBLICAS (expuestas al cliente)
    public: {
      appName: "Simu-Cognition",
    },
  },

  // ── Auth (@sidebase/nuxt-auth) ────────────────────────────────────────────
  auth: {
    // Origen de la app. En producción Vercel, se resuelve automáticamente.
    // En local, apuntar a la URL del dev server.
    originEnvKey: "AUTH_ORIGIN",
    baseURL: process.env.AUTH_ORIGIN
      ? `${process.env.AUTH_ORIGIN}/api/auth`
      : "http://localhost:3000/api/auth",
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
