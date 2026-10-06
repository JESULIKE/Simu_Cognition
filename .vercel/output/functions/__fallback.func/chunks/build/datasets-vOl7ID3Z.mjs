import { _ as __nuxt_component_0 } from './nuxt-link-CfnB6_ol.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, openBlock, createBlock, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
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
  __name: "datasets",
  __ssrInlineRender: true,
  setup(__props) {
    const materias = ref([]);
    const materiaId = ref("");
    ref(null);
    const isDragging = ref(false);
    const parsedData = ref([]);
    const uploadError = ref("");
    const reentrenando = ref(false);
    const restableciendo = ref(false);
    const resetSuccess = ref(false);
    const resultadoCalibracion = ref(null);
    const materiaActual = computed(
      () => materias.value.find((m) => m.id === materiaId.value)
    );
    const datasetStatusClass = computed(() => {
      var _a, _b;
      return ((_b = (_a = materiaActual.value) == null ? void 0 : _a.dataset) == null ? void 0 : _b.origen) === "csv_subido" ? "tag-custom" : "tag-base";
    });
    function formatTipo(tipo) {
      switch (tipo) {
        case "MEMORISTICA":
          return "Memor\xEDstica";
        case "LOGICO_MATEMATICA":
          return "L\xF3gico-Matem\xE1tica";
        case "MIXTA":
          return "Mixta";
        default:
          return "-";
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "datasets-page animate-fade-in" }, _attrs))} data-v-1cc86875><header class="page-header" data-v-1cc86875><div data-v-1cc86875><div class="header-pretitle" data-v-1cc86875>Calibraci\xF3n de Modelos ML</div><h1 class="header-title" data-v-1cc86875>Datasets y Ajuste Emp\xEDrico</h1></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/dashboard",
        class: "btn btn-primary btn-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-1cc86875${_scopeId}><line x1="19" y1="12" x2="5" y2="12" data-v-1cc86875${_scopeId}></line><polyline points="12 19 5 12 12 5" data-v-1cc86875${_scopeId}></polyline></svg> Volver al Simulador `);
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
      _push(`</header><div class="materia-selector-card card" data-v-1cc86875><div class="card-left" data-v-1cc86875><label class="card-label" for="select-materia" data-v-1cc86875>Asignatura a calibrar:</label><select id="select-materia" class="select-input" data-v-1cc86875><!--[-->`);
      ssrRenderList(materias.value, (mat) => {
        _push(`<option${ssrRenderAttr("value", mat.id)} data-v-1cc86875${ssrIncludeBooleanAttr(Array.isArray(materiaId.value) ? ssrLooseContain(materiaId.value, mat.id) : ssrLooseEqual(materiaId.value, mat.id)) ? " selected" : ""}>${ssrInterpolate(mat.nombre)} (${ssrInterpolate(formatTipo(mat.tipo))}) </option>`);
      });
      _push(`<!--]--></select></div>`);
      if (materiaActual.value) {
        _push(`<div class="card-right" data-v-1cc86875><span class="${ssrRenderClass([datasetStatusClass.value, "status-tag"])}" data-v-1cc86875>${ssrInterpolate(((_a = materiaActual.value.dataset) == null ? void 0 : _a.origen) === "csv_subido" ? "Modelo Personalizado" : "Modelo Base Sint\xE9tico")}</span>`);
        if (((_b = materiaActual.value.dataset) == null ? void 0 : _b.origen) === "csv_subido") {
          _push(`<button class="btn btn-ghost btn-xs"${ssrIncludeBooleanAttr(restableciendo.value) ? " disabled" : ""} title="Restaurar a los pesos sint\xE9ticos originales" data-v-1cc86875>${ssrInterpolate(restableciendo.value ? "Restableciendo..." : "\u21BA Restablecer a Base")}</button>`);
        } else {
          _push(`<!---->`);
        }
        if (resetSuccess.value) {
          _push(`<span class="badge badge-green" data-v-1cc86875>\u2713 Restaurado</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="datasets-grid" data-v-1cc86875><div class="card upload-card" data-v-1cc86875><div class="card-header" data-v-1cc86875><div class="header-icon" data-v-1cc86875>\u{1F4C2}</div><div data-v-1cc86875><h3 class="card-title" data-v-1cc86875>Cargar Notas Reales de Alumnos</h3><p class="card-subtitle" data-v-1cc86875>Sube un archivo CSV con el rendimiento emp\xEDrico de tu curso</p></div></div><div class="${ssrRenderClass([{ "drop-zone--active": isDragging.value }, "drop-zone"])}" data-v-1cc86875><input type="file" accept=".csv" class="sr-only" data-v-1cc86875><div class="drop-zone-icon" data-v-1cc86875><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" data-v-1cc86875><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" data-v-1cc86875></path><polyline points="17 8 12 3 7 8" data-v-1cc86875></polyline><line x1="12" y1="3" x2="12" y2="15" data-v-1cc86875></line></svg></div><span class="drop-zone-title" data-v-1cc86875>Haz clic o arrastra un archivo CSV aqu\xED</span><span class="drop-zone-hint" data-v-1cc86875>Columnas: horas_estudio, dificultad, repasos_previos, calidad_estudio, calificacion</span></div><div class="template-box" data-v-1cc86875><span class="template-text" data-v-1cc86875>\xBFNo tienes el formato preparado?</span><button class="btn btn-ghost btn-xs" data-v-1cc86875> Descargar CSV de Ejemplo </button></div>`);
      if (parsedData.value.length > 0) {
        _push(`<div class="preview-box" data-v-1cc86875><div class="preview-header" data-v-1cc86875><span class="preview-title" data-v-1cc86875>${ssrInterpolate(parsedData.value.length)} registros detectados</span><span class="badge badge-green" data-v-1cc86875>V\xE1lido</span></div><div class="table-mini-container" data-v-1cc86875><table class="table-mini" data-v-1cc86875><thead data-v-1cc86875><tr data-v-1cc86875><th data-v-1cc86875>Horas</th><th data-v-1cc86875>Dif</th><th data-v-1cc86875>Repasos</th><th data-v-1cc86875>Foco</th><th data-v-1cc86875>Nota</th></tr></thead><tbody data-v-1cc86875><!--[-->`);
        ssrRenderList(parsedData.value.slice(0, 4), (row, idx) => {
          _push(`<tr data-v-1cc86875><td data-v-1cc86875>${ssrInterpolate(row.horas_estudio)}h</td><td data-v-1cc86875>${ssrInterpolate(row.dificultad)}</td><td data-v-1cc86875>${ssrInterpolate(row.repasos_previos)}</td><td data-v-1cc86875>${ssrInterpolate(Math.round(row.calidad_estudio * 100))}%</td><td data-v-1cc86875><strong data-v-1cc86875>${ssrInterpolate(row.calificacion)}</strong></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div><button class="btn btn-primary w-full mt-3"${ssrIncludeBooleanAttr(reentrenando.value || !materiaId.value) ? " disabled" : ""} data-v-1cc86875>`);
        if (reentrenando.value) {
          _push(`<span class="spinner-sm" data-v-1cc86875></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span data-v-1cc86875>${ssrInterpolate(reentrenando.value ? "Ajustando modelo matem\xE1tico..." : "Calibrar Modelo con estos Datos")}</span></button></div>`);
      } else {
        _push(`<!---->`);
      }
      if (uploadError.value) {
        _push(`<div class="error-msg" data-v-1cc86875>${ssrInterpolate(uploadError.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="card metrics-card" data-v-1cc86875><div class="card-header" data-v-1cc86875><div class="header-icon icon-purple" data-v-1cc86875>\u{1F4C8}</div><div data-v-1cc86875><h3 class="card-title" data-v-1cc86875>Precisi\xF3n del Modelo Calibrado</h3><p class="card-subtitle" data-v-1cc86875>Bondad de ajuste (R\xB2) y error medio absoluto (MAE)</p></div></div>`);
      if (resultadoCalibracion.value) {
        _push(`<div class="results-display animate-fade-in" data-v-1cc86875><div class="metric-result-row" data-v-1cc86875><div class="metric-result-box" data-v-1cc86875><span class="res-label" data-v-1cc86875>Coeficiente de Determinaci\xF3n (R\xB2)</span><span class="res-val val-green" data-v-1cc86875>${ssrInterpolate((resultadoCalibracion.value.r2_score * 100).toFixed(1))}%</span><span class="res-hint" data-v-1cc86875>Proporci\xF3n de varianza explicada</span></div><div class="metric-result-box" data-v-1cc86875><span class="res-label" data-v-1cc86875>Error Medio Absoluto (MAE)</span><span class="res-val val-blue" data-v-1cc86875>\xB1${ssrInterpolate(resultadoCalibracion.value.mae)} pts</span><span class="res-hint" data-v-1cc86875>Desviaci\xF3n media en escala 0\u2013100</span></div></div><div class="sample-count-badge" data-v-1cc86875><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-1cc86875><polyline points="20 6 9 17 4 12" data-v-1cc86875></polyline></svg> Modelo ajustado con \xE9xito utilizando ${ssrInterpolate(resultadoCalibracion.value.muestras)} calificaciones de estudiantes. </div><p class="calibration-note" data-v-1cc86875> El modelo para la materia seleccionada ha sido actualizado en memoria. Al ingresar al simulador, todas las proyecciones reflejar\xE1n los nuevos coeficientes ajustados emp\xEDricamente. </p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/dashboard",
          class: "btn btn-primary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Ir a Simular con el Nuevo Modelo `);
            } else {
              return [
                createTextVNode(" Ir a Simular con el Nuevo Modelo ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="empty-metrics" data-v-1cc86875><div class="empty-metrics-icon" data-v-1cc86875>\u{1F3AF}</div><h4 data-v-1cc86875>Modelo en Estado Base</h4><p data-v-1cc86875> Actualmente se utiliza el modelo general preentrenado con datos sint\xE9ticos de alta fidelidad (R\xB2 &gt; 0.90). Sube un CSV con notas de tu grupo para afinar el modelo a tu propia experiencia pedag\xF3gica. </p></div>`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard/datasets.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const datasets = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1cc86875"]]);

export { datasets as default };
//# sourceMappingURL=datasets-vOl7ID3Z.mjs.map
