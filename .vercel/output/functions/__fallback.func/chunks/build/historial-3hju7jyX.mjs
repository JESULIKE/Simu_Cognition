import { _ as __nuxt_component_0 } from './nuxt-link-CfnB6_ol.mjs';
import { defineComponent, ref, mergeProps, withCtx, openBlock, createBlock, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "historial",
  __ssrInlineRender: true,
  setup(__props) {
    const simulaciones = ref([]);
    const materias = ref([]);
    const filtroMateriaId = ref("");
    const totalSimulaciones = ref(0);
    const limit = ref(15);
    const offset = ref(0);
    const cargando = ref(true);
    const eliminandoId = ref(null);
    const vaciando = ref(false);
    function formatearFecha(isoStr) {
      if (!isoStr) return "-";
      const d = new Date(isoStr);
      return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
    }
    function formatearHora(isoStr) {
      if (!isoStr) return "";
      const d = new Date(isoStr);
      return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    }
    function formatTipo(tipo) {
      switch (tipo) {
        case "MEMORISTICA":
          return "Memor\xEDstica";
        case "LOGICO_MATEMATICA":
          return "L\xF3gico-Mat.";
        case "MIXTA":
          return "Mixta";
        default:
          return "-";
      }
    }
    function getBadgeClass(tipo) {
      switch (tipo) {
        case "MEMORISTICA":
          return "badge-memoristica";
        case "LOGICO_MATEMATICA":
          return "badge-logico";
        case "MIXTA":
          return "badge-mixta";
        default:
          return "";
      }
    }
    function getCalColorClass(cal) {
      if (cal >= 85) return "cal-green";
      if (cal >= 70) return "cal-blue";
      if (cal >= 60) return "cal-amber";
      return "cal-danger";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "historial-page animate-fade-in" }, _attrs))} data-v-477e2a1a><header class="page-header" data-v-477e2a1a><div data-v-477e2a1a><div class="header-pretitle" data-v-477e2a1a>Registro Hist\xF3rico</div><h1 class="header-title" data-v-477e2a1a>Simulaciones Realizadas</h1></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/dashboard",
        class: "btn btn-primary btn-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-477e2a1a${_scopeId}><line x1="19" y1="12" x2="5" y2="12" data-v-477e2a1a${_scopeId}></line><polyline points="12 19 5 12 12 5" data-v-477e2a1a${_scopeId}></polyline></svg> Volver al Simulador `);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                width: "16",
                height: "16",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2"
              }, [
                createVNode("line", {
                  x1: "19",
                  y1: "12",
                  x2: "5",
                  y2: "12"
                }),
                createVNode("polyline", { points: "12 19 5 12 12 5" })
              ])),
              createTextVNode(" Volver al Simulador ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header><div class="filter-bar card" data-v-477e2a1a><div class="filter-group" data-v-477e2a1a><label class="filter-label" for="filter-materia" data-v-477e2a1a>Filtrar por Asignatura:</label><select id="filter-materia" class="filter-select" data-v-477e2a1a><option value="" data-v-477e2a1a${ssrIncludeBooleanAttr(Array.isArray(filtroMateriaId.value) ? ssrLooseContain(filtroMateriaId.value, "") : ssrLooseEqual(filtroMateriaId.value, "")) ? " selected" : ""}>Todas las asignaturas</option><!--[-->`);
      ssrRenderList(materias.value, (mat) => {
        _push(`<option${ssrRenderAttr("value", mat.id)} data-v-477e2a1a${ssrIncludeBooleanAttr(Array.isArray(filtroMateriaId.value) ? ssrLooseContain(filtroMateriaId.value, mat.id) : ssrLooseEqual(filtroMateriaId.value, mat.id)) ? " selected" : ""}>${ssrInterpolate(mat.nombre)}</option>`);
      });
      _push(`<!--]--></select></div><div class="filter-stats" data-v-477e2a1a><span class="total-badge" data-v-477e2a1a>${ssrInterpolate(totalSimulaciones.value)} simulaciones</span>`);
      if (totalSimulaciones.value > 0) {
        _push(`<button class="btn btn-ghost btn-xs btn-vaciar"${ssrIncludeBooleanAttr(vaciando.value) ? " disabled" : ""} title="Eliminar todas las simulaciones de la vista actual" data-v-477e2a1a>${ssrInterpolate(vaciando.value ? "Vaciando..." : "\u{1F5D1}\uFE0F Vaciar Historial")}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (cargando.value) {
        _push(`<div class="loading-state card" data-v-477e2a1a><div class="spinner" data-v-477e2a1a></div><p data-v-477e2a1a>Cargando historial...</p></div>`);
      } else if (simulaciones.value.length === 0) {
        _push(`<div class="empty-state card" data-v-477e2a1a><div class="empty-icon" data-v-477e2a1a>\u{1F4CA}</div><h3 class="empty-title" data-v-477e2a1a>Sin simulaciones guardadas</h3><p class="empty-desc" data-v-477e2a1a> A\xFAn no has guardado ninguna simulaci\xF3n. Ahora puedes ingresar al simulador y pulsar &quot;Guardar en Historial&quot; para registrar espec\xEDficamente las simulaciones que deseas conservar. </p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/dashboard",
          class: "btn btn-primary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Ir al Simulador `);
            } else {
              return [
                createTextVNode(" Ir al Simulador ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="table-container card" data-v-477e2a1a><table class="sim-table" data-v-477e2a1a><thead data-v-477e2a1a><tr data-v-477e2a1a><th data-v-477e2a1a>Fecha</th><th data-v-477e2a1a>Estudiante / Etiqueta</th><th data-v-477e2a1a>Asignatura</th><th data-v-477e2a1a>Par\xE1metros de Entrada</th><th data-v-477e2a1a>Calificaci\xF3n</th><th data-v-477e2a1a>1er Repaso</th><th class="text-right" data-v-477e2a1a>Acci\xF3n</th></tr></thead><tbody data-v-477e2a1a><!--[-->`);
        ssrRenderList(simulaciones.value, (sim) => {
          var _a, _b, _c;
          _push(`<tr class="sim-row" data-v-477e2a1a><td class="col-fecha" data-v-477e2a1a><span class="fecha-main" data-v-477e2a1a>${ssrInterpolate(formatearFecha(sim.creadoEn))}</span><span class="fecha-sub" data-v-477e2a1a>${ssrInterpolate(formatearHora(sim.creadoEn))}</span></td><td class="col-etiqueta" data-v-477e2a1a>`);
          if (sim.etiqueta) {
            _push(`<span class="etiqueta-badge" data-v-477e2a1a><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-477e2a1a><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" data-v-477e2a1a></path><circle cx="12" cy="7" r="4" data-v-477e2a1a></circle></svg> ${ssrInterpolate(sim.etiqueta)}</span>`);
          } else {
            _push(`<span class="etiqueta-muted" data-v-477e2a1a>Sin asignar</span>`);
          }
          _push(`</td><td class="col-materia" data-v-477e2a1a><div class="materia-name" data-v-477e2a1a>${ssrInterpolate(((_a = sim.materia) == null ? void 0 : _a.nombre) || "General")}</div><span class="${ssrRenderClass([getBadgeClass((_b = sim.materia) == null ? void 0 : _b.tipo), "badge"])}" data-v-477e2a1a>${ssrInterpolate(formatTipo((_c = sim.materia) == null ? void 0 : _c.tipo))}</span></td><td class="col-params" data-v-477e2a1a><div class="param-tags" data-v-477e2a1a><span class="tag tag-blue" data-v-477e2a1a>${ssrInterpolate(sim.horasEstudio)}h estudio</span><span class="tag tag-purple" data-v-477e2a1a>Dif: ${ssrInterpolate(sim.dificultad)}/5</span><span class="tag tag-green" data-v-477e2a1a>${ssrInterpolate(sim.repasosPrevios)} repasos</span><span class="tag tag-amber" data-v-477e2a1a>${ssrInterpolate(Math.round(sim.calidadEstudio * 100))}% foco</span></div></td><td class="col-calificacion" data-v-477e2a1a><div class="${ssrRenderClass([getCalColorClass(sim.calificacionPredicha), "cal-val"])}" data-v-477e2a1a>${ssrInterpolate(sim.calificacionPredicha.toFixed(1))} <span class="cal-max" data-v-477e2a1a>/100</span></div></td><td class="col-repaso" data-v-477e2a1a><div class="repaso-val" data-v-477e2a1a> D\xEDa ${ssrInterpolate(sim.diaRepasoOptimo.toFixed(1))}</div><span class="repaso-sub" data-v-477e2a1a>Umbral ${ssrInterpolate(Math.round(sim.umbralRetencion * 100))}%</span></td><td class="col-accion" data-v-477e2a1a><button class="btn-delete" title="Eliminar este registro"${ssrIncludeBooleanAttr(eliminandoId.value === sim.id) ? " disabled" : ""} data-v-477e2a1a><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-477e2a1a><polyline points="3 6 5 6 21 6" data-v-477e2a1a></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" data-v-477e2a1a></path><line x1="10" y1="11" x2="10" y2="17" data-v-477e2a1a></line><line x1="14" y1="11" x2="14" y2="17" data-v-477e2a1a></line></svg></button></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
        if (totalSimulaciones.value > limit.value) {
          _push(`<div class="pagination-bar" data-v-477e2a1a><button class="btn btn-ghost btn-sm"${ssrIncludeBooleanAttr(offset.value === 0) ? " disabled" : ""} data-v-477e2a1a> \u2190 Anterior </button><span class="page-indicator" data-v-477e2a1a> Mostrando ${ssrInterpolate(offset.value + 1)}\u2013${ssrInterpolate(Math.min(offset.value + limit.value, totalSimulaciones.value))} de ${ssrInterpolate(totalSimulaciones.value)}</span><button class="btn btn-ghost btn-sm"${ssrIncludeBooleanAttr(offset.value + limit.value >= totalSimulaciones.value) ? " disabled" : ""} data-v-477e2a1a> Siguiente \u2192 </button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard/historial.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const historial = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-477e2a1a"]]);

export { historial as default };
//# sourceMappingURL=historial-3hju7jyX.mjs.map
