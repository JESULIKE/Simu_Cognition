<template>
  <div class="dashboard-page animate-fade-in">
    <!-- Top Bar / Header -->
    <header class="page-header">
      <div>
        <div class="header-pretitle">Simulador Pedagógico Docente</div>
        <h1 class="header-title">Laboratorio de Curvas de Aprendizaje y Olvido</h1>
      </div>
      <div class="header-actions">
        <div class="guardar-bar">
          <input
            v-model="nombreEstudiante"
            type="text"
            class="input-estudiante"
            placeholder="Estudiante (opcional)"
            maxlength="50"
            @keyup.enter="guardarEnHistorial"
          />
          <button
            class="btn btn-primary btn-sm btn-guardar"
            :disabled="guardando || !simResult"
            @click="guardarEnHistorial"
            title="Guardar esta simulación en el historial"
          >
            <svg v-if="!guardando && !guardadoExito" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            <span v-if="guardando" class="spinner-sm"></span>
            <span v-else-if="guardadoExito">✓ ¡Guardado!</span>
            <span v-else>Guardar en Historial</span>
          </button>
        </div>

        <div class="status-chip">
          <span class="pulse-dot"></span>
          <span>Motor ML Activo</span>
        </div>
      </div>
    </header>

    <!-- Error Banner si hay falla en la API -->
    <div v-if="apiError" class="api-error-banner card">
      <div class="error-icon">⚠️</div>
      <div class="error-body">
        <span class="error-title">Atención con el servicio de simulación</span>
        <p class="error-message">{{ apiError }}</p>
      </div>
      <button class="btn btn-ghost btn-sm" @click="ejecutarSimulacion">Reintentar</button>
    </div>

    <!-- Si no hay materias aún -->
    <div v-if="cargandoMaterias" class="loading-state card">
      <div class="spinner"></div>
      <p>Cargando materias del docente...</p>
    </div>

    <div v-else-if="materias.length === 0" class="no-materias card">
      <div class="no-materias-icon">📚</div>
      <h2 class="no-materias-title">¡Bienvenido a Simu-Cognition!</h2>
      <p class="no-materias-desc">
        Para comenzar a simular curvas de retención y aprendizaje, necesitas registrar tu primera materia o cargar materias de ejemplo.
      </p>
      <div class="no-materias-actions">
        <button class="btn btn-primary" @click="showNuevaMateria = true">
          + Crear mi primera materia
        </button>
        <button class="btn btn-ghost" @click="crearMateriasEjemplo" :disabled="creandoEjemplo">
          {{ creandoEjemplo ? 'Creando ejemplos...' : 'Cargar materias de prueba' }}
        </button>
      </div>
    </div>

    <!-- Contenido principal del Simulador -->
    <div v-else class="simulator-layout">
      <!-- Columna Izquierda: Asignatura y Sliders -->
      <section class="left-col">
        <MateriaSelector
          v-model="materiaIdSeleccionada"
          :materias="materias"
          @recargar="cargarMaterias"
        />

        <SliderPanel
          v-model="params"
          :loading="simulando"
          @change="debouncedSimulate"
        />
      </section>

      <!-- Columna Derecha: KPIs y Gráficos -->
      <section class="right-col">
        <!-- KPIs y Diagnóstico pedagógico -->
        <SimulationSummary
          :calificacion-predicha="simResult?.calificacion_predicha ?? 0"
          :dia-repaso-optimo="simResult?.dia_repaso_optimo ?? 0"
          :umbral-retencion="params.umbral_retencion"
          :curva-olvido="simResult?.curva_olvido ?? null"
          :tipo-materia="materiaActual?.tipo"
          :horas-estudio="params.horas_estudio"
          :repasos-previos="params.repasos_previos"
          :dificultad="params.dificultad"
        />

        <!-- Contenedor de Gráficos -->
        <div class="charts-container">
          <div class="charts-grid">
            <LearningCurveChart
              :curva="simResult?.curva_aprendizaje ?? null"
              :horas-actuales="params.horas_estudio"
              :calificacion-actual="simResult?.calificacion_predicha ?? 0"
            />

            <ForgettingCurveChart
              :curva="simResult?.curva_olvido ?? null"
              :dia-repaso-optimo="simResult?.dia_repaso_optimo ?? 0"
              :umbral-retencion="params.umbral_retencion"
            />
          </div>
        </div>
      </section>
    </div>

    <!-- Modal nueva materia -->
    <NuevaMateriaModal
      v-model="showNuevaMateria"
      @creada="handleNuevaMateria"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'dashboard',
})

interface Materia {
  id: string
  nombre: string
  tipo: 'MEMORISTICA' | 'LOGICO_MATEMATICA' | 'MIXTA'
  creadoEn: string
}

interface SimResult {
  curva_aprendizaje: { x: number[]; y: number[] }
  curva_olvido: { x_dias: number[]; retencion: number[] }
  calificacion_predicha: number
  dia_repaso_optimo: number
}

const materias = ref<Materia[]>([])
const materiaIdSeleccionada = ref<string>('')
const cargandoMaterias = ref(true)
const creandoEjemplo = ref(false)
const showNuevaMateria = ref(false)

const params = ref({
  horas_estudio: 4.0,
  dificultad: 3,
  repasos_previos: 1,
  calidad_estudio: 0.75,
  umbral_retencion: 0.70,
})

