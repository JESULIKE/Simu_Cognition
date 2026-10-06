<template>
  <div class="comparacion-wrap">
    <!-- H1: Calificación predicha vs real -->
    <div class="chart-card card">
      <div class="chart-header">
        <div>
          <div class="chart-badge badge-indigo">H1 — Curva de Aprendizaje</div>
          <h4 class="chart-title">Calificación Predicha vs Real</h4>
          <p class="chart-subtitle">Predicción del modelo polinomial (v3.0) comparada con la nota real del quiz inicial.</p>
        </div>
        <div class="stat-pair">
          <div class="chart-stat">
            <span class="stat-label">Predicha</span>
            <span class="stat-val indigo">{{ props.calificacionPredicha.toFixed(1) }}</span>
          </div>
          <div class="chart-stat">
            <span class="stat-label">Real</span>
            <span class="stat-val teal">{{ props.calificacionReal.toFixed(1) }}</span>
          </div>
          <div class="chart-stat">
            <span class="stat-label">Error Abs.</span>
            <span class="stat-val" :class="errorAbsClass">{{ props.errorAbsoluto.toFixed(1) }}</span>
          </div>
        </div>
      </div>

      <div class="chart-canvas-container">
        <Bar v-if="h1ChartData.labels.length" :data="h1ChartData" :options="h1Options" />
        <div v-else class="chart-loading">
          <div class="spinner"></div>
          <span>Sin datos de comparación aún…</span>
        </div>
      </div>
    </div>

    <!-- H2: Retención predicha vs real -->
    <div class="chart-card card" v-if="h2Visible">
      <div class="chart-header">
        <div>
          <div class="chart-badge badge-purple">H2 — Curva de Olvido (Ebbinghaus)</div>
          <h4 class="chart-title">Retención Predicha vs Real</h4>
          <p class="chart-subtitle">Decaimiento comparado en días 0, 1, 3, 7, 14. Puntos excluidos (reestudio) no se grafican.</p>
        </div>
        <div class="chart-stat">
          <span class="stat-label">Δ Retención prom.</span>
          <span class="stat-val" :class="deltaClass">{{ deltaFormatted }}</span>
        </div>
      </div>

      <div class="chart-canvas-container">
        <Line :data="h2ChartData" :options="h2Options" />
      </div>

      <div class="chart-footer">
        <div class="legend-item">
          <span class="legend-line" style="background:#6366f1;"></span>
          <span>Retención Predicha (Ebbinghaus)</span>
        </div>
        <div class="legend-item">
          <span class="legend-line" style="background:#34d399;"></span>
          <span>Retención Real (datos del estudiante)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend, LineElement, BarElement,
  LinearScale, PointElement, CategoryScale, Filler,
} from 'chart.js'
import { Line, Bar } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, LineElement, BarElement, LinearScale, PointElement, CategoryScale, Filler)

interface PuntoOlvido {
  dia: number
  retencion_predicha?: number
  retencion_real?: number
}

const props = defineProps<{
  calificacionPredicha: number
  calificacionReal: number
  errorAbsoluto: number
  curvaOlvidoPredicha: PuntoOlvido[]
  puntosOlvidoReales: PuntoOlvido[]
  deltaRetencionPromedio: number
}>()

// ── H1 ──────────────────────────────────────────────────────────────────────

