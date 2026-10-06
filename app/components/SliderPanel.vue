<template>
  <div class="slider-panel card">
    <div class="panel-header">
      <div>
        <h3 class="panel-title">Variables de la Simulación</h3>
        <p class="panel-subtitle">Ajusta los factores pedagógicos del estudiante o cohorte</p>
      </div>
      <button class="btn btn-ghost btn-sm reset-btn" @click="resetDefaults" title="Restablecer valores por defecto">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
        <span>Reset</span>
      </button>
    </div>

    <!-- Presets rápidos -->
    <div class="presets-row">
      <span class="presets-label">Escenarios:</span>
      <button
        class="preset-chip"
        :class="{ 'preset-chip--active': activePreset === 'promedio' }"
        @click="applyPreset('promedio')"
      >
        Estudiante Promedio
      </button>
      <button
        class="preset-chip"
        :class="{ 'preset-chip--active': activePreset === 'intensivo' }"
        @click="applyPreset('intensivo')"
      >
        Pre-Examen Intensivo
      </button>
      <button
        class="preset-chip"
        :class="{ 'preset-chip--active': activePreset === 'inicio' }"
        @click="applyPreset('inicio')"
      >
        Inicio de Curso
      </button>
    </div>

    <div class="sliders-list">
      <!-- 1. Horas de estudio -->
      <div class="slider-group">
        <div class="slider-meta">
          <div class="slider-title-box">
            <span class="slider-name">Horas de Estudio</span>
            <span class="slider-hint">Tiempo total dedicado a la sesión</span>
          </div>
          <span class="slider-value-badge badge-blue">{{ modelValue.horas_estudio }} hrs</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="10"
          step="0.5"
          :value="modelValue.horas_estudio"
          @input="updateField('horas_estudio', Number(($event.target as HTMLInputElement).value))"
          class="range-slider range-blue"
        />
        <div class="slider-ticks">
          <span>0.5h (Mín)</span>
          <span>5h</span>
          <span>10h (Máx)</span>
        </div>
      </div>

      <!-- 2. Nivel de Dificultad -->
      <div class="slider-group">
        <div class="slider-meta">
          <div class="slider-title-box">
            <span class="slider-name">Dificultad de la Materia</span>
            <span class="slider-hint">{{ getDificultadLabel(modelValue.dificultad) }}</span>
          </div>
          <span class="slider-value-badge badge-purple">Nivel {{ modelValue.dificultad }} / 5</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          :value="modelValue.dificultad"
          @input="updateField('dificultad', Number(($event.target as HTMLInputElement).value))"
          class="range-slider range-purple"
        />
        <div class="slider-ticks">
          <span>1 (Fácil)</span>
          <span>3 (Intermedio)</span>
          <span>5 (Muy Complejo)</span>
        </div>
      </div>

      <!-- 3. Repasos previos -->
      <div class="slider-group">
        <div class="slider-meta">
          <div class="slider-title-box">
            <span class="slider-name">Repasos Previos Realizados</span>
            <span class="slider-hint">Mitiga el factor de decaimiento en la curva de Ebbinghaus</span>
          </div>
          <span class="slider-value-badge badge-green">{{ modelValue.repasos_previos }} repasos</span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          :value="modelValue.repasos_previos"
          @input="updateField('repasos_previos', Number(($event.target as HTMLInputElement).value))"
          class="range-slider range-green"
        />
        <div class="slider-ticks">
          <span>0 (Primer contacto)</span>
          <span>2 - 3</span>
          <span>5 (Consolidado)</span>
        </div>
      </div>

      <!-- 4. Calidad de Estudio -->
      <div class="slider-group">
        <div class="slider-meta">
          <div class="slider-title-box">
            <span class="slider-name">Calidad / Foco de Estudio</span>
            <span class="slider-hint">Atención sostenida, técnicas activas vs pasivas</span>
          </div>
          <span class="slider-value-badge badge-amber">{{ Math.round(modelValue.calidad_estudio * 100) }}%</span>
        </div>
        <input
          type="range"
          min="0.30"
          max="1.00"
          step="0.05"
          :value="modelValue.calidad_estudio"
          @input="updateField('calidad_estudio', Number(($event.target as HTMLInputElement).value))"
          class="range-slider range-amber"
        />
        <div class="slider-ticks">
          <span>30% (Distracción)</span>
          <span>70% (Estándar)</span>
          <span>100% (Foco Profundo)</span>
        </div>
      </div>

      <!-- 5. Umbral de retención -->
      <div class="slider-group">
        <div class="slider-meta">
          <div class="slider-title-box">
            <span class="slider-name">Umbral Crítico de Retención</span>
            <span class="slider-hint">Punto en el cual se requiere repasar antes de olvidar</span>
          </div>
          <span class="slider-value-badge badge-teal">{{ Math.round(modelValue.umbral_retencion * 100) }}%</span>
        </div>
        <input
          type="range"
          min="0.50"
          max="0.95"
          step="0.05"
          :value="modelValue.umbral_retencion"
          @input="updateField('umbral_retencion', Number(($event.target as HTMLInputElement).value))"
          class="range-slider range-teal"
        />
        <div class="slider-ticks">
          <span>50% (Mínimo)</span>
          <span>70% (Recomendado)</span>
          <span>95% (Exigente)</span>
        </div>
      </div>
    </div>

    <!-- Indicador de estado de cálculo -->
    <div class="panel-footer">
      <div class="status-indicator">
        <span class="status-dot" :class="{ 'status-dot--loading': loading }"></span>
        <span class="status-text">{{ loading ? 'Calculando predicción ML...' : 'Predicción actualizada en tiempo real' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface SimulationParams {
  horas_estudio: number
  dificultad: number
  repasos_previos: number
  calidad_estudio: number
  umbral_retencion: number
}

const props = defineProps<{
  modelValue: SimulationParams
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: SimulationParams): void
  (e: 'change'): void
}>()

const activePreset = ref<string>('promedio')

function updateField<K extends keyof SimulationParams>(key: K, val: SimulationParams[K]) {
  activePreset.value = ''
  const updated = { ...props.modelValue, [key]: val }
  emit('update:modelValue', updated)
  emit('change')
}

function getDificultadLabel(dif: number): string {
  switch (dif) {
    case 1:
      return 'Introductoria / Conceptos fundamentales'
    case 2:
      return 'Básica con aplicaciones sencillas'
    case 3:
      return 'Nivel medio universitario'
    case 4:
      return 'Avanzada / Alta abstracción'
    case 5:
      return 'Alta complejidad / Múltiples variables'
    default:
      return ''
  }
}

function applyPreset(type: 'promedio' | 'intensivo' | 'inicio') {
  activePreset.value = type
  let preset: SimulationParams
  if (type === 'promedio') {
    preset = {
      horas_estudio: 4.0,
      dificultad: 3,
      repasos_previos: 1,
      calidad_estudio: 0.75,
      umbral_retencion: 0.70,
    }
  } else if (type === 'intensivo') {
    preset = {
      horas_estudio: 7.5,
      dificultad: 4,
      repasos_previos: 3,
      calidad_estudio: 0.90,
      umbral_retencion: 0.80,
    }
  } else {
    preset = {
      horas_estudio: 2.0,
      dificultad: 2,
      repasos_previos: 0,
      calidad_estudio: 0.65,
      umbral_retencion: 0.70,
    }
  }
  emit('update:modelValue', preset)
  emit('change')
}

function resetDefaults() {
  applyPreset('promedio')
}
</script>

<style scoped>
.slider-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.panel-title {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.2rem;
}

.panel-subtitle {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.reset-btn {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
}
.reset-btn:hover {
  color: var(--color-text);
}

/* Presets */
.presets-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.presets-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-dim);
  text-transform: uppercase;
}

