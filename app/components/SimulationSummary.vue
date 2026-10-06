<template>
  <div class="summary-section">
    <!-- Grid de métricas clave -->
    <div class="metrics-grid">
      <!-- 1. Calificación predicha -->
      <div class="metric-card card">
        <div class="metric-header">
          <span class="metric-label">Calificación Predicha</span>
          <span class="metric-badge" :class="calificacionBadgeClass">
            {{ calificacionStatus }}
          </span>
        </div>
        <div class="metric-body">
          <div class="metric-val">
            <span class="val-number">{{ calificacionPredicha.toFixed(1) }}</span>
            <span class="val-unit">/ 100</span>
          </div>
          <div class="progress-track">
            <div
              class="progress-fill"
              :class="calificacionProgressClass"
              :style="{ width: `${Math.min(100, Math.max(0, calificacionPredicha))}%` }"
            ></div>
          </div>
        </div>
        <span class="metric-desc">Estimada por el modelo polinomial</span>
      </div>

      <!-- 2. Día de repaso óptimo -->
      <div class="metric-card card">
        <div class="metric-header">
          <span class="metric-label">Intervención Recomendada</span>
          <span class="metric-badge badge-purple">Ebbinghaus</span>
        </div>
        <div class="metric-body">
          <div class="metric-val">
            <span class="val-number font-purple">Día {{ diaRepasoOptimo.toFixed(1) }}</span>
          </div>
          <p class="metric-subtext">
            Momento idóneo para el 1er repaso espaciado antes de cruzar el umbral del {{ Math.round(umbralRetencion * 100) }}%.
          </p>
        </div>
        <span class="metric-desc">Repaso de refuerzo activo</span>
      </div>

      <!-- 3. Retención a 7 días -->
      <div class="metric-card card">
        <div class="metric-header">
          <span class="metric-label">Retención a 7 Días</span>
          <span class="metric-badge badge-teal">Corto plazo</span>
        </div>
        <div class="metric-body">
          <div class="metric-val">
            <span class="val-number font-teal">{{ retencion7d.toFixed(1) }}%</span>
          </div>
          <p class="metric-subtext">
            Memoria conservada tras una semana sin repasos adicionales.
          </p>
        </div>
        <span class="metric-desc">Decaimiento exponencial</span>
      </div>

      <!-- 4. Retención a 30 días -->
      <div class="metric-card card">
        <div class="metric-header">
          <span class="metric-label">Retención a 30 Días</span>
          <span class="metric-badge badge-amber">Largo plazo</span>
        </div>
        <div class="metric-body">
          <div class="metric-val">
            <span class="val-number font-amber">{{ retencion30d.toFixed(1) }}%</span>
          </div>
          <p class="metric-subtext">
            Retención residual al finalizar el mes.
          </p>
        </div>
        <span class="metric-desc">Base de memoria permanente</span>
      </div>
    </div>

    <!-- Panel de Diagnóstico Pedagógico Inteligente -->
    <div class="pedagogical-advice card">
      <div class="advice-header">
        <div class="advice-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>
        <div>
          <h4 class="advice-title">Diagnóstico Didáctico para el Docente</h4>
          <p class="advice-subtitle">Recomendaciones pedagógicas basadas en el perfil cognitivo y la simulación actual</p>
        </div>
      </div>
      <div class="advice-content">
        <p class="advice-p">{{ recomendacionEstrategia }}</p>
        <p class="advice-p advice-secondary">{{ recomendacionHoras }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  calificacionPredicha: number
  diaRepasoOptimo: number
  umbralRetencion: number
  curvaOlvido: { x_dias: number[]; retencion: number[] } | null
  tipoMateria?: string
  horasEstudio: number
  repasosPrevios: number
  dificultad: number
}>()

// Retención a los 7 días
const retencion7d = computed(() => {
  if (!props.curvaOlvido) return 0
  const idx = props.curvaOlvido.x_dias.findIndex((d) => d === 7)
  if (idx !== -1) {
    const v = props.curvaOlvido.retencion[idx]
    return v <= 1 ? v * 100 : v
  }
  return 0
})

// Retención a los 30 días
const retencion30d = computed(() => {
  if (!props.curvaOlvido) return 0
  const idx = props.curvaOlvido.x_dias.findIndex((d) => d === 30)
  if (idx !== -1) {
    const v = props.curvaOlvido.retencion[idx]
    return v <= 1 ? v * 100 : v
  }
  return 0
})

// Calificación status y badges
const calificacionStatus = computed(() => {
  const c = props.calificacionPredicha
  if (c >= 85) return 'Sobresaliente'
  if (c >= 70) return 'Notable'
  if (c >= 60) return 'Aprobado'
  return 'En Riesgo'
})

