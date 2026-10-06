<template>
  <div class="rec-card" :class="sentimientoClass">
    <div class="rec-header">
      <div class="rec-icon">{{ sentimientoIcon }}</div>
      <div>
        <div class="rec-badge">Recomendación Pedagógica</div>
        <h4 class="rec-codigo">{{ codigoAnonimo }}</h4>
      </div>
    </div>

    <!-- Métricas individuales -->
    <div class="rec-metricas">
      <div class="metrica-pill">
        <span class="metrica-label">Error Absoluto (H1)</span>
        <span class="metrica-val" :class="errorClass">{{ errorAbsoluto.toFixed(1) }} pts</span>
      </div>
      <div class="metrica-pill" v-if="deltaRetencionPromedio !== null">
        <span class="metrica-label">Δ Retención Prom. (H2)</span>
        <span class="metrica-val" :class="deltaClass">{{ deltaFormatted }}</span>
      </div>
      <div class="metrica-pill">
        <span class="metrica-label">Calidad de Estudio</span>
        <span class="metrica-val">{{ (calidadEstudio * 100).toFixed(0) }}%</span>
      </div>
    </div>

    <!-- Texto de recomendación -->
    <div class="rec-texto">
      <p>{{ recomendacionTexto }}</p>
    </div>

    <!-- Generado en -->
    <div class="rec-footer">
      Generado: {{ formatFecha(generadaEn) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  codigoAnonimo: string
  recomendacionTexto: string
  errorAbsoluto: number
  deltaRetencionPromedio: number | null
  calidadEstudio: number
  generadaEn: string
}>()

const errorClass = computed(() => ({
  'val-ok':   props.errorAbsoluto <= 5,
  'val-warn': props.errorAbsoluto > 5 && props.errorAbsoluto <= 10,
  'val-bad':  props.errorAbsoluto > 10,
}))

const deltaClass = computed(() => {
  if (props.deltaRetencionPromedio === null) return {}
  return {
    'val-ok':   props.deltaRetencionPromedio >= -0.05,
    'val-warn': props.deltaRetencionPromedio < -0.05 && props.deltaRetencionPromedio >= -0.15,
    'val-bad':  props.deltaRetencionPromedio < -0.15,
  }
})

const deltaFormatted = computed(() => {
  if (props.deltaRetencionPromedio === null) return 'N/A'
  const v = props.deltaRetencionPromedio
  return `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}%`
})

// Determinar sentimiento general para color de borde
const sentimientoClass = computed(() => {
  if (props.errorAbsoluto > 10 || (props.deltaRetencionPromedio ?? 0) < -0.15) return 'sentimiento-warn'
  if (props.errorAbsoluto <= 5 && (props.deltaRetencionPromedio ?? 0) >= -0.05) return 'sentimiento-ok'
  return 'sentimiento-neutral'
})

const sentimientoIcon = computed(() => {
  if (props.errorAbsoluto > 10 || (props.deltaRetencionPromedio ?? 0) < -0.15) return '⚠️'
  if (props.errorAbsoluto <= 5 && (props.deltaRetencionPromedio ?? 0) >= -0.05) return '✅'
  return '📊'
})

function formatFecha(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}
</script>

<style scoped>
.rec-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: border-color 0.2s;
}

.sentimiento-ok      { border-left-color: #34d399; }
.sentimiento-warn    { border-left-color: #f87171; }
.sentimiento-neutral { border-left-color: #fb923c; }

.rec-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rec-icon {
  font-size: 1.6rem;
  line-height: 1;
}

.rec-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-dim);
}

.rec-codigo {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.rec-metricas {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.metrica-pill {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.4rem 0.75rem;
}

.metrica-label {
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-dim);
}

.metrica-val {
  font-size: 0.92rem;
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--color-text);
}

.val-ok   { color: #34d399; }
.val-warn { color: #fb923c; }
.val-bad  { color: #f87171; }

.rec-texto {
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  line-height: 1.65;
  border-left: 3px solid var(--color-accent);
}

.rec-footer {
  font-size: 0.7rem;
  color: var(--color-text-dim);
}
</style>