const simResult = ref<SimResult | null>(null)
const simulando = ref(false)
const apiError = ref('')

const nombreEstudiante = ref('')
const guardando = ref(false)
const guardadoExito = ref(false)

const materiaActual = computed(() =>
  materias.value.find((m) => m.id === materiaIdSeleccionada.value)
)

async function cargarMaterias() {
  cargandoMaterias.value = true
  try {
    const res = await $fetch<Materia[]>('/api/materias')
    materias.value = res || []
    if (materias.value.length > 0 && !materiaIdSeleccionada.value) {
      materiaIdSeleccionada.value = materias.value[0].id
    }
  } catch (err: any) {
    console.error('Error cargando materias:', err)
  } finally {
    cargandoMaterias.value = false
  }
}

async function crearMateriasEjemplo() {
  creandoEjemplo.value = true
  try {
    const m1 = await $fetch('/api/materias', {
      method: 'POST',
      body: { nombre: 'Cálculo Diferencial e Integral', tipo: 'LOGICO_MATEMATICA' },
    })
    const m2 = await $fetch('/api/materias', {
      method: 'POST',
      body: { nombre: 'Anatomía Humana y Fisiología', tipo: 'MEMORISTICA' },
    })
    const m3 = await $fetch('/api/materias', {
      method: 'POST',
      body: { nombre: 'Química Orgánica y Bioquímica', tipo: 'MIXTA' },
    })
    await cargarMaterias()
    materiaIdSeleccionada.value = (m1 as any).id
  } catch (err) {
    console.error('Error creando ejemplos:', err)
  } finally {
    creandoEjemplo.value = false
  }
}

async function ejecutarSimulacion() {
  if (!materiaIdSeleccionada.value) return

  simulando.value = true
  apiError.value = ''

  try {
    const res = await $fetch<SimResult>('/api/simulate', {
      method: 'POST',
      body: {
        materiaId: materiaIdSeleccionada.value,
        horas_estudio: params.value.horas_estudio,
        dificultad: params.value.dificultad,
        repasos_previos: params.value.repasos_previos,
        calidad_estudio: params.value.calidad_estudio,
        umbral_retencion: params.value.umbral_retencion,
      },
    })
    simResult.value = res
  } catch (err: any) {
    console.error('Error al simular:', err)
    apiError.value =
      err?.data?.message ||
      'No se pudo conectar con el microservicio ML. Asegúrate de que el servicio Python esté en ejecución.'
  } finally {
    simulando.value = false
  }
}

async function guardarEnHistorial() {
  if (!materiaIdSeleccionada.value || !simResult.value || guardando.value) return

  guardando.value = true
  try {
    await $fetch('/api/simulaciones/guardar', {
      method: 'POST',
      body: {
        materiaId: materiaIdSeleccionada.value,
        horas_estudio: params.value.horas_estudio,
        dificultad: params.value.dificultad,
        repasos_previos: params.value.repasos_previos,
        calidad_estudio: params.value.calidad_estudio,
        umbral_retencion: params.value.umbral_retencion,
        calificacion_predicha: simResult.value.calificacion_predicha,
        dia_repaso_optimo: simResult.value.dia_repaso_optimo,
        etiqueta: nombreEstudiante.value.trim() || undefined,
      },
    })
    guardadoExito.value = true
    nombreEstudiante.value = ''
    setTimeout(() => {
      guardadoExito.value = false
    }, 3000)
  } catch (err: any) {
    console.error('Error guardando en historial:', err)
    alert(err?.data?.message || 'Error al guardar simulación')
  } finally {
    guardando.value = false
  }
}

const debouncedSimulate = useDebounceFn(() => {
  ejecutarSimulacion()
}, 300)

watch(materiaIdSeleccionada, (newId) => {
  if (newId) {
    ejecutarSimulacion()
  }
})

function handleNuevaMateria(nueva: any) {
  materias.value.unshift(nueva)
  materiaIdSeleccionada.value = nueva.id
  ejecutarSimulacion()
}

onMounted(async () => {
  await cargarMaterias()
  if (materiaIdSeleccionada.value) {
    await ejecutarSimulacion()
  }
})
</script>

<style scoped>
.dashboard-page {
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

.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.guardar-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 0.25rem 0.35rem 0.25rem 0.75rem;
  border-radius: var(--radius-md);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.input-estudiante {
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text);
  font-size: 0.85rem;
  min-width: 170px;
}

.input-estudiante::placeholder {
  color: var(--color-text-muted);
  opacity: 0.8;
}

.btn-guardar {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
}

.status-chip {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.775rem;
  font-weight: 600;
  color: #34d399;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.25);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-full);
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
}

.api-error-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md);
}

.error-icon {
  font-size: 1.5rem;
}

.error-body {
  flex: 1;
}

.error-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #f87171;
  display: block;
  margin-bottom: 0.15rem;
}

.error-message {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

/* Empty states */
.loading-state,
.no-materias {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.no-materias-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.no-materias-title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
}

.no-materias-desc {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  max-width: 480px;
  line-height: 1.5;
}

.no-materias-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* Simulator 2-column Grid */
.simulator-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.75rem;
  align-items: start;
}

.left-col {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: sticky;
  top: 1.5rem;
}

.right-col {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

@media (max-width: 1200px) {
  .simulator-layout {
    grid-template-columns: 1fr;
  }
  .left-col {
    position: static;
  }
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