const calificacionBadgeClass = computed(() => {
  const c = props.calificacionPredicha
  if (c >= 85) return 'badge-green'
  if (c >= 70) return 'badge-blue'
  if (c >= 60) return 'badge-amber'
  return 'badge-danger'
})

const calificacionProgressClass = computed(() => {
  const c = props.calificacionPredicha
  if (c >= 85) return 'fill-green'
  if (c >= 70) return 'fill-blue'
  if (c >= 60) return 'fill-amber'
  return 'fill-danger'
})

// Diagnósticos didácticos
const recomendacionEstrategia = computed(() => {
  const tipo = props.tipoMateria || 'MIXTA'
  const dia = props.diaRepasoOptimo.toFixed(1)

  if (tipo === 'MEMORISTICA') {
    return `Para asignaturas de alta carga memorística, la tasa de olvido inicial es especialmente agresiva. Con los parámetros actuales, programa una actividad de recuerdo activo (flashcards, micro-quizzing o preguntas rápidas al inicio de clase) exactamente en el Día ${dia}, antes de que se desvanezca más del ${Math.round((1 - props.umbralRetencion) * 100)}% de los conceptos.`
  } else if (tipo === 'LOGICO_MATEMATICA') {
    return `En materias lógico-matemáticas, la retención estructural es más robusta una vez comprendido el principio. Sin embargo, la resolución de ejercicios prácticos guiados en el Día ${dia} consolidará los esquemas de razonamiento y evitará la degradación de la memoria operativa.`
  } else {
    return `Al ser una materia mixta, se sugiere articular una sesión dual en el Día ${dia}: 10 minutos de recuperación de terminología teórica seguidos de 20 minutos de aplicación en casos prácticos.`
  }
})

const recomendacionHoras = computed(() => {
  if (props.horasEstudio >= 7) {
    return `Atención: Con ${props.horasEstudio} horas consecutivas, el modelo muestra una clara desaceleración marginal en el rendimiento (ley de rendimientos decrecientes). Recomienda a tus alumnos fragmentar el estudio en bloques de 3 a 4 horas espaciadas a lo largo de varios días para maximizar la absorción.`
  } else if (props.horasEstudio < 2.5 && props.dificultad >= 4) {
    return `Alerta: Para una dificultad nivel ${props.dificultad}, un tiempo de estudio de solo ${props.horasEstudio}h puede resultar insuficiente para garantizar una nota aprobatoria sólida. Sugiere reforzar con al menos 2 horas adicionales y 1 sesión de repaso.`
  } else {
    return `La asignación de ${props.horasEstudio} horas de estudio con ${props.repasosPrevios} repasos se encuentra en una franja equilibrada de rendimiento/esfuerzo para este nivel.`
  }
})
</script>

<style scoped>
.summary-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.metric-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.metric-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
}

.badge-green {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.badge-blue {
  background: rgba(79, 142, 247, 0.15);
  color: #4f8ef7;
  border: 1px solid rgba(79, 142, 247, 0.3);
}

.badge-purple {
  background: rgba(167, 139, 250, 0.15);
  color: #a78bfa;
  border: 1px solid rgba(167, 139, 250, 0.3);
}

.badge-teal {
  background: rgba(45, 212, 191, 0.15);
  color: #2dd4bf;
  border: 1px solid rgba(45, 212, 191, 0.3);
}

.badge-amber {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.badge-danger {
  background: rgba(248, 113, 113, 0.15);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.metric-body {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.metric-val {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.val-number {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.1;
}

.val-unit {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.font-purple {
  color: #a78bfa;
}

.font-teal {
  color: #2dd4bf;
}

.font-amber {
  color: #fbbf24;
}

.metric-subtext {
  font-size: 0.725rem;
  color: var(--color-text-muted);
  line-height: 1.35;
}

.progress-track {
  width: 100%;
  height: 6px;
  background: var(--color-surface-2);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.4rem;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.fill-green {
  background: #34d399;
}
.fill-blue {
  background: #4f8ef7;
}
.fill-amber {
  background: #fbbf24;
}
.fill-danger {
  background: #f87171;
}

.metric-desc {
  font-size: 0.68rem;
  color: var(--color-text-dim);
}

/* Advice */
.pedagogical-advice {
  background: linear-gradient(135deg, rgba(79, 142, 247, 0.08) 0%, rgba(167, 139, 250, 0.05) 100%);
  border: 1px solid rgba(79, 142, 247, 0.25);
  border-radius: var(--radius-md);
  padding: 1.35rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.advice-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.advice-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: rgba(79, 142, 247, 0.15);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.advice-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.advice-subtitle {
  font-size: 0.775rem;
  color: var(--color-text-muted);
}

.advice-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.advice-p {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--color-text);
}

.advice-secondary {
  color: var(--color-text-muted);
  font-size: 0.8rem;
  padding-top: 0.4rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
}

@media (max-width: 1080px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
