<template>
  <div class="datasets-page animate-fade-in">
    <!-- Header -->
    <header class="page-header">
      <div>
        <div class="header-pretitle">Calibración de Modelos ML</div>
        <h1 class="header-title">Datasets y Ajuste Empírico</h1>
      </div>
      <NuxtLink to="/dashboard" class="btn btn-primary btn-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Volver al Simulador
      </NuxtLink>
    </header>

    <!-- Selector de Asignatura -->
    <div class="materia-selector-card card">
      <div class="card-left">
        <label class="card-label" for="select-materia">Asignatura a calibrar:</label>
        <select id="select-materia" v-model="materiaId" class="select-input">
          <option v-for="mat in materias" :key="mat.id" :value="mat.id">
            {{ mat.nombre }} ({{ formatTipo(mat.tipo) }})
          </option>
        </select>
      </div>
      <div v-if="materiaActual" class="card-right">
        <span class="status-tag" :class="datasetStatusClass">
          {{ materiaActual.dataset?.origen === 'csv_subido' ? 'Modelo Personalizado' : 'Modelo Base Sintético' }}
        </span>
        <button
          v-if="materiaActual.dataset?.origen === 'csv_subido'"
          class="btn btn-ghost btn-xs"
          :disabled="restableciendo"
          @click="restablecerModeloBase"
          title="Restaurar a los pesos sintéticos originales"
        >
          {{ restableciendo ? 'Restableciendo...' : '↺ Restablecer a Base' }}
        </button>
        <span v-if="resetSuccess" class="badge badge-green">✓ Restaurado</span>
      </div>
    </div>

    <!-- Layout 2 columnas: Upload & Métricas -->
    <div class="datasets-grid">
      <!-- Columna 1: Subida de CSV -->
      <div class="card upload-card">
        <div class="card-header">
          <div class="header-icon">📂</div>
          <div>
            <h3 class="card-title">Cargar Notas Reales de Alumnos</h3>
            <p class="card-subtitle">Sube un archivo CSV con el rendimiento empírico de tu curso</p>
          </div>
        </div>

        <div
          class="drop-zone"
          :class="{ 'drop-zone--active': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleFileDrop"
          @click="fileInputRef?.click()"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept=".csv"
            class="sr-only"
            @change="handleFileSelect"
          />
          <div class="drop-zone-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <span class="drop-zone-title">Haz clic o arrastra un archivo CSV aquí</span>
          <span class="drop-zone-hint">Columnas: horas_estudio, dificultad, repasos_previos, calidad_estudio, calificacion</span>
        </div>

        <!-- Descargar plantilla -->
        <div class="template-box">
          <span class="template-text">¿No tienes el formato preparado?</span>
          <button class="btn btn-ghost btn-xs" @click="descargarPlantilla">
            Descargar CSV de Ejemplo
          </button>
        </div>

        <!-- Vista previa de datos parseados -->
        <div v-if="parsedData.length > 0" class="preview-box">
          <div class="preview-header">
            <span class="preview-title">{{ parsedData.length }} registros detectados</span>
            <span class="badge badge-green">Válido</span>
          </div>
          <div class="table-mini-container">
            <table class="table-mini">
              <thead>
                <tr>
                  <th>Horas</th>
                  <th>Dif</th>
                  <th>Repasos</th>
                  <th>Foco</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in parsedData.slice(0, 4)" :key="idx">
                  <td>{{ row.horas_estudio }}h</td>
                  <td>{{ row.dificultad }}</td>
                  <td>{{ row.repasos_previos }}</td>
                  <td>{{ Math.round(row.calidad_estudio * 100) }}%</td>
                  <td><strong>{{ row.calificacion }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <button
            class="btn btn-primary w-full mt-3"
            :disabled="reentrenando || !materiaId"
            @click="enviarReentrenamiento"
          >
            <span v-if="reentrenando" class="spinner-sm"></span>
            <span>{{ reentrenando ? 'Ajustando modelo matemático...' : 'Calibrar Modelo con estos Datos' }}</span>
          </button>
        </div>

        <div v-if="uploadError" class="error-msg">
          {{ uploadError }}
        </div>
      </div>

      <!-- Columna 2: Resultados y Métricas de Calibración -->
      <div class="card metrics-card">
        <div class="card-header">
          <div class="header-icon icon-purple">📈</div>
          <div>
            <h3 class="card-title">Precisión del Modelo Calibrado</h3>
            <p class="card-subtitle">Bondad de ajuste (R²) y error medio absoluto (MAE)</p>
          </div>
        </div>

        <div v-if="resultadoCalibracion" class="results-display animate-fade-in">
          <div class="metric-result-row">
            <div class="metric-result-box">
              <span class="res-label">Coeficiente de Determinación (R²)</span>
              <span class="res-val val-green">{{ (resultadoCalibracion.r2_score * 100).toFixed(1) }}%</span>
              <span class="res-hint">Proporción de varianza explicada</span>
            </div>
            <div class="metric-result-box">
              <span class="res-label">Error Medio Absoluto (MAE)</span>
              <span class="res-val val-blue">±{{ resultadoCalibracion.mae }} pts</span>
              <span class="res-hint">Desviación media en escala 0–100</span>
            </div>
          </div>

          <div class="sample-count-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Modelo ajustado con éxito utilizando {{ resultadoCalibracion.muestras }} calificaciones de estudiantes.
          </div>

          <p class="calibration-note">
            El modelo para la materia seleccionada ha sido actualizado en memoria. Al ingresar al simulador, todas las proyecciones reflejarán los nuevos coeficientes ajustados empíricamente.
          </p>

          <NuxtLink to="/dashboard" class="btn btn-primary">
            Ir a Simular con el Nuevo Modelo
          </NuxtLink>
        </div>

        <div v-else class="empty-metrics">
          <div class="empty-metrics-icon">🎯</div>
          <h4>Modelo en Estado Base</h4>
          <p>
            Actualmente se utiliza el modelo general preentrenado con datos sintéticos de alta fidelidad (R² &gt; 0.90). Sube un CSV con notas de tu grupo para afinar el modelo a tu propia experiencia pedagógica.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard',
})

