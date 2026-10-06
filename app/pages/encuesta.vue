<template>
  <div class="encuesta-page">
    <head>
      <title>Cuestionario de Hábitos de Estudio — Simu-Cognition</title>
      <meta name="description" content="Encuesta anónima para evaluar hábitos de estudio y calibrar curvas cognitivas de aprendizaje." />
    </head>

    <!-- Header / Hero -->
    <header class="encuesta-header">
      <div class="header-content">
        <span class="badge-pill">Participación Anónima</span>
        <h1 class="page-title">Cuestionario de Hábitos de Estudio</h1>
        <p class="page-subtitle">
          Tus respuestas ayudarán a modelar curvas de retención y optimizar los tiempos de repaso. Esta encuesta es 100% anónima.
        </p>
      </div>
    </header>

    <main class="encuesta-container">
      <!-- Loading state -->
      <div v-if="loadingMaterias" class="card card-loading">
        <div class="spinner"></div>
        <p>Cargando encuesta...</p>
      </div>

      <!-- Success Screen -->
      <div v-else-if="submitted" class="card success-card">
        <div class="success-icon">✓</div>
        <h2 class="success-title">¡Cuestionario Completado con Éxito!</h2>
        <p class="success-desc">
          Muchas gracias por tu tiempo. Tu aporte ha sido registrado en la base de datos de investigación.
        </p>
        <div class="anon-code-box">
          <span class="anon-code-label">Tu código de participante:</span>
          <strong class="anon-code-val">{{ createdCodigo }}</strong>
          <span class="anon-code-hint">Guardá este código si tu docente te lo solicita para registrar tus notas de quiz.</span>
        </div>
        <button type="button" class="btn-primary" @click="resetForm">
          Responder otro cuestionario
        </button>
      </div>

      <!-- Form Card -->
      <form v-else class="card form-card" @submit.prevent="submitEncuesta">
        <!-- 1. Materia (viene del enlace/QR que comparte el docente) -->
        <section class="form-group">
          <label class="field-label">
            <span class="step-num">1</span>
            Materia o tema
          </label>
          <div v-if="!materia" class="alert alert-warning">
            Este enlace no es válido o está incompleto. Pídele a tu docente el enlace o el código QR de la encuesta.
          </div>
          <div v-else class="materia-fija">
            <strong>{{ materia.nombre }}</strong>
            <span class="field-hint">{{ formatTipo(materia.tipo) }}</span>
          </div>
        </section>

        <!-- 2. Código anónimo opcional -->
        <section class="form-group">
          <label class="field-label" for="codigo-anonimo">
            <span class="step-num">2</span>
            Código o identificador asignado (opcional)
          </label>
          <input
            id="codigo-anonimo"
            v-model="form.codigoAnonimo"
            type="text"
            class="form-input"
            placeholder="Ej. EST-012 (si te dieron uno, o déjalo vacío para autogenerar)"
          />
          <span class="field-hint">Si tu docente te asignó un código específico, ingrésalo aquí. Si no, déjalo en blanco.</span>
        </section>

        <!-- 3. Tiempo de estudio y repasos -->
        <section class="form-group">
          <label class="field-label">
            <span class="step-num">3</span>
            Tiempo dedicado y repasos
          </label>
          
          <div class="grid-2">
            <div class="sub-field">
              <label class="sub-label" for="horas-estudio">
                Horas de estudio dedicadas:
                <strong class="accent-val">{{ form.horasEstudio }}h</strong>
              </label>
              <input
                id="horas-estudio"
                v-model.number="form.horasEstudio"
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                class="form-range"
              />
              <div class="range-labels">
                <span>0.5h</span>
                <span>5h</span>
                <span>10h</span>
              </div>
            </div>

            <div class="sub-field">
              <label class="sub-label">
                Repasos previos realizados:
                <strong class="accent-val">{{ form.repasosPrevios }}</strong>
              </label>
              <div class="pill-group">
                <button
                  v-for="r in [0, 1, 2, 3, 4, 5]"
                  :key="r"
                  type="button"
                  class="pill-btn"
                  :class="{ active: form.repasosPrevios === r }"
                  @click="form.repasosPrevios = r"
                >
                  {{ r }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. Escala Likert de Técnicas de Estudio Activo -->
        <section class="form-group">
          <label class="field-label">
            <span class="step-num">4</span>
            Técnicas de estudio activo aplicadas
            <span class="field-sub">Indica qué tan frecuente aplicaste cada técnica (1 = Nunca, 5 = Siempre)</span>
          </label>

          <div class="likert-list">
            <div
              v-for="(item, idx) in LIKERT_ITEMS"
              :key="idx"
              class="likert-card"
            >
              <div class="likert-desc">{{ item }}</div>
              <div class="rating-buttons">
                <button
                  v-for="val in 5"
                  :key="val"
                  type="button"
                  class="rate-btn"
                  :class="{ selected: likertValues[idx] === val }"
                  @click="likertValues[idx] = val"
                >
                  {{ val }}
                </button>
              </div>
            </div>
          </div>

          <!-- Indicador visual de Calidad de Estudio -->
          <div class="calidad-banner">
            <div class="calidad-info">
              <span>Índice de Calidad de Estudio Calculado:</span>
              <strong>{{ (calidadEstudioCalc * 100).toFixed(0) }}% ({{ calidadEstudioCalc.toFixed(2) }})</strong>
            </div>
            <div class="progress-track">
              <div class="progress-bar" :style="{ width: `${calidadEstudioCalc * 100}%` }"></div>
            </div>
          </div>
        </section>

        <!-- 5. Dificultad percibida -->
        <section class="form-group">
          <label class="field-label">
            <span class="step-num">5</span>
            ¿Qué tan difícil te pareció este tema?
          </label>
          <div class="rating-row-full">
            <button
              v-for="d in [1, 2, 3, 4, 5]"
              :key="d"
              type="button"
              class="difficulty-btn"
              :class="{ active: form.dificultadPercibida === d }"
              @click="form.dificultadPercibida = d"
            >
              <span class="dif-num">{{ d }}</span>
              <span class="dif-desc">{{ DIF_LABELS[d - 1] }}</span>
            </button>
          </div>
        </section>

        <!-- Error alert -->
        <div v-if="errorMsg" class="alert alert-danger">
          {{ errorMsg }}
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button
            type="submit"
            class="btn-primary btn-submit"
            :disabled="!isFormValid || submitting"
          >
            <span v-if="submitting" class="spinner-sm"></span>
            {{ submitting ? 'Enviando respuestas...' : 'Enviar Respuestas' }}
          </button>
          <p class="terms-note">
            Al enviar este formulario aceptas que tus respuestas anónimas se utilicen con fines académicos y de investigación.
          </p>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
interface MateriaItem {
  id: string
  nombre: string
  tipo: string
}

const route = useRoute()

const LIKERT_ITEMS = [
  'Elaboré resúmenes, esquemas o mapas conceptuales con mis propias palabras.',
  'Practiqué recordar el contenido activamente sin mirar el material (active recall).',
  'Espacié mis sesiones de estudio en vez de estudiar todo de una sentada.',
  'Me autoevalué con preguntas o ejercicios de prueba antes de la prueba.',
  'Estudié en un ambiente sin distracciones (lejos de celular y redes sociales).',
]

const DIF_LABELS = ['Muy Fácil', 'Fácil', 'Moderado', 'Difícil', 'Muy Difícil']

const materia = ref<MateriaItem | null>(null)
const loadingMaterias = ref(true)
const submitting = ref(false)
const submitted = ref(false)
const createdCodigo = ref('')
const errorMsg = ref('')

const likertValues = ref<number[]>([0, 0, 0, 0, 0])

const form = ref({
  materiaId: '',
  codigoAnonimo: '',
  horasEstudio: 2,
  repasosPrevios: 0,
  dificultadPercibida: 0,
})

// La materia llega por el enlace /encuesta?materia=ID (enlace o QR del docente).
// No se listan materias: solo se resuelve la que el docente compartió.
onMounted(async () => {
  const paramMateria = route.query.materia as string | undefined
  try {
    if (paramMateria) {
      materia.value = await $fetch<MateriaItem>(`/api/publico/materias/${encodeURIComponent(paramMateria)}`)
      form.value.materiaId = materia.value.id
    }
  } catch {
    materia.value = null
  } finally {
    loadingMaterias.value = false
  }
})

function formatTipo(tipo: string) {
  if (tipo === 'LOGICO_MATEMATICA') return 'Lógico-Matemática'
  if (tipo === 'MEMORISTICA') return 'Memorística'
  return 'Mixta'
}

// calidad_estudio = promedio(ítems Likert) / 5
const calidadEstudioCalc = computed(() => {
  const answered = likertValues.value.filter((v) => v > 0)
  if (answered.length === 0) return 0
  const sum = answered.reduce((a, b) => a + b, 0)
  return sum / (answered.length * 5)
})

const isFormValid = computed(() => {
  return (
    materia.value &&
    form.value.materiaId &&
    form.value.horasEstudio >= 0.5 &&
    form.value.dificultadPercibida > 0 &&
    likertValues.value.every((v) => v > 0)
  )
})

async function submitEncuesta() {
  if (!isFormValid.value || submitting.value) return
  submitting.value = true
  errorMsg.value = ''

  try {
    const payload: Record<string, unknown> = {
      materiaId: form.value.materiaId,
      horasEstudio: form.value.horasEstudio,
      repasosPrevios: form.value.repasosPrevios,
      calidadEstudio: parseFloat(calidadEstudioCalc.value.toFixed(3)),
      dificultadPercibida: form.value.dificultadPercibida,
    }

    if (form.value.codigoAnonimo.trim()) {
      payload.codigoAnonimo = form.value.codigoAnonimo.trim()
    }

    const res = await $fetch<{ codigoAnonimo: string }>('/api/evaluaciones', {
      method: 'POST',
      body: payload,
    })

    createdCodigo.value = res.codigoAnonimo
    submitted.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    errorMsg.value = e?.data?.message || e?.message || 'Error al guardar la encuesta. Intenta nuevamente.'
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  submitted.value = false
  likertValues.value = [0, 0, 0, 0, 0]
  form.value.codigoAnonimo = ''
  form.value.dificultadPercibida = 0
  form.value.repasosPrevios = 0
  form.value.horasEstudio = 2
  createdCodigo.value = ''
  errorMsg.value = ''
}
</script>

<style scoped>
.encuesta-page {
  min-height: 100dvh;
  background: var(--color-bg);
  padding: 2.5rem 1rem 4rem;
  font-family: var(--font-body);
  color: var(--color-text);
}

.encuesta-header {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 2rem;
}

.badge-pill {
  display: inline-block;
  background: var(--color-primary-glow);
  color: var(--color-primary);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  margin-bottom: 0.75rem;
}

.page-title {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.75rem;
  color: var(--color-text);
}

.page-subtitle {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
}

.encuesta-container {
  max-width: 720px;
  margin: 0 auto;
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.card-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-muted);
  padding: 4rem 2rem;
}

.form-group {
  margin-bottom: 2rem;
  padding-bottom: 1.75rem;
  border-bottom: 1px solid var(--color-border-light);
}

.form-group:last-of-type {
  border-bottom: none;
  margin-bottom: 1rem;
  padding-bottom: 0;
}

.field-label {
  display: flex;
  flex-direction: column;
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-text);
  gap: 0.25rem;
}

