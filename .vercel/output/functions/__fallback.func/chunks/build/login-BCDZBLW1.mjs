import { _ as __nuxt_component_0 } from './nuxt-link-CfnB6_ol.mjs';
import { defineComponent, reactive, ref, mergeProps, unref, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc, u as useAuth, a as useRouter } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const { signIn } = useAuth();
    useRouter();
    const form = reactive({ email: "", password: "" });
    const loading = ref(false);
    const errorMsg = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "login-page animate-fade-in" }, _attrs))} data-v-9280662c><div class="login-card card" data-v-9280662c><div class="login-header" data-v-9280662c><div class="brand-mark" data-v-9280662c><span class="brand-mark-text" data-v-9280662c>SC</span></div><h1 data-v-9280662c>Simu-Cognition</h1><p data-v-9280662c>Simulador de curvas de aprendizaje para docentes</p></div><form id="login-form" class="login-form" data-v-9280662c><div class="form-group" data-v-9280662c><label class="label" for="email" data-v-9280662c>Email</label><input id="email"${ssrRenderAttr("value", unref(form).email)} type="email" class="input" placeholder="tu@email.com" autocomplete="email" required data-v-9280662c></div><div class="form-group" data-v-9280662c><label class="label" for="password" data-v-9280662c>Contrase\xF1a</label><input id="password"${ssrRenderAttr("value", unref(form).password)} type="password" class="input" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" autocomplete="current-password" required data-v-9280662c></div>`);
      if (unref(errorMsg)) {
        _push(`<div class="error-msg" data-v-9280662c>${ssrInterpolate(unref(errorMsg))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button id="login-submit" type="submit" class="btn btn-primary login-btn"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} data-v-9280662c>`);
      if (unref(loading)) {
        _push(`<span class="spinner" data-v-9280662c></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<span data-v-9280662c>${ssrInterpolate(unref(loading) ? "Ingresando..." : "Iniciar Sesi\xF3n")}</span></button><div class="divider" data-v-9280662c><span data-v-9280662c>o</span></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/dashboard",
        class: "btn btn-ghost direct-btn"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span data-v-9280662c${_scopeId}>\u{1F680} Entrar directamente al Simulador (Modo Local)</span>`);
          } else {
            return [
              createVNode("span", null, "\u{1F680} Entrar directamente al Simulador (Modo Local)")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</form><div class="test-credentials" data-v-9280662c><span class="cred-title" data-v-9280662c>Credenciales de prueba:</span><code data-v-9280662c>docente@simu-cognition.app</code><code data-v-9280662c>docente123</code><button type="button" class="autofill-btn" data-v-9280662c>Rellenar formulario</button></div><p class="login-footer" data-v-9280662c> \xBFDeseas registrar un nuevo docente? `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/registro",
        id: "link-registro"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Crear cuenta`);
          } else {
            return [
              createTextVNode("Crear cuenta")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const login = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9280662c"]]);

export { login as default };
//# sourceMappingURL=login-BCDZBLW1.mjs.map
