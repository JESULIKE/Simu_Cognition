import { _ as __nuxt_component_0 } from './nuxt-link-CfnB6_ol.mjs';
import { defineComponent, reactive, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
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
  __name: "registro",
  __ssrInlineRender: true,
  setup(__props) {
    const { signIn } = useAuth();
    useRouter();
    const form = reactive({ nombre: "", email: "", password: "" });
    const loading = ref(false);
    const errorMsg = ref("");
    const successMsg = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "registro-page animate-fade-in" }, _attrs))} data-v-58fa2672><div class="card registro-card" data-v-58fa2672><div class="registro-header" data-v-58fa2672><div class="brand-mark" data-v-58fa2672><span class="brand-mark-text" data-v-58fa2672>SC</span></div><h1 data-v-58fa2672>Crear cuenta</h1><p data-v-58fa2672>Accede a todas las herramientas de simulaci\xF3n</p></div><form id="registro-form" class="registro-form" data-v-58fa2672><div class="form-group" data-v-58fa2672><label class="label" for="nombre" data-v-58fa2672>Nombre completo</label><input id="nombre"${ssrRenderAttr("value", unref(form).nombre)} type="text" class="input" placeholder="Mar\xEDa Garc\xEDa" required data-v-58fa2672></div><div class="form-group" data-v-58fa2672><label class="label" for="email" data-v-58fa2672>Email</label><input id="email"${ssrRenderAttr("value", unref(form).email)} type="email" class="input" placeholder="tu@email.com" required data-v-58fa2672></div><div class="form-group" data-v-58fa2672><label class="label" for="password" data-v-58fa2672>Contrase\xF1a</label><input id="password"${ssrRenderAttr("value", unref(form).password)} type="password" class="input" placeholder="M\xEDnimo 8 caracteres" minlength="8" required data-v-58fa2672></div>`);
      if (unref(errorMsg)) {
        _push(`<div class="error-msg" data-v-58fa2672>${ssrInterpolate(unref(errorMsg))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(successMsg)) {
        _push(`<div class="success-msg" data-v-58fa2672>${ssrInterpolate(unref(successMsg))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button id="registro-submit" type="submit" class="btn btn-primary registro-btn"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} data-v-58fa2672>`);
      if (unref(loading)) {
        _push(`<span class="spinner" data-v-58fa2672></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(loading) ? "Creando cuenta..." : "Crear cuenta")}</button></form><p class="registro-footer" data-v-58fa2672> \xBFYa tienes cuenta? `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/login",
        id: "link-login"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Iniciar sesi\xF3n`);
          } else {
            return [
              createTextVNode("Iniciar sesi\xF3n")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/registro.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const registro = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-58fa2672"]]);

export { registro as default };
//# sourceMappingURL=registro-DryctPbR.mjs.map
