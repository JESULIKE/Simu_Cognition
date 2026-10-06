import numpy as np
import pytest

from model import teoria
from model.calibracion import calibrar


def _simular_grupo(tipo, theta_real, n, seed=1, ruido=0.06):
    rng = np.random.default_rng(seed)
    obs = []
    for _ in range(n):
        d, r, q = int(rng.integers(1, 6)), int(rng.integers(0, 3)), float(rng.uniform(0.3, 1))
        s = teoria.estabilidad(tipo, d, r, q) * theta_real
        pts = [
            {"dia": dd, "retencion_real": float(np.clip(np.exp(-dd / s) + rng.normal(0, ruido), 0, 1))}
            for dd in (1, 3, 7, 14)
        ]
        obs.append({"dificultad": d, "repasos_previos": r, "calidad_estudio": q, "puntos": pts})
    return obs


def test_recupera_theta_verdadero_con_muestra_moderada():
    out = calibrar(_simular_grupo("MIXTA", 1.8, 30), "MIXTA")
    assert out["suficiente"]
    assert out["escala_s"] == pytest.approx(1.8, rel=0.2)
    lo, hi = out["escala_s_ic95"]
    assert lo <= 1.8 <= hi
    assert out["rmse_calibrada"] < out["rmse_teorica"]


def test_si_el_prior_es_correcto_theta_cerca_de_1():
    out = calibrar(_simular_grupo("MEMORISTICA", 1.0, 30, seed=3), "MEMORISTICA")
    assert out["escala_s"] == pytest.approx(1.0, abs=0.2)


def test_shrinkage_con_pocos_datos_se_queda_mas_cerca_del_prior():
    pocos = calibrar(_simular_grupo("MIXTA", 3.0, 5, seed=2), "MIXTA")
    muchos = calibrar(_simular_grupo("MIXTA", 3.0, 40, seed=2), "MIXTA")
    assert pocos["suficiente"] and muchos["suficiente"]
    assert abs(np.log(pocos["escala_s"])) < abs(np.log(muchos["escala_s"]))


def test_datos_insuficientes_no_calibra():
    out = calibrar(_simular_grupo("MIXTA", 1.5, 3), "MIXTA")
    assert out["suficiente"] is False
    assert "datos suficientes" in out["mensaje"]


def test_validacion_prospectiva_mejora_si_prior_esta_sesgado():
    out = calibrar(_simular_grupo("LOGICO_MATEMATICA", 0.4, 30, seed=5), "LOGICO_MATEMATICA")
    vp = out["validacion_prospectiva"]
    assert vp is not None
    assert vp["mae_calibrada"] < vp["mae_teorica"]
