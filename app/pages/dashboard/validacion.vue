<template>
  <div class="page-validacion">
    <head>
      <title>Validación Empírica — Simu-Cognition</title>
      <meta name="description" content="Módulo de validación empírica: registra estudiantes, resultados de quiz y compara contra las predicciones del simulador para el paper científico." />
    </head>

    <!-- Hero -->
    <div class="page-hero">
      <div>
        <div class="hero-badge">Módulo v4.0</div>
        <h1 class="hero-title">Validación Empírica</h1>
        <p class="hero-sub">
          Recolectá datos reales de estudiantes, compará contra las predicciones del simulador y exportá el dataset para el paper.
        </p>
      </div>

      <!-- Selector de materia global -->
      <div class="materia-selector-wrap">
        <label class="sel-label" for="materia-global">Materia activa</label>
        <select id="materia-global" v-model="materiaActivaId" class="form-select" @change="onMateriaChange">
          <option value="" disabled>Seleccionar materia…</option>
          <option v-for="m in materias" :key="m.id" :value="m.id">{{ m.nombre }}</option>
        </select>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-wrap">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        :id="`tab-${tab.key}`"
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <!-- ── TAB: Registrar estudiante ───────────────────────────────────── -->
    <section v-if="activeTab === 'registrar'" class="tab-content">
      <div class="section-intro">
        <h2 class="section-h2">Registrar nuevo estudiante</h2>
        <p class="section-p">Completá la ficha del docente y el cuestionario del estudiante antes de aplicar el quiz inicial (Día 0).</p>
      </div>

      <!-- Banner de encuesta pública para compartir -->
      <div class="public-survey-box">
        <div class="survey-box-left">
          <span class="survey-badge">📱 Encuesta para Alumnos</span>
          <p class="survey-desc">
            ¿Querés que tus estudiantes respondan directamente desde sus teléfonos o computadoras?
          </p>
          <code class="survey-url">{{ publicSurveyUrl }}</code>
        </div>
        <button type="button" class="btn-copy-link" @click="copySurveyLink">
          {{ copied ? '¡Copiado!' : 'Copiar Enlace' }}
        </button>
      </div>

      <EvaluacionForm
        :materias="materias"
        :initial-materia-id="materiaActivaId"
        @created="onEvaluacionCreada"
      />

      <!-- Toast de confirmación -->
      <div v-if="toastRegistrado" class="toast toast-ok">
        ✓ Estudiante <strong>{{ toastRegistrado }}</strong> registrado correctamente.
      </div>
    </section>

    <!-- ── TAB: Registrar resultado de quiz ────────────────────────────── -->
    <section v-if="activeTab === 'resultado'" class="tab-content">
      <div class="section-intro">
        <h2 class="section-h2">Registrar resultado de quiz</h2>
        <p class="section-p">Seleccioná un estudiante y registrá la nota del quiz para el momento correspondiente.</p>
      </div>

      <!-- Selector de evaluación -->
      <div class="eval-selector card">
        <label class="sel-label" for="eval-select">Estudiante</label>
        <select id="eval-select" v-model="evaluacionSeleccionadaId" class="form-select">
          <option value="" disabled>Seleccionar estudiante…</option>
          <option v-for="e in evaluacionesDeMateriaActiva" :key="e.id" :value="e.id">
            {{ e.codigoAnonimo }} (Creado: {{ formatFecha(e.creadaEn) }})
          </option>
        </select>
        <p v-if="!materiaActivaId" class="sel-hint">Seleccioná una materia arriba primero.</p>
        <p v-else-if="evaluacionesDeMateriaActiva.length === 0" class="sel-hint">
          No hay estudiantes registrados para esta materia aún.
        </p>
      </div>

      <QuizResultadoForm
        v-if="evaluacionSeleccionada"
        :evaluacion="evaluacionSeleccionada"
        :resultados-existentes="evaluacionSeleccionada.resultados || []"
        @saved="onResultadoGuardado"
      />
    </section>

    <!-- ── TAB: Comparación individual ────────────────────────────────── -->
    <section v-if="activeTab === 'comparacion'" class="tab-content">
      <div class="section-intro">
        <h2 class="section-h2">Comparación individual</h2>
        <p class="section-p">Genera la comparación predicha vs real para un estudiante. Requiere que el resultado INICIAL esté registrado.</p>
      </div>

      <!-- Selector + botón comparar -->
      <div class="eval-selector card">
        <label class="sel-label" for="eval-comparar-select">Estudiante</label>
        <div class="comparar-row">
          <select id="eval-comparar-select" v-model="evaluacionComparacionId" class="form-select">
            <option value="" disabled>Seleccionar estudiante…</option>
            <option v-for="e in evaluacionesDeMateriaActiva" :key="e.id" :value="e.id">
              {{ e.codigoAnonimo }}
            </option>
          </select>
          <button
            id="btn-generar-comparacion"
            type="button"
            class="btn-primary"
            :disabled="!evaluacionComparacionId || comparandoLoading"
            @click="generarComparacion"
          >
            <span v-if="comparandoLoading" class="spinner-sm"></span>
            {{ comparandoLoading ? 'Calculando…' : 'Generar Comparación' }}
          </button>
        </div>
        <p v-if="comparacionError" class="form-error">{{ comparacionError }}</p>
      </div>

      <!-- Resultado de la comparación -->
      <template v-if="comparacionActual">
        <ComparacionChart
          :calificacion-predicha="comparacionActual.comparacion.calificacionPredicha"
          :calificacion-real="comparacionActual.comparacion.calificacionReal"
          :error-absoluto="comparacionActual.comparacion.errorAbsoluto"
          :curva-olvido-predicha="comparacionActual.curva_olvido_predicha"
          :puntos-olvido-reales="comparacionActual.puntos_olvido_reales"
          :delta-retencion-promedio="comparacionActual.delta_retencion_promedio"
        />
        <RecomendacionCard
          :codigo-anonimo="comparacionActual.codigoAnonimo"
          :recomendacion-texto="comparacionActual.recomendacion"
          :error-absoluto="comparacionActual.comparacion.errorAbsoluto"
          :delta-retencion-promedio="comparacionActual.delta_retencion_promedio"
          :calidad-estudio="comparacionActual.calidadEstudio"
          :generada-en="comparacionActual.comparacion.generadaEn"
        />
      </template>
    </section>

    <!-- ── TAB: Análisis agregado ──────────────────────────────────────── -->
    <section v-if="activeTab === 'analisis'" class="tab-content">
      <div class="section-intro">
        <h2 class="section-h2">Análisis estadístico del grupo</h2>
        <p class="section-p">MAE, RMSE, Pearson r, Spearman ρ y confirmación direccional por variable. Requiere al menos 2 estudiantes con comparación calculada.</p>
      </div>

      <div class="refresh-row">
        <button
          id="btn-cargar-analisis"
          type="button"
          class="btn-secondary"
          :disabled="!materiaActivaId || analisisLoading"
          @click="cargarAnalisis"
        >
          <span v-if="analisisLoading" class="spinner-sm"></span>
          {{ analisisLoading ? 'Calculando…' : '↺ Calcular métricas' }}
        </button>
        <p v-if="analisisError" class="form-error">{{ analisisError }}</p>
      </div>

      <p v-if="analisisMensaje" class="analisis-msg">{{ analisisMensaje }}</p>

      <AnalisisAgregadoPanel
        v-if="analisisMetricas"
        :metricas="analisisMetricas"
        :materia-id="materiaActivaId"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: 'Validación Empírica — Simu-Cognition',
})