interface MateriaItem {
  id: string
  nombre: string
  tipo: string
  dataset?: { origen: string; creadoEn: string }
}

const materias = ref<MateriaItem[]>([])
const materiaId = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const parsedData = ref<any[]>([])
const uploadError = ref('')
const reentrenando = ref(false)
const restableciendo = ref(false)
const resetSuccess = ref(false)
const resultadoCalibracion = ref<{
  r2_score: number
  mae: number
  muestras: number
} | null>(null)

const materiaActual = computed(() =>
  materias.value.find((m) => m.id === materiaId.value)
)

const datasetStatusClass = computed(() => {
  return materiaActual.value?.dataset?.origen === 'csv_subido'
    ? 'tag-custom'
    : 'tag-base'
})

async function cargarMaterias() {
  try {
    const res = await $fetch<MateriaItem[]>('/api/materias')
    materias.value = res || []
    if (materias.value.length > 0 && !materiaId.value) {
      materiaId.value = materias.value[0].id
    }
  } catch (err) {
    console.error('Error al cargar materias:', err)
  }
}

function formatTipo(tipo?: string): string {
  switch (tipo) {
    case 'MEMORISTICA':
      return 'Memorística'
    case 'LOGICO_MATEMATICA':
      return 'Lógico-Matemática'
    case 'MIXTA':
      return 'Mixta'
    default:
      return '-'
  }
}

function handleFileDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    procesarArchivo(e.dataTransfer.files[0])
  }
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    procesarArchivo(target.files[0])
  }
}

function procesarArchivo(file: File) {
  uploadError.value = ''
  if (!file.name.endsWith('.csv')) {
    uploadError.value = 'El archivo debe tener extensión .csv'
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const text = event.target?.result as string
      parsearCSV(text)
    } catch (err: any) {
      uploadError.value = 'Error leyendo el archivo CSV: ' + err.message
    }
  }
  reader.readAsText(file)
}