const h1ChartData = computed(() => {
  if (props.calificacionPredicha === 0 && props.calificacionReal === 0)
    return { labels: [], datasets: [] }
  return {
    labels: ['Calificación'],
    datasets: [
      {
        label: 'Predicha',
        data: [props.calificacionPredicha],
        backgroundColor: 'rgba(99,102,241,0.7)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Real',
        data: [props.calificacionReal],
        backgroundColor: 'rgba(52,211,153,0.7)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }
})

const h1Options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, labels: { color: '#94a3b8', font: { size: 12 } } },
    tooltip: {
      backgroundColor: '#1a2236',
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      callbacks: {
        label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}`,
      },
    },
  },
  scales: {
    y: {
      min: 0, max: 100,
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#64748b', callback: (v: any) => `${v}` },
      title: { display: true, text: 'Calificación (0-100)', color: '#64748b', font: { size: 11 } },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#64748b' },
    },
  },
}))

const errorAbsClass = computed(() => ({
  'val-ok':   props.errorAbsoluto <= 5,
  'val-warn': props.errorAbsoluto > 5 && props.errorAbsoluto <= 10,
  'val-bad':  props.errorAbsoluto > 10,
}))

// ── H2 ──────────────────────────────────────────────────────────────────────

const h2Visible = computed(() => props.puntosOlvidoReales.length > 1)

const h2ChartData = computed(() => {
  const diasPred = props.curvaOlvidoPredicha.map((p) => p.dia)
  const retPred  = props.curvaOlvidoPredicha.map((p) => p.retencion_predicha ?? 0)

  const diasReal = props.puntosOlvidoReales.map((p) => p.dia)
  const retReal  = props.puntosOlvidoReales.map((p) => p.retencion_real ?? 0)

  // Union de etiquetas de días
  const allDias = [...new Set([...diasPred, ...diasReal])].sort((a, b) => a - b)
  const labels  = allDias.map((d) => `d${d}`)

  const predMap: Record<number, number> = {}
  diasPred.forEach((d, i) => { predMap[d] = retPred[i] })

  const realMap: Record<number, number> = {}
  diasReal.forEach((d, i) => { realMap[d] = retReal[i] })

  return {
    labels,
    datasets: [
      {
        label: 'Predicha',
        data: allDias.map((d) => predMap[d] !== undefined ? +(predMap[d] * 100).toFixed(1) : null),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.12)',
        borderWidth: 2.5,
        pointRadius: 4,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Real',
        data: allDias.map((d) => realMap[d] !== undefined ? +(realMap[d] * 100).toFixed(1) : null),
        borderColor: '#34d399',
        backgroundColor: 'rgba(52,211,153,0.12)',
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: '#34d399',
        tension: 0.3,
        fill: false,
      },
    ],
  }
})

const h2Options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  spanGaps: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1a2236',
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      callbacks: {
        label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y}%`,
      },
    },
  },
  scales: {
    y: {
      min: 0, max: 100,
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#64748b', callback: (v: any) => `${v}%` },
      title: { display: true, text: 'Retención (%)', color: '#64748b', font: { size: 11 } },
    },
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#64748b' },
      title: { display: true, text: 'Días desde el quiz inicial', color: '#64748b', font: { size: 11 } },
    },
  },
}))

const deltaFormatted = computed(() => {
  const v = props.deltaRetencionPromedio
  return `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}%`
})

const deltaClass = computed(() => ({
  'val-ok':   props.deltaRetencionPromedio >= -0.05,
  'val-warn': props.deltaRetencionPromedio < -0.05 && props.deltaRetencionPromedio >= -0.15,
  'val-bad':  props.deltaRetencionPromedio < -0.15,
}))
</script>

<style scoped>
.comparacion-wrap {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.chart-badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  margin-bottom: 0.35rem;
}

.badge-indigo {
  background: rgba(99,102,241,0.15);
  color: #818cf8;
  border: 1px solid rgba(99,102,241,0.3);
}

.badge-purple {
  background: rgba(167,139,250,0.15);
  color: #a78bfa;
  border: 1px solid rgba(167,139,250,0.3);
}

.chart-title  { font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: var(--color-text); }
.chart-subtitle { font-size: 0.78rem; color: var(--color-text-muted); }

.stat-pair {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.chart-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: var(--color-surface-2);
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  min-width: 72px;
}

.stat-label { font-size: 0.65rem; color: var(--color-text-dim); text-transform: uppercase; }
.stat-val   { font-size: 0.95rem; font-weight: 700; font-family: var(--font-heading); }
.stat-val.indigo { color: #818cf8; }
.stat-val.teal   { color: #34d399; }

.val-ok   { color: #34d399; }
.val-warn { color: #fb923c; }
.val-bad  { color: #f87171; }

.chart-canvas-container {
  height: 240px;
  position: relative;
  width: 100%;
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0.75rem;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.chart-footer {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.legend-item { display: flex; align-items: center; gap: 0.45rem; }
.legend-line {
  display: inline-block;
  width: 16px;
  height: 3px;
  border-radius: 2px;
}
</style>
