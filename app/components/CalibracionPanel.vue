<template>
  <div class="cal-panel">
    <div class="card cal-intro">
      <h3 class="cal-title">Calibración con los datos de tu grupo</h3>
      <p class="cal-p">
        El simulador parte de una curva de olvido <em>teórica</em> (Ebbinghaus). Aquí se ajusta a lo que
        <strong>realmente retiene tu grupo</strong>: con las notas de los días 1, 3, 7 y 14 se estima la
        estabilidad de la memoria <code>S</code> y el simulador pasa a usar esa curva.
      </p>
      <div class="cal-actions">
        <button type="button" class="btn-primary" :disabled="!materiaId || cargando" @click="calibrar">
          <span v-if="cargando" class="spinner-sm"></span>
          {{ cargando ? 'Calibrando…' : 'Calibrar con los datos del grupo' }}
        </button>
        <button v-if="guardada" type="button" class="btn-secondary" :disabled="cargando" @click="descartar">
          Volver a la curva teórica
        </button>
      </div>
      <p v-if="error" class="form-error">{{ error }}</p>
      <p v-if="guardada && !resultado" class="cal-saved">
        Calibración activa: S × {{ guardada.escalaS.toFixed(2) }}
        ({{ guardada.nEstudiantes }} estudiantes, calculada el {{ fecha(guardada.calculadaEn) }}).
      </p>
    </div>

    <div v-if="resultado && !resultado.suficiente" class="card cal-warn">
      <strong>Todavía no se puede calibrar.</strong> {{ resultado.mensaje }}
    </div>

    <template v-if="resultado && resultado.suficiente">
      <div class="cal-grid">
        <div class="card cal-tile">
          <span class="tile-label">Estabilidad S del grupo</span>
          <span class="tile-val">{{ resultado.s_base_calibrada.toFixed(1) }} días</span>
          <span class="tile-sub">teoría: {{ resultado.s_base_prior.toFixed(1) }} días</span>
        </div>
        <div class="card cal-tile">
          <span class="tile-label">Factor de escala</span>
          <span class="tile-val">× {{ resultado.escala_s.toFixed(2) }}</span>
          <span class="tile-sub">
            IC 95 %: {{ resultado.escala_s_ic95[0].toFixed(2) }} – {{ resultado.escala_s_ic95[1].toFixed(2) }}
          </span>
        </div>
        <div class="card cal-tile">
          <span class="tile-label">Error de ajuste (RMSE)</span>
          <span class="tile-val">{{ pct(resultado.rmse_calibrada) }}</span>
          <span class="tile-sub">teoría: {{ pct(resultado.rmse_teorica) }}</span>
        </div>
        <div class="card cal-tile">
          <span class="tile-label">Datos usados</span>
          <span class="tile-val">{{ resultado.n_estudiantes }}</span>
          <span class="tile-sub">estudiantes · {{ resultado.n_puntos }} mediciones</span>
        </div>
      </div>

      <div class="card cal-chart-card">
        <h4 class="chart-h">Curva teórica vs curva calibrada</h4>
        <div class="cal-chart">
          <Line :data="chartData" :options="chartOptions" />
        </div>
        <p class="chart-note">
          Estudiante promedio del grupo. Los puntos son la retención real media
          (nota del día n ÷ nota inicial, máx. 100 %).
        </p>
      </div>

      <div v-if="resultado.validacion_prospectiva" class="card cal-prospectiva">
        <h4 class="chart-h">Validación prospectiva (predecir lo que aún no se ha visto)</h4>
        <p class="cal-p">
          Se calibró <em>solo</em> con las mediciones hasta el día {{ resultado.validacion_prospectiva.dia_corte }}
          y se predijeron las {{ resultado.validacion_prospectiva.n_puntos_prueba }} mediciones posteriores.
        </p>
        <div class="prosp-row">
          <span>Error medio con la curva teórica: <strong>{{ pct(resultado.validacion_prospectiva.mae_teorica) }}</strong></span>
          <span>Con la curva calibrada: <strong>{{ pct(resultado.validacion_prospectiva.mae_calibrada) }}</strong></span>
          <span class="prosp-verdict" :class="{ ok: mejora }">
            {{ mejora ? 'La calibración mejora la predicción' : 'Sin mejora apreciable respecto a la teoría' }}
          </span>
        </div>
      </div>

      <div class="card cal-honest">
        <strong>Cómo leer esto.</strong> La estimación ancla el resultado a la teoría cuando hay pocos datos
        (<em>shrinkage</em>), y el intervalo se obtiene por bootstrap sobre estudiantes. Con grupos pequeños es una
        estimación <strong>exploratoria</strong>: sirve para ajustar el calendario de repasos de este grupo, no para
        generalizar a otras poblaciones.
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Chart as ChartJS, Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, Filler)

interface Resultado {
  suficiente: boolean
  mensaje: string
  n_estudiantes: number
  n_puntos: number
  escala_s: number
  escala_s_ic95: [number, number]
  s_base_prior: number
  s_base_calibrada: number
  rmse_teorica: number
  rmse_calibrada: number
  validacion_prospectiva: { dia_corte: number; n_puntos_prueba: number; mae_teorica: number; mae_calibrada: number } | null
  curva_dias: number[]
  curva_teorica: number[]
  curva_calibrada: number[]
  puntos_observados: { dia: number; media: number; n: number }[]
}

interface Guardada { escalaS: number; nEstudiantes: number; calculadaEn: string }

