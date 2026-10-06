"""
simulate_logic.py
-----------------
Lógica pura del endpoint /simulate: sin FastAPI, sin I/O.
Importable desde main.py (local) y desde api/simulate.py (Vercel).

Curva de aprendizaje:
  - Barre horas_estudio de 0.5 a 10 en 40 pasos, manteniendo el resto de
    parámetros fijos en los valores del request.
  - Predice calificacion con el modelo polinomial del tipo de materia.

Curva de olvido:
  - Barre dias de 0 a 30 en 31 puntos.
  - Usa la función Ebbinghaus parametrizada.
"""

import numpy as np
from model.loader import cargar_modelo
from model.ebbinghaus import retencion, dia_repaso_optimo
from schemas import SimulateRequest, SimulateResponse, CurvaAprendizaje, CurvaOlvido

# Resolución de las curvas
N_HORAS = 40   # puntos en el eje x de la curva de aprendizaje
N_DIAS  = 61   # dias 0..60 (uno por día) para la curva de olvido


def calcular_simulacion(req: SimulateRequest) -> SimulateResponse:
    """
    Calcula ambas curvas y la calificación predicha para los parámetros dados.
    """
    modelo = cargar_modelo(req.tipo_materia)

    # ── Curva de aprendizaje ────────────────────────────────────────────────
    # Barremos horas_estudio de 0.5 a 10 con los demás parámetros fijos.
    horas_range = np.linspace(0.5, 10.0, N_HORAS)

    X_curva = np.column_stack([
        horas_range,
        np.full(N_HORAS, req.dificultad),
        np.full(N_HORAS, req.repasos_previos),
        np.full(N_HORAS, req.calidad_estudio),
    ])
    y_curva = np.clip(modelo.predict(X_curva), 0, 100)

    # Calificación puntual para las horas exactas del request
    X_punto = np.array([[
        req.horas_estudio,
        req.dificultad,
        req.repasos_previos,
        req.calidad_estudio,
    ]])
    calificacion_predicha = float(np.clip(modelo.predict(X_punto)[0], 0, 100))

    # ── Curva de olvido ─────────────────────────────────────────────────────
    dias_range = np.linspace(0, 30, N_DIAS)
    ret = retencion(
        dias_range,
        req.tipo_materia,
        req.dificultad,
        req.repasos_previos,
        req.calidad_estudio,
    )

    dia_opt = dia_repaso_optimo(
        req.tipo_materia,
        req.dificultad,
        req.repasos_previos,
        req.calidad_estudio,
        req.umbral_retencion,
    )

    return SimulateResponse(
        curva_aprendizaje=CurvaAprendizaje(
            x=horas_range.round(3).tolist(),
            y=y_curva.round(2).tolist(),
        ),
        curva_olvido=CurvaOlvido(
            x_dias=dias_range.round(3).tolist(),
            retencion=np.clip(ret, 0, 1).round(4).tolist(),
        ),
        calificacion_predicha=round(calificacion_predicha, 2),
        dia_repaso_optimo=round(dia_opt, 2),
    )