.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  margin-right: 0.5rem;
}

.field-sub {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--color-text-muted);
}

.materia-fija {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
}

.field-hint {
  display: block;
  font-size: 0.8rem;
  color: var(--color-text-dim);
  margin-top: 0.35rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 600px) {
  .grid-2 {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}

.sub-field {
  background: var(--color-surface-2);
  padding: 1rem;
  border-radius: var(--radius-md);
}

.sub-label {
  display: block;
  font-size: 0.88rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.accent-val {
  color: var(--color-primary);
  font-weight: 700;
}

.form-range {
  width: 100%;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-text-dim);
  margin-top: 0.25rem;
}

.pill-group {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.pill-btn {
  flex: 1;
  min-width: 38px;
  padding: 0.45rem 0.6rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pill-btn:hover {
  border-color: var(--color-primary);
}

.pill-btn.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

/* Likert List */
.likert-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.likert-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--color-surface-2);
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
}

@media (max-width: 600px) {
  .likert-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

.likert-desc {
  font-size: 0.9rem;
  color: var(--color-text);
  flex: 1;
}

.rating-buttons {
  display: flex;
  gap: 0.35rem;
}

.rate-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.rate-btn:hover {
  border-color: var(--color-primary);
}

.rate-btn.selected {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}

/* Calidad Banner */
.calidad-banner {
  margin-top: 1.25rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
}

.calidad-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
  margin-bottom: 0.4rem;
  color: var(--color-text);
}

.progress-track {
  height: 8px;
  background: var(--color-border-light);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  transition: width 0.3s ease;
}

/* Perceived difficulty buttons */
.rating-row-full {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
}

@media (max-width: 500px) {
  .rating-row-full {
    grid-template-columns: 1fr;
  }
}

.difficulty-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.difficulty-btn:hover {
  border-color: var(--color-primary);
}

.difficulty-btn.active {
  background: var(--color-secondary);
  border-color: var(--color-secondary);
  color: #fff;
}

.dif-num {
  font-size: 1.1rem;
  font-weight: 700;
}

.dif-desc {
  font-size: 0.72rem;
  margin-top: 0.2rem;
  opacity: 0.9;
}

/* Form Actions */
.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-submit {
  width: 100%;
  padding: 0.95rem;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.terms-note {
  font-size: 0.8rem;
  color: var(--color-text-dim);
  text-align: center;
}

/* Success Card */
.success-card {
  text-align: center;
  padding: 3rem 2rem;
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #ecfdf5;
  color: #059669;
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  border: 2px solid #a7f3d0;
}

.success-title {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.success-desc {
  color: var(--color-text-muted);
  max-width: 480px;
  margin: 0 auto 1.5rem;
  line-height: 1.5;
}

.anon-code-box {
  background: #f1f5f9;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  max-width: 380px;
  margin: 0 auto 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.anon-code-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.anon-code-val {
  font-family: monospace;
  font-size: 1.75rem;
  color: var(--color-primary);
  font-weight: 700;
}

.anon-code-hint {
  font-size: 0.75rem;
  color: var(--color-text-dim);
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
