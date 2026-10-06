/**
 * server/utils/teoria.ts
 * ──────────────────────
 * Espejo en TypeScript del modelo teórico de ml-service/model/teoria.py.
 * Se usa como RESPALDO cuando el microservicio Python no responde, de modo que
 * el docente vea los MISMOS números de olvido y la misma curva de aprendizaje
 * teórica. (La nota del microservicio viene del modelo sustituto de sklearn,
 * que aproxima esta fórmula con error medio < 1.5 puntos.)
 *
 * Cualquier cambio de fórmulas debe hacerse en AMBOS archivos; la paridad la
 * verifica `ml-service/tests/test_paridad_ts.py`.
 */

export type TipoMateria = "MEMORISTICA" | "LOGICO_MATEMATICA" | "MIXTA";

export const S_BASE_PRIOR: Record<TipoMateria, number> = {
  MEMORISTICA: 4.0,
  LOGICO_MATEMATICA: 10.0,
  MIXTA: 7.0,
};

const GAIN_REPASO = 0.5;
const CALIDAD_MIN = 0.6;
const CALIDAD_RANGO = 0.8;
const DIF_BASE = 1.2;
const DIF_PASO = 0.1;

export const K_APRENDIZAJE: Record<TipoMateria, number> = {
  MEMORISTICA: 0.55,
  LOGICO_MATEMATICA: 0.3,
  MIXTA: 0.42,
};
const TECHO_BASE = 85;
const TECHO_REPASO = 3;
const DIF_PENALIZACION = 0.25;

export function factorEstabilidad(dificultad: number, repasos: number, calidad: number): number {
  return (
    (1 + GAIN_REPASO * repasos) *
    (CALIDAD_MIN + CALIDAD_RANGO * calidad) *
    (DIF_BASE - DIF_PASO * (dificultad - 1))
  );
}

export function estabilidad(
  tipo: TipoMateria,
  dificultad: number,
  repasos: number,
  calidad: number,
  escalaS = 1,
): number {
  return S_BASE_PRIOR[tipo] * escalaS * factorEstabilidad(dificultad, repasos, calidad);
}

export function retencion(dia: number, s: number): number {
  return Math.exp(-dia / s);
}

export function diaUmbral(s: number, umbral: number): number {
  if (umbral >= 1) return 0;
  return Math.min(60, Math.max(0, -s * Math.log(umbral)));
}

export function notaEsperada(
  tipo: TipoMateria,
  horas: number,
  dificultad: number,
  repasos: number,
  calidad: number,
): number {
  const hEf = horas * (0.5 + 0.5 * calidad);
  const kEf = K_APRENDIZAJE[tipo] / (1 + DIF_PENALIZACION * (dificultad - 1));
  const techo = Math.min(100, TECHO_BASE + TECHO_REPASO * repasos);
  return techo * (1 - Math.exp(-kEf * hEf));
}

const r = (v: number, d: number) => Number(v.toFixed(d));

/** Respuesta equivalente a POST /simulate del microservicio, calculada en TS. */
export function simularLocal(p: {
  tipo: TipoMateria;
  horas_estudio: number;
  dificultad: number;
  repasos_previos: number;
  calidad_estudio: number;
  umbral_retencion: number;
  escala_s: number;
}) {
  const s = estabilidad(p.tipo, p.dificultad, p.repasos_previos, p.calidad_estudio, p.escala_s);

  const x_dias: number[] = [];
  const ret: number[] = [];
  for (let i = 0; i <= 60; i++) {
    const d = i * 0.5;
    x_dias.push(r(d, 3));
    ret.push(r(retencion(d, s), 4));
  }

  const x_horas: number[] = [];
  const y_aprendizaje: number[] = [];
  for (let i = 0; i < 40; i++) {
    const h = 0.5 + (i * 9.5) / 39;
    x_horas.push(r(h, 3));
    y_aprendizaje.push(r(notaEsperada(p.tipo, h, p.dificultad, p.repasos_previos, p.calidad_estudio), 2));
  }

  return {
    curva_aprendizaje: { x: x_horas, y: y_aprendizaje },
    curva_olvido: { x_dias, retencion: ret },
    calificacion_predicha: r(
      notaEsperada(p.tipo, p.horas_estudio, p.dificultad, p.repasos_previos, p.calidad_estudio),
      2,
    ),
    dia_repaso_optimo: r(diaUmbral(s, p.umbral_retencion), 2),
    estabilidad_dias: r(s, 3),
    escala_s: p.escala_s,
  };
}