.preset-chip {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease);
}
.preset-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
}
.preset-chip--active {
  background: rgba(79, 142, 247, 0.15);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}

/* Sliders */
.sliders-list {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.slider-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.slider-title-box {
  display: flex;
  flex-direction: column;
}

.slider-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.slider-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.slider-value-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-heading);
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

.badge-green {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.badge-amber {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.badge-teal {
  background: rgba(45, 212, 191, 0.15);
  color: #2dd4bf;
  border: 1px solid rgba(45, 212, 191, 0.3);
}

/* Custom Range Styles */
.range-slider {
  width: 100%;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: var(--color-surface-2);
  outline: none;
  cursor: pointer;
  transition: background 0.2s;
}

.range-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  transition: transform 0.15s, box-shadow 0.15s;
}
.range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.range-blue::-webkit-slider-thumb {
  background: #4f8ef7;
  box-shadow: 0 0 12px rgba(79, 142, 247, 0.5);
}

.range-purple::-webkit-slider-thumb {
  background: #a78bfa;
  box-shadow: 0 0 12px rgba(167, 139, 250, 0.5);
}

.range-green::-webkit-slider-thumb {
  background: #34d399;
  box-shadow: 0 0 12px rgba(52, 211, 153, 0.5);
}

.range-amber::-webkit-slider-thumb {
  background: #fbbf24;
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.5);
}

.range-teal::-webkit-slider-thumb {
  background: #2dd4bf;
  box-shadow: 0 0 12px rgba(45, 212, 191, 0.5);
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.675rem;
  color: var(--color-text-dim);
}

.panel-footer {
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 6px var(--color-accent);
}

.status-dot--loading {
  background: var(--color-warning);
  box-shadow: 0 0 6px var(--color-warning);
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  from { opacity: 0.4; }
  to { opacity: 1; }
}
</style>
