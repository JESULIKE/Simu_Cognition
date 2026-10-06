<template>
  <div class="eval-form">
    <!-- Sección 1: Ficha del docente -->
    <div class="form-section">
      <div class="section-header">
        <span class="section-badge badge-blue">Ficha del Docente</span>
        <h3 class="section-title">Configuración del Tema</h3>
        <p class="section-desc">Completar antes de que el estudiante llene su parte.</p>
      </div>

      <div class="form-row">
        <label class="form-label">
          Materia
          <select id="materia-select" v-model="form.materiaId" class="form-select" required>
            <option value="" disabled>Seleccionar materia...</option>
            <option v-for="m in materias" :key="m.id" :value="m.id">{{ m.nombre }}</option>
          </select>
        </label>

        <label class="form-label">
          Tipo de materia (según docente)
          <select id="tipo-docente-select" v-model="form.tipoMateriaDocente" class="form-select" required>
            <option value="MEMORISTICA">Memorística</option>
            <option value="LOGICO_MATEMATICA">Lógico-Matemática</option>
            <option value="MIXTA">Mixta</option>
          </select>
        </label>
      </div>

      <label class="form-label">
        Dificultad del tema (percepción del docente)
        <div class="rubrica-hint">
          1 = contenido ya visto y repasado varias veces &nbsp;|&nbsp;
          5 = contenido completamente nuevo y abstracto
        </div>
        <div class="rating-row">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            :id="`dif-docente-${n}`"
            class="rating-btn"
            :class="{ active: form.dificultadDocente === n }"
            @click="form.dificultadDocente = n"
          >{{ n }}</button>
        </div>
      </label>

      <label class="form-label">
        Código anónimo del estudiante
        <div class="codigo-row">
          <input
            id="codigo-anonimo"
            v-model="form.codigoAnonimo"
            type="text"
            class="form-input"
            placeholder="Se genera automáticamente (ej. EST-001)"
          />
          <span class="codigo-hint">Deja en blanco para asignar automáticamente</span>
        </div>
      </label>
    </div>

    <!-- Sección 2: Cuestionario del estudiante -->
    <div class="form-section">
      <div class="section-header">
        <span class="section-badge badge-teal">Cuestionario del Estudiante</span>
        <h3 class="section-title">Hábitos de Estudio</h3>
        <p class="section-desc">El estudiante completa esta sección de forma individual.</p>
      </div>

      <div class="form-row">
        <label class="form-label">
          Horas de estudio dedicadas a este tema
          <input
            id="horas-estudio"
            v-model.number="form.horasEstudio"
            type="number"
            min="0.5"
            max="10"
            step="0.5"
            class="form-input"
            required
          />
        </label>
        <label class="form-label">
          Número de repasos previos realizados
          <input
            id="repasos-previos"
            v-model.number="form.repasosPrevios"
            type="number"
            min="0"
            max="5"
            step="1"
            class="form-input"
            required
          />
        </label>
      </div>

      <!-- 5 ítems Likert de calidad de estudio -->
      <div class="likert-block">
        <div class="likert-header">
          Técnicas de estudio activo
          <span class="likert-sub">Escala: 1 = Nunca &nbsp;|&nbsp; 5 = Siempre</span>
        </div>
        <div
          v-for="(item, idx) in likertItems"
          :key="idx"
          class="likert-item"
        >
          <span class="likert-label">{{ item.label }}</span>
          <div class="likert-scale">
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              :id="`likert-${idx}-${n}`"
              class="rating-btn rating-btn-sm"
              :class="{ active: likertValues[idx] === n }"
              @click="likertValues[idx] = n"
            >{{ n }}</button>
          </div>
        </div>
        <div class="calidad-result">
          Calidad de estudio calculada:
          <strong>{{ calidadEstudioCalc.toFixed(2) }}</strong>
          <span class="calidad-bar-wrap">
            <span class="calidad-bar" :style="{ width: `${calidadEstudioCalc * 100}%` }"></span>
          </span>
        </div>
      </div>

      <label class="form-label">
        Dificultad percibida por el estudiante
        <div class="rating-row">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            :id="`dif-percibida-${n}`"
            class="rating-btn"
            :class="{ active: form.dificultadPercibida === n }"
            @click="form.dificultadPercibida = n"
          >{{ n }}</button>
        </div>
      </label>
    </div>

    <!-- Error y submit -->
    <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>

    <button
      id="submit-evaluacion"
      type="button"
      class="btn-primary"
      :disabled="!isValid || loading"
      @click="handleSubmit"
    >
      <span v-if="loading" class="spinner-sm"></span>
      {{ loading ? 'Guardando…' : 'Registrar Estudiante' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  materias: { id: string; nombre: string; tipo: string }[]
  initialMateriaId?: string
}>()

const emit = defineEmits<{
  (e: 'created', evaluacion: Record<string, unknown>): void
}>()

const LIKERT_ITEMS = [
  'Practiqué recordando el contenido sin ver mis apuntes (active recall).',
  'Espacié mis sesiones de estudio en vez de estudiar todo de una sentada.',
  'Me autoevalué con preguntas o ejercicios antes del quiz.',
  'Le expliqué el contenido a alguien más o en voz alta.',
  'Estudié en un ambiente sin distracciones (celular, redes, etc.).',
]

const likertItems = LIKERT_ITEMS.map((label) => ({ label }))
const likertValues = ref<number[]>([0, 0, 0, 0, 0])

const form = ref({
  materiaId: '',
  tipoMateriaDocente: 'MEMORISTICA' as 'MEMORISTICA' | 'LOGICO_MATEMATICA' | 'MIXTA',
  dificultadDocente: 0,
  codigoAnonimo: '',
  horasEstudio: 2,
  repasosPrevios: 0,
  dificultadPercibida: 0,
})

watch(
  () => props.initialMateriaId,
  (newId) => {
    if (newId && (!form.value.materiaId || form.value.materiaId !== newId)) {
      form.value.materiaId = newId
    }
  },
  { immediate: true }
)

const loading = ref(false)
const errorMsg = ref('')

// calidad_estudio = promedio(ítems Likert) / 5
const calidadEstudioCalc = computed(() => {
  const filled = likertValues.value.filter((v) => v > 0)
  if (filled.length === 0) return 0
  return filled.reduce((a, b) => a + b, 0) / (filled.length * 5)
})

const isValid = computed(() =>
  form.value.materiaId &&
  form.value.dificultadDocente > 0 &&
  form.value.dificultadPercibida > 0 &&
  form.value.horasEstudio >= 0.5 &&
  likertValues.value.every((v) => v > 0)
)

async function handleSubmit() {
  if (!isValid.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    const body: Record<string, unknown> = {
      materiaId: form.value.materiaId,
      tipoMateriaDocente: form.value.tipoMateriaDocente,
      dificultadDocente: form.value.dificultadDocente,
      horasEstudio: form.value.horasEstudio,
      repasosPrevios: form.value.repasosPrevios,
      calidadEstudio: parseFloat(calidadEstudioCalc.value.toFixed(3)),
      dificultadPercibida: form.value.dificultadPercibida,
    }
    if (form.value.codigoAnonimo.trim()) {
      body.codigoAnonimo = form.value.codigoAnonimo.trim()
    }
    const result = await $fetch('/api/evaluaciones', { method: 'POST', body })
    emit('created', result as Record<string, unknown>)
    // Reset manteniendo la materia seleccionada
    const currentMateria = form.value.materiaId
    form.value = {
      materiaId: currentMateria,
      tipoMateriaDocente: 'MEMORISTICA',
      dificultadDocente: 0,
      codigoAnonimo: '',
      horasEstudio: 2,
      repasosPrevios: 0,
      dificultadPercibida: 0,
    }
    likertValues.value = [0, 0, 0, 0, 0]
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    errorMsg.value = e?.data?.message || e?.message || 'Error al guardar la evaluación.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.eval-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.section-badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  margin-bottom: 0.2rem;
  width: fit-content;
}

.badge-blue {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.badge-teal {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.section-title {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
}

.section-desc {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
}

.form-label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.form-input,
.form-select {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-accent);
}

.form-select option {
  background: var(--color-surface);
}

.rubrica-hint {
  font-size: 0.72rem;
  color: var(--color-text-dim);
  font-style: italic;
  margin-bottom: 0.25rem;
}

.rating-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.rating-btn {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.rating-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.rating-btn.active {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}

.rating-btn-sm {
  width: 1.9rem;
  height: 1.9rem;
  font-size: 0.8rem;
}

.codigo-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.codigo-hint {
  font-size: 0.72rem;
  color: var(--color-text-dim);
  font-style: italic;
}

/* Likert */
.likert-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.likert-header {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.likert-sub {
  font-size: 0.72rem;
  color: var(--color-text-dim);
  font-weight: 400;
}

.likert-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.5rem 0;
  border-top: 1px solid var(--color-border);
}

.likert-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  flex: 1;
  min-width: 180px;
}

.likert-scale {
  display: flex;
  gap: 0.35rem;
  flex-shrink: 0;
}

.calidad-result {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
}

.calidad-result strong {
  color: #34d399;
  font-size: 0.95rem;
}

.calidad-bar-wrap {
  flex: 1;
  min-width: 80px;
  height: 5px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}

.calidad-bar {
  display: block;
  height: 100%;
  background: #34d399;
  border-radius: 3px;
  transition: width 0.3s;
}

/* Submit */
.form-error {
  font-size: 0.8rem;
  color: #f87171;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
}

.btn-primary {
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.65rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s, transform 0.15s;
  width: fit-content;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
