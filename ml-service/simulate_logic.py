"""
simulate_logic.py
-----------------
Lógica pura del endpoint /simulate: sin FastAPI, sin I/O.
Importable desde main.py (local) y desde api/simulate.py (Vercel).

Curva de aprendizaje:
  - Barre horas_estudio de 0.5 a 10 en 40 pasos con el resto de parámetros fijos.
  - La nota la predice el modelo sustituto de sklearn (aproxima model/teoria.py).

Curva de olvido:
  - R(t) = exp(-t / S) para t = 0..30 días (61 puntos).
  - S sale de la teoría, escalada por la calibración del grupo (escala_s).
"""

import numpy as np
from model.loader import cargar_modelo
from model import teoria
from schemas import SimulateRequest, SimulateResponse, CurvaAprendizaje, CurvaOlvido

N_HORAS = 40   # puntos en el eje x de la curva de aprendizaje
N_DIAS = 61    # puntos de la curva de olvido (0..30 días, paso 0.5)


def calcular_simulacion(req: SimulateRequest) -> SimulateResponse:
    modelo = cargar_modelo(req.tipo_materia, req.materia_id)

    # ── Curva de aprendizaje ────────────────────────────────────────────────
    horas_range = np.linspace(0.5, 10.0, N_HORAS)
    X_curva = np.column_stack([
        horas_range,
        np.full(N_HORAS, req.dificultad),
        np.full(N_HORAS, req.repasos_previos),
        np.full(N_HORAS, req.calidad_estudio),
    ])
    y_curva = np.clip(modelo.predict(X_curva), 0, 100)

    X_punto = np.array([[req.horas_estudio, req.dificultad, req.repasos_previos, req.calidad_estudio]])
    calificacion_predicha = float(np.clip(modelo.predict(X_punto)[0], 0, 100))

    # ── Curva de olvido ─────────────────────────────────────────────────────
    s = teoria.estabilidad(
        req.tipo_materia, req.dificultad, req.repasos_previos, req.calidad_estudio, req.escala_s
    )
    dias_range = np.linspace(0, 30, N_DIAS)
    ret = teoria.retencion(dias_range, s)

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
        dia_repaso_optimo=round(teoria.dia_umbral(s, req.umbral_retencion), 2),
        estabilidad_dias=round(float(s), 3),
        escala_s=req.escala_s,
    )
