<template>
  <div class="quiz-form card">
    <div class="quiz-header">
      <span class="badge badge-orange">Registro de Quiz</span>
      <h4 class="quiz-title">{{ evaluacion.codigoAnonimo }}</h4>
      <p class="quiz-sub">Registrar resultado del quiz para un momento de medición.</p>
    </div>

    <!-- Selector de momento -->
    <div class="momento-grid">
      <button
        v-for="m in MOMENTOS"
        :key="m.key"
        type="button"
        :id="`momento-${m.key}`"
        class="momento-btn"
        :class="{
          active: form.momento === m.key,
          registrado: momentosRegistrados.includes(m.key),
          invalido: momentosInvalidos.includes(m.key),
        }"
        @click="form.momento = m.key"
      >
        <span class="momento-label">{{ m.label }}</span>
        <span v-if="momentosRegistrados.includes(m.key)" class="momento-tag tag-ok">✓ Registrado</span>
        <span v-if="momentosInvalidos.includes(m.key)" class="momento-tag tag-warn">⚠ Excluido H2</span>
      </button>
    </div>

    <!-- Nota -->
    <label class="form-label">
      Nota obtenida (0 – 100)
      <input
        id="nota-obtenida"
        v-model.number="form.notaObtenida"
        type="number"
        min="0"
        max="100"
        step="0.5"
        class="form-input nota-input"
        required
      />
    </label>

    <!-- Control: reestudio -->
    <label class="checkbox-label" :class="{ checked: form.reestudioReportado }">
      <input
        id="reestudio-check"
        v-model="form.reestudioReportado"
        type="checkbox"
        class="sr-only"
      />
      <span class="checkbox-box"></span>
      <span class="checkbox-text">
        El estudiante repasó el tema desde la última evaluación
        <span class="checkbox-warn">(excluye este punto del análisis de retención H2)</span>
      </span>
    </label>

    <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>

    <button
      id="submit-resultado"
      type="button"
      class="btn-primary"
      :disabled="!isValid || loading"
      @click="handleSubmit"
    >
      <span v-if="loading" class="spinner-sm"></span>
      {{ loading ? 'Guardando…' : 'Registrar Resultado' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type Momento = 'INICIAL' | 'DIA_1' | 'DIA_3' | 'DIA_7' | 'DIA_14'

interface ResultadoExistente {
  momento: Momento
  reestudioReportado: boolean
}

const props = defineProps<{
  evaluacion: { id: string; codigoAnonimo: string }
  resultadosExistentes: ResultadoExistente[]
}>()

const emit = defineEmits<{
  (e: 'saved', resultado: Record<string, unknown>): void
}>()

const MOMENTOS: { key: Momento; label: string }[] = [
  { key: 'INICIAL', label: 'Día 0 (Inicial)' },
  { key: 'DIA_1',   label: 'Día 1' },
  { key: 'DIA_3',   label: 'Día 3' },
  { key: 'DIA_7',   label: 'Día 7' },
  { key: 'DIA_14',  label: 'Día 14' },
]

const form = ref<{ momento: Momento; notaObtenida: number; reestudioReportado: boolean }>({
  momento: 'INICIAL',
  notaObtenida: 0,
  reestudioReportado: false,
})

const loading = ref(false)
const errorMsg = ref('')

const momentosRegistrados = computed(() =>
  props.resultadosExistentes.map((r) => r.momento)
)

const momentosInvalidos = computed(() =>
  props.resultadosExistentes
    .filter((r) => r.reestudioReportado)
    .map((r) => r.momento)
)

const isValid = computed(
  () => form.value.momento && form.value.notaObtenida >= 0 && form.value.notaObtenida <= 100
)

async function handleSubmit() {
  if (!isValid.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    const result = await $fetch(`/api/evaluaciones/${props.evaluacion.id}/resultado`, {
      method: 'POST',
      body: {
        momento: form.value.momento,
        notaObtenida: form.value.notaObtenida,
        reestudioReportado: form.value.reestudioReportado,
      },
    })
    emit('saved', result as Record<string, unknown>)
    form.value = { momento: 'INICIAL', notaObtenida: 0, reestudioReportado: false }
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    errorMsg.value = e?.data?.message || e?.message || 'Error al registrar resultado.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.quiz-form {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.quiz-header { display: flex; flex-direction: column; gap: 0.25rem; }

.badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  width: fit-content;
}

.badge-orange {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.3);
}

.quiz-title { font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: var(--color-text); }
.quiz-sub   { font-size: 0.78rem; color: var(--color-text-muted); }

.momento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.5rem;
}

.momento-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.6rem 0.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  cursor: pointer;
  transition: all 0.15s;
}

.momento-btn:hover { border-color: var(--color-accent); }
.momento-btn.active { border-color: var(--color-accent); background: rgba(99,102,241,0.12); }
.momento-btn.registrado { border-color: #34d399; }
.momento-btn.invalido   { border-color: #fb923c; opacity: 0.7; }

.momento-label { font-size: 0.82rem; font-weight: 600; color: var(--color-text); }

.momento-tag {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-full);
  text-transform: uppercase;
}

.tag-ok   { background: rgba(52,211,153,0.15); color: #34d399; }
.tag-warn { background: rgba(251,146,60,0.15);  color: #fb923c; }

.form-label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.form-input {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.form-input:focus { outline: none; border-color: var(--color-accent); }
.nota-input { max-width: 140px; }

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  transition: border-color 0.15s;
}

.checkbox-label.checked { border-color: #fb923c; background: rgba(251,146,60,0.06); }

.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }

.checkbox-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid var(--color-border);
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.15s;
}

.checkbox-label.checked .checkbox-box {
  background: #fb923c;
  border-color: #fb923c;
}

.checkbox-text {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.checkbox-warn {
  display: block;
  font-size: 0.72rem;
  color: #fb923c;
  font-style: italic;
  margin-top: 0.15rem;
}

.form-error {
  font-size: 0.8rem;
  color: #f87171;
  background: rgba(248,113,113,0.08);
  border: 1px solid rgba(248,113,113,0.2);
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

.btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner-sm {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
