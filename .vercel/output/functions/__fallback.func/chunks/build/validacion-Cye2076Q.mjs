import { defineComponent, ref, computed, mergeProps, watch, unref, useModel, mergeModels, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderComponent, ssrRenderStyle } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
import { Chart, Title, Tooltip, Legend, LineElement, BarElement, LinearScale, PointElement, CategoryScale, Filler } from 'chart.js';
import { Bar, Line } from 'vue-chartjs';
import { u as useHead } from './v3-xcKYy52X.mjs';
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
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';

const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "EvaluacionForm",
  __ssrInlineRender: true,
  props: {
    materias: {},
    initialMateriaId: {}
  },
  emits: ["created"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const LIKERT_ITEMS = [
      "Practiqu\xE9 recordando el contenido sin ver mis apuntes (active recall).",
      "Espaci\xE9 mis sesiones de estudio en vez de estudiar todo de una sentada.",
      "Me autoevalu\xE9 con preguntas o ejercicios antes del quiz.",
      "Le expliqu\xE9 el contenido a alguien m\xE1s o en voz alta.",
      "Estudi\xE9 en un ambiente sin distracciones (celular, redes, etc.)."
    ];
    const likertItems = LIKERT_ITEMS.map((label) => ({ label }));
    const likertValues = ref([0, 0, 0, 0, 0]);
    const form = ref({
      materiaId: "",
      tipoMateriaDocente: "MEMORISTICA",
      dificultadDocente: 0,
      codigoAnonimo: "",
      horasEstudio: 2,
      repasosPrevios: 0,
      dificultadPercibida: 0
    });
    watch(
      () => props.initialMateriaId,
      (newId) => {
        if (newId && (!form.value.materiaId || form.value.materiaId !== newId)) {
          form.value.materiaId = newId;
        }
      },
      { immediate: true }
    );
    const loading = ref(false);
    const errorMsg = ref("");
    const calidadEstudioCalc = computed(() => {
      const filled = likertValues.value.filter((v) => v > 0);
      if (filled.length === 0) return 0;
      return filled.reduce((a, b) => a + b, 0) / (filled.length * 5);
    });
    const isValid = computed(
      () => form.value.materiaId && form.value.dificultadDocente > 0 && form.value.dificultadPercibida > 0 && form.value.horasEstudio >= 0.5 && likertValues.value.every((v) => v > 0)
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "eval-form" }, _attrs))} data-v-c55e5f3d><div class="form-section" data-v-c55e5f3d><div class="section-header" data-v-c55e5f3d><span class="section-badge badge-blue" data-v-c55e5f3d>Ficha del Docente</span><h3 class="section-title" data-v-c55e5f3d>Configuraci\xF3n del Tema</h3><p class="section-desc" data-v-c55e5f3d>Completar antes de que el estudiante llene su parte.</p></div><div class="form-row" data-v-c55e5f3d><label class="form-label" data-v-c55e5f3d> Materia <select id="materia-select" class="form-select" required data-v-c55e5f3d><option value="" disabled data-v-c55e5f3d${ssrIncludeBooleanAttr(Array.isArray(form.value.materiaId) ? ssrLooseContain(form.value.materiaId, "") : ssrLooseEqual(form.value.materiaId, "")) ? " selected" : ""}>Seleccionar materia...</option><!--[-->`);
      ssrRenderList(__props.materias, (m) => {
        _push(`<option${ssrRenderAttr("value", m.id)} data-v-c55e5f3d${ssrIncludeBooleanAttr(Array.isArray(form.value.materiaId) ? ssrLooseContain(form.value.materiaId, m.id) : ssrLooseEqual(form.value.materiaId, m.id)) ? " selected" : ""}>${ssrInterpolate(m.nombre)}</option>`);
      });
      _push(`<!--]--></select></label><label class="form-label" data-v-c55e5f3d> Tipo de materia (seg\xFAn docente) <select id="tipo-docente-select" class="form-select" required data-v-c55e5f3d><option value="MEMORISTICA" data-v-c55e5f3d${ssrIncludeBooleanAttr(Array.isArray(form.value.tipoMateriaDocente) ? ssrLooseContain(form.value.tipoMateriaDocente, "MEMORISTICA") : ssrLooseEqual(form.value.tipoMateriaDocente, "MEMORISTICA")) ? " selected" : ""}>Memor\xEDstica</option><option value="LOGICO_MATEMATICA" data-v-c55e5f3d${ssrIncludeBooleanAttr(Array.isArray(form.value.tipoMateriaDocente) ? ssrLooseContain(form.value.tipoMateriaDocente, "LOGICO_MATEMATICA") : ssrLooseEqual(form.value.tipoMateriaDocente, "LOGICO_MATEMATICA")) ? " selected" : ""}>L\xF3gico-Matem\xE1tica</option><option value="MIXTA" data-v-c55e5f3d${ssrIncludeBooleanAttr(Array.isArray(form.value.tipoMateriaDocente) ? ssrLooseContain(form.value.tipoMateriaDocente, "MIXTA") : ssrLooseEqual(form.value.tipoMateriaDocente, "MIXTA")) ? " selected" : ""}>Mixta</option></select></label></div><label class="form-label" data-v-c55e5f3d> Dificultad del tema (percepci\xF3n del docente) <div class="rubrica-hint" data-v-c55e5f3d> 1 = contenido ya visto y repasado varias veces \xA0|\xA0 5 = contenido completamente nuevo y abstracto </div><div class="rating-row" data-v-c55e5f3d><!--[-->`);
      ssrRenderList(5, (n) => {
        _push(`<button type="button"${ssrRenderAttr("id", `dif-docente-${n}`)} class="${ssrRenderClass([{ active: form.value.dificultadDocente === n }, "rating-btn"])}" data-v-c55e5f3d>${ssrInterpolate(n)}</button>`);
      });
      _push(`<!--]--></div></label><label class="form-label" data-v-c55e5f3d> C\xF3digo an\xF3nimo del estudiante <div class="codigo-row" data-v-c55e5f3d><input id="codigo-anonimo"${ssrRenderAttr("value", form.value.codigoAnonimo)} type="text" class="form-input" placeholder="Se genera autom\xE1ticamente (ej. EST-001)" data-v-c55e5f3d><span class="codigo-hint" data-v-c55e5f3d>Deja en blanco para asignar autom\xE1ticamente</span></div></label></div><div class="form-section" data-v-c55e5f3d><div class="section-header" data-v-c55e5f3d><span class="section-badge badge-teal" data-v-c55e5f3d>Cuestionario del Estudiante</span><h3 class="section-title" data-v-c55e5f3d>H\xE1bitos de Estudio</h3><p class="section-desc" data-v-c55e5f3d>El estudiante completa esta secci\xF3n de forma individual.</p></div><div class="form-row" data-v-c55e5f3d><label class="form-label" data-v-c55e5f3d> Horas de estudio dedicadas a este tema <input id="horas-estudio"${ssrRenderAttr("value", form.value.horasEstudio)} type="number" min="0.5" max="10" step="0.5" class="form-input" required data-v-c55e5f3d></label><label class="form-label" data-v-c55e5f3d> N\xFAmero de repasos previos realizados <input id="repasos-previos"${ssrRenderAttr("value", form.value.repasosPrevios)} type="number" min="0" max="5" step="1" class="form-input" required data-v-c55e5f3d></label></div><div class="likert-block" data-v-c55e5f3d><div class="likert-header" data-v-c55e5f3d> T\xE9cnicas de estudio activo <span class="likert-sub" data-v-c55e5f3d>Escala: 1 = Nunca \xA0|\xA0 5 = Siempre</span></div><!--[-->`);
      ssrRenderList(unref(likertItems), (item, idx) => {
        _push(`<div class="likert-item" data-v-c55e5f3d><span class="likert-label" data-v-c55e5f3d>${ssrInterpolate(item.label)}</span><div class="likert-scale" data-v-c55e5f3d><!--[-->`);
        ssrRenderList(5, (n) => {
          _push(`<button type="button"${ssrRenderAttr("id", `likert-${idx}-${n}`)} class="${ssrRenderClass([{ active: likertValues.value[idx] === n }, "rating-btn rating-btn-sm"])}" data-v-c55e5f3d>${ssrInterpolate(n)}</button>`);
        });
        _push(`<!--]--></div></div>`);
      });
      _push(`<!--]--><div class="calidad-result" data-v-c55e5f3d> Calidad de estudio calculada: <strong data-v-c55e5f3d>${ssrInterpolate(calidadEstudioCalc.value.toFixed(2))}</strong><span class="calidad-bar-wrap" data-v-c55e5f3d><span class="calidad-bar" style="${ssrRenderStyle({ width: `${calidadEstudioCalc.value * 100}%` })}" data-v-c55e5f3d></span></span></div></div><label class="form-label" data-v-c55e5f3d> Dificultad percibida por el estudiante <div class="rating-row" data-v-c55e5f3d><!--[-->`);
      ssrRenderList(5, (n) => {
        _push(`<button type="button"${ssrRenderAttr("id", `dif-percibida-${n}`)} class="${ssrRenderClass([{ active: form.value.dificultadPercibida === n }, "rating-btn"])}" data-v-c55e5f3d>${ssrInterpolate(n)}</button>`);
      });
      _push(`<!--]--></div></label></div>`);
      if (errorMsg.value) {
        _push(`<p class="form-error" data-v-c55e5f3d>${ssrInterpolate(errorMsg.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button id="submit-evaluacion" type="button" class="btn-primary"${ssrIncludeBooleanAttr(!isValid.value || loading.value) ? " disabled" : ""} data-v-c55e5f3d>`);
      if (loading.value) {
        _push(`<span class="spinner-sm" data-v-c55e5f3d></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(loading.value ? "Guardando\u2026" : "Registrar Estudiante")}</button></div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/EvaluacionForm.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-c55e5f3d"]]);
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "QuizResultadoForm",
  __ssrInlineRender: true,
  props: {
    evaluacion: {},
    resultadosExistentes: {}
  },
  emits: ["saved"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const MOMENTOS = [
      { key: "INICIAL", label: "D\xEDa 0 (Inicial)" },
      { key: "DIA_1", label: "D\xEDa 1" },
      { key: "DIA_3", label: "D\xEDa 3" },
      { key: "DIA_7", label: "D\xEDa 7" },
      { key: "DIA_14", label: "D\xEDa 14" }
    ];
    const form = ref({
      momento: "INICIAL",
      notaObtenida: 0,
      reestudioReportado: false
    });
    const loading = ref(false);
    const errorMsg = ref("");
    const momentosRegistrados = computed(
      () => props.resultadosExistentes.map((r) => r.momento)
    );
    const momentosInvalidos = computed(
      () => props.resultadosExistentes.filter((r) => r.reestudioReportado).map((r) => r.momento)
    );
    const isValid = computed(
      () => form.value.momento && form.value.notaObtenida >= 0 && form.value.notaObtenida <= 100
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "quiz-form card" }, _attrs))} data-v-0d4ad3a5><div class="quiz-header" data-v-0d4ad3a5><span class="badge badge-orange" data-v-0d4ad3a5>Registro de Quiz</span><h4 class="quiz-title" data-v-0d4ad3a5>${ssrInterpolate(__props.evaluacion.codigoAnonimo)}</h4><p class="quiz-sub" data-v-0d4ad3a5>Registrar resultado del quiz para un momento de medici\xF3n.</p></div><div class="momento-grid" data-v-0d4ad3a5><!--[-->`);
      ssrRenderList(MOMENTOS, (m) => {
        _push(`<button type="button"${ssrRenderAttr("id", `momento-${m.key}`)} class="${ssrRenderClass([{
          active: form.value.momento === m.key,
          registrado: momentosRegistrados.value.includes(m.key),
          invalido: momentosInvalidos.value.includes(m.key)
        }, "momento-btn"])}" data-v-0d4ad3a5><span class="momento-label" data-v-0d4ad3a5>${ssrInterpolate(m.label)}</span>`);
        if (momentosRegistrados.value.includes(m.key)) {
          _push(`<span class="momento-tag tag-ok" data-v-0d4ad3a5>\u2713 Registrado</span>`);
        } else {
          _push(`<!---->`);
        }
        if (momentosInvalidos.value.includes(m.key)) {
          _push(`<span class="momento-tag tag-warn" data-v-0d4ad3a5>\u26A0 Excluido H2</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button>`);
      });
      _push(`<!--]--></div><label class="form-label" data-v-0d4ad3a5> Nota obtenida (0 \u2013 100) <input id="nota-obtenida"${ssrRenderAttr("value", form.value.notaObtenida)} type="number" min="0" max="100" step="0.5" class="form-input nota-input" required data-v-0d4ad3a5></label><label class="${ssrRenderClass([{ checked: form.value.reestudioReportado }, "checkbox-label"])}" data-v-0d4ad3a5><input id="reestudio-check"${ssrIncludeBooleanAttr(Array.isArray(form.value.reestudioReportado) ? ssrLooseContain(form.value.reestudioReportado, null) : form.value.reestudioReportado) ? " checked" : ""} type="checkbox" class="sr-only" data-v-0d4ad3a5><span class="checkbox-box" data-v-0d4ad3a5></span><span class="checkbox-text" data-v-0d4ad3a5> El estudiante repas\xF3 el tema desde la \xFAltima evaluaci\xF3n <span class="checkbox-warn" data-v-0d4ad3a5>(excluye este punto del an\xE1lisis de retenci\xF3n H2)</span></span></label>`);
      if (errorMsg.value) {
        _push(`<p class="form-error" data-v-0d4ad3a5>${ssrInterpolate(errorMsg.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button id="submit-resultado" type="button" class="btn-primary"${ssrIncludeBooleanAttr(!isValid.value || loading.value) ? " disabled" : ""} data-v-0d4ad3a5>`);
      if (loading.value) {
        _push(`<span class="spinner-sm" data-v-0d4ad3a5></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(loading.value ? "Guardando\u2026" : "Registrar Resultado")}</button></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/QuizResultadoForm.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-0d4ad3a5"]]);
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "ComparacionChart",
  __ssrInlineRender: true,
  props: {
    calificacionPredicha: {},
    calificacionReal: {},
    errorAbsoluto: {},
    curvaOlvidoPredicha: {},
    puntosOlvidoReales: {},
    deltaRetencionPromedio: {}
  },
  setup(__props) {
    Chart.register(Title, Tooltip, Legend, LineElement, BarElement, LinearScale, PointElement, CategoryScale, Filler);
    const props = __props;
    const h1ChartData = computed(() => {
      if (props.calificacionPredicha === 0 && props.calificacionReal === 0)
        return { labels: [], datasets: [] };
      return {
        labels: ["Calificaci\xF3n"],
        datasets: [
          {
            label: "Predicha",
            data: [props.calificacionPredicha],
            backgroundColor: "rgba(99,102,241,0.7)",
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: "Real",
            data: [props.calificacionReal],
            backgroundColor: "rgba(52,211,153,0.7)",
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      };
    });
    const h1Options = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { color: "#94a3b8", font: { size: 12 } } },
        tooltip: {
          backgroundColor: "#1a2236",
          titleColor: "#e2e8f0",
          bodyColor: "#94a3b8",
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}`
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: { color: "#64748b", callback: (v) => `${v}` },
          title: { display: true, text: "Calificaci\xF3n (0-100)", color: "#64748b", font: { size: 11 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: "#64748b" }
        }
      }
    }));
    const errorAbsClass = computed(() => ({
      "val-ok": props.errorAbsoluto <= 5,
      "val-warn": props.errorAbsoluto > 5 && props.errorAbsoluto <= 10,
      "val-bad": props.errorAbsoluto > 10
    }));
    const h2Visible = computed(() => props.puntosOlvidoReales.length > 1);
    const h2ChartData = computed(() => {
      const diasPred = props.curvaOlvidoPredicha.map((p) => p.dia);
      const retPred = props.curvaOlvidoPredicha.map((p) => {
        var _a;
        return (_a = p.retencion_predicha) != null ? _a : 0;
      });
      const diasReal = props.puntosOlvidoReales.map((p) => p.dia);
      const retReal = props.puntosOlvidoReales.map((p) => {
        var _a;
        return (_a = p.retencion_real) != null ? _a : 0;
      });
      const allDias = [.../* @__PURE__ */ new Set([...diasPred, ...diasReal])].sort((a, b) => a - b);
      const labels = allDias.map((d) => `d${d}`);
      const predMap = {};
      diasPred.forEach((d, i) => {
        predMap[d] = retPred[i];
      });
      const realMap = {};
      diasReal.forEach((d, i) => {
        realMap[d] = retReal[i];
      });
      return {
        labels,
        datasets: [
          {
            label: "Predicha",
            data: allDias.map((d) => predMap[d] !== void 0 ? +(predMap[d] * 100).toFixed(1) : null),
            borderColor: "#6366f1",
            backgroundColor: "rgba(99,102,241,0.12)",
            borderWidth: 2.5,
            pointRadius: 4,
            tension: 0.3,
            fill: false
          },
          {
            label: "Real",
            data: allDias.map((d) => realMap[d] !== void 0 ? +(realMap[d] * 100).toFixed(1) : null),
            borderColor: "#34d399",
            backgroundColor: "rgba(52,211,153,0.12)",
            borderWidth: 2.5,
            pointRadius: 5,
            pointBackgroundColor: "#34d399",
            tension: 0.3,
            fill: false
          }
        ]
      };
    });
    const h2Options = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      spanGaps: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1a2236",
          titleColor: "#e2e8f0",
          bodyColor: "#94a3b8",
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: { color: "#64748b", callback: (v) => `${v}%` },
          title: { display: true, text: "Retenci\xF3n (%)", color: "#64748b", font: { size: 11 } }
        },
        x: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: { color: "#64748b" },
          title: { display: true, text: "D\xEDas desde el quiz inicial", color: "#64748b", font: { size: 11 } }
        }
      }
    }));
    const deltaFormatted = computed(() => {
      const v = props.deltaRetencionPromedio;
      return `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`;
    });
    const deltaClass = computed(() => ({
      "val-ok": props.deltaRetencionPromedio >= -0.05,
      "val-warn": props.deltaRetencionPromedio < -0.05 && props.deltaRetencionPromedio >= -0.15,
      "val-bad": props.deltaRetencionPromedio < -0.15
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "comparacion-wrap" }, _attrs))} data-v-3bf9f8f8><div class="chart-card card" data-v-3bf9f8f8><div class="chart-header" data-v-3bf9f8f8><div data-v-3bf9f8f8><div class="chart-badge badge-indigo" data-v-3bf9f8f8>H1 \u2014 Curva de Aprendizaje</div><h4 class="chart-title" data-v-3bf9f8f8>Calificaci\xF3n Predicha vs Real</h4><p class="chart-subtitle" data-v-3bf9f8f8>Predicci\xF3n del modelo polinomial (v3.0) comparada con la nota real del quiz inicial.</p></div><div class="stat-pair" data-v-3bf9f8f8><div class="chart-stat" data-v-3bf9f8f8><span class="stat-label" data-v-3bf9f8f8>Predicha</span><span class="stat-val indigo" data-v-3bf9f8f8>${ssrInterpolate(props.calificacionPredicha.toFixed(1))}</span></div><div class="chart-stat" data-v-3bf9f8f8><span class="stat-label" data-v-3bf9f8f8>Real</span><span class="stat-val teal" data-v-3bf9f8f8>${ssrInterpolate(props.calificacionReal.toFixed(1))}</span></div><div class="chart-stat" data-v-3bf9f8f8><span class="stat-label" data-v-3bf9f8f8>Error Abs.</span><span class="${ssrRenderClass([errorAbsClass.value, "stat-val"])}" data-v-3bf9f8f8>${ssrInterpolate(props.errorAbsoluto.toFixed(1))}</span></div></div></div><div class="chart-canvas-container" data-v-3bf9f8f8>`);
      if (h1ChartData.value.labels.length) {
        _push(ssrRenderComponent(unref(Bar), {
          data: h1ChartData.value,
          options: h1Options.value
        }, null, _parent));
      } else {
        _push(`<div class="chart-loading" data-v-3bf9f8f8><div class="spinner" data-v-3bf9f8f8></div><span data-v-3bf9f8f8>Sin datos de comparaci\xF3n a\xFAn\u2026</span></div>`);
      }
      _push(`</div></div>`);
      if (h2Visible.value) {
        _push(`<div class="chart-card card" data-v-3bf9f8f8><div class="chart-header" data-v-3bf9f8f8><div data-v-3bf9f8f8><div class="chart-badge badge-purple" data-v-3bf9f8f8>H2 \u2014 Curva de Olvido (Ebbinghaus)</div><h4 class="chart-title" data-v-3bf9f8f8>Retenci\xF3n Predicha vs Real</h4><p class="chart-subtitle" data-v-3bf9f8f8>Decaimiento comparado en d\xEDas 0, 1, 3, 7, 14. Puntos excluidos (reestudio) no se grafican.</p></div><div class="chart-stat" data-v-3bf9f8f8><span class="stat-label" data-v-3bf9f8f8>\u0394 Retenci\xF3n prom.</span><span class="${ssrRenderClass([deltaClass.value, "stat-val"])}" data-v-3bf9f8f8>${ssrInterpolate(deltaFormatted.value)}</span></div></div><div class="chart-canvas-container" data-v-3bf9f8f8>`);
        _push(ssrRenderComponent(unref(Line), {
          data: h2ChartData.value,
          options: h2Options.value
        }, null, _parent));
        _push(`</div><div class="chart-footer" data-v-3bf9f8f8><div class="legend-item" data-v-3bf9f8f8><span class="legend-line" style="${ssrRenderStyle({ "background": "#6366f1" })}" data-v-3bf9f8f8></span><span data-v-3bf9f8f8>Retenci\xF3n Predicha (Ebbinghaus)</span></div><div class="legend-item" data-v-3bf9f8f8><span class="legend-line" style="${ssrRenderStyle({ "background": "#34d399" })}" data-v-3bf9f8f8></span><span data-v-3bf9f8f8>Retenci\xF3n Real (datos del estudiante)</span></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ComparacionChart.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-3bf9f8f8"]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "RecomendacionCard",
  __ssrInlineRender: true,
  props: {
    codigoAnonimo: {},
    recomendacionTexto: {},
    errorAbsoluto: {},
    deltaRetencionPromedio: {},
    calidadEstudio: {},
    generadaEn: {}
  },
  setup(__props) {
    const props = __props;
    const errorClass = computed(() => ({
      "val-ok": props.errorAbsoluto <= 5,
      "val-warn": props.errorAbsoluto > 5 && props.errorAbsoluto <= 10,
      "val-bad": props.errorAbsoluto > 10
    }));
    const deltaClass = computed(() => {
      if (props.deltaRetencionPromedio === null) return {};
      return {
        "val-ok": props.deltaRetencionPromedio >= -0.05,
        "val-warn": props.deltaRetencionPromedio < -0.05 && props.deltaRetencionPromedio >= -0.15,
        "val-bad": props.deltaRetencionPromedio < -0.15
      };
    });
    const deltaFormatted = computed(() => {
      if (props.deltaRetencionPromedio === null) return "N/A";
      const v = props.deltaRetencionPromedio;
      return `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`;
    });
    const sentimientoClass = computed(() => {
      var _a, _b;
      if (props.errorAbsoluto > 10 || ((_a = props.deltaRetencionPromedio) != null ? _a : 0) < -0.15) return "sentimiento-warn";
      if (props.errorAbsoluto <= 5 && ((_b = props.deltaRetencionPromedio) != null ? _b : 0) >= -0.05) return "sentimiento-ok";
      return "sentimiento-neutral";
    });
    const sentimientoIcon = computed(() => {
      var _a, _b;
      if (props.errorAbsoluto > 10 || ((_a = props.deltaRetencionPromedio) != null ? _a : 0) < -0.15) return "\u26A0\uFE0F";
      if (props.errorAbsoluto <= 5 && ((_b = props.deltaRetencionPromedio) != null ? _b : 0) >= -0.05) return "\u2705";
      return "\u{1F4CA}";
    });
    function formatFecha(iso) {
      try {
        return new Date(iso).toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      } catch {
        return iso;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["rec-card", sentimientoClass.value]
      }, _attrs))} data-v-1e87e42c><div class="rec-header" data-v-1e87e42c><div class="rec-icon" data-v-1e87e42c>${ssrInterpolate(sentimientoIcon.value)}</div><div data-v-1e87e42c><div class="rec-badge" data-v-1e87e42c>Recomendaci\xF3n Pedag\xF3gica</div><h4 class="rec-codigo" data-v-1e87e42c>${ssrInterpolate(__props.codigoAnonimo)}</h4></div></div><div class="rec-metricas" data-v-1e87e42c><div class="metrica-pill" data-v-1e87e42c><span class="metrica-label" data-v-1e87e42c>Error Absoluto (H1)</span><span class="${ssrRenderClass([errorClass.value, "metrica-val"])}" data-v-1e87e42c>${ssrInterpolate(__props.errorAbsoluto.toFixed(1))} pts</span></div>`);
      if (__props.deltaRetencionPromedio !== null) {
        _push(`<div class="metrica-pill" data-v-1e87e42c><span class="metrica-label" data-v-1e87e42c>\u0394 Retenci\xF3n Prom. (H2)</span><span class="${ssrRenderClass([deltaClass.value, "metrica-val"])}" data-v-1e87e42c>${ssrInterpolate(deltaFormatted.value)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="metrica-pill" data-v-1e87e42c><span class="metrica-label" data-v-1e87e42c>Calidad de Estudio</span><span class="metrica-val" data-v-1e87e42c>${ssrInterpolate((__props.calidadEstudio * 100).toFixed(0))}%</span></div></div><div class="rec-texto" data-v-1e87e42c><p data-v-1e87e42c>${ssrInterpolate(__props.recomendacionTexto)}</p></div><div class="rec-footer" data-v-1e87e42c> Generado: ${ssrInterpolate(formatFecha(__props.generadaEn))}</div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RecomendacionCard.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-1e87e42c"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AnalisisAgregadoPanel",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    metricas: {},
    materiaId: {}
  }, {
    "exportLoading": { type: Boolean, ...{ default: false } },
    "exportLoadingModifiers": {}
  }),
  emits: ["update:exportLoading"],
  setup(__props) {
    const props = __props;
    const exportLoading = useModel(__props, "exportLoading");
    const maeClass = computed(() => classByError(props.metricas.mae));
    const rmseClass = computed(() => classByError(props.metricas.rmse));
    const pearsonClass = computed(() => classByCorrelation(Math.abs(props.metricas.pearson_r)));
    const spearmanClass = computed(() => classByCorrelation(Math.abs(props.metricas.spearman_r)));
    function classByError(v) {
      if (v <= 5) return "mk-ok";
      if (v <= 10) return "mk-warn";
      return "mk-bad";
    }
    function classByCorrelation(r) {
      if (r >= 0.7) return "mk-ok";
      if (r >= 0.4) return "mk-warn";
      return "mk-bad";
    }
    function pClass(p) {
      if (p < 0.05) return "p-sig";
      if (p < 0.1) return "p-marginal";
      return "p-ns";
    }
    function formatVar(v) {
      const map = {
        horas_estudio: "Horas de Estudio",
        repasos_previos: "Repasos Previos",
        calidad_estudio: "Calidad de Estudio",
        dificultad_docente: "Dificultad (docente)"
      };
      return map[v] || v;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "panel" }, _attrs))} data-v-616ff91a><div class="panel-header" data-v-616ff91a><div data-v-616ff91a><span class="panel-badge" data-v-616ff91a>An\xE1lisis Agregado</span><h3 class="panel-title" data-v-616ff91a>M\xE9tricas Estad\xEDsticas del Grupo</h3><p class="panel-sub" data-v-616ff91a>n = ${ssrInterpolate(__props.metricas.n)} estudiantes con comparaci\xF3n calculada.</p></div><button id="btn-exportar-csv" type="button" class="btn-export"${ssrIncludeBooleanAttr(exportLoading.value) ? " disabled" : ""} data-v-616ff91a>`);
      if (exportLoading.value) {
        _push(`<span class="spinner-sm" data-v-616ff91a></span>`);
      } else {
        _push(`<span data-v-616ff91a>\u2B07</span>`);
      }
      _push(` ${ssrInterpolate(exportLoading.value ? "Generando CSV\u2026" : "Exportar CSV")}</button></div><div class="metricas-grid" data-v-616ff91a><div class="metrica-card" data-v-616ff91a><span class="mk-label" data-v-616ff91a>MAE</span><span class="${ssrRenderClass([maeClass.value, "mk-val"])}" data-v-616ff91a>${ssrInterpolate(__props.metricas.mae)}</span><span class="mk-hint" data-v-616ff91a>Error absoluto medio (H1)</span></div><div class="metrica-card" data-v-616ff91a><span class="mk-label" data-v-616ff91a>RMSE</span><span class="${ssrRenderClass([rmseClass.value, "mk-val"])}" data-v-616ff91a>${ssrInterpolate(__props.metricas.rmse)}</span><span class="mk-hint" data-v-616ff91a>Ra\xEDz del error cuadr\xE1tico medio</span></div><div class="metrica-card" data-v-616ff91a><span class="mk-label" data-v-616ff91a>Pearson r</span><span class="${ssrRenderClass([pearsonClass.value, "mk-val"])}" data-v-616ff91a>${ssrInterpolate(__props.metricas.pearson_r)}</span><span class="${ssrRenderClass([pClass(__props.metricas.pearson_p), "mk-hint mk-p"])}" data-v-616ff91a>p = ${ssrInterpolate(__props.metricas.pearson_p)}</span></div><div class="metrica-card" data-v-616ff91a><span class="mk-label" data-v-616ff91a>Spearman \u03C1</span><span class="${ssrRenderClass([spearmanClass.value, "mk-val"])}" data-v-616ff91a>${ssrInterpolate(__props.metricas.spearman_r)}</span><span class="${ssrRenderClass([pClass(__props.metricas.spearman_p), "mk-hint mk-p"])}" data-v-616ff91a>p = ${ssrInterpolate(__props.metricas.spearman_p)}</span></div></div><div class="tabla-wrap" data-v-616ff91a><h4 class="tabla-title" data-v-616ff91a>Confirmaci\xF3n Direccional por Variable (regresi\xF3n univariada)</h4><p class="tabla-sub" data-v-616ff91a>\xBFLa direcci\xF3n predicha por el modelo se sostiene con datos reales? Cada variable se analiza por separado (n=${ssrInterpolate(__props.metricas.n)}).</p><div class="tabla-scroll" data-v-616ff91a><table class="tabla" data-v-616ff91a><thead data-v-616ff91a><tr data-v-616ff91a><th data-v-616ff91a>Variable</th><th data-v-616ff91a>Pendiente</th><th data-v-616ff91a>R\xB2</th><th data-v-616ff91a>p-valor</th><th data-v-616ff91a>Direcci\xF3n</th></tr></thead><tbody data-v-616ff91a><!--[-->`);
      ssrRenderList(__props.metricas.confirmacion_direccional, (row) => {
        _push(`<tr class="${ssrRenderClass({ "row-ok": row.direccion_confirmada, "row-warn": !row.direccion_confirmada })}" data-v-616ff91a><td class="var-name" data-v-616ff91a>${ssrInterpolate(formatVar(row.variable))}</td><td class="mono" data-v-616ff91a>${ssrInterpolate(row.pendiente >= 0 ? "+" : "")}${ssrInterpolate(row.pendiente)}</td><td class="mono" data-v-616ff91a>${ssrInterpolate(row.r2)}</td><td class="${ssrRenderClass([pClass(row.p_valor), "mono"])}" data-v-616ff91a>${ssrInterpolate(row.p_valor)}</td><td data-v-616ff91a><span class="${ssrRenderClass([row.direccion_confirmada ? "dir-ok" : "dir-fail", "dir-badge"])}" data-v-616ff91a>${ssrInterpolate(row.direccion_confirmada ? "\u2713 Confirmada" : "\u2717 No confirmada")}</span></td></tr>`);
      });
      _push(`<!--]--></tbody></table></div><p class="tabla-note" data-v-616ff91a> p &lt; 0.05 se considera estad\xEDsticamente significativo para n \u2248 30\u201350. La direcci\xF3n se confirma si la pendiente tiene el signo esperado seg\xFAn la hip\xF3tesis del modelo. </p></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AnalisisAgregadoPanel.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-616ff91a"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "validacion",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Validaci\xF3n Emp\xEDrica \u2014 Simu-Cognition"
    });
    const TABS = [
      { key: "registrar", label: "Registrar Estudiante", icon: "\u{1F4CB}" },
      { key: "resultado", label: "Registrar Quiz", icon: "\u270F\uFE0F" },
      { key: "comparacion", label: "Comparaci\xF3n", icon: "\u{1F4CA}" },
      { key: "analisis", label: "An\xE1lisis Agregado", icon: "\u{1F52C}" }
    ];
    const activeTab = ref("registrar");
    const materias = ref([]);
    const materiaActivaId = ref("");
    const copied = ref(false);
    const publicSurveyUrl = computed(() => {
      return "/encuesta";
    });
    const evaluaciones = ref([]);
    const evaluacionesDeMateriaActiva = computed(() => evaluaciones.value);
    const toastRegistrado = ref("");
    function onEvaluacionCreada(ev) {
      const ev_ = ev;
      evaluaciones.value.unshift({ ...ev_, resultados: [], comparacion: null });
      toastRegistrado.value = ev_.codigoAnonimo;
      setTimeout(() => {
        toastRegistrado.value = "";
      }, 3500);
    }
    const evaluacionSeleccionadaId = ref("");
    const evaluacionSeleccionada = computed(
      () => evaluaciones.value.find((e) => e.id === evaluacionSeleccionadaId.value) || null
    );
    function onResultadoGuardado(res) {
      const ev = evaluaciones.value.find((e) => e.id === evaluacionSeleccionadaId.value);
      if (!ev) return;
      const r = res;
      const idx = ev.resultados.findIndex((x) => x.momento === r.momento);
      if (idx >= 0) {
        ev.resultados[idx] = r;
      } else {
        ev.resultados.push(r);
      }
    }
    const evaluacionComparacionId = ref("");
    const comparandoLoading = ref(false);
    const comparacionError = ref("");
    const comparacionActual = ref(null);
    const analisisLoading = ref(false);
    const analisisError = ref("");
    const analisisMensaje = ref("");
    const analisisMetricas = ref(null);
    function formatFecha(iso) {
      try {
        return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
      } catch {
        return iso;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_EvaluacionForm = __nuxt_component_0;
      const _component_QuizResultadoForm = __nuxt_component_1;
      const _component_ComparacionChart = __nuxt_component_2;
      const _component_RecomendacionCard = __nuxt_component_3;
      const _component_AnalisisAgregadoPanel = __nuxt_component_4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "page-validacion" }, _attrs))} data-v-24d5ffc0><head data-v-24d5ffc0><title data-v-24d5ffc0>Validaci\xF3n Emp\xEDrica \u2014 Simu-Cognition</title><meta name="description" content="M\xF3dulo de validaci\xF3n emp\xEDrica: registra estudiantes, resultados de quiz y compara contra las predicciones del simulador para el paper cient\xEDfico." data-v-24d5ffc0></head><div class="page-hero" data-v-24d5ffc0><div data-v-24d5ffc0><div class="hero-badge" data-v-24d5ffc0>M\xF3dulo v4.0</div><h1 class="hero-title" data-v-24d5ffc0>Validaci\xF3n Emp\xEDrica</h1><p class="hero-sub" data-v-24d5ffc0> Recolect\xE1 datos reales de estudiantes, compar\xE1 contra las predicciones del simulador y export\xE1 el dataset para el paper. </p></div><div class="materia-selector-wrap" data-v-24d5ffc0><label class="sel-label" for="materia-global" data-v-24d5ffc0>Materia activa</label><select id="materia-global" class="form-select" data-v-24d5ffc0><option value="" disabled data-v-24d5ffc0${ssrIncludeBooleanAttr(Array.isArray(materiaActivaId.value) ? ssrLooseContain(materiaActivaId.value, "") : ssrLooseEqual(materiaActivaId.value, "")) ? " selected" : ""}>Seleccionar materia\u2026</option><!--[-->`);
      ssrRenderList(materias.value, (m) => {
        _push(`<option${ssrRenderAttr("value", m.id)} data-v-24d5ffc0${ssrIncludeBooleanAttr(Array.isArray(materiaActivaId.value) ? ssrLooseContain(materiaActivaId.value, m.id) : ssrLooseEqual(materiaActivaId.value, m.id)) ? " selected" : ""}>${ssrInterpolate(m.nombre)}</option>`);
      });
      _push(`<!--]--></select></div></div><div class="tabs-wrap" data-v-24d5ffc0><!--[-->`);
      ssrRenderList(TABS, (tab) => {
        _push(`<button${ssrRenderAttr("id", `tab-${tab.key}`)} type="button" class="${ssrRenderClass([{ active: activeTab.value === tab.key }, "tab-btn"])}" data-v-24d5ffc0><span class="tab-icon" data-v-24d5ffc0>${ssrInterpolate(tab.icon)}</span> ${ssrInterpolate(tab.label)}</button>`);
      });
      _push(`<!--]--></div>`);
      if (activeTab.value === "registrar") {
        _push(`<section class="tab-content" data-v-24d5ffc0><div class="section-intro" data-v-24d5ffc0><h2 class="section-h2" data-v-24d5ffc0>Registrar nuevo estudiante</h2><p class="section-p" data-v-24d5ffc0>Complet\xE1 la ficha del docente y el cuestionario del estudiante antes de aplicar el quiz inicial (D\xEDa 0).</p></div><div class="public-survey-box" data-v-24d5ffc0><div class="survey-box-left" data-v-24d5ffc0><span class="survey-badge" data-v-24d5ffc0>\u{1F4F1} Encuesta para Alumnos</span><p class="survey-desc" data-v-24d5ffc0> \xBFQuer\xE9s que tus estudiantes respondan directamente desde sus tel\xE9fonos o computadoras? </p><code class="survey-url" data-v-24d5ffc0>${ssrInterpolate(publicSurveyUrl.value)}</code></div><button type="button" class="btn-copy-link" data-v-24d5ffc0>${ssrInterpolate(copied.value ? "\xA1Copiado!" : "Copiar Enlace")}</button></div>`);
        _push(ssrRenderComponent(_component_EvaluacionForm, {
          materias: materias.value,
          "initial-materia-id": materiaActivaId.value,
          onCreated: onEvaluacionCreada
        }, null, _parent));
        if (toastRegistrado.value) {
          _push(`<div class="toast toast-ok" data-v-24d5ffc0> \u2713 Estudiante <strong data-v-24d5ffc0>${ssrInterpolate(toastRegistrado.value)}</strong> registrado correctamente. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "resultado") {
        _push(`<section class="tab-content" data-v-24d5ffc0><div class="section-intro" data-v-24d5ffc0><h2 class="section-h2" data-v-24d5ffc0>Registrar resultado de quiz</h2><p class="section-p" data-v-24d5ffc0>Seleccion\xE1 un estudiante y registr\xE1 la nota del quiz para el momento correspondiente.</p></div><div class="eval-selector card" data-v-24d5ffc0><label class="sel-label" for="eval-select" data-v-24d5ffc0>Estudiante</label><select id="eval-select" class="form-select" data-v-24d5ffc0><option value="" disabled data-v-24d5ffc0${ssrIncludeBooleanAttr(Array.isArray(evaluacionSeleccionadaId.value) ? ssrLooseContain(evaluacionSeleccionadaId.value, "") : ssrLooseEqual(evaluacionSeleccionadaId.value, "")) ? " selected" : ""}>Seleccionar estudiante\u2026</option><!--[-->`);
        ssrRenderList(evaluacionesDeMateriaActiva.value, (e) => {
          _push(`<option${ssrRenderAttr("value", e.id)} data-v-24d5ffc0${ssrIncludeBooleanAttr(Array.isArray(evaluacionSeleccionadaId.value) ? ssrLooseContain(evaluacionSeleccionadaId.value, e.id) : ssrLooseEqual(evaluacionSeleccionadaId.value, e.id)) ? " selected" : ""}>${ssrInterpolate(e.codigoAnonimo)} (Creado: ${ssrInterpolate(formatFecha(e.creadaEn))}) </option>`);
        });
        _push(`<!--]--></select>`);
        if (!materiaActivaId.value) {
          _push(`<p class="sel-hint" data-v-24d5ffc0>Seleccion\xE1 una materia arriba primero.</p>`);
        } else if (evaluacionesDeMateriaActiva.value.length === 0) {
          _push(`<p class="sel-hint" data-v-24d5ffc0> No hay estudiantes registrados para esta materia a\xFAn. </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (evaluacionSeleccionada.value) {
          _push(ssrRenderComponent(_component_QuizResultadoForm, {
            evaluacion: evaluacionSeleccionada.value,
            "resultados-existentes": evaluacionSeleccionada.value.resultados || [],
            onSaved: onResultadoGuardado
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "comparacion") {
        _push(`<section class="tab-content" data-v-24d5ffc0><div class="section-intro" data-v-24d5ffc0><h2 class="section-h2" data-v-24d5ffc0>Comparaci\xF3n individual</h2><p class="section-p" data-v-24d5ffc0>Genera la comparaci\xF3n predicha vs real para un estudiante. Requiere que el resultado INICIAL est\xE9 registrado.</p></div><div class="eval-selector card" data-v-24d5ffc0><label class="sel-label" for="eval-comparar-select" data-v-24d5ffc0>Estudiante</label><div class="comparar-row" data-v-24d5ffc0><select id="eval-comparar-select" class="form-select" data-v-24d5ffc0><option value="" disabled data-v-24d5ffc0${ssrIncludeBooleanAttr(Array.isArray(evaluacionComparacionId.value) ? ssrLooseContain(evaluacionComparacionId.value, "") : ssrLooseEqual(evaluacionComparacionId.value, "")) ? " selected" : ""}>Seleccionar estudiante\u2026</option><!--[-->`);
        ssrRenderList(evaluacionesDeMateriaActiva.value, (e) => {
          _push(`<option${ssrRenderAttr("value", e.id)} data-v-24d5ffc0${ssrIncludeBooleanAttr(Array.isArray(evaluacionComparacionId.value) ? ssrLooseContain(evaluacionComparacionId.value, e.id) : ssrLooseEqual(evaluacionComparacionId.value, e.id)) ? " selected" : ""}>${ssrInterpolate(e.codigoAnonimo)}</option>`);
        });
        _push(`<!--]--></select><button id="btn-generar-comparacion" type="button" class="btn-primary"${ssrIncludeBooleanAttr(!evaluacionComparacionId.value || comparandoLoading.value) ? " disabled" : ""} data-v-24d5ffc0>`);
        if (comparandoLoading.value) {
          _push(`<span class="spinner-sm" data-v-24d5ffc0></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(comparandoLoading.value ? "Calculando\u2026" : "Generar Comparaci\xF3n")}</button></div>`);
        if (comparacionError.value) {
          _push(`<p class="form-error" data-v-24d5ffc0>${ssrInterpolate(comparacionError.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (comparacionActual.value) {
          _push(`<!--[-->`);
          _push(ssrRenderComponent(_component_ComparacionChart, {
            "calificacion-predicha": comparacionActual.value.comparacion.calificacionPredicha,
            "calificacion-real": comparacionActual.value.comparacion.calificacionReal,
            "error-absoluto": comparacionActual.value.comparacion.errorAbsoluto,
            "curva-olvido-predicha": comparacionActual.value.curva_olvido_predicha,
            "puntos-olvido-reales": comparacionActual.value.puntos_olvido_reales,
            "delta-retencion-promedio": comparacionActual.value.delta_retencion_promedio
          }, null, _parent));
          _push(ssrRenderComponent(_component_RecomendacionCard, {
            "codigo-anonimo": comparacionActual.value.codigoAnonimo,
            "recomendacion-texto": comparacionActual.value.recomendacion,
            "error-absoluto": comparacionActual.value.comparacion.errorAbsoluto,
            "delta-retencion-promedio": comparacionActual.value.delta_retencion_promedio,
            "calidad-estudio": comparacionActual.value.calidadEstudio,
            "generada-en": comparacionActual.value.comparacion.generadaEn
          }, null, _parent));
          _push(`<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "analisis") {
        _push(`<section class="tab-content" data-v-24d5ffc0><div class="section-intro" data-v-24d5ffc0><h2 class="section-h2" data-v-24d5ffc0>An\xE1lisis estad\xEDstico del grupo</h2><p class="section-p" data-v-24d5ffc0>MAE, RMSE, Pearson r, Spearman \u03C1 y confirmaci\xF3n direccional por variable. Requiere al menos 2 estudiantes con comparaci\xF3n calculada.</p></div><div class="refresh-row" data-v-24d5ffc0><button id="btn-cargar-analisis" type="button" class="btn-secondary"${ssrIncludeBooleanAttr(!materiaActivaId.value || analisisLoading.value) ? " disabled" : ""} data-v-24d5ffc0>`);
        if (analisisLoading.value) {
          _push(`<span class="spinner-sm" data-v-24d5ffc0></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(analisisLoading.value ? "Calculando\u2026" : "\u21BA Calcular m\xE9tricas")}</button>`);
        if (analisisError.value) {
          _push(`<p class="form-error" data-v-24d5ffc0>${ssrInterpolate(analisisError.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (analisisMensaje.value) {
          _push(`<p class="analisis-msg" data-v-24d5ffc0>${ssrInterpolate(analisisMensaje.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (analisisMetricas.value) {
          _push(ssrRenderComponent(_component_AnalisisAgregadoPanel, {
            metricas: analisisMetricas.value,
            "materia-id": materiaActivaId.value
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard/validacion.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const validacion = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-24d5ffc0"]]);

export { validacion as default };
//# sourceMappingURL=validacion-Cye2076Q.mjs.map
