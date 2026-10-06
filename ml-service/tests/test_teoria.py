import numpy as np
import pytest

from model import teoria
from model.loader import cargar_modelo


@pytest.mark.parametrize("tipo", teoria.TIPOS_VALIDOS)
def test_retencion_decrece_y_esta_en_0_1(tipo):
    s = teoria.estabilidad(tipo, 3, 1, 0.8)
    r = teoria.retencion(np.arange(0, 31), s)
    assert r[0] == pytest.approx(1.0)
    assert np.all(np.diff(r) < 0)
    assert np.all((r > 0) & (r <= 1))


def test_estabilidad_ordena_tipos_y_responde_a_factores():
    mem = teoria.estabilidad("MEMORISTICA", 3, 1, 0.8)
    mix = teoria.estabilidad("MIXTA", 3, 1, 0.8)
    log = teoria.estabilidad("LOGICO_MATEMATICA", 3, 1, 0.8)
    assert mem < mix < log
    assert teoria.estabilidad("MIXTA", 3, 3, 0.8) > mix  # más repasos -> más S
    assert teoria.estabilidad("MIXTA", 3, 1, 1.0) > mix  # mejor calidad -> más S
    assert teoria.estabilidad("MIXTA", 5, 1, 0.8) < mix  # más difícil -> menos S


def test_dia_umbral_es_inverso_de_retencion():
    s = teoria.estabilidad("MIXTA", 3, 1, 0.8)
    d = teoria.dia_umbral(s, 0.6)
    assert teoria.retencion(d, s) == pytest.approx(0.6, abs=1e-6)


@pytest.mark.parametrize("tipo", teoria.TIPOS_VALIDOS)
def test_nota_esperada_monotona_y_acotada(tipo):
    h = np.linspace(0.5, 10, 50)
    nota = teoria.nota_esperada(tipo, h, 3, 1, 0.8)
    assert np.all(np.diff(nota) > 0)
    assert nota.min() >= 0 and nota.max() <= 100
    assert teoria.nota_esperada(tipo, 5, 1, 1, 0.8) > teoria.nota_esperada(tipo, 5, 5, 1, 0.8)
    assert teoria.nota_esperada(tipo, 5, 3, 5, 0.8) > teoria.nota_esperada(tipo, 5, 3, 0, 0.8)


@pytest.mark.parametrize("tipo", teoria.TIPOS_VALIDOS)
def test_modelo_sustituto_aproxima_la_teoria(tipo):
    modelo = cargar_modelo(tipo)
    rng = np.random.default_rng(0)
    n = 3000
    X = np.column_stack([
        rng.uniform(0.5, 10, n), rng.integers(1, 6, n), rng.integers(0, 6, n), rng.uniform(0.3, 1, n),
    ])
    y_teo = teoria.nota_esperada(tipo, X[:, 0], X[:, 1], X[:, 2], X[:, 3])
    y_mod = np.clip(modelo.predict(X), 0, 100)
    assert np.mean(np.abs(y_teo - y_mod)) < 1.5  # puntos de nota


def test_tipo_invalido():
    with pytest.raises(ValueError):
        teoria.estabilidad("OTRA", 3, 1, 0.8)
