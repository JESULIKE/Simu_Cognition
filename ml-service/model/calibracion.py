"""
calibracion.py
--------------
Calibra la estabilidad de memoria S de un grupo con SUS datos reales.

Modelo:  R_ij = exp( -t_ij / (theta * S0_i) )
  S0_i  : estabilidad teórica del estudiante i (prior de model/teoria.py)
  theta : factor de escala del grupo (1.0 = el prior es correcto)

Estimación (MAP, "shrinkage"): se minimiza
    SSE / sigma^2  +  (ln theta)^2 / tau^2
El segundo término ancla la solución al prior cuando hay pocos datos: con
muestras pequeñas theta se queda cerca de 1; con más datos, domina la evidencia.
El intervalo de confianza del 95 % se obtiene por bootstrap sobre estudiantes.

Retención real = nota_día_n / nota_inicial recortada a [0, 1] (una mejora entre
tests no es "retención > 100 %"). El día 0 no se usa (vale 1 por definición).
"""

import numpy as np
from scipy.optimize import minimize_scalar

from model import teoria

SIGMA = 0.12      # ruido de medición esperado en retención (fracción)
TAU = 0.5         # incertidumbre previa de ln(theta): ~ factor 1.65 a 1 sd
MIN_ESTUDIANTES = 5
MIN_PUNTOS = 8
N_BOOT = 400
DIAS_CURVA = list(range(0, 31))


def _vectorizar(observaciones: list[dict], tipo: str):
    """Aplana a arrays: t, r, s0 (uno por punto) e índice de estudiante."""
    t, r, s0, idx = [], [], [], []
    for i, o in enumerate(observaciones):
        s_i = teoria.estabilidad(tipo, o["dificultad"], o["repasos_previos"], o["calidad_estudio"])
        for p in o["puntos"]:
            if p["dia"] <= 0:
                continue
            t.append(float(p["dia"]))
            r.append(float(np.clip(p["retencion_real"], 0.0, 1.0)))
            s0.append(s_i)
            idx.append(i)
    return np.array(t), np.array(r), np.array(s0), np.array(idx)


def _ajustar_theta(t: np.ndarray, r: np.ndarray, s0: np.ndarray) -> float:
    def objetivo(ln_theta: float) -> float:
        pred = np.exp(-t / (np.exp(ln_theta) * s0))
        return float(np.sum((r - pred) ** 2) / SIGMA**2 + ln_theta**2 / TAU**2)

    res = minimize_scalar(objetivo, bounds=(-2.3, 2.3), method="bounded")  # theta en [0.1, 10]
    return float(np.exp(res.x))


def _rmse(t, r, s0, theta) -> float:
    return float(np.sqrt(np.mean((r - np.exp(-t / (theta * s0))) ** 2)))


def _mae(t, r, s0, theta) -> float:
    return float(np.mean(np.abs(r - np.exp(-t / (theta * s0)))))


def calibrar(observaciones: list[dict], tipo: str, seed: int = 123) -> dict:
    teoria.validar_tipo(tipo)
    t, r, s0, idx = _vectorizar(observaciones, tipo)
    n_est = len(np.unique(idx))
    base = {
        "n_estudiantes": int(n_est),
        "n_puntos": int(len(t)),
        "s_base_prior": teoria.S_BASE_PRIOR[tipo],
    }

    if n_est < MIN_ESTUDIANTES or len(t) < MIN_PUNTOS:
        return {
            **base,
            "suficiente": False,
            "mensaje": (
                f"Aún no hay datos suficientes para calibrar: se necesitan al menos {MIN_ESTUDIANTES} "
                f"estudiantes y {MIN_PUNTOS} mediciones posteriores al día 0 "
                f"(hay {n_est} y {len(t)})."
            ),
        }

    theta = _ajustar_theta(t, r, s0)

    # Bootstrap por estudiante para el IC95
    rng = np.random.default_rng(seed)
    est_ids = np.unique(idx)
    thetas = []
    for _ in range(N_BOOT):
        muestra = rng.choice(est_ids, size=len(est_ids), replace=True)
        mask = np.concatenate([np.where(idx == e)[0] for e in muestra])
        thetas.append(_ajustar_theta(t[mask], r[mask], s0[mask]))
    ic = [float(np.percentile(thetas, 2.5)), float(np.percentile(thetas, 97.5))]

    # Validación prospectiva: ajusta con días <= 3, predice días > 3 (no vistos al ajustar)
    prospectiva = None
    corte = 3
    m_fit, m_test = t <= corte, t > corte
    if m_fit.sum() >= MIN_PUNTOS and m_test.sum() >= 3:
        th_fit = _ajustar_theta(t[m_fit], r[m_fit], s0[m_fit])
        prospectiva = {
            "dia_corte": corte,
            "n_puntos_prueba": int(m_test.sum()),
            "mae_teorica": round(_mae(t[m_test], r[m_test], s0[m_test], 1.0), 4),
            "mae_calibrada": round(_mae(t[m_test], r[m_test], s0[m_test], th_fit), 4),
        }

    # Retención real media por día (lo que se ve en la gráfica como puntos)
    observados = [
        {"dia": float(d), "media": round(float(np.mean(r[t == d])), 4), "n": int(np.sum(t == d))}
        for d in np.unique(t)
    ]

    # Curvas de referencia para el estudiante "promedio" del grupo
    s_ref = float(np.mean(s0))
    dias = np.array(DIAS_CURVA, dtype=float)

    return {
        **base,
        "suficiente": True,
        "mensaje": "Calibración calculada con los datos del grupo.",
        "escala_s": round(theta, 4),
        "escala_s_ic95": [round(ic[0], 4), round(ic[1], 4)],
        "s_base_calibrada": round(teoria.S_BASE_PRIOR[tipo] * theta, 3),
        "rmse_teorica": round(_rmse(t, r, s0, 1.0), 4),
        "rmse_calibrada": round(_rmse(t, r, s0, theta), 4),
        "validacion_prospectiva": prospectiva,
        "curva_dias": dias.tolist(),
        "curva_teorica": np.round(teoria.retencion(dias, s_ref), 4).tolist(),
        "curva_calibrada": np.round(teoria.retencion(dias, s_ref * theta), 4).tolist(),
        "puntos_observados": observados,
    }
