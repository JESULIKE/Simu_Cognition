<template>
  <div class="plan-card card">
    <div class="plan-header">
      <div>
        <div class="plan-badge">Plan de repasos</div>
        <h4 class="plan-title">¿Cuándo repasar? Calendario sugerido</h4>
        <p class="plan-sub">
          Cada repaso se programa cuando la retención llega a tu umbral
          ({{ Math.round(umbralRetencion * 100) }}%). {{ origenTexto }}
        </p>
      </div>
      <div class="plan-compare" v-if="plan.dias.length > 0">
        <span class="compare-label">Retención media en {{ plan.horizonte }} días</span>
        <div class="compare-row">
          <span class="compare-sin">{{ sinRepaso.toFixed(0) }}%<small> sin repaso</small></span>
          <span class="compare-arrow">→</span>
          <span class="compare-con">{{ conRepaso.toFixed(0) }}%<small> con el plan</small></span>
        </div>
      </div>
    </div>

    <div v-if="plan.dias.length === 0" class="plan-empty">
      Con estos parámetros la retención se mantiene por encima del umbral durante los
      {{ plan.horizonte }} días: no hace falta repasar en ese periodo.
    </div>

    <ol v-else class="plan-list">
      <li v-for="(dia, i) in plan.dias" :key="i" class="plan-item">
        <span class="plan-num">{{ i + 1 }}</span>
        <span class="plan-dia">Día {{ dia }}</span>
        <span class="plan-fecha">{{ fechaTexto(dia) }}</span>
        <span class="plan-int" v-if="i > 0">+{{ (dia - plan.dias[i - 1]).toFixed(1) }} d desde el anterior</span>
        <span class="plan-int" v-else>primer repaso</span>
      </li>
    </ol>

    <div class="plan-actions">
      <label class="plan-fecha-input">
        Fecha de la sesión de estudio
        <input v-model="fechaSesion" type="date" class="input" />
      </label>
      <button type="button" class="btn btn-primary btn-sm" :disabled="plan.dias.length === 0" @click="descargarICS">
        Descargar calendario (.ics)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { generarICS, retencionConPlan, retencionPromedio, type PlanRepasos } from '~/composables/usePlanRepasos'

const props = defineProps<{
  plan: PlanRepasos
  estabilidad: number
  umbralRetencion: number
  nombreMateria: string
  calibrado: boolean
}>()

const hoy = new Date()
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fechaSesion = ref(iso(hoy))

const origenTexto = computed(() =>
  props.calibrado
    ? 'Proyección con la curva calibrada de tu grupo.'
    : 'Proyección con la curva teórica; calibra tu grupo para ajustarla.',
)

const sinRepaso = computed(
  () => retencionPromedio((d) => Math.exp(-d / props.estabilidad), props.plan.horizonte) * 100,
)
const conRepaso = computed(
  () => retencionPromedio((d) => retencionConPlan(d, props.plan), props.plan.horizonte) * 100,
)

function baseFecha(): Date {
  const [y, m, d] = fechaSesion.value.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

function fechaTexto(dia: number): string {
  const f = baseFecha()
  f.setDate(f.getDate() + Math.round(dia))
  return f.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short' })
}

function descargarICS() {
  const ics = generarICS(props.plan, props.nombreMateria, baseFecha())
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plan-de-repasos.ics'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.plan-card { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.plan-header { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.plan-badge {
  display: inline-block; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
  color: var(--color-primary); background: var(--color-primary-glow); padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full); margin-bottom: 0.4rem;
}
.plan-title { font-family: var(--font-heading); font-size: 1.05rem; margin: 0; color: var(--color-text); }
.plan-sub { margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--color-text-muted); max-width: 46ch; }
.plan-compare { display: flex; flex-direction: column; gap: 0.25rem; align-items: flex-end; }
.compare-label { font-size: 0.75rem; color: var(--color-text-muted); }
.compare-row { display: flex; align-items: baseline; gap: 0.5rem; font-family: var(--font-heading); font-weight: 700; font-size: 1.4rem; }
.compare-row small { font-size: 0.7rem; font-weight: 500; color: var(--color-text-muted); }
.compare-sin { color: #f59e0b; }
.compare-con { color: #34d399; }
.compare-arrow { color: var(--color-text-muted); }
.plan-empty { font-size: 0.9rem; color: var(--color-text-muted); }
.plan-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }
.plan-item {
  display: grid; grid-template-columns: 1.75rem 5rem 1fr auto; align-items: center; gap: 0.6rem;
  padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md);
  background: var(--color-surface-2); font-size: 0.88rem;
}
.plan-num {
  width: 1.5rem; height: 1.5rem; border-radius: 50%; background: var(--color-primary); color: #fff;
  display: grid; place-items: center; font-size: 0.75rem; font-weight: 700;
}
.plan-dia { font-weight: 600; color: var(--color-text); }
.plan-fecha { color: var(--color-text-muted); }
.plan-int { font-size: 0.75rem; color: var(--color-text-muted); }
.plan-actions { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
.plan-fecha-input { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.78rem; color: var(--color-text-muted); }
@media (max-width: 600px) {
  .plan-item { grid-template-columns: 1.75rem 4rem 1fr; }
  .plan-int { display: none; }
  .plan-compare { align-items: flex-start; }
}
</style>