const props = defineProps<{ materiaId: string }>()
const emit = defineEmits<{ (e: 'cambio'): void }>()

const resultado = ref<Resultado | null>(null)
const guardada = ref<Guardada | null>(null)
const cargando = ref(false)
const error = ref('')

async function cargarGuardada() {
  guardada.value = null
  resultado.value = null
  error.value = ''
  if (!props.materiaId) return
  try {
    guardada.value = await $fetch<Guardada | null>(`/api/calibracion/${props.materiaId}`)
  } catch {
    guardada.value = null
  }
}
watch(() => props.materiaId, cargarGuardada, { immediate: true })

function mensajeError(err: unknown, porDefecto: string) {
  const e = err as { data?: { message?: string }; message?: string }
  return e?.data?.message || e?.message || porDefecto
}

async function calibrar() {
  cargando.value = true
  error.value = ''
  try {
    resultado.value = await $fetch<Resultado>(`/api/calibracion/${props.materiaId}`, { method: 'POST' })
    if (resultado.value.suficiente) await cargarGuardadaSinLimpiar()
    emit('cambio')
  } catch (err) {
    error.value = mensajeError(err, 'No se pudo calibrar.')
  } finally {
    cargando.value = false
  }
}

async function cargarGuardadaSinLimpiar() {
  try {
    guardada.value = await $fetch<Guardada | null>(`/api/calibracion/${props.materiaId}`)
  } catch { /* se mantiene lo mostrado */ }
}

async function descartar() {
  cargando.value = true
  error.value = ''
  try {
    await $fetch(`/api/calibracion/${props.materiaId}`, { method: 'DELETE' })
    guardada.value = null
    resultado.value = null
    emit('cambio')
  } catch (err) {
    error.value = mensajeError(err, 'No se pudo descartar la calibración.')
  } finally {
    cargando.value = false
  }
}

const pct = (v: number) => `${(v * 100).toFixed(1)} %`
const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
const mejora = computed(() => {
  const v = resultado.value?.validacion_prospectiva
  // "Mejora" solo si el error baja de forma apreciable (>5 % relativo).
  return !!v && v.mae_calibrada < v.mae_teorica * 0.95
})

const chartData = computed(() => {
  const r = resultado.value
  if (!r) return { labels: [], datasets: [] }
  const observados = r.curva_dias.map((d) => {
    const p = r.puntos_observados.find((o) => o.dia === d)
    return p ? Math.round(p.media * 1000) / 10 : null
  })
  return {
    labels: r.curva_dias.map((d) => `d${d}`),
    datasets: [
      {
        label: 'Teórica',
        data: r.curva_teorica.map((v) => Math.round(v * 1000) / 10),
        borderColor: '#94a3b8', borderDash: [6, 5], borderWidth: 2, pointRadius: 0, tension: 0.3,
      },
      {
        label: 'Calibrada con tu grupo',
        data: r.curva_calibrada.map((v) => Math.round(v * 1000) / 10),
        borderColor: '#34d399', borderWidth: 3, pointRadius: 0, tension: 0.3,
      },
      {
        label: 'Retención real media',
        data: observados,
        showLine: false,
        borderColor: '#a78bfa', backgroundColor: '#a78bfa', pointRadius: 6, pointHoverRadius: 8,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  spanGaps: false,
  plugins: { legend: { display: true, labels: { color: '#94a3b8' } } },
  scales: {
    x: { ticks: { color: '#64748b', maxTicksLimit: 10 }, title: { display: true, text: 'Días', color: '#64748b' } },
    y: {
      min: 0, max: 100,
      ticks: { color: '#64748b', callback: (v: number | string) => `${v}%` },
      title: { display: true, text: 'Retención', color: '#64748b' },
    },
  },
}
</script>

<style scoped>
.cal-panel { display: flex; flex-direction: column; gap: 1rem; }
.card { padding: 1.1rem 1.25rem; }
.cal-title { font-family: var(--font-heading); font-size: 1.1rem; margin: 0 0 0.4rem; color: var(--color-text); }
.cal-p { margin: 0 0 0.75rem; font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.5; }
.cal-p code { background: var(--color-surface-2); padding: 0 0.3rem; border-radius: 4px; }
.cal-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.cal-saved { margin: 0.75rem 0 0; font-size: 0.85rem; color: #34d399; }
.cal-warn { border-left: 3px solid #f59e0b; font-size: 0.9rem; color: var(--color-text-muted); }
.cal-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.75rem; }
.cal-tile { display: flex; flex-direction: column; gap: 0.2rem; }
.tile-label { font-size: 0.75rem; color: var(--color-text-muted); }
.tile-val { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; color: var(--color-text); }
.tile-sub { font-size: 0.78rem; color: var(--color-text-muted); }
.chart-h { font-family: var(--font-heading); font-size: 0.98rem; margin: 0 0 0.6rem; color: var(--color-text); }
.cal-chart { height: 300px; }
.chart-note { margin: 0.6rem 0 0; font-size: 0.78rem; color: var(--color-text-muted); }
.prosp-row { display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem; font-size: 0.88rem; color: var(--color-text-muted); align-items: center; }
.prosp-verdict { font-weight: 600; color: #f59e0b; }
.prosp-verdict.ok { color: #34d399; }
.cal-honest { font-size: 0.85rem; color: var(--color-text-muted); border-left: 3px solid var(--color-border-light); line-height: 1.5; }
</style>
