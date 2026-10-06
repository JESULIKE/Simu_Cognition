<template>
  <div class="chart-card card">
    <div class="chart-header">
      <div>
        <div class="chart-badge badge-purple">{{ etiquetaModelo || 'Modelo Ebbinghaus Paramétrico' }}</div>
        <h4 class="chart-title">Curva de Olvido</h4>
        <p class="chart-subtitle">Decaimiento temporal de retención en memoria y momento crítico de repaso</p>
      </div>
      <div class="chart-stat">
        <span class="stat-label">Repaso Óptimo Sugerido</span>
        <span class="stat-val">Día {{ diaRepasoOptimo.toFixed(1) }}</span>
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
        <span>Calculando curva de retención...</span>
      </div>
    </div>

    <div class="chart-footer">
      <div class="legend-item">
        <span class="legend-line line-ebbinghaus"></span>
        <span>Retención Estimada (% de memoria conservada)</span>
      </div>
      <div v-if="plan && plan.dias.length > 0" class="legend-item">
        <span class="legend-line" style="border-top: 3px solid #34d399; width: 24px; display: inline-block"></span>
        <span>Con repasos planificados (se reinicia en cada repaso)</span>
      </div>
      <div class="legend-item">
        <span class="legend-line line-umbral-ret"></span>
        <span>Umbral Mínimo Deseado ({{ Math.round(umbralRetencion * 100) }}%)</span>
      </div>
      <div class="legend-item">
        <span class="legend-point point-repaso"></span>
        <span>Día de Repaso Espaciado (Día {{ diaRepasoOptimo.toFixed(1) }})</span>
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
import { retencionConPlan, type PlanRepasos } from '~/composables/usePlanRepasos'

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
  curva: { x_dias: number[]; retencion: number[] } | null
  diaRepasoOptimo: number
  umbralRetencion: number
  /** Si se pasa, se dibuja además la curva con los repasos del plan. */
  plan?: PlanRepasos | null
  /** Texto del badge: curva teórica o calibrada con el grupo. */
  etiquetaModelo?: string
}>()

const chartData = computed(() => {
  if (!props.curva || !props.curva.x_dias || props.curva.x_dias.length === 0) {
    return { labels: [], datasets: [] }
  }

  const labels = props.curva.x_dias.map((d) => `d${d}`)
  // En Python retencion viene como fracción 0.0 - 1.0 (o porcentaje si fue transformado)
  const retentionPercents = props.curva.retencion.map((val) => {
    const v = val <= 1.0 ? val * 100 : val
    return Math.round(v * 10) / 10
  })

  // Encontrar el punto más cercano a diaRepasoOptimo
  let closestIdx = 0
  let minDiff = Infinity
  props.curva.x_dias.forEach((day, idx) => {
    const diff = Math.abs(day - props.diaRepasoOptimo)
    if (diff < minDiff) {
      minDiff = diff
      closestIdx = idx
    }
  })

  const pointRadii = props.curva.x_dias.map((_, idx) => (idx === closestIdx ? 7 : 0))
  const pointHoverRadii = props.curva.x_dias.map((_, idx) => (idx === closestIdx ? 9 : 4))
  const umbralPercent = Math.round(props.umbralRetencion * 100)

  return {
    labels,
    datasets: [
      {
        label: 'Retención de Memoria (%)',
        data: retentionPercents,
        borderColor: '#a78bfa',
        borderWidth: 3,
        pointBackgroundColor: '#a78bfa',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: pointRadii,
        pointHoverRadius: pointHoverRadii,
        tension: 0.35,
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx
          const gradient = ctx.createLinearGradient(0, 0, 0, 300)
          gradient.addColorStop(0, 'rgba(167, 139, 250, 0.28)')
          gradient.addColorStop(1, 'rgba(167, 139, 250, 0.00)')
          return gradient
        },
      },
      ...(props.plan && props.plan.dias.length > 0
        ? [{
            label: 'Con repasos planificados (%)',
            data: props.curva.x_dias.map((d) => Math.round(retencionConPlan(d, props.plan as PlanRepasos) * 1000) / 10),
            borderColor: '#34d399',
            borderWidth: 2.5,
            pointRadius: 0,
            tension: 0,
            fill: false,
          }]
        : []),
      {
        label: `Umbral de Retención (${umbralPercent}%)`,
        data: props.curva.x_dias.map(() => umbralPercent),
        borderColor: 'rgba(52, 211, 153, 0.7)',
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
          if (String(context.dataset.label).startsWith('Umbral')) {
            return `Umbral deseado: ${Math.round(props.umbralRetencion * 100)}%`
          }
          if (String(context.dataset.label).startsWith('Con repasos')) {
            return `Con repasos planificados: ${context.parsed.y}%`
          }
          return `Sin repaso: ${context.parsed.y}%`
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
        maxTicksLimit: 12,
      },
      title: {
        display: true,
        text: 'Días Transcurridos desde la Sesión',
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
        callback: (val: any) => `${val}%`,
      },
      title: {
        display: true,
        text: 'Retención de Memoria (%)',
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

.badge-purple {
  background: rgba(167, 139, 250, 0.15);
  color: #a78bfa;
  border: 1px solid rgba(167, 139, 250, 0.3);
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
  color: #a78bfa;
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

.line-ebbinghaus {
  background: #a78bfa;
}

.line-umbral-ret {
  background: #34d399;
  border-top: 1px dashed #34d399;
}

.legend-point {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.point-repaso {
  background: #a78bfa;
  border: 2px solid #fff;
}
</style>