const TABS = [
  { key: 'registrar',   label: 'Registrar Estudiante', icon: '📋' },
  { key: 'resultado',   label: 'Registrar Quiz',        icon: '✏️' },
  { key: 'comparacion', label: 'Comparación',            icon: '📊' },
  { key: 'analisis',    label: 'Análisis Agregado',      icon: '🔬' },
]

const activeTab = ref<'registrar' | 'resultado' | 'comparacion' | 'analisis'>('registrar')

// ── Materias ──────────────────────────────────────────────────────────────────

interface Materia { id: string; nombre: string; tipo: string }

const materias = ref<Materia[]>([])
const materiaActivaId = ref('')
const copied = ref(false)

const publicSurveyUrl = computed(() => {
  if (process.client) {
    const origin = window.location.origin
    return materiaActivaId.value ? `${origin}/encuesta?materia=${materiaActivaId.value}` : `${origin}/encuesta`
  }
  return '/encuesta'
})

function copySurveyLink() {
  if (process.client && navigator.clipboard) {
    navigator.clipboard.writeText(publicSurveyUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  }
}

onMounted(async () => {
  try {
    const res = await $fetch<Materia[]>('/api/materias')
    materias.value = res
    if (materias.value.length > 0 && !materiaActivaId.value) {
      materiaActivaId.value = materias.value[0].id
      await onMateriaChange()
    }
  } catch (err) {
    console.error('[validacion] Error cargando materias:', err)
  }
})

// ── Evaluaciones ──────────────────────────────────────────────────────────────

interface Resultado { momento: string; reestudioReportado: boolean; notaObtenida: number }

interface Evaluacion {
  id: string
  codigoAnonimo: string
  creadaEn: string
  horasEstudio: number
  calidadEstudio: number
  resultados: Resultado[]
  comparacion: {
    calificacionPredicha: number
    calificacionReal: number
    errorAbsoluto: number
    retencionPredichaJson: string
    retencionRealJson: string
    recomendacionTexto: string
    generadaEn: string
  } | null
}

const evaluaciones = ref<Evaluacion[]>([])

const evaluacionesDeMateriaActiva = computed(() => evaluaciones.value)

async function onMateriaChange() {
  evaluaciones.value = []
  evaluacionSeleccionadaId.value = ''
  evaluacionComparacionId.value = ''
  comparacionActual.value = null
  analisisMetricas.value = null
  analisisMensaje.value = ''
  if (!materiaActivaId.value) return
  try {
    const res = await $fetch<{ evaluaciones: Evaluacion[] }>(`/api/analisis/${materiaActivaId.value}`)
    evaluaciones.value = res.evaluaciones || []
  } catch {
    // Materia sin datos aún — no es un error
    evaluaciones.value = []
  }
}

// ── Tab: Registrar ────────────────────────────────────────────────────────────

const toastRegistrado = ref('')

function onEvaluacionCreada(ev: Record<string, unknown>) {
  const ev_ = ev as Evaluacion & { codigoAnonimo: string }
  evaluaciones.value.unshift({ ...ev_, resultados: [], comparacion: null })
  toastRegistrado.value = ev_.codigoAnonimo
  setTimeout(() => { toastRegistrado.value = '' }, 3500)
}

// ── Tab: Resultado ────────────────────────────────────────────────────────────

const evaluacionSeleccionadaId = ref('')
const evaluacionSeleccionada = computed(() =>
  evaluaciones.value.find((e) => e.id === evaluacionSeleccionadaId.value) || null
)

function onResultadoGuardado(res: Record<string, unknown>) {
  // Actualizar resultados en la evaluación local sin refetch completo
  const ev = evaluaciones.value.find((e) => e.id === evaluacionSeleccionadaId.value)
  if (!ev) return
  const r = res as Resultado & { id: string; evaluacionId: string }
  const idx = ev.resultados.findIndex((x) => x.momento === r.momento)
  if (idx >= 0) {
    ev.resultados[idx] = r
  } else {
    ev.resultados.push(r)
  }
}

// ── Tab: Comparación ──────────────────────────────────────────────────────────

const evaluacionComparacionId = ref('')
const comparandoLoading = ref(false)
const comparacionError  = ref('')
const comparacionActual = ref<null | {
  comparacion: { calificacionPredicha: number; calificacionReal: number; errorAbsoluto: number; generadaEn: string }
  curva_olvido_predicha: { dia: number; retencion_predicha: number }[]
  puntos_olvido_reales: { dia: number; retencion_real: number }[]
  delta_retencion_promedio: number
  recomendacion: string
  codigoAnonimo: string
  calidadEstudio: number
}>(null)

async function generarComparacion() {
  if (!evaluacionComparacionId.value) return
  comparandoLoading.value = true
  comparacionError.value = ''
  comparacionActual.value = null
  try {
    type CmpRes = typeof comparacionActual.value
    const res = await $fetch<CmpRes>(`/api/evaluaciones/${evaluacionComparacionId.value}/comparar`, {
      method: 'POST',
    })
    const ev = evaluaciones.value.find((e) => e.id === evaluacionComparacionId.value)
    comparacionActual.value = {
      ...res!,
      codigoAnonimo: ev?.codigoAnonimo || '',
      calidadEstudio: ev?.calidadEstudio || 0,
    }
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    comparacionError.value = e?.data?.message || e?.message || 'Error al generar comparación.'
  } finally {
    comparandoLoading.value = false
  }
}

// ── Tab: Análisis ─────────────────────────────────────────────────────────────

const analisisLoading = ref(false)
const analisisError   = ref('')
const analisisMensaje = ref('')
const analisisMetricas = ref<null | {
  n: number; mae: number; rmse: number
  pearson_r: number; pearson_p: number
  spearman_r: number; spearman_p: number
  confirmacion_direccional: { variable: string; pendiente: number; r2: number; p_valor: number; direccion_confirmada: boolean }[]
}>(null)

async function cargarAnalisis() {
  if (!materiaActivaId.value) return
  analisisLoading.value = true
  analisisError.value = ''
  analisisMensaje.value = ''
  analisisMetricas.value = null
  try {
    const res = await $fetch<{ metricas: typeof analisisMetricas.value; mensaje?: string; evaluaciones: Evaluacion[] }>(
      `/api/analisis/${materiaActivaId.value}`
    )
    evaluaciones.value = res.evaluaciones || []
    if (res.mensaje) {
      analisisMensaje.value = res.mensaje
    } else {
      analisisMetricas.value = res.metricas
    }
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    analisisError.value = e?.data?.message || e?.message || 'Error al cargar análisis.'
  } finally {
    analisisLoading.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFecha(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
  } catch { return iso }
}
</script>

<style scoped>
.page-validacion {
  padding: 2rem 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* Hero */
.page-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
}

.hero-badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  background: rgba(99,102,241,0.15);
  color: #818cf8;
  border: 1px solid rgba(99,102,241,0.3);
  margin-bottom: 0.35rem;
}

.hero-title {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.2;
}

.hero-sub {
  font-size: 0.88rem;
  color: var(--color-text-muted);
  margin-top: 0.35rem;
  max-width: 480px;
}

/* Materia selector */
.materia-selector-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 220px;
}

