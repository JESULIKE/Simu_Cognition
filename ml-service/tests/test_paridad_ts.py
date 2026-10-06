"""
Verifica que server/utils/teoria.ts (respaldo del BFF) calcula exactamente lo
mismo que model/teoria.py. Se omite si Node >= 22.6 no está disponible.
"""

import itertools
import json
import os
import shutil
import subprocess

import pytest

from model import teoria

AQUI = os.path.dirname(__file__)


def _casos():
    out = []
    for tipo, d, r, q in itertools.product(teoria.TIPOS_VALIDOS, (1, 3, 5), (0, 2, 5), (0.3, 0.75, 1.0)):
        out.append({"tipo": tipo, "dificultad": d, "repasos": r, "calidad": q,
                    "escala": 1.7, "umbral": 0.6, "horas": 4.5})
    return out


@pytest.mark.skipif(shutil.which("node") is None, reason="Node no disponible")
def test_teoria_ts_igual_a_teoria_py():
    casos = _casos()
    proc = subprocess.run(
        ["node", "--experimental-strip-types", "--no-warnings", os.path.join(AQUI, "paridad.mjs"), json.dumps(casos)],
        capture_output=True, text=True, timeout=60,
    )
    if proc.returncode != 0 and "strip-types" in proc.stderr:
        pytest.skip("Node sin soporte de --experimental-strip-types")
    assert proc.returncode == 0, proc.stderr
    ts = json.loads(proc.stdout)

    for c, t in zip(casos, ts):
        s = teoria.estabilidad(c["tipo"], c["dificultad"], c["repasos"], c["calidad"], c["escala"])
        assert t["s"] == pytest.approx(s, rel=1e-12)
        assert t["r7"] == pytest.approx(float(teoria.retencion(7, s)), rel=1e-12)
        assert t["dia"] == pytest.approx(teoria.dia_umbral(s, c["umbral"]), rel=1e-12)
        nota = float(teoria.nota_esperada(c["tipo"], c["horas"], c["dificultad"], c["repasos"], c["calidad"]))
        assert t["nota"] == pytest.approx(nota, rel=1e-12)
