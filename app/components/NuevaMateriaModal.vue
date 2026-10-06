<template>
  <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
    <div class="modal-card card animate-fade-in">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Nueva Materia</h2>
          <p class="modal-subtitle">Configura los parámetros cognitivos de la asignatura para calibrar el modelo ML</p>
        </div>
        <button class="btn btn-ghost btn-icon close-btn" @click="$emit('update:modelValue', false)" aria-label="Cerrar">
          ✕
        </button>
      </div>

      <form @submit.prevent="guardarMateria" class="modal-body">
        <div class="form-group">
          <label class="form-label" for="materia-nombre">Nombre de la Materia</label>
          <input
            id="materia-nombre"
            v-model="nombre"
            type="text"
            class="input"
            placeholder="Ej. Cálculo Multivariable, Anatomía Humana, etc."
            required
            :disabled="guardando"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Perfil de Aprendizaje de la Materia</label>
          <div class="tipo-cards">
            <label
              class="tipo-card"
              :class="{ 'tipo-card--active': tipo === 'MEMORISTICA' }"
            >
              <input type="radio" v-model="tipo" value="MEMORISTICA" class="sr-only" />
              <div class="tipo-badge badge-memoristica">Memorística</div>
              <div class="tipo-title">Alta Carga de Memoria</div>
              <p class="tipo-desc">
                Crecimiento rápido con pocas horas de estudio, pero decaimiento acelerado (olvido rápido) sin repaso continuo.
              </p>
              <span class="tipo-examples">Ej: Vocabulario, Historia, Anatomía</span>
            </label>

            <label
              class="tipo-card"
              :class="{ 'tipo-card--active': tipo === 'LOGICO_MATEMATICA' }"
            >
              <input type="radio" v-model="tipo" value="LOGICO_MATEMATICA" class="sr-only" />
              <div class="tipo-badge badge-logico">Lógico-Matemática</div>
              <div class="tipo-title">Razonamiento Estructural</div>
              <p class="tipo-desc">
                Curva inicial con pendiente más suave; retención estructural más duradera una vez consolidado el concepto.
              </p>
              <span class="tipo-examples">Ej: Cálculo, Física, Algoritmos</span>
            </label>

            <label
              class="tipo-card"
              :class="{ 'tipo-card--active': tipo === 'MIXTA' }"
            >
              <input type="radio" v-model="tipo" value="MIXTA" class="sr-only" />
              <div class="tipo-badge badge-mixta">Mixta</div>
              <div class="tipo-title">Conceptual y Aplicada</div>
              <p class="tipo-desc">
                Equilibrio entre adquisición conceptual y deducción analítica. Tasa de retención intermedia.
              </p>
              <span class="tipo-examples">Ej: Química Orgánica, Economía, Medicina</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="materia-dificultad">
            Dificultad del contenido según el docente:
            <strong>{{ dificultad }} / 5</strong>
          </label>
          <input
            id="materia-dificultad"
            v-model.number="dificultad"
            type="range"
            min="1"
            max="5"
            step="1"
            :disabled="guardando"
          />
          <small class="tipo-desc">
            Los estudiantes que respondan la encuesta heredan este valor. 1 = muy fácil, 5 = muy difícil.
          </small>
        </div>

        <div v-if="error" class="error-banner">
          {{ error }}
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-ghost"
            @click="$emit('update:modelValue', false)"
            :disabled="guardando"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="guardando || !nombre.trim()"
          >
            <span v-if="guardando" class="spinner-sm"></span>
            <span>{{ guardando ? 'Creando...' : 'Crear Asignatura' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'creada', materia: any): void
}>()

const nombre = ref('')
const tipo = ref<'MEMORISTICA' | 'LOGICO_MATEMATICA' | 'MIXTA'>('MIXTA')
const dificultad = ref(3)
const guardando = ref(false)
const error = ref('')

async function guardarMateria() {
  if (!nombre.value.trim()) return
  guardando.value = true
  error.value = ''

  try {
    const res = await $fetch('/api/materias', {
      method: 'POST',
      body: {
        nombre: nombre.value.trim(),
        tipo: tipo.value,
        dificultadDocente: dificultad.value,
      },
    })
    nombre.value = ''
    tipo.value = 'MIXTA'
    dificultad.value = 3
    emit('creada', res)
    emit('update:modelValue', false)
  } catch (err: any) {
    error.value = err?.data?.message || 'Error al crear la materia'
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 7, 14, 0.78);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-card {
  width: 100%;
  max-width: 640px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  box-shadow: var(--shadow-lg), 0 0 40px rgba(0, 0, 0, 0.6);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.modal-subtitle {
  font-size: 0.825rem;
  color: var(--color-text-muted);
}

.close-btn {
  font-size: 1rem;
  color: var(--color-text-dim);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-2);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.tipo-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.tipo-card {
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
  padding: 1rem 0.85rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transition: all var(--duration-fast) var(--ease);
}

.tipo-card:hover {
  border-color: var(--color-border-light);
  transform: translateY(-2px);
}

.tipo-card--active {
  border-color: var(--color-primary);
  background: rgba(79, 142, 247, 0.08);
  box-shadow: 0 0 16px rgba(79, 142, 247, 0.15);
}

.tipo-badge {
  align-self: flex-start;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
}

.badge-memoristica {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
}

.badge-logico {
  background: rgba(167, 139, 250, 0.15);
  color: #a78bfa;
}

.badge-mixta {
  background: rgba(79, 142, 247, 0.15);
  color: #4f8ef7;
}

.tipo-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
  margin-top: 0.2rem;
}

.tipo-desc {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  line-height: 1.35;
}

.tipo-examples {
  font-size: 0.68rem;
  color: var(--color-text-dim);
  font-style: italic;
  margin-top: auto;
}

.error-banner {
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #f87171;
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.825rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.spinner-sm {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.4rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .tipo-cards {
    grid-template-columns: 1fr;
  }
}
</style>
