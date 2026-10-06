<template>
  <div class="panel">
    <!-- Cabecera -->
    <div class="panel-header">
      <div>
        <span class="panel-badge">Análisis Agregado</span>
        <h3 class="panel-title">Métricas Estadísticas del Grupo</h3>
        <p class="panel-sub">n = {{ metricas.n }} estudiantes con comparación calculada.</p>
      </div>
      <button
        id="btn-exportar-csv"
        type="button"
        class="btn-export"
        :disabled="exportLoading"
        @click="handleExport"
      >
        <span v-if="exportLoading" class="spinner-sm"></span>
        <span v-else>⬇</span>
        {{ exportLoading ? 'Generando CSV…' : 'Exportar CSV' }}
      </button>
    </div>

    <!-- Métricas globales -->
    <div class="metricas-grid">
      <div class="metrica-card">
        <span class="mk-label">MAE</span>
        <span class="mk-val" :class="maeClass">{{ metricas.mae }}</span>
        <span class="mk-hint">Error absoluto medio (H1)</span>
      </div>
      <div class="metrica-card">
        <span class="mk-label">RMSE</span>
        <span class="mk-val" :class="rmseClass">{{ metricas.rmse }}</span>
        <span class="mk-hint">Raíz del error cuadrático medio</span>
      </div>
      <div class="metrica-card">
        <span class="mk-label">Pearson r</span>
        <span class="mk-val" :class="pearsonClass">{{ metricas.pearson_r }}</span>
        <span class="mk-hint mk-p" :class="pClass(metricas.pearson_p)">p = {{ metricas.pearson_p }}</span>
      </div>
      <div class="metrica-card">
        <span class="mk-label">Spearman ρ</span>
        <span class="mk-val" :class="spearmanClass">{{ metricas.spearman_r }}</span>
        <span class="mk-hint mk-p" :class="pClass(metricas.spearman_p)">p = {{ metricas.spearman_p }}</span>
      </div>
    </div>

    <!-- Tabla confirmación direccional -->
    <div class="tabla-wrap">
      <h4 class="tabla-title">Confirmación Direccional por Variable (regresión univariada)</h4>
      <p class="tabla-sub">¿La dirección predicha por el modelo se sostiene con datos reales? Cada variable se analiza por separado (n={{ metricas.n }}).</p>
      <div class="tabla-scroll">
        <table class="tabla">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Pendiente</th>
              <th>R²</th>
              <th>p-valor</th>
              <th>Dirección</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in metricas.confirmacion_direccional"
              :key="row.variable"
              :class="{ 'row-ok': row.direccion_confirmada, 'row-warn': !row.direccion_confirmada }"
            >
              <td class="var-name">{{ formatVar(row.variable) }}</td>
              <td class="mono">{{ row.pendiente >= 0 ? '+' : '' }}{{ row.pendiente }}</td>
              <td class="mono">{{ row.r2 }}</td>
              <td class="mono" :class="pClass(row.p_valor)">{{ row.p_valor }}</td>
              <td>
                <span class="dir-badge" :class="row.direccion_confirmada ? 'dir-ok' : 'dir-fail'">
                  {{ row.direccion_confirmada ? '✓ Confirmada' : '✗ No confirmada' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="tabla-note">
        p &lt; 0.05 se considera estadísticamente significativo para n ≈ 30–50.
        La dirección se confirma si la pendiente tiene el signo esperado según la hipótesis del modelo.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface DireccionVariable {
  variable: string
  pendiente: number
  r2: number
  p_valor: number
  direccion_confirmada: boolean
}

interface Metricas {
  n: number
  mae: number
  rmse: number
  pearson_r: number
  pearson_p: number
  spearman_r: number
  spearman_p: number
  confirmacion_direccional: DireccionVariable[]
}

const props = defineProps<{
  metricas: Metricas
  materiaId: string
}>()

const exportLoading = defineModel<boolean>('exportLoading', { default: false })

// Clases de color para métricas
const maeClass    = computed(() => classByError(props.metricas.mae))
const rmseClass   = computed(() => classByError(props.metricas.rmse))
const pearsonClass  = computed(() => classByCorrelation(Math.abs(props.metricas.pearson_r)))
const spearmanClass = computed(() => classByCorrelation(Math.abs(props.metricas.spearman_r)))

function classByError(v: number) {
  if (v <= 5)  return 'mk-ok'
  if (v <= 10) return 'mk-warn'
  return 'mk-bad'
}

function classByCorrelation(r: number) {
  if (r >= 0.7)  return 'mk-ok'
  if (r >= 0.4)  return 'mk-warn'
  return 'mk-bad'
}

function pClass(p: number) {
  if (p < 0.05) return 'p-sig'
  if (p < 0.10) return 'p-marginal'
  return 'p-ns'
}

function formatVar(v: string) {
  const map: Record<string, string> = {
    horas_estudio:     'Horas de Estudio',
    repasos_previos:   'Repasos Previos',
    calidad_estudio:   'Calidad de Estudio',
    dificultad_docente:'Dificultad (docente)',
  }
  return map[v] || v
}

async function handleExport() {
  exportLoading.value = true
  try {
    const response = await $fetch(`/api/analisis/${props.materiaId}/exportar`, {
      responseType: 'blob',
    }) as Blob
    const url = URL.createObjectURL(response)
    const a = document.createElement('a')
    a.href = url
    a.download = `validacion_${props.materiaId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('[exportar]', err)
  } finally {
    exportLoading.value = false
  }
}
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.panel-badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  background: rgba(99,102,241,0.15);
  color: #818cf8;
  border: 1px solid rgba(99,102,241,0.3);
  margin-bottom: 0.25rem;
}

.panel-title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.panel-sub {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  padding: 0.55rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-export:hover:not(:disabled) {
  border-color: #34d399;
  color: #34d399;
}

.btn-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Métricas grid */
.metricas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
}

.metrica-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.mk-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-dim);
}

.mk-val {
  font-size: 1.7rem;
  font-weight: 800;
  font-family: var(--font-heading);
  line-height: 1.1;
}

.mk-ok   { color: #34d399; }
.mk-warn { color: #fb923c; }
.mk-bad  { color: #f87171; }

.mk-hint {
  font-size: 0.7rem;
  color: var(--color-text-dim);
  margin-top: 0.1rem;
}

.mk-p { font-weight: 600; }
.p-sig      { color: #34d399; }
.p-marginal { color: #fb923c; }
.p-ns       { color: var(--color-text-dim); }

/* Tabla */
.tabla-wrap {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tabla-title {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
}

.tabla-sub {
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

.tabla-scroll { overflow-x: auto; }

.tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.tabla thead tr {
  border-bottom: 1px solid var(--color-border);
}

.tabla th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-dim);
}

.tabla tbody tr {
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.15s;
}

.tabla tbody tr:hover { background: var(--color-surface-2); }
.row-ok   { border-left: 3px solid #34d399; }
.row-warn { border-left: 3px solid #f87171; }

.tabla td {
  padding: 0.55rem 0.75rem;
  color: var(--color-text-muted);
}

.var-name { font-weight: 600; color: var(--color-text); }
.mono     { font-family: monospace; font-size: 0.85rem; }

.dir-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
}

.dir-ok   { background: rgba(52,211,153,0.15); color: #34d399; border: 1px solid rgba(52,211,153,0.3); }
.dir-fail { background: rgba(248,113,113,0.15); color: #f87171; border: 1px solid rgba(248,113,113,0.3); }

.tabla-note {
  font-size: 0.7rem;
  color: var(--color-text-dim);
  font-style: italic;
  padding-top: 0.25rem;
  border-top: 1px solid var(--color-border);
}

.spinner-sm {
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
