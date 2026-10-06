"""
entrenamiento.py
----------------
Entrena un Pipeline(PolynomialFeatures(grado=3), LinearRegression) por tipo de
materia sobre los datasets sintéticos y lo evalúa con validación cruzada.

El modelo es un SUSTITUTO del simulador teórico (model/teoria.py): se mide qué
tan bien lo aproxima. No es evidencia empírica sobre estudiantes reales.

Ejecutar desde ml-service/ (tras generar_datasets):
  python -m model.entrenamiento

Escribe tanto <tipo>.pkl (modelo activo) como base_<tipo>.pkl (copia para /reset-model).
"""

import os
import shutil
import joblib
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import r2_score, mean_absolute_error

from model import teoria

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "..", "data", "datasets_sinteticos")
MODELOS_DIR = os.path.join(BASE_DIR, "modelos")

FEATURES = ["horas_estudio", "dificultad", "repasos_previos", "calidad_estudio"]
TARGET = "calificacion"
GRADO = 3


def entrenar_modelo(X_train: np.ndarray, y_train: np.ndarray, grado: int = GRADO) -> Pipeline:
    modelo = Pipeline([
        ("poly", PolynomialFeatures(degree=grado, include_bias=False)),
        ("reg", LinearRegression()),
    ])
    modelo.fit(X_train, y_train)
    return modelo


def error_vs_teoria(modelo: Pipeline, tipo: str, n: int = 5000, seed: int = 7) -> dict:
    """Error del sustituto frente al simulador teórico SIN ruido, en puntos aleatorios."""
    rng = np.random.default_rng(seed)
    X = np.column_stack([
        rng.uniform(0.5, 10, n),
        rng.integers(1, 6, n),
        rng.integers(0, 6, n),
        rng.uniform(0.3, 1.0, n),
    ])
    y_teo = teoria.nota_esperada(tipo, X[:, 0], X[:, 1], X[:, 2], X[:, 3])
    y_mod = np.clip(modelo.predict(X), 0, 100)
    return {"MAE_vs_teoria": mean_absolute_error(y_teo, y_mod), "R2_vs_teoria": r2_score(y_teo, y_mod)}


if __name__ == "__main__":
    os.makedirs(MODELOS_DIR, exist_ok=True)
    resultados = []

    for tipo in teoria.TIPOS_VALIDOS:
        nombre = tipo.lower()
        csv_path = os.path.join(DATA_DIR, f"{nombre}.csv")
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"No se encontró {csv_path}. Ejecuta: python -m model.generar_datasets")

        df = pd.read_csv(csv_path)
        X, y = df[FEATURES].values, df[TARGET].values
        X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)

        modelo = entrenar_modelo(X_tr, y_tr)
        cv = cross_val_score(entrenar_modelo(X_tr, y_tr), X_tr, y_tr, cv=5, scoring="r2")
        met = {
            "tipo": nombre,
            "R2_cv": cv.mean(),
            "R2_test": r2_score(y_te, modelo.predict(X_te)),
            "MAE_test": mean_absolute_error(y_te, modelo.predict(X_te)),
            **error_vs_teoria(modelo, tipo),
        }
        resultados.append(met)

        pkl = os.path.join(MODELOS_DIR, f"{nombre}.pkl")
        joblib.dump(modelo, pkl)
        shutil.copyfile(pkl, os.path.join(MODELOS_DIR, f"base_{nombre}.pkl"))

    print(pd.DataFrame(resultados).set_index("tipo").to_string(float_format=lambda v: f"{v:.4f}"))
    ok = all(r["R2_vs_teoria"] > 0.97 for r in resultados)
    print("\n[OK] El sustituto aproxima al simulador (R2 > 0.97)." if ok else "\n[WARN] Revisa la aproximación.")
