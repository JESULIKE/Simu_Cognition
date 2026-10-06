<template>
  <div class="historial-page animate-fade-in">
    <!-- Header -->
    <header class="page-header">
      <div>
        <div class="header-pretitle">Registro Histórico</div>
        <h1 class="header-title">Simulaciones Realizadas</h1>
      </div>
      <NuxtLink to="/dashboard" class="btn btn-primary btn-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Volver al Simulador
      </NuxtLink>
    </header>

    <!-- Filtros de búsqueda -->
    <div class="filter-bar card">
      <div class="filter-group">
        <label class="filter-label" for="filter-materia">Filtrar por Asignatura:</label>
        <select
          id="filter-materia"
          v-model="filtroMateriaId"
          class="filter-select"
          @change="cargarHistorial(0)"
        >
          <option value="">Todas las asignaturas</option>
          <option v-for="mat in materias" :key="mat.id" :value="mat.id">
            {{ mat.nombre }}
          </option>
        </select>
      </div>

      <div class="filter-stats">
        <span class="total-badge">{{ totalSimulaciones }} simulaciones</span>
        <button
          v-if="totalSimulaciones > 0"
          class="btn btn-ghost btn-xs btn-vaciar"
          :disabled="vaciando"
          @click="vaciarTodoHistorial"
          title="Eliminar todas las simulaciones de la vista actual"
        >
          {{ vaciando ? 'Vaciando...' : '🗑️ Vaciar Historial' }}
        </button>
      </div>
    </div>

    <!-- Estado cargando -->
    <div v-if="cargando" class="loading-state card">
      <div class="spinner"></div>
      <p>Cargando historial...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="simulaciones.length === 0" class="empty-state card">
      <div class="empty-icon">📊</div>
      <h3 class="empty-title">Sin simulaciones guardadas</h3>
      <p class="empty-desc">
        Aún no has guardado ninguna simulación. Ahora puedes ingresar al simulador y pulsar "Guardar en Historial" para registrar específicamente las simulaciones que deseas conservar.
      </p>
      <NuxtLink to="/dashboard" class="btn btn-primary">
        Ir al Simulador
      </NuxtLink>
    </div>

    <!-- Tabla / Lista de simulaciones -->
    <div v-else class="table-container card">
      <table class="sim-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Estudiante / Etiqueta</th>
            <th>Asignatura</th>
            <th>Parámetros de Entrada</th>
            <th>Calificación</th>
            <th>1er Repaso</th>
            <th class="text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sim in simulaciones" :key="sim.id" class="sim-row">
            <td class="col-fecha">
              <span class="fecha-main">{{ formatearFecha(sim.creadoEn) }}</span>
              <span class="fecha-sub">{{ formatearHora(sim.creadoEn) }}</span>
            </td>

            <td class="col-etiqueta">
              <span v-if="sim.etiqueta" class="etiqueta-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {{ sim.etiqueta }}
              </span>
              <span v-else class="etiqueta-muted">Sin asignar</span>
            </td>

            <td class="col-materia">
              <div class="materia-name">{{ sim.materia?.nombre || 'General' }}</div>
              <span class="badge" :class="getBadgeClass(sim.materia?.tipo)">
                {{ formatTipo(sim.materia?.tipo) }}
              </span>
            </td>

            <td class="col-params">
              <div class="param-tags">
                <span class="tag tag-blue">{{ sim.horasEstudio }}h estudio</span>
                <span class="tag tag-purple">Dif: {{ sim.dificultad }}/5</span>
                <span class="tag tag-green">{{ sim.repasosPrevios }} repasos</span>
                <span class="tag tag-amber">{{ Math.round(sim.calidadEstudio * 100) }}% foco</span>
              </div>
            </td>

            <td class="col-calificacion">
              <div class="cal-val" :class="getCalColorClass(sim.calificacionPredicha)">
                {{ sim.calificacionPredicha.toFixed(1) }} <span class="cal-max">/100</span>
              </div>
            </td>

            <td class="col-repaso">
              <div class="repaso-val">
                Día {{ sim.diaRepasoOptimo.toFixed(1) }}
              </div>
              <span class="repaso-sub">Umbral {{ Math.round(sim.umbralRetencion * 100) }}%</span>
            </td>

            <td class="col-accion">
              <button
                class="btn-delete"
                title="Eliminar este registro"
                :disabled="eliminandoId === sim.id"
                @click="eliminarSimulacion(sim.id)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div v-if="totalSimulaciones > limit" class="pagination-bar">
        <button
          class="btn btn-ghost btn-sm"
          :disabled="offset === 0"
          @click="cargarHistorial(offset - limit)"
        >
          ← Anterior
        </button>
        <span class="page-indicator">
          Mostrando {{ offset + 1 }}–{{ Math.min(offset + limit, totalSimulaciones) }} de {{ totalSimulaciones }}
        </span>
        <button
          class="btn btn-ghost btn-sm"
          :disabled="offset + limit >= totalSimulaciones"
          @click="cargarHistorial(offset + limit)"
        >
          Siguiente →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
})

interface SimulacionItem {
  id: string
  dificultad: number
  horasEstudio: number
  repasosPrevios: number
  calidadEstudio: number
  umbralRetencion: number
  calificacionPredicha: number
  diaRepasoOptimo: number
  etiqueta?: string | null
  creadoEn: string
  materia?: {
    id: string
    nombre: string
    tipo: string
  }
}

interface MateriaSimple {
  id: string
  nombre: string
  tipo: string
}

const simulaciones = ref<SimulacionItem[]>([])
const materias = ref<MateriaSimple[]>([])
const filtroMateriaId = ref('')
const totalSimulaciones = ref(0)
const limit = ref(15)
const offset = ref(0)
const cargando = ref(true)
const eliminandoId = ref<string | null>(null)
const vaciando = ref(false)