function parsearCSV(csvText: string) {
  const lines = csvText.trim().split(/\r?\n/)
  if (lines.length < 2) {
    uploadError.value = 'El CSV está vacío o solo contiene encabezados'
    return
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const required = ['horas_estudio', 'dificultad', 'repasos_previos', 'calidad_estudio', 'calificacion']

  for (const req of required) {
    if (!headers.includes(req)) {
      uploadError.value = `Falta la columna requerida: "${req}". Encabezados encontrados: ${headers.join(', ')}`
      return
    }
  }

  const rows: any[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const parts = line.split(',').map((p) => p.trim())
    if (parts.length < headers.length) continue

    const obj: Record<string, number> = {}
    headers.forEach((h, idx) => {
      obj[h] = parseFloat(parts[idx])
    })

    if (!isNaN(obj.horas_estudio) && !isNaN(obj.calificacion)) {
      rows.push(obj)
    }
  }

  if (rows.length < 5) {
    uploadError.value = 'Se requieren al menos 5 registros válidos para el ajuste del modelo'
    return
  }

  parsedData.value = rows
}

async function enviarReentrenamiento() {
  if (!materiaId.value || parsedData.value.length === 0) return

  reentrenando.value = true
  uploadError.value = ''

  try {
    const res = await $fetch<{
      status: string
      tipo_materia: string
      muestras: number
      r2_score: number
      mae: number
    }>('/api/retrain', {
      method: 'POST',
      body: {
        materiaId: materiaId.value,
        datos: parsedData.value,
      },
    })

    resultadoCalibracion.value = {
      r2_score: res.r2_score,
      mae: res.mae,
      muestras: res.muestras,
    }
    await cargarMaterias()
  } catch (err: any) {
    uploadError.value = err?.data?.message || 'Error al calibrar el modelo'
  } finally {
    reentrenando.value = false
  }
}

async function restablecerModeloBase() {
  if (!materiaId.value) return
  if (!confirm('¿Deseas restablecer esta materia a su modelo matemático base sintético?')) return

  restableciendo.value = true
  uploadError.value = ''
  try {
    await $fetch('/api/reset-model', {
      method: 'POST',
      body: { materiaId: materiaId.value },
    })
    resultadoCalibracion.value = null
    parsedData.value = []
    resetSuccess.value = true
    setTimeout(() => {
      resetSuccess.value = false
    }, 4000)
    await cargarMaterias()
  } catch (err: any) {
    uploadError.value = err?.data?.message || 'Error al restablecer el modelo'
  } finally {
    restableciendo.value = false
  }
}

function descargarPlantilla() {
  const content =
    'horas_estudio,dificultad,repasos_previos,calidad_estudio,calificacion\n' +
    '2.0,2,0,0.70,55.0\n' +
    '3.5,3,1,0.80,68.5\n' +
    '4.0,3,1,0.75,72.0\n' +
    '5.5,4,2,0.85,81.0\n' +
    '7.0,4,3,0.90,90.5\n' +
    '8.0,5,3,0.95,94.0\n'

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'plantilla_calibracion_alumnos.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  cargarMaterias()
})
</script>

<style scoped>
.datasets-page {
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

/* Materia selector */
.materia-selector-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
  gap: 1rem;
}

.card-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.select-input {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  outline: none;
  cursor: pointer;
}

.status-tag {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
}

.tag-custom {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.tag-base {
  background: rgba(79, 142, 247, 0.15);
  color: #4f8ef7;
  border: 1px solid rgba(79, 142, 247, 0.3);
}

/* 2-col Grid */
.datasets-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.75rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
}

.header-icon {
  font-size: 1.6rem;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.card-title {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
}

.card-subtitle {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

/* Drop Zone */
.drop-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: 2.25rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;
  background: var(--color-surface-2);
  transition: all var(--duration-fast) var(--ease);
}
.drop-zone:hover,
.drop-zone--active {
  border-color: var(--color-primary);
  background: rgba(79, 142, 247, 0.05);
}

.drop-zone-icon {
  color: var(--color-primary);
}

.drop-zone-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
}

.drop-zone-hint {
  font-size: 0.725rem;
  color: var(--color-text-dim);
  max-width: 320px;
}

.template-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding: 0.65rem 0.85rem;
  background: var(--color-surface-2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.template-text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* Preview */
.preview-box {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.preview-title {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--color-text);
}

.table-mini-container {
  overflow-x: auto;
}

.table-mini {
  width: 100%;
  font-size: 0.75rem;
  border-collapse: collapse;
}

.table-mini th {
  text-align: left;
  padding: 0.4rem 0.5rem;
  color: var(--color-text-dim);
  border-bottom: 1px solid var(--color-border);
}

.table-mini td {
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.error-msg {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #f87171;
  font-size: 0.8rem;
  border-radius: var(--radius-sm);
}

/* Metrics column */
.results-display {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.metric-result-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.metric-result-box {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.res-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-dim);
  text-transform: uppercase;
}

.res-val {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
}

.val-green { color: #34d399; }
.val-blue { color: #4f8ef7; }

.res-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.sample-count-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.25);
  color: #34d399;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.825rem;
  font-weight: 500;
}

.calibration-note {
  font-size: 0.825rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.empty-metrics {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1.5rem;
  gap: 0.75rem;
}

.empty-metrics-icon {
  font-size: 2.75rem;
}

.empty-metrics h4 {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
}

.empty-metrics p {
  font-size: 0.825rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  max-width: 360px;
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

@media (max-width: 900px) {
  .datasets-grid {
    grid-template-columns: 1fr;
  }
}
</style>
