/**
 * composables/usePlanRepasos.ts
 * ─────────────────────────────
 * Plan de repasos espaciados a partir de la estabilidad S de la simulación.
 *
 * Regla (coherente con el modelo teórico, sin constantes nuevas):
 *   - Se repasa cuando la retención cae hasta el umbral elegido por el docente.
 *   - Cada repaso cuenta como un "repaso previo" más: S crece según el mismo
 *     factor (1 + 0.5·repasos) de ml-service/model/teoria.py (GAIN_REPASO).
 *
 * Es una PROYECCIÓN TEÓRICA (o calibrada, si el grupo tiene calibración):
 * no una promesa. La etiqueta en la interfaz debe decirlo.
 */

// Debe coincidir con GAIN_REPASO de ml-service/model/teoria.py
const GAIN_REPASO = 0.5
const INTERVALO_MIN_DIAS = 0.5
const MAX_REPASOS = 8

export interface PlanRepasos {
  /** Días (desde la sesión de estudio) en que conviene repasar. */
  dias: number[]
  /** Estabilidad S (días) tras cada tramo: S[0] antes del 1.er repaso, etc. */
  estabilidades: number[]
  horizonte: number
}

export function calcularPlanRepasos(
  s: number,
  repasosPrevios: number,
  umbral: number,
  horizonte = 30,
): PlanRepasos {
  const dias: number[] = []
  const estabilidades: number[] = [s]
  let t = 0
  let sActual = s
  const base = 1 + GAIN_REPASO * repasosPrevios

  for (let k = 1; k <= MAX_REPASOS; k++) {
    const hasta = Math.max(INTERVALO_MIN_DIAS, -sActual * Math.log(Math.min(umbral, 0.999)))
    t += hasta
    if (t > horizonte) break
    dias.push(Number(t.toFixed(1)))
    sActual = (s * (1 + GAIN_REPASO * (repasosPrevios + k))) / base
    estabilidades.push(sActual)
  }
  return { dias, estabilidades, horizonte }
}

/** Retención en el día `dia` con el plan de repasos aplicado (dientes de sierra). */
export function retencionConPlan(dia: number, plan: PlanRepasos): number {
  let inicio = 0
  let idx = 0
  for (let i = 0; i < plan.dias.length; i++) {
    if (dia >= plan.dias[i]) {
      inicio = plan.dias[i]
      idx = i + 1
    }
  }
  return Math.exp(-(dia - inicio) / plan.estabilidades[idx])
}

export function retencionPromedio(
  f: (dia: number) => number,
  horizonte = 30,
  paso = 0.5,
): number {
  let suma = 0
  let n = 0
  for (let d = 0; d <= horizonte + 1e-9; d += paso) {
    suma += f(d)
    n++
  }
  return suma / n
}

function fechaICS(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`
}

function escaparICS(t: string): string {
  return t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

/** Calendario .ics (eventos de día completo) con los repasos del plan. */
export function generarICS(plan: PlanRepasos, nombreMateria: string, fechaSesion: Date): string {
  const ahora = new Date()
  const sello =
    `${ahora.getUTCFullYear()}${String(ahora.getUTCMonth() + 1).padStart(2, '0')}${String(ahora.getUTCDate()).padStart(2, '0')}` +
    `T${String(ahora.getUTCHours()).padStart(2, '0')}${String(ahora.getUTCMinutes()).padStart(2, '0')}${String(ahora.getUTCSeconds()).padStart(2, '0')}Z`

  const lineas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Simu-Cognition//Plan de repasos//ES', 'CALSCALE:GREGORIAN']
  plan.dias.forEach((dia, i) => {
    const f = new Date(fechaSesion)
    f.setDate(f.getDate() + Math.round(dia))
    const fin = new Date(f)
    fin.setDate(fin.getDate() + 1)
    lineas.push(
      'BEGIN:VEVENT',
      `UID:simucognition-${fechaICS(fechaSesion)}-${i + 1}-${Math.random().toString(36).slice(2, 10)}@simu-cognition`,
      `DTSTAMP:${sello}`,
      `DTSTART;VALUE=DATE:${fechaICS(f)}`,
      `DTEND;VALUE=DATE:${fechaICS(fin)}`,
      `SUMMARY:${escaparICS(`Repaso ${i + 1}: ${nombreMateria}`)}`,
      `DESCRIPTION:${escaparICS('Repaso espaciado sugerido por Simu-Cognition (proyección del modelo; ajústalo con los datos reales de tu grupo).')}`,
      'END:VEVENT',
    )
  })
  lineas.push('END:VCALENDAR')
  return lineas.join('\r\n') + '\r\n'
}