.sel-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-select {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  width: 100%;
}

.form-select:focus { outline: none; border-color: var(--color-accent); }
.form-select option { background: var(--color-surface); }

/* Tabs */
.tabs-wrap {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.tab-btn:hover { color: var(--color-text); background: var(--color-surface-2); }
.tab-btn.active { color: var(--color-accent); border-bottom-color: var(--color-accent); font-weight: 600; }

.tab-icon { font-size: 1rem; }

/* Content */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

.section-intro { display: flex; flex-direction: column; gap: 0.25rem; }
.section-h2    { font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: var(--color-text); }
.section-p     { font-size: 0.82rem; color: var(--color-text-muted); }

/* Eval selector card */
.eval-selector {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.sel-hint {
  font-size: 0.75rem;
  color: var(--color-text-dim);
  font-style: italic;
}

.comparar-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

/* Botones */
.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.6rem 1.25rem;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-primary  { background: var(--color-accent); color: #fff; }
.btn-secondary {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn-primary:hover:not(:disabled)  { opacity: 0.9; transform: translateY(-1px); }
.btn-secondary:hover:not(:disabled){ border-color: var(--color-accent); color: var(--color-accent); }
.btn-primary:disabled, .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

/* Análisis extras */
.refresh-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.analisis-msg {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  font-style: italic;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  animation: slideUp 0.3s ease, fadeOut 0.4s ease 3.1s forwards;
  z-index: 999;
}

.toast-ok {
  background: rgba(52,211,153,0.15);
  border: 1px solid #34d399;
  color: #34d399;
}

@keyframes slideUp   { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes fadeOut   { to { opacity: 0; } }

.form-error {
  font-size: 0.8rem;
  color: #f87171;
  background: rgba(248,113,113,0.08);
  border: 1px solid rgba(248,113,113,0.2);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
}

.spinner-sm {
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
 
 /* Public survey share box */
 .public-survey-box {
   display: flex;
   justify-content: space-between;
   align-items: center;
   background: linear-gradient(135deg, rgba(59,111,212,0.08) 0%, rgba(124,58,237,0.08) 100%);
   border: 1px solid var(--color-primary-glow);
   border-radius: var(--radius-lg);
   padding: 1.25rem 1.5rem;
   margin-bottom: 1.5rem;
   gap: 1.25rem;
 }

@media (max-width: 640px) {
  .public-survey-box {
    flex-direction: column;
    align-items: flex-start;
  }
}

.survey-box-left {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.survey-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.survey-desc {
  font-size: 0.9rem;
  color: var(--color-text);
  margin: 0;
}

.survey-url {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  background: var(--color-surface);
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  display: inline-block;
  width: fit-content;
}

.btn-copy-link {
  white-space: nowrap;
  padding: 0.65rem 1.2rem;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  border: none;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy-link:hover {
  background: #2d5dbd;
}
</style>
