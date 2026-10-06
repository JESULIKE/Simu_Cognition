import { defineComponent, ref, computed, watch, mergeProps, unref, shallowRef, shallowReadonly, toValue, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrLooseEqual } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
import { Chart, Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, Filler } from 'chart.js';
import { Line } from 'vue-chartjs';
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

const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "NuevaMateriaModal",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: Boolean }
  },
  emits: ["update:modelValue", "creada"],
  setup(__props, { emit: __emit }) {
    const nombre = ref("");
    const tipo = ref("MIXTA");
    const guardando = ref(false);
    const error = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.modelValue) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "modal-backdrop" }, _attrs))} data-v-937ba8a7><div class="modal-card card animate-fade-in" data-v-937ba8a7><div class="modal-header" data-v-937ba8a7><div data-v-937ba8a7><h2 class="modal-title" data-v-937ba8a7>Nueva Materia</h2><p class="modal-subtitle" data-v-937ba8a7>Configura los par\xE1metros cognitivos de la asignatura para calibrar el modelo ML</p></div><button class="btn btn-ghost btn-icon close-btn" aria-label="Cerrar" data-v-937ba8a7> \u2715 </button></div><form class="modal-body" data-v-937ba8a7><div class="form-group" data-v-937ba8a7><label class="form-label" for="materia-nombre" data-v-937ba8a7>Nombre de la Materia</label><input id="materia-nombre"${ssrRenderAttr("value", nombre.value)} type="text" class="input" placeholder="Ej. C\xE1lculo Multivariable, Anatom\xEDa Humana, etc." required${ssrIncludeBooleanAttr(guardando.value) ? " disabled" : ""} data-v-937ba8a7></div><div class="form-group" data-v-937ba8a7><label class="form-label" data-v-937ba8a7>Perfil de Aprendizaje de la Materia</label><div class="tipo-cards" data-v-937ba8a7><label class="${ssrRenderClass([{ "tipo-card--active": tipo.value === "MEMORISTICA" }, "tipo-card"])}" data-v-937ba8a7><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(tipo.value, "MEMORISTICA")) ? " checked" : ""} value="MEMORISTICA" class="sr-only" data-v-937ba8a7><div class="tipo-badge badge-memoristica" data-v-937ba8a7>Memor\xEDstica</div><div class="tipo-title" data-v-937ba8a7>Alta Carga de Memoria</div><p class="tipo-desc" data-v-937ba8a7> Crecimiento r\xE1pido con pocas horas de estudio, pero decaimiento acelerado (olvido r\xE1pido) sin repaso continuo. </p><span class="tipo-examples" data-v-937ba8a7>Ej: Vocabulario, Historia, Anatom\xEDa</span></label><label class="${ssrRenderClass([{ "tipo-card--active": tipo.value === "LOGICO_MATEMATICA" }, "tipo-card"])}" data-v-937ba8a7><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(tipo.value, "LOGICO_MATEMATICA")) ? " checked" : ""} value="LOGICO_MATEMATICA" class="sr-only" data-v-937ba8a7><div class="tipo-badge badge-logico" data-v-937ba8a7>L\xF3gico-Matem\xE1tica</div><div class="tipo-title" data-v-937ba8a7>Razonamiento Estructural</div><p class="tipo-desc" data-v-937ba8a7> Curva inicial con pendiente m\xE1s suave; retenci\xF3n estructural m\xE1s duradera una vez consolidado el concepto. </p><span class="tipo-examples" data-v-937ba8a7>Ej: C\xE1lculo, F\xEDsica, Algoritmos</span></label><label class="${ssrRenderClass([{ "tipo-card--active": tipo.value === "MIXTA" }, "tipo-card"])}" data-v-937ba8a7><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(tipo.value, "MIXTA")) ? " checked" : ""} value="MIXTA" class="sr-only" data-v-937ba8a7><div class="tipo-badge badge-mixta" data-v-937ba8a7>Mixta</div><div class="tipo-title" data-v-937ba8a7>Conceptual y Aplicada</div><p class="tipo-desc" data-v-937ba8a7> Equilibrio entre adquisici\xF3n conceptual y deducci\xF3n anal\xEDtica. Tasa de retenci\xF3n intermedia. </p><span class="tipo-examples" data-v-937ba8a7>Ej: Qu\xEDmica Org\xE1nica, Econom\xEDa, Medicina</span></label></div></div>`);
        if (error.value) {
          _push(`<div class="error-banner" data-v-937ba8a7>${ssrInterpolate(error.value)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="modal-footer" data-v-937ba8a7><button type="button" class="btn btn-ghost"${ssrIncludeBooleanAttr(guardando.value) ? " disabled" : ""} data-v-937ba8a7> Cancelar </button><button type="submit" class="btn btn-primary"${ssrIncludeBooleanAttr(guardando.value || !nombre.value.trim()) ? " disabled" : ""} data-v-937ba8a7>`);
        if (guardando.value) {
          _push(`<span class="spinner-sm" data-v-937ba8a7></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span data-v-937ba8a7>${ssrInterpolate(guardando.value ? "Creando..." : "Crear Asignatura")}</span></button></div></form></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/NuevaMateriaModal.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_5 = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-937ba8a7"]]);
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "MateriaSelector",
  __ssrInlineRender: true,
  props: {
    materias: {},
    modelValue: {}
  },
  emits: ["update:modelValue", "recargar"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const showModal = ref(false);
    const selectedMateria = computed(
      () => props.materias.find((m) => m.id === props.modelValue)
    );
    function formatTipo(tipo) {
      switch (tipo) {
        case "MEMORISTICA":
          return "Memor\xEDstica";
        case "LOGICO_MATEMATICA":
          return "L\xF3gico-Matem\xE1tica";
        case "MIXTA":
          return "Mixta";
        default:
          return tipo;
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
          return "badge-default";
      }
    }
    function getTipoHint(tipo) {
      switch (tipo) {
        case "MEMORISTICA":
          return "Curva empinada \u2022 Olvido acelerado sin repasos frecuentes";
        case "LOGICO_MATEMATICA":
          return "Curva gradual \u2022 Alta retenci\xF3n estructural a largo plazo";
        case "MIXTA":
          return "Curva balanceada \u2022 Requiere combinaci\xF3n de pr\xE1ctica y teor\xEDa";
        default:
          return "";
      }
    }
    function handleMateriaCreada(nueva) {
      emit("recargar");
      emit("update:modelValue", nueva.id);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuevaMateriaModal = __nuxt_component_5;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "materia-selector-wrapper" }, _attrs))} data-v-f3e9c204><div class="selector-header" data-v-f3e9c204><div class="selector-label" data-v-f3e9c204><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-f3e9c204><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" data-v-f3e9c204></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" data-v-f3e9c204></path></svg><span data-v-f3e9c204>Asignatura activa</span></div><button class="btn btn-ghost btn-sm new-btn" data-v-f3e9c204><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-f3e9c204><line x1="12" y1="5" x2="12" y2="19" data-v-f3e9c204></line><line x1="5" y1="12" x2="19" y2="12" data-v-f3e9c204></line></svg><span data-v-f3e9c204>Nueva</span></button></div>`);
      if (__props.materias.length > 0) {
        _push(`<div class="selector-body" data-v-f3e9c204><div class="select-container" data-v-f3e9c204><select${ssrRenderAttr("value", __props.modelValue)} class="materia-select" data-v-f3e9c204><!--[-->`);
        ssrRenderList(__props.materias, (mat) => {
          _push(`<option${ssrRenderAttr("value", mat.id)} data-v-f3e9c204>${ssrInterpolate(mat.nombre)} (${ssrInterpolate(formatTipo(mat.tipo))}) </option>`);
        });
        _push(`<!--]--></select><div class="select-chevron" data-v-f3e9c204><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-f3e9c204><polyline points="6 9 12 15 18 9" data-v-f3e9c204></polyline></svg></div></div>`);
        if (selectedMateria.value) {
          _push(`<div class="materia-tag-badge" data-v-f3e9c204><span class="${ssrRenderClass([getBadgeClass(selectedMateria.value.tipo), "badge"])}" data-v-f3e9c204>${ssrInterpolate(formatTipo(selectedMateria.value.tipo))}</span><span class="materia-hint" data-v-f3e9c204>${ssrInterpolate(getTipoHint(selectedMateria.value.tipo))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="empty-materias" data-v-f3e9c204><p class="empty-text" data-v-f3e9c204>No tienes asignaturas registradas</p><button class="btn btn-primary btn-sm" data-v-f3e9c204> Crear tu primera materia </button></div>`);
      }
      _push(ssrRenderComponent(_component_NuevaMateriaModal, {
        modelValue: showModal.value,
        "onUpdate:modelValue": ($event) => showModal.value = $event,
        onCreada: handleMateriaCreada
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MateriaSelector.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-f3e9c204"]]);
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "SliderPanel",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    loading: { type: Boolean }
  },
  emits: ["update:modelValue", "change"],
  setup(__props, { emit: __emit }) {
    const activePreset = ref("promedio");
    function getDificultadLabel(dif) {
      switch (dif) {
        case 1:
          return "Introductoria / Conceptos fundamentales";
        case 2:
          return "B\xE1sica con aplicaciones sencillas";
        case 3:
          return "Nivel medio universitario";
        case 4:
          return "Avanzada / Alta abstracci\xF3n";
        case 5:
          return "Alta complejidad / M\xFAltiples variables";
        default:
          return "";
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "slider-panel card" }, _attrs))} data-v-49df4080><div class="panel-header" data-v-49df4080><div data-v-49df4080><h3 class="panel-title" data-v-49df4080>Variables de la Simulaci\xF3n</h3><p class="panel-subtitle" data-v-49df4080>Ajusta los factores pedag\xF3gicos del estudiante o cohorte</p></div><button class="btn btn-ghost btn-sm reset-btn" title="Restablecer valores por defecto" data-v-49df4080><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-49df4080><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" data-v-49df4080></path><path d="M3 3v5h5" data-v-49df4080></path></svg><span data-v-49df4080>Reset</span></button></div><div class="presets-row" data-v-49df4080><span class="presets-label" data-v-49df4080>Escenarios:</span><button class="${ssrRenderClass([{ "preset-chip--active": activePreset.value === "promedio" }, "preset-chip"])}" data-v-49df4080> Estudiante Promedio </button><button class="${ssrRenderClass([{ "preset-chip--active": activePreset.value === "intensivo" }, "preset-chip"])}" data-v-49df4080> Pre-Examen Intensivo </button><button class="${ssrRenderClass([{ "preset-chip--active": activePreset.value === "inicio" }, "preset-chip"])}" data-v-49df4080> Inicio de Curso </button></div><div class="sliders-list" data-v-49df4080><div class="slider-group" data-v-49df4080><div class="slider-meta" data-v-49df4080><div class="slider-title-box" data-v-49df4080><span class="slider-name" data-v-49df4080>Horas de Estudio</span><span class="slider-hint" data-v-49df4080>Tiempo total dedicado a la sesi\xF3n</span></div><span class="slider-value-badge badge-blue" data-v-49df4080>${ssrInterpolate(__props.modelValue.horas_estudio)} hrs</span></div><input type="range" min="0.5" max="10" step="0.5"${ssrRenderAttr("value", __props.modelValue.horas_estudio)} class="range-slider range-blue" data-v-49df4080><div class="slider-ticks" data-v-49df4080><span data-v-49df4080>0.5h (M\xEDn)</span><span data-v-49df4080>5h</span><span data-v-49df4080>10h (M\xE1x)</span></div></div><div class="slider-group" data-v-49df4080><div class="slider-meta" data-v-49df4080><div class="slider-title-box" data-v-49df4080><span class="slider-name" data-v-49df4080>Dificultad de la Materia</span><span class="slider-hint" data-v-49df4080>${ssrInterpolate(getDificultadLabel(__props.modelValue.dificultad))}</span></div><span class="slider-value-badge badge-purple" data-v-49df4080>Nivel ${ssrInterpolate(__props.modelValue.dificultad)} / 5</span></div><input type="range" min="1" max="5" step="1"${ssrRenderAttr("value", __props.modelValue.dificultad)} class="range-slider range-purple" data-v-49df4080><div class="slider-ticks" data-v-49df4080><span data-v-49df4080>1 (F\xE1cil)</span><span data-v-49df4080>3 (Intermedio)</span><span data-v-49df4080>5 (Muy Complejo)</span></div></div><div class="slider-group" data-v-49df4080><div class="slider-meta" data-v-49df4080><div class="slider-title-box" data-v-49df4080><span class="slider-name" data-v-49df4080>Repasos Previos Realizados</span><span class="slider-hint" data-v-49df4080>Mitiga el factor de decaimiento en la curva de Ebbinghaus</span></div><span class="slider-value-badge badge-green" data-v-49df4080>${ssrInterpolate(__props.modelValue.repasos_previos)} repasos</span></div><input type="range" min="0" max="5" step="1"${ssrRenderAttr("value", __props.modelValue.repasos_previos)} class="range-slider range-green" data-v-49df4080><div class="slider-ticks" data-v-49df4080><span data-v-49df4080>0 (Primer contacto)</span><span data-v-49df4080>2 - 3</span><span data-v-49df4080>5 (Consolidado)</span></div></div><div class="slider-group" data-v-49df4080><div class="slider-meta" data-v-49df4080><div class="slider-title-box" data-v-49df4080><span class="slider-name" data-v-49df4080>Calidad / Foco de Estudio</span><span class="slider-hint" data-v-49df4080>Atenci\xF3n sostenida, t\xE9cnicas activas vs pasivas</span></div><span class="slider-value-badge badge-amber" data-v-49df4080>${ssrInterpolate(Math.round(__props.modelValue.calidad_estudio * 100))}%</span></div><input type="range" min="0.30" max="1.00" step="0.05"${ssrRenderAttr("value", __props.modelValue.calidad_estudio)} class="range-slider range-amber" data-v-49df4080><div class="slider-ticks" data-v-49df4080><span data-v-49df4080>30% (Distracci\xF3n)</span><span data-v-49df4080>70% (Est\xE1ndar)</span><span data-v-49df4080>100% (Foco Profundo)</span></div></div><div class="slider-group" data-v-49df4080><div class="slider-meta" data-v-49df4080><div class="slider-title-box" data-v-49df4080><span class="slider-name" data-v-49df4080>Umbral Cr\xEDtico de Retenci\xF3n</span><span class="slider-hint" data-v-49df4080>Punto en el cual se requiere repasar antes de olvidar</span></div><span class="slider-value-badge badge-teal" data-v-49df4080>${ssrInterpolate(Math.round(__props.modelValue.umbral_retencion * 100))}%</span></div><input type="range" min="0.50" max="0.95" step="0.05"${ssrRenderAttr("value", __props.modelValue.umbral_retencion)} class="range-slider range-teal" data-v-49df4080><div class="slider-ticks" data-v-49df4080><span data-v-49df4080>50% (M\xEDnimo)</span><span data-v-49df4080>70% (Recomendado)</span><span data-v-49df4080>95% (Exigente)</span></div></div></div><div class="panel-footer" data-v-49df4080><div class="status-indicator" data-v-49df4080><span class="${ssrRenderClass([{ "status-dot--loading": __props.loading }, "status-dot"])}" data-v-49df4080></span><span class="status-text" data-v-49df4080>${ssrInterpolate(__props.loading ? "Calculando predicci\xF3n ML..." : "Predicci\xF3n actualizada en tiempo real")}</span></div></div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SliderPanel.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-49df4080"]]);
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "SimulationSummary",
  __ssrInlineRender: true,
  props: {
    calificacionPredicha: {},
    diaRepasoOptimo: {},
    umbralRetencion: {},
    curvaOlvido: {},
    tipoMateria: {},
    horasEstudio: {},
    repasosPrevios: {},
    dificultad: {}
  },
  setup(__props) {
    const props = __props;
    const retencion7d = computed(() => {
      if (!props.curvaOlvido) return 0;
      const idx = props.curvaOlvido.x_dias.findIndex((d) => d === 7);
      if (idx !== -1) {
        const v = props.curvaOlvido.retencion[idx];
        return v <= 1 ? v * 100 : v;
      }
      return 0;
    });
    const retencion30d = computed(() => {
      if (!props.curvaOlvido) return 0;
      const idx = props.curvaOlvido.x_dias.findIndex((d) => d === 30);
      if (idx !== -1) {
        const v = props.curvaOlvido.retencion[idx];
        return v <= 1 ? v * 100 : v;
      }
      return 0;
    });
    const calificacionStatus = computed(() => {
      const c = props.calificacionPredicha;
      if (c >= 85) return "Sobresaliente";
      if (c >= 70) return "Notable";
      if (c >= 60) return "Aprobado";
      return "En Riesgo";
    });
    const calificacionBadgeClass = computed(() => {
      const c = props.calificacionPredicha;
      if (c >= 85) return "badge-green";
      if (c >= 70) return "badge-blue";
      if (c >= 60) return "badge-amber";
      return "badge-danger";
    });
    const calificacionProgressClass = computed(() => {
      const c = props.calificacionPredicha;
      if (c >= 85) return "fill-green";
      if (c >= 70) return "fill-blue";
      if (c >= 60) return "fill-amber";
      return "fill-danger";
    });
    const recomendacionEstrategia = computed(() => {
      const tipo = props.tipoMateria || "MIXTA";
      const dia = props.diaRepasoOptimo.toFixed(1);
      if (tipo === "MEMORISTICA") {
        return `Para asignaturas de alta carga memor\xEDstica, la tasa de olvido inicial es especialmente agresiva. Con los par\xE1metros actuales, programa una actividad de recuerdo activo (flashcards, micro-quizzing o preguntas r\xE1pidas al inicio de clase) exactamente en el D\xEDa ${dia}, antes de que se desvanezca m\xE1s del ${Math.round((1 - props.umbralRetencion) * 100)}% de los conceptos.`;
      } else if (tipo === "LOGICO_MATEMATICA") {
        return `En materias l\xF3gico-matem\xE1ticas, la retenci\xF3n estructural es m\xE1s robusta una vez comprendido el principio. Sin embargo, la resoluci\xF3n de ejercicios pr\xE1cticos guiados en el D\xEDa ${dia} consolidar\xE1 los esquemas de razonamiento y evitar\xE1 la degradaci\xF3n de la memoria operativa.`;
      } else {
        return `Al ser una materia mixta, se sugiere articular una sesi\xF3n dual en el D\xEDa ${dia}: 10 minutos de recuperaci\xF3n de terminolog\xEDa te\xF3rica seguidos de 20 minutos de aplicaci\xF3n en casos pr\xE1cticos.`;
      }
    });
    const recomendacionHoras = computed(() => {
      if (props.horasEstudio >= 7) {
        return `Atenci\xF3n: Con ${props.horasEstudio} horas consecutivas, el modelo muestra una clara desaceleraci\xF3n marginal en el rendimiento (ley de rendimientos decrecientes). Recomienda a tus alumnos fragmentar el estudio en bloques de 3 a 4 horas espaciadas a lo largo de varios d\xEDas para maximizar la absorci\xF3n.`;
      } else if (props.horasEstudio < 2.5 && props.dificultad >= 4) {
        return `Alerta: Para una dificultad nivel ${props.dificultad}, un tiempo de estudio de solo ${props.horasEstudio}h puede resultar insuficiente para garantizar una nota aprobatoria s\xF3lida. Sugiere reforzar con al menos 2 horas adicionales y 1 sesi\xF3n de repaso.`;
      } else {
        return `La asignaci\xF3n de ${props.horasEstudio} horas de estudio con ${props.repasosPrevios} repasos se encuentra en una franja equilibrada de rendimiento/esfuerzo para este nivel.`;
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "summary-section" }, _attrs))} data-v-1d0e18b2><div class="metrics-grid" data-v-1d0e18b2><div class="metric-card card" data-v-1d0e18b2><div class="metric-header" data-v-1d0e18b2><span class="metric-label" data-v-1d0e18b2>Calificaci\xF3n Predicha</span><span class="${ssrRenderClass([calificacionBadgeClass.value, "metric-badge"])}" data-v-1d0e18b2>${ssrInterpolate(calificacionStatus.value)}</span></div><div class="metric-body" data-v-1d0e18b2><div class="metric-val" data-v-1d0e18b2><span class="val-number" data-v-1d0e18b2>${ssrInterpolate(__props.calificacionPredicha.toFixed(1))}</span><span class="val-unit" data-v-1d0e18b2>/ 100</span></div><div class="progress-track" data-v-1d0e18b2><div class="${ssrRenderClass([calificacionProgressClass.value, "progress-fill"])}" style="${ssrRenderStyle({ width: `${Math.min(100, Math.max(0, __props.calificacionPredicha))}%` })}" data-v-1d0e18b2></div></div></div><span class="metric-desc" data-v-1d0e18b2>Estimada por el modelo polinomial</span></div><div class="metric-card card" data-v-1d0e18b2><div class="metric-header" data-v-1d0e18b2><span class="metric-label" data-v-1d0e18b2>Intervenci\xF3n Recomendada</span><span class="metric-badge badge-purple" data-v-1d0e18b2>Ebbinghaus</span></div><div class="metric-body" data-v-1d0e18b2><div class="metric-val" data-v-1d0e18b2><span class="val-number font-purple" data-v-1d0e18b2>D\xEDa ${ssrInterpolate(__props.diaRepasoOptimo.toFixed(1))}</span></div><p class="metric-subtext" data-v-1d0e18b2> Momento id\xF3neo para el 1er repaso espaciado antes de cruzar el umbral del ${ssrInterpolate(Math.round(__props.umbralRetencion * 100))}%. </p></div><span class="metric-desc" data-v-1d0e18b2>Repaso de refuerzo activo</span></div><div class="metric-card card" data-v-1d0e18b2><div class="metric-header" data-v-1d0e18b2><span class="metric-label" data-v-1d0e18b2>Retenci\xF3n a 7 D\xEDas</span><span class="metric-badge badge-teal" data-v-1d0e18b2>Corto plazo</span></div><div class="metric-body" data-v-1d0e18b2><div class="metric-val" data-v-1d0e18b2><span class="val-number font-teal" data-v-1d0e18b2>${ssrInterpolate(retencion7d.value.toFixed(1))}%</span></div><p class="metric-subtext" data-v-1d0e18b2> Memoria conservada tras una semana sin repasos adicionales. </p></div><span class="metric-desc" data-v-1d0e18b2>Decaimiento exponencial</span></div><div class="metric-card card" data-v-1d0e18b2><div class="metric-header" data-v-1d0e18b2><span class="metric-label" data-v-1d0e18b2>Retenci\xF3n a 30 D\xEDas</span><span class="metric-badge badge-amber" data-v-1d0e18b2>Largo plazo</span></div><div class="metric-body" data-v-1d0e18b2><div class="metric-val" data-v-1d0e18b2><span class="val-number font-amber" data-v-1d0e18b2>${ssrInterpolate(retencion30d.value.toFixed(1))}%</span></div><p class="metric-subtext" data-v-1d0e18b2> Retenci\xF3n residual al finalizar el mes. </p></div><span class="metric-desc" data-v-1d0e18b2>Base de memoria permanente</span></div></div><div class="pedagogical-advice card" data-v-1d0e18b2><div class="advice-header" data-v-1d0e18b2><div class="advice-icon" data-v-1d0e18b2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-1d0e18b2><circle cx="12" cy="12" r="10" data-v-1d0e18b2></circle><line x1="12" y1="16" x2="12" y2="12" data-v-1d0e18b2></line><line x1="12" y1="8" x2="12.01" y2="8" data-v-1d0e18b2></line></svg></div><div data-v-1d0e18b2><h4 class="advice-title" data-v-1d0e18b2>Diagn\xF3stico Did\xE1ctico para el Docente</h4><p class="advice-subtitle" data-v-1d0e18b2>Recomendaciones pedag\xF3gicas basadas en el perfil cognitivo y la simulaci\xF3n actual</p></div></div><div class="advice-content" data-v-1d0e18b2><p class="advice-p" data-v-1d0e18b2>${ssrInterpolate(recomendacionEstrategia.value)}</p><p class="advice-p advice-secondary" data-v-1d0e18b2>${ssrInterpolate(recomendacionHoras.value)}</p></div></div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SimulationSummary.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-1d0e18b2"]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "LearningCurveChart",
  __ssrInlineRender: true,
  props: {
    curva: {},
    horasActuales: {},
    calificacionActual: {}
  },
  setup(__props) {
    Chart.register(
      Title,
      Tooltip,
      Legend,
      LineElement,
      LinearScale,
      PointElement,
      CategoryScale,
      Filler
    );
    const props = __props;
    const chartData = computed(() => {
      if (!props.curva || !props.curva.x || props.curva.x.length === 0) {
        return { labels: [], datasets: [] };
      }
      const labels = props.curva.x.map((val) => `${val}h`);
      const curvePoints = props.curva.y.map((val) => Math.round(val * 10) / 10);
      let closestIdx = 0;
      let minDiff = Infinity;
      props.curva.x.forEach((xVal, idx) => {
        const diff = Math.abs(xVal - props.horasActuales);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      const pointRadii = props.curva.x.map((_, idx) => idx === closestIdx ? 7 : 0);
      const pointHoverRadii = props.curva.x.map((_, idx) => idx === closestIdx ? 9 : 4);
      return {
        labels,
        datasets: [
          {
            label: "Calificaci\xF3n Predicha",
            data: curvePoints,
            borderColor: "#4f8ef7",
            borderWidth: 3,
            pointBackgroundColor: "#4f8ef7",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: pointRadii,
            pointHoverRadius: pointHoverRadii,
            tension: 0.35,
            fill: true,
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, "rgba(79, 142, 247, 0.28)");
              gradient.addColorStop(1, "rgba(79, 142, 247, 0.00)");
              return gradient;
            }
          },
          {
            label: "Aprobaci\xF3n (60)",
            data: props.curva.x.map(() => 60),
            borderColor: "rgba(251, 191, 36, 0.55)",
            borderWidth: 1.5,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      };
    });
    const chartOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 500
      },
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: "#1a2236",
          titleColor: "#e2e8f0",
          bodyColor: "#94a3b8",
          borderColor: "#253351",
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          callbacks: {
            label: (context) => {
              if (context.datasetIndex === 1) return "Umbral aprobaci\xF3n: 60 pts";
              return `Calificaci\xF3n: ${context.parsed.y} / 100`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.04)"
          },
          ticks: {
            color: "#64748b",
            font: { size: 11 },
            maxTicksLimit: 11
          },
          title: {
            display: true,
            text: "Horas de Estudio",
            color: "#64748b",
            font: { size: 12, weight: "500" }
          }
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: "rgba(255, 255, 255, 0.06)"
          },
          ticks: {
            color: "#64748b",
            font: { size: 11 },
            stepSize: 20
          },
          title: {
            display: true,
            text: "Calificaci\xF3n Estimada (0\u2013100)",
            color: "#64748b",
            font: { size: 12, weight: "500" }
          }
        }
      }
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "chart-card card" }, _attrs))} data-v-eb297220><div class="chart-header" data-v-eb297220><div data-v-eb297220><div class="chart-badge badge-blue" data-v-eb297220>Modelo Polinomial (scikit-learn)</div><h4 class="chart-title" data-v-eb297220>Curva de Aprendizaje</h4><p class="chart-subtitle" data-v-eb297220>Rendimiento acad\xE9mico estimado en funci\xF3n del tiempo de estudio</p></div><div class="chart-stat" data-v-eb297220><span class="stat-label" data-v-eb297220>Punto Actual</span><span class="stat-val" data-v-eb297220>${ssrInterpolate(__props.horasActuales)}h \u2192 ${ssrInterpolate(__props.calificacionActual.toFixed(1))}/100</span></div></div><div class="chart-canvas-container" data-v-eb297220>`);
      if (chartData.value.labels.length > 0) {
        _push(ssrRenderComponent(unref(Line), {
          data: chartData.value,
          options: chartOptions.value
        }, null, _parent));
      } else {
        _push(`<div class="chart-loading" data-v-eb297220><div class="spinner" data-v-eb297220></div><span data-v-eb297220>Calculando curva...</span></div>`);
      }
      _push(`</div><div class="chart-footer" data-v-eb297220><div class="legend-item" data-v-eb297220><span class="legend-line line-primary" data-v-eb297220></span><span data-v-eb297220>Curva de Aprendizaje Calibrada</span></div><div class="legend-item" data-v-eb297220><span class="legend-point point-highlight" data-v-eb297220></span><span data-v-eb297220>Escenario Actual (${ssrInterpolate(__props.horasActuales)}h)</span></div><div class="legend-item" data-v-eb297220><span class="legend-line line-umbral" data-v-eb297220></span><span data-v-eb297220>Umbral de Aprobaci\xF3n (60 pts)</span></div></div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LearningCurveChart.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-eb297220"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ForgettingCurveChart",
  __ssrInlineRender: true,
  props: {
    curva: {},
    diaRepasoOptimo: {},
    umbralRetencion: {}
  },
  setup(__props) {
    Chart.register(
      Title,
      Tooltip,
      Legend,
      LineElement,
      LinearScale,
      PointElement,
      CategoryScale,
      Filler
    );
    const props = __props;
    const chartData = computed(() => {
      if (!props.curva || !props.curva.x_dias || props.curva.x_dias.length === 0) {
        return { labels: [], datasets: [] };
      }
      const labels = props.curva.x_dias.map((d) => `d${d}`);
      const retentionPercents = props.curva.retencion.map((val) => {
        const v = val <= 1 ? val * 100 : val;
        return Math.round(v * 10) / 10;
      });
      let closestIdx = 0;
      let minDiff = Infinity;
      props.curva.x_dias.forEach((day, idx) => {
        const diff = Math.abs(day - props.diaRepasoOptimo);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      const pointRadii = props.curva.x_dias.map((_, idx) => idx === closestIdx ? 7 : 0);
      const pointHoverRadii = props.curva.x_dias.map((_, idx) => idx === closestIdx ? 9 : 4);
      const umbralPercent = Math.round(props.umbralRetencion * 100);
      return {
        labels,
        datasets: [
          {
            label: "Retenci\xF3n de Memoria (%)",
            data: retentionPercents,
            borderColor: "#a78bfa",
            borderWidth: 3,
            pointBackgroundColor: "#a78bfa",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: pointRadii,
            pointHoverRadius: pointHoverRadii,
            tension: 0.35,
            fill: true,
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, "rgba(167, 139, 250, 0.28)");
              gradient.addColorStop(1, "rgba(167, 139, 250, 0.00)");
              return gradient;
            }
          },
          {
            label: `Umbral de Retenci\xF3n (${umbralPercent}%)`,
            data: props.curva.x_dias.map(() => umbralPercent),
            borderColor: "rgba(52, 211, 153, 0.7)",
            borderWidth: 1.5,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      };
    });
    const chartOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 500
      },
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: "#1a2236",
          titleColor: "#e2e8f0",
          bodyColor: "#94a3b8",
          borderColor: "#253351",
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          callbacks: {
            label: (context) => {
              if (context.datasetIndex === 1) {
                return `Umbral deseado: ${Math.round(props.umbralRetencion * 100)}%`;
              }
              return `Retenci\xF3n: ${context.parsed.y}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.04)"
          },
          ticks: {
            color: "#64748b",
            font: { size: 11 },
            maxTicksLimit: 12
          },
          title: {
            display: true,
            text: "D\xEDas Transcurridos desde la Sesi\xF3n",
            color: "#64748b",
            font: { size: 12, weight: "500" }
          }
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: "rgba(255, 255, 255, 0.06)"
          },
          ticks: {
            color: "#64748b",
            font: { size: 11 },
            stepSize: 20,
            callback: (val) => `${val}%`
          },
          title: {
            display: true,
            text: "Retenci\xF3n de Memoria (%)",
            color: "#64748b",
            font: { size: 12, weight: "500" }
          }
        }
      }
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "chart-card card" }, _attrs))} data-v-7e16a282><div class="chart-header" data-v-7e16a282><div data-v-7e16a282><div class="chart-badge badge-purple" data-v-7e16a282>Modelo Ebbinghaus Param\xE9trico</div><h4 class="chart-title" data-v-7e16a282>Curva de Olvido</h4><p class="chart-subtitle" data-v-7e16a282>Decaimiento temporal de retenci\xF3n en memoria y momento cr\xEDtico de repaso</p></div><div class="chart-stat" data-v-7e16a282><span class="stat-label" data-v-7e16a282>Repaso \xD3ptimo Sugerido</span><span class="stat-val" data-v-7e16a282>D\xEDa ${ssrInterpolate(__props.diaRepasoOptimo.toFixed(1))}</span></div></div><div class="chart-canvas-container" data-v-7e16a282>`);
      if (chartData.value.labels.length > 0) {
        _push(ssrRenderComponent(unref(Line), {
          data: chartData.value,
          options: chartOptions.value
        }, null, _parent));
      } else {
        _push(`<div class="chart-loading" data-v-7e16a282><div class="spinner" data-v-7e16a282></div><span data-v-7e16a282>Calculando curva de retenci\xF3n...</span></div>`);
      }
      _push(`</div><div class="chart-footer" data-v-7e16a282><div class="legend-item" data-v-7e16a282><span class="legend-line line-ebbinghaus" data-v-7e16a282></span><span data-v-7e16a282>Retenci\xF3n Estimada (% de memoria conservada)</span></div><div class="legend-item" data-v-7e16a282><span class="legend-line line-umbral-ret" data-v-7e16a282></span><span data-v-7e16a282>Umbral M\xEDnimo Deseado (${ssrInterpolate(Math.round(__props.umbralRetencion * 100))}%)</span></div><div class="legend-item" data-v-7e16a282><span class="legend-point point-repaso" data-v-7e16a282></span><span data-v-7e16a282>D\xEDa de Repaso Espaciado (D\xEDa ${ssrInterpolate(__props.diaRepasoOptimo.toFixed(1))})</span></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ForgettingCurveChart.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-7e16a282"]]);
