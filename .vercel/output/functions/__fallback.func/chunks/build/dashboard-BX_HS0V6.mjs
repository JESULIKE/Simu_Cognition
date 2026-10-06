import { _ as __nuxt_component_0 } from './nuxt-link-CfnB6_ol.mjs';
import { mergeProps, withCtx, openBlock, createBlock, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
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

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "dashboard-layout" }, _attrs))} data-v-198d169b><aside class="sidebar" data-v-198d169b><div class="sidebar-brand" data-v-198d169b><div class="brand-icon" data-v-198d169b>SC</div><span class="brand-name" data-v-198d169b>Simu-Cognition</span></div><nav class="sidebar-nav" data-v-198d169b>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/dashboard",
    class: "nav-item",
    "active-class": "nav-item--active"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-198d169b${_scopeId}><rect x="3" y="3" width="7" height="7" data-v-198d169b${_scopeId}></rect><rect x="14" y="3" width="7" height="7" data-v-198d169b${_scopeId}></rect><rect x="14" y="14" width="7" height="7" data-v-198d169b${_scopeId}></rect><rect x="3" y="14" width="7" height="7" data-v-198d169b${_scopeId}></rect></svg> Simulador `);
      } else {
        return [
          (openBlock(), createBlock("svg", {
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2"
          }, [
            createVNode("rect", {
              x: "3",
              y: "3",
              width: "7",
              height: "7"
            }),
            createVNode("rect", {
              x: "14",
              y: "3",
              width: "7",
              height: "7"
            }),
            createVNode("rect", {
              x: "14",
              y: "14",
              width: "7",
              height: "7"
            }),
            createVNode("rect", {
              x: "3",
              y: "14",
              width: "7",
              height: "7"
            })
          ])),
          createTextVNode(" Simulador ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/dashboard/historial",
    class: "nav-item",
    "active-class": "nav-item--active"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-198d169b${_scopeId}><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" data-v-198d169b${_scopeId}></path></svg> Historial `);
      } else {
        return [
          (openBlock(), createBlock("svg", {
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2"
          }, [
            createVNode("path", { d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" })
          ])),
          createTextVNode(" Historial ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/dashboard/datasets",
    class: "nav-item",
    "active-class": "nav-item--active"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-198d169b${_scopeId}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" data-v-198d169b${_scopeId}></path><polyline points="17 8 12 3 7 8" data-v-198d169b${_scopeId}></polyline><line x1="12" y1="3" x2="12" y2="15" data-v-198d169b${_scopeId}></line></svg> Calibrar Datos `);
      } else {
        return [
          (openBlock(), createBlock("svg", {
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2"
          }, [
            createVNode("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
            createVNode("polyline", { points: "17 8 12 3 7 8" }),
            createVNode("line", {
              x1: "12",
              y1: "3",
              x2: "12",
              y2: "15"
            })
          ])),
          createTextVNode(" Calibrar Datos ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/dashboard/validacion",
    class: "nav-item",
    "active-class": "nav-item--active"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-198d169b${_scopeId}><path d="M9 11l3 3L22 4" data-v-198d169b${_scopeId}></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" data-v-198d169b${_scopeId}></path></svg> Validaci\xF3n Emp\xEDrica `);
      } else {
        return [
          (openBlock(), createBlock("svg", {
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2"
          }, [
            createVNode("path", { d: "M9 11l3 3L22 4" }),
            createVNode("path", { d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" })
          ])),
          createTextVNode(" Validaci\xF3n Emp\xEDrica ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</nav></aside><main class="main-content" data-v-198d169b>`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</main></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const dashboard = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-198d169b"]]);

export { dashboard as default };
//# sourceMappingURL=dashboard-BX_HS0V6.mjs.map
