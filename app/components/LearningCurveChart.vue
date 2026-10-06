<template>
  <div class="chart-card card">
    <div class="chart-header">
      <div>
        <div class="chart-badge badge-blue">Modelo Polinomial (scikit-learn)</div>
        <h4 class="chart-title">Curva de Aprendizaje</h4>
        <p class="chart-subtitle">Rendimiento académico estimado en función del tiempo de estudio</p>
      </div>
      <div class="chart-stat">
        <span class="stat-label">Punto Actual</span>
        <span class="stat-val">{{ horasActuales }}h → {{ calificacionActual.toFixed(1) }}/100</span>
      </div>
    </div>

    <div class="chart-canvas-container">
      <Line
        v-if="chartData.labels.length > 0"
        :data="chartData"
        :options="chartOptions"
      />
      <div v-else class="chart-loading">
        <div class="spinner"></div>
        <span>Calculando curva...</span>
      </div>
    </div>

    <div class="chart-footer">
      <div class="legend-item">
        <span class="legend-line line-primary"></span>
        <span>Curva de Aprendizaje Calibrada</span>
      </div>
      <div class="legend-item">
        <span class="legend-point point-highlight"></span>
        <span>Escenario Actual ({{ horasActuales }}h)</span>
      </div>
      <div class="legend-item">
        <span class="legend-line line-umbral"></span>
        <span>Umbral de Aprobación (60 pts)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Filler
)

const props = defineProps<{
  curva: { x: number[]; y: number[] } | null
  horasActuales: number
  calificacionActual: number
}>()

const chartData = computed(() => {
  if (!props.curva || !props.curva.x || props.curva.x.length === 0) {
    return { labels: [], datasets: [] }
  }

  const labels = props.curva.x.map((val) => `${val}h`)
  const curvePoints = props.curva.y.map((val) => Math.round(val * 10) / 10)

  // Encontrar el índice más cercano al punto actual
  let closestIdx = 0
  let minDiff = Infinity
  props.curva.x.forEach((xVal, idx) => {
    const diff = Math.abs(xVal - props.horasActuales)
    if (diff < minDiff) {
      minDiff = diff
      closestIdx = idx
    }
  })

  // Array de puntos destacados (solo uno visible)
  const pointRadii = props.curva.x.map((_, idx) => (idx === closestIdx ? 7 : 0))
  const pointHoverRadii = props.curva.x.map((_, idx) => (idx === closestIdx ? 9 : 4))

  return {
    labels,
    datasets: [
      {
        label: 'Calificación Predicha',
        data: curvePoints,
        borderColor: '#4f8ef7',
        borderWidth: 3,
        pointBackgroundColor: '#4f8ef7',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: pointRadii,
        pointHoverRadius: pointHoverRadii,
        tension: 0.35,
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx
          const gradient = ctx.createLinearGradient(0, 0, 0, 300)
          gradient.addColorStop(0, 'rgba(79, 142, 247, 0.28)')
          gradient.addColorStop(1, 'rgba(79, 142, 247, 0.00)')
          return gradient
        },
      },
      {
        label: 'Aprobación (60)',
        data: props.curva.x.map(() => 60),
        borderColor: 'rgba(251, 191, 36, 0.55)',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 500,
  },
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#1a2236',
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      borderColor: '#253351',
      borderWidth: 1,
      padding: 10,
      boxPadding: 4,
      callbacks: {
        label: (context: any) => {
          if (context.datasetIndex === 1) return 'Umbral aprobación: 60 pts'
          return `Calificación: ${context.parsed.y} / 100`
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.04)',
      },
      ticks: {
        color: '#64748b',
        font: { size: 11 },
        maxTicksLimit: 11,
      },
      title: {
        display: true,
        text: 'Horas de Estudio',
        color: '#64748b',
        font: { size: 12, weight: '500' as const },
      },
    },
    y: {
      min: 0,
      max: 100,
      grid: {
        color: 'rgba(255, 255, 255, 0.06)',
      },
      ticks: {
        color: '#64748b',
        font: { size: 11 },
        stepSize: 20,
      },
      title: {
        display: true,
        text: 'Calificación Estimada (0–100)',
        color: '#64748b',
        font: { size: 12, weight: '500' as const },
      },
    },
  },
}))
</script>

<style scoped>
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

.badge-blue {
  background: rgba(79, 142, 247, 0.15);
  color: #4f8ef7;
  border: 1px solid rgba(79, 142, 247, 0.3);
}

.chart-title {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
}

.chart-subtitle {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.chart-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: var(--color-surface-2);
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.stat-label {
  font-size: 0.68rem;
  color: var(--color-text-dim);
  text-transform: uppercase;
}

.stat-val {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-primary);
  font-family: var(--font-heading);
}

.chart-canvas-container {
  height: 280px;
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

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.legend-line {
  display: inline-block;
  width: 16px;
  height: 3px;
  border-radius: 2px;
}

.line-primary {
  background: #4f8ef7;
}

.line-umbral {
  background: #fbbf24;
  border-top: 1px dashed #fbbf24;
}

.legend-point {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.point-highlight {
  background: #4f8ef7;
  border: 2px solid #fff;
}
</style>