typeof WorkerGlobalScope !== "undefined" && globalThis instanceof WorkerGlobalScope;
const noop = () => {
};
function createFilterWrapper(filter, fn) {
  function wrapper(...args) {
    return new Promise((resolve, reject) => {
      Promise.resolve(filter(() => fn.apply(this, args), {
        fn,
        thisArg: this,
        args
      })).then(resolve).catch(reject);
    });
  }
  if ("cancel" in filter) Object.assign(wrapper, {
    cancel: filter.cancel,
    flush: filter.flush,
    isPending: filter.isPending
  });
  return wrapper;
}
function debounceFilter(ms, options = {}) {
  let timer;
  let maxTimer;
  let lastRejector = noop;
  let lastResolve = noop;
  const _pending = shallowRef(false);
  const _clearTimeout = (timer2) => {
    clearTimeout(timer2);
    lastRejector();
    lastRejector = noop;
  };
  let lastInvoker;
  const handler = (invoke2) => {
    const duration = toValue(ms);
    const maxDuration = toValue(options.maxWait);
    if (timer) _clearTimeout(timer);
    if (duration <= 0 || maxDuration !== void 0 && maxDuration <= 0) {
      if (maxTimer) {
        _clearTimeout(maxTimer);
        maxTimer = void 0;
      }
      _pending.value = false;
      return Promise.resolve(invoke2());
    }
    _pending.value = true;
    return new Promise((resolve, reject) => {
      lastRejector = options.rejectOnCancel ? reject : resolve;
      lastResolve = resolve;
      lastInvoker = invoke2;
      if (maxDuration && !maxTimer) maxTimer = setTimeout(() => {
        if (timer) _clearTimeout(timer);
        maxTimer = void 0;
        _pending.value = false;
        resolve(lastInvoker());
      }, maxDuration);
      timer = setTimeout(() => {
        if (maxTimer) _clearTimeout(maxTimer);
        maxTimer = void 0;
        _pending.value = false;
        resolve(invoke2());
      }, duration);
    });
  };
  return Object.assign(handler, {
    cancel: () => {
      if (timer) {
        _clearTimeout(timer);
        timer = void 0;
      }
      if (maxTimer) {
        _clearTimeout(maxTimer);
        maxTimer = void 0;
      }
      _pending.value = false;
      lastResolve = noop;
    },
    flush: () => {
      if (_pending.value) {
        if (timer) {
          clearTimeout(timer);
          timer = void 0;
        }
        if (maxTimer) {
          clearTimeout(maxTimer);
          maxTimer = void 0;
        }
        _pending.value = false;
        const resolve = lastResolve;
        lastRejector = noop;
        lastResolve = noop;
        resolve(lastInvoker());
      }
    },
    isPending: shallowReadonly(_pending)
  });
}
function useDebounceFn(fn, ms = 200, options = {}) {
  return createFilterWrapper(debounceFilter(ms, options), fn);
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const materias = ref([]);
    const materiaIdSeleccionada = ref("");
    const cargandoMaterias = ref(true);
    const creandoEjemplo = ref(false);
    const showNuevaMateria = ref(false);
    const params = ref({
      horas_estudio: 4,
      dificultad: 3,
      repasos_previos: 1,
      calidad_estudio: 0.75,
      umbral_retencion: 0.7
    });
    const simResult = ref(null);
    const simulando = ref(false);
    const apiError = ref("");
    const nombreEstudiante = ref("");
    const guardando = ref(false);
    const guardadoExito = ref(false);
    const materiaActual = computed(
      () => materias.value.find((m) => m.id === materiaIdSeleccionada.value)
    );
    async function cargarMaterias() {
      cargandoMaterias.value = true;
      try {
        const res = await $fetch("/api/materias");
        materias.value = res || [];
        if (materias.value.length > 0 && !materiaIdSeleccionada.value) {
          materiaIdSeleccionada.value = materias.value[0].id;
        }
      } catch (err) {
        console.error("Error cargando materias:", err);
      } finally {
        cargandoMaterias.value = false;
      }
    }
    async function ejecutarSimulacion() {
      var _a;
      if (!materiaIdSeleccionada.value) return;
      simulando.value = true;
      apiError.value = "";
      try {
        const res = await $fetch("/api/simulate", {
          method: "POST",
          body: {
            materiaId: materiaIdSeleccionada.value,
            horas_estudio: params.value.horas_estudio,
            dificultad: params.value.dificultad,
            repasos_previos: params.value.repasos_previos,
            calidad_estudio: params.value.calidad_estudio,
            umbral_retencion: params.value.umbral_retencion
          }
        });
        simResult.value = res;
      } catch (err) {
        console.error("Error al simular:", err);
        apiError.value = ((_a = err == null ? void 0 : err.data) == null ? void 0 : _a.message) || "No se pudo conectar con el microservicio ML. Aseg\xFArate de que el servicio Python est\xE9 en ejecuci\xF3n.";
      } finally {
        simulando.value = false;
      }
    }
    const debouncedSimulate = useDebounceFn(() => {
      ejecutarSimulacion();
    }, 300);
    watch(materiaIdSeleccionada, (newId) => {
      if (newId) {
        ejecutarSimulacion();
      }
    });
    function handleNuevaMateria(nueva) {
      materias.value.unshift(nueva);
      materiaIdSeleccionada.value = nueva.id;
      ejecutarSimulacion();
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
      const _component_MateriaSelector = __nuxt_component_0;
      const _component_SliderPanel = __nuxt_component_1;
      const _component_SimulationSummary = __nuxt_component_2;
      const _component_LearningCurveChart = __nuxt_component_3;
      const _component_ForgettingCurveChart = __nuxt_component_4;
      const _component_NuevaMateriaModal = __nuxt_component_5;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "dashboard-page animate-fade-in" }, _attrs))} data-v-462c31f5><header class="page-header" data-v-462c31f5><div data-v-462c31f5><div class="header-pretitle" data-v-462c31f5>Simulador Pedag\xF3gico Docente</div><h1 class="header-title" data-v-462c31f5>Laboratorio de Curvas de Aprendizaje y Olvido</h1></div><div class="header-actions" data-v-462c31f5><div class="guardar-bar" data-v-462c31f5><input${ssrRenderAttr("value", nombreEstudiante.value)} type="text" class="input-estudiante" placeholder="Estudiante (opcional)" maxlength="50" data-v-462c31f5><button class="btn btn-primary btn-sm btn-guardar"${ssrIncludeBooleanAttr(guardando.value || !simResult.value) ? " disabled" : ""} title="Guardar esta simulaci\xF3n en el historial" data-v-462c31f5>`);
      if (!guardando.value && !guardadoExito.value) {
        _push(`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-462c31f5><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" data-v-462c31f5></path><polyline points="17 21 17 13 7 13 7 21" data-v-462c31f5></polyline><polyline points="7 3 7 8 15 8" data-v-462c31f5></polyline></svg>`);
      } else {
        _push(`<!---->`);
      }
      if (guardando.value) {
        _push(`<span class="spinner-sm" data-v-462c31f5></span>`);
      } else if (guardadoExito.value) {
        _push(`<span data-v-462c31f5>\u2713 \xA1Guardado!</span>`);
      } else {
        _push(`<span data-v-462c31f5>Guardar en Historial</span>`);
      }
      _push(`</button></div><div class="status-chip" data-v-462c31f5><span class="pulse-dot" data-v-462c31f5></span><span data-v-462c31f5>Motor ML Activo</span></div></div></header>`);
      if (apiError.value) {
        _push(`<div class="api-error-banner card" data-v-462c31f5><div class="error-icon" data-v-462c31f5>\u26A0\uFE0F</div><div class="error-body" data-v-462c31f5><span class="error-title" data-v-462c31f5>Atenci\xF3n con el servicio de simulaci\xF3n</span><p class="error-message" data-v-462c31f5>${ssrInterpolate(apiError.value)}</p></div><button class="btn btn-ghost btn-sm" data-v-462c31f5>Reintentar</button></div>`);
      } else {
        _push(`<!---->`);
      }
      if (cargandoMaterias.value) {
        _push(`<div class="loading-state card" data-v-462c31f5><div class="spinner" data-v-462c31f5></div><p data-v-462c31f5>Cargando materias del docente...</p></div>`);
      } else if (materias.value.length === 0) {
        _push(`<div class="no-materias card" data-v-462c31f5><div class="no-materias-icon" data-v-462c31f5>\u{1F4DA}</div><h2 class="no-materias-title" data-v-462c31f5>\xA1Bienvenido a Simu-Cognition!</h2><p class="no-materias-desc" data-v-462c31f5> Para comenzar a simular curvas de retenci\xF3n y aprendizaje, necesitas registrar tu primera materia o cargar materias de ejemplo. </p><div class="no-materias-actions" data-v-462c31f5><button class="btn btn-primary" data-v-462c31f5> + Crear mi primera materia </button><button class="btn btn-ghost"${ssrIncludeBooleanAttr(creandoEjemplo.value) ? " disabled" : ""} data-v-462c31f5>${ssrInterpolate(creandoEjemplo.value ? "Creando ejemplos..." : "Cargar materias de prueba")}</button></div></div>`);
      } else {
        _push(`<div class="simulator-layout" data-v-462c31f5><section class="left-col" data-v-462c31f5>`);
        _push(ssrRenderComponent(_component_MateriaSelector, {
          modelValue: materiaIdSeleccionada.value,
          "onUpdate:modelValue": ($event) => materiaIdSeleccionada.value = $event,
          materias: materias.value,
          onRecargar: cargarMaterias
        }, null, _parent));
        _push(ssrRenderComponent(_component_SliderPanel, {
          modelValue: params.value,
          "onUpdate:modelValue": ($event) => params.value = $event,
          loading: simulando.value,
          onChange: unref(debouncedSimulate)
        }, null, _parent));
        _push(`</section><section class="right-col" data-v-462c31f5>`);
        _push(ssrRenderComponent(_component_SimulationSummary, {
          "calificacion-predicha": (_b = (_a = simResult.value) == null ? void 0 : _a.calificacion_predicha) != null ? _b : 0,
          "dia-repaso-optimo": (_d = (_c = simResult.value) == null ? void 0 : _c.dia_repaso_optimo) != null ? _d : 0,
          "umbral-retencion": params.value.umbral_retencion,
          "curva-olvido": (_f = (_e = simResult.value) == null ? void 0 : _e.curva_olvido) != null ? _f : null,
          "tipo-materia": (_g = materiaActual.value) == null ? void 0 : _g.tipo,
          "horas-estudio": params.value.horas_estudio,
          "repasos-previos": params.value.repasos_previos,
          dificultad: params.value.dificultad
        }, null, _parent));
        _push(`<div class="charts-container" data-v-462c31f5><div class="charts-grid" data-v-462c31f5>`);
        _push(ssrRenderComponent(_component_LearningCurveChart, {
          curva: (_i = (_h = simResult.value) == null ? void 0 : _h.curva_aprendizaje) != null ? _i : null,
          "horas-actuales": params.value.horas_estudio,
          "calificacion-actual": (_k = (_j = simResult.value) == null ? void 0 : _j.calificacion_predicha) != null ? _k : 0
        }, null, _parent));
        _push(ssrRenderComponent(_component_ForgettingCurveChart, {
          curva: (_m = (_l = simResult.value) == null ? void 0 : _l.curva_olvido) != null ? _m : null,
          "dia-repaso-optimo": (_o = (_n = simResult.value) == null ? void 0 : _n.dia_repaso_optimo) != null ? _o : 0,
          "umbral-retencion": params.value.umbral_retencion
        }, null, _parent));
        _push(`</div></div></section></div>`);
      }
      _push(ssrRenderComponent(_component_NuevaMateriaModal, {
        modelValue: showNuevaMateria.value,
        "onUpdate:modelValue": ($event) => showNuevaMateria.value = $event,
        onCreada: handleNuevaMateria
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-462c31f5"]]);

export { index as default };
//# sourceMappingURL=index-CBmo2ylM.mjs.map