async function eliminarSimulacion(id: string) {
  if (!confirm('¿Deseas eliminar esta simulación del historial?')) return

  eliminandoId.value = id
  try {
    await $fetch(`/api/simulaciones/${id}`, { method: 'DELETE' })
    simulaciones.value = simulaciones.value.filter((s) => s.id !== id)
    totalSimulaciones.value = Math.max(0, totalSimulaciones.value - 1)
  } catch (err: any) {
    console.error('Error al eliminar simulación:', err)
    alert(err?.data?.message || 'Error al eliminar registro')
  } finally {
    eliminandoId.value = null
  }
}

async function vaciarTodoHistorial() {
  const confirmMsg = filtroMateriaId.value
    ? '¿Deseas vaciar todas las simulaciones de la asignatura seleccionada?'
    : '¿Deseas vaciar TODO el historial de simulaciones?'
  if (!confirm(confirmMsg)) return

  vaciando.value = true
  try {
    const params: Record<string, any> = {}
    if (filtroMateriaId.value) params.materiaId = filtroMateriaId.value
    await $fetch('/api/simulaciones/vaciar', { method: 'DELETE', params })
    await cargarHistorial(0)
  } catch (err: any) {
    console.error('Error vaciando historial:', err)
    alert(err?.data?.message || 'Error al vaciar el historial')
  } finally {
    vaciando.value = false
  }
}

async function cargarMaterias() {
  try {
    const res = await $fetch<MateriaSimple[]>('/api/materias')
    materias.value = res || []
  } catch (err) {
    console.error('Error al cargar materias:', err)
  }
}

async function cargarHistorial(nuevoOffset = 0) {
  cargando.value = true
  offset.value = nuevoOffset

  try {
    const params: Record<string, any> = {
      limit: limit.value,
      offset: offset.value,
    }
    if (filtroMateriaId.value) {
      params.materiaId = filtroMateriaId.value
    }

    const res = await $fetch<{
      simulaciones: SimulacionItem[]
      total: number
    }>('/api/simulaciones', { params })

    simulaciones.value = res.simulaciones || []
    totalSimulaciones.value = res.total || 0
  } catch (err) {
    console.error('Error cargando historial:', err)
  } finally {
    cargando.value = false
  }
}

function formatearFecha(isoStr: string): string {
  if (!isoStr) return '-'
  const d = new Date(isoStr)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatearHora(isoStr: string): string {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function formatTipo(tipo?: string): string {
  switch (tipo) {
    case 'MEMORISTICA':
      return 'Memorística'
    case 'LOGICO_MATEMATICA':
      return 'Lógico-Mat.'
    case 'MIXTA':
      return 'Mixta'
    default:
      return '-'
  }
}

function getBadgeClass(tipo?: string): string {
  switch (tipo) {
    case 'MEMORISTICA':
      return 'badge-memoristica'
    case 'LOGICO_MATEMATICA':
      return 'badge-logico'
    case 'MIXTA':
      return 'badge-mixta'
    default:
      return ''
  }
}

function getCalColorClass(cal: number): string {
  if (cal >= 85) return 'cal-green'
  if (cal >= 70) return 'cal-blue'
  if (cal >= 60) return 'cal-amber'
  return 'cal-danger'
}

onMounted(async () => {
  await cargarMaterias()
  await cargarHistorial(0)
})
</script>

<style scoped>
.historial-page {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  max-width: 1440px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-pretitle {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.header-title {
  font-family: var(--font-heading);
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
}

/* Filter bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.filter-select {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.85rem;
  padding: 0.45rem 1rem;
  outline: none;
  cursor: pointer;
}
.filter-select:focus {
  border-color: var(--color-primary);
}

.total-badge {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

/* Table */
.table-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.sim-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.sim-table th {
  padding: 1rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-dim);
  border-bottom: 1px solid var(--color-border);
  background: rgba(17, 24, 39, 0.6);
}

.sim-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.875rem;
  vertical-align: middle;
}

.sim-row:hover {
  background: var(--color-surface-2);
}

.col-fecha {
  display: flex;
  flex-direction: column;
}

.fecha-main {
  font-weight: 600;
  color: var(--color-text);
}

.fecha-sub {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.materia-name {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
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

.param-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.tag {
  font-size: 0.72rem;
  font-weight: 500;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
}

.tag-blue { color: #4f8ef7; }
.tag-purple { color: #a78bfa; }
.tag-green { color: #34d399; }
.tag-amber { color: #fbbf24; }

.cal-val {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
}

.cal-max {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 400;
}

.cal-green { color: #34d399; }
.cal-blue { color: #4f8ef7; }
.cal-amber { color: #fbbf24; }
.cal-danger { color: #f87171; }

.repaso-val {
  font-family: var(--font-heading);
  font-weight: 700;
  color: #a78bfa;
}

.repaso-sub {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
}

.page-indicator {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

/* Empty state */
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.empty-title {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-text);
}

.empty-desc {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  max-width: 450px;
  line-height: 1.5;
}

/* Etiqueta y acciones */
.col-etiqueta {
  white-space: nowrap;
}

.etiqueta-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(79, 142, 247, 0.12);
  color: var(--color-primary);
  border: 1px solid rgba(79, 142, 247, 0.25);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-sm);
}

.etiqueta-muted {
  font-size: 0.775rem;
  color: var(--color-text-muted);
  font-style: italic;
  opacity: 0.7;
}

.text-right {
  text-align: right;
}

.col-accion {
  text-align: right;
}

.btn-delete {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;
}

.btn-delete:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.btn-delete:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-vaciar {
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  margin-left: 0.75rem;
  transition: all 0.2s ease;
}

.btn-vaciar:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}

</style>
