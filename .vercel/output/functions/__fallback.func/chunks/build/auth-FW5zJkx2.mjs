import { g as defineNuxtRouteMiddleware, u as useAuth, n as navigateTo } from './server.mjs';
import 'vue';
import '../_/nitro.mjs';
import '@prisma/client';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'pinia';
import 'vue-router';
import 'requrl';
import 'vue/server-renderer';

const auth = defineNuxtRouteMiddleware(async (to) => {
  const PUBLIC_ROUTES = ["/login", "/registro"];
  if (PUBLIC_ROUTES.includes(to.path)) return;
  const { status } = useAuth();
  if (status.value === "unauthenticated") {
    return navigateTo("/login");
  }
});

export { auth as default };
//# sourceMappingURL=auth-FW5zJkx2.mjs.map
