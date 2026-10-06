import pytest
from fastapi.testclient import TestClient

import main

client = TestClient(main.app)

BASE = {
    "tipo_materia": "MIXTA",
    "horas_estudio": 4.5,
    "dificultad": 3,
    "repasos_previos": 1,
    "calidad_estudio": 0.8,
    "umbral_retencion": 0.6,
}


def test_health():
    assert client.get("/").json()["status"] == "ok"


def test_simulate_devuelve_estabilidad_y_curvas():
    r = client.post("/simulate", json=BASE)
    assert r.status_code == 200
    j = r.json()
    assert len(j["curva_aprendizaje"]["x"]) == 40
    assert j["curva_olvido"]["retencion"][0] == 1.0
    assert j["estabilidad_dias"] > 0
    assert 0 <= j["calificacion_predicha"] <= 100


def test_escala_s_alarga_el_repaso_optimo():
    a = client.post("/simulate", json=BASE).json()
    b = client.post("/simulate", json={**BASE, "escala_s": 2.0}).json()
    assert b["dia_repaso_optimo"] == pytest.approx(2 * a["dia_repaso_optimo"], rel=0.02)


def test_simulate_rechaza_tipo_invalido():
    assert client.post("/simulate", json={**BASE, "tipo_materia": "X"}).status_code == 422


def test_materia_id_con_path_traversal_se_rechaza():
    datos = [{"horas_estudio": 1, "dificultad": 3, "repasos_previos": 1, "calidad_estudio": 0.8, "calificacion": 50}] * 6
    r = client.post("/retrain?tipo_materia=MIXTA&materia_id=../../etc/passwd", json=datos)
    assert r.status_code == 422


def test_retrain_es_por_materia_y_no_cambia_el_modelo_base():
    datos = [
        {"horas_estudio": h, "dificultad": 3, "repasos_previos": 1, "calidad_estudio": 0.8, "calificacion": 20 + 5 * h}
        for h in range(1, 11)
    ]
    antes = client.post("/simulate", json=BASE).json()["calificacion_predicha"]
    r = client.post("/retrain?tipo_materia=MIXTA&materia_id=test_materia_pytest", json=datos)
    assert r.status_code == 200
    con_custom = client.post("/simulate", json={**BASE, "materia_id": "test_materia_pytest"}).json()["calificacion_predicha"]
    sin_custom = client.post("/simulate", json=BASE).json()["calificacion_predicha"]
    assert sin_custom == antes  # el modelo base y otras materias no cambian
    assert con_custom != antes
    assert client.post("/reset-model?tipo_materia=MIXTA&materia_id=test_materia_pytest").status_code == 200


def test_calibrar_endpoint():
    obs = [
        {
            "dificultad": 3,
            "repasos_previos": 1,
            "calidad_estudio": 0.8,
            "puntos": [
                {"dia": 1, "retencion_real": 0.95},
                {"dia": 3, "retencion_real": 0.85},
                {"dia": 7, "retencion_real": 0.7},
            ],
        }
        for _ in range(6)
    ]
    r = client.post("/calibrar", json={"tipo_materia": "MIXTA", "observaciones": obs})
    assert r.status_code == 200 and r.json()["suficiente"] is True


def test_clave_api_si_esta_configurada(monkeypatch):
    monkeypatch.setenv("ML_API_KEY", "secreto")
    assert client.post("/simulate", json=BASE).status_code == 401
    assert client.post("/simulate", json=BASE, headers={"X-ML-Key": "secreto"}).status_code == 200
