import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import { _ as _export_sfc, b as useRoute } from './server.mjs';
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
  __name: "encuesta",
  __ssrInlineRender: true,
  setup(__props) {
    useRoute();
    const LIKERT_ITEMS = [
      "Elabor\xE9 res\xFAmenes, esquemas o mapas conceptuales con mis propias palabras.",
      "Practiqu\xE9 recordar el contenido activamente sin mirar el material (active recall).",
      "Espaci\xE9 mis sesiones de estudio en vez de estudiar todo de una sentada.",
      "Me autoevalu\xE9 con preguntas o ejercicios de prueba antes de la prueba.",
      "Estudi\xE9 en un ambiente sin distracciones (lejos de celular y redes sociales)."
    ];
    const DIF_LABELS = ["Muy F\xE1cil", "F\xE1cil", "Moderado", "Dif\xEDcil", "Muy Dif\xEDcil"];
    const materias = ref([]);
    const loadingMaterias = ref(true);
    const submitting = ref(false);
    const submitted = ref(false);
    const createdCodigo = ref("");
    const errorMsg = ref("");
    const likertValues = ref([0, 0, 0, 0, 0]);
    const form = ref({
      materiaId: "",
      tipoMateriaDocente: "MIXTA",
      dificultadDocente: 3,
      codigoAnonimo: "",
      horasEstudio: 2,
      repasosPrevios: 0,
      dificultadPercibida: 0
    });
    function formatTipo(tipo) {
      if (tipo === "LOGICO_MATEMATICA") return "L\xF3gico-Matem\xE1tica";
      if (tipo === "MEMORISTICA") return "Memor\xEDstica";
      return "Mixta";
    }
    const calidadEstudioCalc = computed(() => {
      const answered = likertValues.value.filter((v) => v > 0);
      if (answered.length === 0) return 0;
      const sum = answered.reduce((a, b) => a + b, 0);
      return sum / (answered.length * 5);
    });
    const isFormValid = computed(() => {
      return form.value.materiaId && form.value.horasEstudio >= 0.5 && form.value.dificultadPercibida > 0 && likertValues.value.every((v) => v > 0);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "encuesta-page" }, _attrs))} data-v-f632cc07><head data-v-f632cc07><title data-v-f632cc07>Cuestionario de H\xE1bitos de Estudio \u2014 Simu-Cognition</title><meta name="description" content="Encuesta an\xF3nima para evaluar h\xE1bitos de estudio y calibrar curvas cognitivas de aprendizaje." data-v-f632cc07></head><header class="encuesta-header" data-v-f632cc07><div class="header-content" data-v-f632cc07><span class="badge-pill" data-v-f632cc07>Participaci\xF3n An\xF3nima</span><h1 class="page-title" data-v-f632cc07>Cuestionario de H\xE1bitos de Estudio</h1><p class="page-subtitle" data-v-f632cc07> Tus respuestas ayudar\xE1n a modelar curvas de retenci\xF3n y optimizar los tiempos de repaso. Esta encuesta es 100% an\xF3nima. </p></div></header><main class="encuesta-container" data-v-f632cc07>`);
      if (unref(loadingMaterias)) {
        _push(`<div class="card card-loading" data-v-f632cc07><div class="spinner" data-v-f632cc07></div><p data-v-f632cc07>Cargando materias disponibles...</p></div>`);
      } else if (unref(submitted)) {
        _push(`<div class="card success-card" data-v-f632cc07><div class="success-icon" data-v-f632cc07>\u2713</div><h2 class="success-title" data-v-f632cc07>\xA1Cuestionario Completado con \xC9xito!</h2><p class="success-desc" data-v-f632cc07> Muchas gracias por tu tiempo. Tu aporte ha sido registrado en la base de datos de investigaci\xF3n. </p><div class="anon-code-box" data-v-f632cc07><span class="anon-code-label" data-v-f632cc07>Tu c\xF3digo de participante:</span><strong class="anon-code-val" data-v-f632cc07>${ssrInterpolate(unref(createdCodigo))}</strong><span class="anon-code-hint" data-v-f632cc07>Guard\xE1 este c\xF3digo si tu docente te lo solicita para registrar tus notas de quiz.</span></div><button type="button" class="btn-primary" data-v-f632cc07> Responder otro cuestionario </button></div>`);
      } else {
        _push(`<form class="card form-card" data-v-f632cc07><section class="form-group" data-v-f632cc07><label class="field-label" for="materia-select" data-v-f632cc07><span class="step-num" data-v-f632cc07>1</span> \xBFEn qu\xE9 materia o tema est\xE1s participando? </label>`);
        if (unref(materias).length === 0) {
          _push(`<div class="alert alert-warning" data-v-f632cc07> No se encontraron materias registradas a\xFAn. Si eres docente, crea al menos una materia en el panel o ejecuta el seed. </div>`);
        } else {
          _push(`<select id="materia-select" class="form-select" required data-v-f632cc07><option value="" disabled data-v-f632cc07${ssrIncludeBooleanAttr(Array.isArray(unref(form).materiaId) ? ssrLooseContain(unref(form).materiaId, "") : ssrLooseEqual(unref(form).materiaId, "")) ? " selected" : ""}>Selecciona tu materia...</option><!--[-->`);
          ssrRenderList(unref(materias), (m) => {
            _push(`<option${ssrRenderAttr("value", m.id)} data-v-f632cc07${ssrIncludeBooleanAttr(Array.isArray(unref(form).materiaId) ? ssrLooseContain(unref(form).materiaId, m.id) : ssrLooseEqual(unref(form).materiaId, m.id)) ? " selected" : ""}>${ssrInterpolate(m.nombre)} (${ssrInterpolate(formatTipo(m.tipo))}) </option>`);
          });
          _push(`<!--]--></select>`);
        }
        _push(`</section><section class="form-group" data-v-f632cc07><label class="field-label" for="codigo-anonimo" data-v-f632cc07><span class="step-num" data-v-f632cc07>2</span> C\xF3digo o identificador asignado (opcional) </label><input id="codigo-anonimo"${ssrRenderAttr("value", unref(form).codigoAnonimo)} type="text" class="form-input" placeholder="Ej. EST-012 (si te dieron uno, o d\xE9jalo vac\xEDo para autogenerar)" data-v-f632cc07><span class="field-hint" data-v-f632cc07>Si tu docente te asign\xF3 un c\xF3digo espec\xEDfico, ingr\xE9salo aqu\xED. Si no, d\xE9jalo en blanco.</span></section><section class="form-group" data-v-f632cc07><label class="field-label" data-v-f632cc07><span class="step-num" data-v-f632cc07>3</span> Tiempo dedicado y repasos </label><div class="grid-2" data-v-f632cc07><div class="sub-field" data-v-f632cc07><label class="sub-label" for="horas-estudio" data-v-f632cc07> Horas de estudio dedicadas: <strong class="accent-val" data-v-f632cc07>${ssrInterpolate(unref(form).horasEstudio)}h</strong></label><input id="horas-estudio"${ssrRenderAttr("value", unref(form).horasEstudio)} type="range" min="0.5" max="10" step="0.5" class="form-range" data-v-f632cc07><div class="range-labels" data-v-f632cc07><span data-v-f632cc07>0.5h</span><span data-v-f632cc07>5h</span><span data-v-f632cc07>10h</span></div></div><div class="sub-field" data-v-f632cc07><label class="sub-label" data-v-f632cc07> Repasos previos realizados: <strong class="accent-val" data-v-f632cc07>${ssrInterpolate(unref(form).repasosPrevios)}</strong></label><div class="pill-group" data-v-f632cc07><!--[-->`);
        ssrRenderList([0, 1, 2, 3, 4, 5], (r) => {
          _push(`<button type="button" class="${ssrRenderClass([{ active: unref(form).repasosPrevios === r }, "pill-btn"])}" data-v-f632cc07>${ssrInterpolate(r)}</button>`);
        });
        _push(`<!--]--></div></div></div></section><section class="form-group" data-v-f632cc07><label class="field-label" data-v-f632cc07><span class="step-num" data-v-f632cc07>4</span> T\xE9cnicas de estudio activo aplicadas <span class="field-sub" data-v-f632cc07>Indica qu\xE9 tan frecuente aplicaste cada t\xE9cnica (1 = Nunca, 5 = Siempre)</span></label><div class="likert-list" data-v-f632cc07><!--[-->`);
        ssrRenderList(LIKERT_ITEMS, (item, idx) => {
          _push(`<div class="likert-card" data-v-f632cc07><div class="likert-desc" data-v-f632cc07>${ssrInterpolate(item)}</div><div class="rating-buttons" data-v-f632cc07><!--[-->`);
          ssrRenderList(5, (val) => {
            _push(`<button type="button" class="${ssrRenderClass([{ selected: unref(likertValues)[idx] === val }, "rate-btn"])}" data-v-f632cc07>${ssrInterpolate(val)}</button>`);
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]--></div><div class="calidad-banner" data-v-f632cc07><div class="calidad-info" data-v-f632cc07><span data-v-f632cc07>\xCDndice de Calidad de Estudio Calculado:</span><strong data-v-f632cc07>${ssrInterpolate((unref(calidadEstudioCalc) * 100).toFixed(0))}% (${ssrInterpolate(unref(calidadEstudioCalc).toFixed(2))})</strong></div><div class="progress-track" data-v-f632cc07><div class="progress-bar" style="${ssrRenderStyle({ width: `${unref(calidadEstudioCalc) * 100}%` })}" data-v-f632cc07></div></div></div></section><section class="form-group" data-v-f632cc07><label class="field-label" data-v-f632cc07><span class="step-num" data-v-f632cc07>5</span> \xBFQu\xE9 tan dif\xEDcil te pareci\xF3 este tema? </label><div class="rating-row-full" data-v-f632cc07><!--[-->`);
        ssrRenderList([1, 2, 3, 4, 5], (d) => {
          _push(`<button type="button" class="${ssrRenderClass([{ active: unref(form).dificultadPercibida === d }, "difficulty-btn"])}" data-v-f632cc07><span class="dif-num" data-v-f632cc07>${ssrInterpolate(d)}</span><span class="dif-desc" data-v-f632cc07>${ssrInterpolate(DIF_LABELS[d - 1])}</span></button>`);
        });
        _push(`<!--]--></div></section>`);
        if (unref(errorMsg)) {
          _push(`<div class="alert alert-danger" data-v-f632cc07>${ssrInterpolate(unref(errorMsg))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="form-actions" data-v-f632cc07><button type="submit" class="btn-primary btn-submit"${ssrIncludeBooleanAttr(!unref(isFormValid) || unref(submitting)) ? " disabled" : ""} data-v-f632cc07>`);
        if (unref(submitting)) {
          _push(`<span class="spinner-sm" data-v-f632cc07></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(submitting) ? "Enviando respuestas..." : "Enviar Respuestas")}</button><p class="terms-note" data-v-f632cc07> Al enviar este formulario aceptas que tus respuestas an\xF3nimas se utilicen con fines acad\xE9micos y de investigaci\xF3n. </p></div></form>`);
      }
      _push(`</main></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/encuesta.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const encuesta = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f632cc07"]]);

export { encuesta as default };
//# sourceMappingURL=encuesta-_stiHIUD.mjs.map
