"""
teoria.py
---------
Modelo TEÓRICO de Simu-Cognition (única fuente de verdad de las fórmulas).
Hay un espejo en TypeScript: server/utils/teoria.ts (se verifica con
tests/test_paridad_ts.py).

Qué es y qué NO es
------------------
* Olvido (Ebbinghaus):  R(t) = exp(-t / S)
  S = estabilidad de la memoria, en días.

  Los valores S_BASE_PRIOR son un PUNTO DE PARTIDA (prior) de orden de magnitud,
  coherente con el decaimiento rápido inicial de Ebbinghaus (1885) y su
  replicación (Murre y Dros, 2015), y con que el espaciado y la recuperación
  alargan la retención (Cepeda et al., 2006; Roediger y Karpicke, 2006).
  NO son constantes universales: dependen del material, la edad y la medición.
  Por eso el sistema los CALIBRA con los datos reales del grupo
  (ver model/calibracion.py). Los factores multiplicativos (repasos, calidad,
  dificultad) son hipótesis de trabajo a contrastar con esos mismos datos.

* Aprendizaje (nota esperada):  curva de saturación exponencial en las horas
  efectivas de estudio. Es una hipótesis de trabajo, no un ajuste a datos.
  El modelo polinomial de sklearn aprende a APROXIMAR este simulador
  (modelo sustituto); no "descubre" la realidad.
"""

import numpy as np

TIPOS_VALIDOS = ("MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA")

# ── Olvido ───────────────────────────────────────────────────────────────────
# Estabilidad base (días) para dificultad 3, 0 repasos y calidad media.
S_BASE_PRIOR: dict[str, float] = {
    "MEMORISTICA": 4.0,
    "LOGICO_MATEMATICA": 10.0,
    "MIXTA": 7.0,
}

GAIN_REPASO = 0.5      # cada repaso añade +50 % de S base
CALIDAD_MIN = 0.6      # factor de calidad: 0.6 + 0.8*q  ∈ [0.6, 1.4]
CALIDAD_RANGO = 0.8
DIF_BASE = 1.2         # factor de dificultad: 1.2 - 0.1*(d-1) ∈ [0.8, 1.2]
DIF_PASO = 0.1

# ── Aprendizaje ──────────────────────────────────────────────────────────────
K_APRENDIZAJE: dict[str, float] = {
    "MEMORISTICA": 0.55,        # sube rápido con pocas horas
    "LOGICO_MATEMATICA": 0.30,  # sube más lento (requiere práctica)
    "MIXTA": 0.42,
}
TECHO_BASE = 85.0   # nota máxima sin repasos previos
TECHO_REPASO = 3.0  # cada repaso sube el techo (máx. 100)
DIF_PENALIZACION = 0.25


def validar_tipo(tipo_materia: str) -> None:
    if tipo_materia not in TIPOS_VALIDOS:
        raise ValueError(
            f"tipo_materia inválido: '{tipo_materia}'. Opciones válidas: {sorted(TIPOS_VALIDOS)}"
        )


def factor_estabilidad(dificultad: float, repasos_previos: float, calidad_estudio: float) -> float:
    """Multiplicador de S (sin el S base del tipo de materia)."""
    f_rep = 1.0 + GAIN_REPASO * repasos_previos
    f_cal = CALIDAD_MIN + CALIDAD_RANGO * calidad_estudio
    f_dif = DIF_BASE - DIF_PASO * (dificultad - 1)
    return f_rep * f_cal * f_dif


def estabilidad(
    tipo_materia: str,
    dificultad: float,
    repasos_previos: float,
    calidad_estudio: float,
    escala_s: float = 1.0,
) -> float:
    """
    S en días. `escala_s` es el factor de calibración del grupo (1.0 = prior).
    """
    validar_tipo(tipo_materia)
    return S_BASE_PRIOR[tipo_materia] * escala_s * factor_estabilidad(
        dificultad, repasos_previos, calidad_estudio
    )


def retencion(dias, s: float):
    """R(t) = exp(-t/S) en [0, 1]."""
    return np.exp(-np.asarray(dias, dtype=float) / s)


def dia_umbral(s: float, umbral: float) -> float:
    """Día en que R(t) = umbral (forma cerrada), acotado a [0, 60]."""
    if umbral >= 1.0:
        return 0.0
    return float(min(60.0, max(0.0, -s * np.log(umbral))))


def nota_esperada(
    tipo_materia: str,
    horas_estudio,
    dificultad,
    repasos_previos,
    calidad_estudio,
):
    """Nota esperada (0-100) según el simulador teórico. Vectorizable."""
    validar_tipo(tipo_materia)
    h = np.asarray(horas_estudio, dtype=float)
    d = np.asarray(dificultad, dtype=float)
    r = np.asarray(repasos_previos, dtype=float)
    q = np.asarray(calidad_estudio, dtype=float)
    h_ef = h * (0.5 + 0.5 * q)
    k_ef = K_APRENDIZAJE[tipo_materia] / (1.0 + DIF_PENALIZACION * (d - 1.0))
    techo = np.minimum(100.0, TECHO_BASE + TECHO_REPASO * r)
    return techo * (1.0 - np.exp(-k_ef * h_ef))
