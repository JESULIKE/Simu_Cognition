<template>
  <div class="materia-selector-wrapper">
    <div class="selector-header">
      <div class="selector-label">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <span>Asignatura activa</span>
      </div>
      <button class="btn btn-ghost btn-sm new-btn" @click="showModal = true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>Nueva</span>
      </button>
    </div>

    <!-- Dropdown / Selector -->
    <div v-if="materias.length > 0" class="selector-body">
      <div class="select-container">
        <select
          :value="modelValue"
          class="materia-select"
          @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="mat in materias" :key="mat.id" :value="mat.id">
            {{ mat.nombre }} ({{ formatTipo(mat.tipo) }})
          </option>
        </select>
        <div class="select-chevron">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      <!-- Selected subject details tag -->
      <div v-if="selectedMateria" class="materia-tag-badge">
        <span class="badge" :class="getBadgeClass(selectedMateria.tipo)">
          {{ formatTipo(selectedMateria.tipo) }}
        </span>
        <span class="materia-hint">{{ getTipoHint(selectedMateria.tipo) }}</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-materias">
      <p class="empty-text">No tienes asignaturas registradas</p>
      <button class="btn btn-primary btn-sm" @click="showModal = true">
        Crear tu primera materia
      </button>
    </div>

    <!-- Modal para crear materia -->
    <NuevaMateriaModal
      v-model="showModal"
      @creada="handleMateriaCreada"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface MateriaItem {
  id: string
  nombre: string
  tipo: 'MEMORISTICA' | 'LOGICO_MATEMATICA' | 'MIXTA'
  creadoEn: string
}

const props = defineProps<{
  materias: MateriaItem[]
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', id: string): void
  (e: 'recargar'): void
}>()

const showModal = ref(false)

const selectedMateria = computed(() =>
  props.materias.find((m) => m.id === props.modelValue)
)

function formatTipo(tipo: string): string {
  switch (tipo) {
    case 'MEMORISTICA':
      return 'Memorística'
    case 'LOGICO_MATEMATICA':
      return 'Lógico-Matemática'
    case 'MIXTA':
      return 'Mixta'
    default:
      return tipo
  }
}

function getBadgeClass(tipo: string): string {
  switch (tipo) {
    case 'MEMORISTICA':
      return 'badge-memoristica'
    case 'LOGICO_MATEMATICA':
      return 'badge-logico'
    case 'MIXTA':
      return 'badge-mixta'
    default:
      return 'badge-default'
  }
}

function getTipoHint(tipo: string): string {
  switch (tipo) {
    case 'MEMORISTICA':
      return 'Curva empinada • Olvido acelerado sin repasos frecuentes'
    case 'LOGICO_MATEMATICA':
      return 'Curva gradual • Alta retención estructural a largo plazo'
    case 'MIXTA':
      return 'Curva balanceada • Requiere combinación de práctica y teoría'
    default:
      return ''
  }
}

function handleMateriaCreada(nueva: MateriaItem) {
  emit('recargar')
  emit('update:modelValue', nueva.id)
}
</script>

<style scoped>
.materia-selector-wrapper {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.15rem 1.25rem;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.selector-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.new-btn {
  font-size: 0.8rem;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-sm);
}
.new-btn:hover {
  background: rgba(79, 142, 247, 0.12);
}

.selector-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.select-container {
  position: relative;
  width: 100%;
}

.materia-select {
  width: 100%;
  appearance: none;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.65rem 2.25rem 0.65rem 0.85rem;
  cursor: pointer;
  outline: none;
  transition: border-color var(--duration-fast) var(--ease);
}
.materia-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-glow);
}

.select-chevron {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
}

.materia-tag-badge {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
}

.badge-memoristica {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.25);
}

.badge-logico {
  background: rgba(167, 139, 250, 0.15);
  color: #a78bfa;
  border: 1px solid rgba(167, 139, 250, 0.25);
}

.badge-mixta {
  background: rgba(79, 142, 247, 0.15);
  color: #4f8ef7;
  border: 1px solid rgba(79, 142, 247, 0.25);
}

.materia-hint {
  font-size: 0.775rem;
  color: var(--color-text-muted);
}

.empty-materias {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  text-align: center;
}

.empty-text {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
</style>
