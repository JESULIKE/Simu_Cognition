"""
ebbinghaus.py
-------------
Curva de olvido de Ebbinghaus parametrizada por tipo de materia.
Las fórmulas viven en model/teoria.py; este módulo conserva la API usada por
simulate_logic.py y comparar_logic.py.

Ejecutar como script para una validación rápida:
  python -m model.ebbinghaus   (desde ml-service/)
"""

import numpy as np

from model import teoria

S_BASE_POR_TIPO = teoria.S_BASE_PRIOR
TIPOS_VALIDOS = set(teoria.TIPOS_VALIDOS)


def retencion(
    dias: np.ndarray | float,
    tipo_materia: str,
    dificultad: int,
    repasos_previos: int,
    calidad_estudio: float,
    escala_s: float = 1.0,
) -> np.ndarray | float:
    """R(t) = e^(-t/S). `escala_s` permite usar la calibración del grupo."""
    s = teoria.estabilidad(tipo_materia, dificultad, repasos_previos, calidad_estudio, escala_s)
    return teoria.retencion(dias, s)


def dia_repaso_optimo(
    tipo_materia: str,
    dificultad: int,
    repasos_previos: int,
    calidad_estudio: float,
    umbral_retencion: float,
    escala_s: float = 1.0,
) -> float:
    """Día en que la retención cae al umbral (máx. 60)."""
    s = teoria.estabilidad(tipo_materia, dificultad, repasos_previos, calidad_estudio, escala_s)
    return teoria.dia_umbral(s, umbral_retencion)


if __name__ == "__main__":
    import pandas as pd

    DIAS_DEMO = [0, 1, 3, 7, 14, 30]
    UMBRAL = 0.6
    PARAMS = dict(dificultad=3, repasos_previos=1, calidad_estudio=0.8)

    filas = []
    for tipo in teoria.TIPOS_VALIDOS:
        fila = {"tipo_materia": tipo}
        for d in DIAS_DEMO:
            fila[f"dia_{d:02d}"] = round(float(retencion(d, tipo, **PARAMS)), 4)
        fila["dia_repaso_optimo"] = round(dia_repaso_optimo(tipo, umbral_retencion=UMBRAL, **PARAMS), 2)
        filas.append(fila)

    print(pd.DataFrame(filas).set_index("tipo_materia").to_string())
    print("\n[OK] Validacion de ebbinghaus.py completada.")
