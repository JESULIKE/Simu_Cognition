"""
ebbinghaus.py
-------------
Implementa la curva de olvido de Ebbinghaus parametrizada por TipoMateria,
exactamente según la documentación v3.0 (sección 6).

Funciones exportables:
  - retencion(dias, tipo_materia, dificultad, repasos_previos, calidad_estudio)
  - dia_repaso_optimo(tipo_materia, dificultad, repasos_previos, calidad_estudio, umbral_retencion)

Ejecutar como script standalone para validación:
  python model/ebbinghaus.py
"""

import numpy as np

# ── Parámetro S base por tipo de materia ───────────────────────────────────
# S representa la "estabilidad de memoria" en días.
# Materias memorísticas olvidan más rápido (S bajo);
# lógico-matemáticas retienen más (S alto).
S_BASE_POR_TIPO: dict[str, float] = {
    "MEMORISTICA":        3.0,
    "LOGICO_MATEMATICA":  6.0,
    "MIXTA":              4.5,
}

TIPOS_VALIDOS = set(S_BASE_POR_TIPO.keys())


def _validar_tipo(tipo_materia: str) -> None:
    if tipo_materia not in TIPOS_VALIDOS:
        raise ValueError(
            f"tipo_materia inválido: '{tipo_materia}'. "
            f"Opciones válidas: {sorted(TIPOS_VALIDOS)}"
        )


def retencion(
    dias: np.ndarray | float,
    tipo_materia: str,
    dificultad: int,
    repasos_previos: int,
    calidad_estudio: float,
) -> np.ndarray | float:
    """
    Calcula R(t) = e^(-t / S) donde S depende del tipo de materia,
    los repasos previos, la calidad de estudio y la dificultad.

    Args:
        dias             : escalar o array de tiempos en días.
        tipo_materia     : "MEMORISTICA" | "LOGICO_MATEMATICA" | "MIXTA"
        dificultad       : entero [1, 5]
        repasos_previos  : entero [0, 5]
        calidad_estudio  : float  [0.3, 1.0]

    Returns:
        Retención en [0, 1].
    """
    _validar_tipo(tipo_materia)

    s_base = S_BASE_POR_TIPO[tipo_materia]

    # S aumenta con repasos y calidad, disminuye con dificultad.
    # (6 - dificultad) normaliza la dificultad a [1, 5] → [5, 1].
    S = s_base * (1 + repasos_previos * 0.6) * calidad_estudio * (6 - dificultad) / 5

    return np.exp(-np.asarray(dias, dtype=float) / max(S, 0.1))


def dia_repaso_optimo(
    tipo_materia: str,
    dificultad: int,
    repasos_previos: int,
    calidad_estudio: float,
    umbral_retencion: float,
) -> float:
    """
    Devuelve el primer día en que la retención cae por debajo del umbral.
    Si nunca cae por debajo en 60 días, devuelve 60.0.

    Args:
        umbral_retencion : float [0, 1], p.ej. 0.6 = 60% de retención.

    Returns:
        Día óptimo de repaso (float).
    """
    _validar_tipo(tipo_materia)

    dias = np.linspace(0, 60, 600)
    r    = retencion(dias, tipo_materia, dificultad, repasos_previos, calidad_estudio)

    # argmax sobre la condición booleana devuelve el primer índice True.
    indices = np.where(r <= umbral_retencion)[0]
    if len(indices) == 0:
        return 60.0

    return float(dias[indices[0]])


# ─────────────────────────────────────────────────────────────────────────────
# Validación standalone
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import pandas as pd

    DIAS_DEMO = [0, 1, 3, 7, 14, 30]
    UMBRAL    = 0.6

    # Parametros de ejemplo (docente configura estos via sliders)
    PARAMS = dict(dificultad=3, repasos_previos=1, calidad_estudio=0.8)

    filas = []
    for tipo in ["MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA"]:
        fila = {"tipo_materia": tipo}
        for d in DIAS_DEMO:
            r = retencion(d, tipo, **PARAMS)
            fila[f"dia_{d:02d}"] = round(float(r), 4)
        fila["dia_repaso_optimo"] = dia_repaso_optimo(tipo, umbral_retencion=UMBRAL, **PARAMS)
        filas.append(fila)

    df = pd.DataFrame(filas).set_index("tipo_materia")

    print("-- Retencion por tipo de materia ---------------------------------")
    print(f"   Parametros: {PARAMS}")
    print(f"   Umbral de retencion: {UMBRAL}")
    print()
    print(df.to_string())
    print("\n[OK] Validacion de ebbinghaus.py completada.")
