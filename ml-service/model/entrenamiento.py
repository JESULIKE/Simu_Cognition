"""
entrenamiento.py
----------------
Entrena un Pipeline(PolynomialFeatures(grado=3), LinearRegression) por cada
TipoMateria, lo evalúa con validación cruzada 5-fold (R²) y serializa los
modelos entrenados en ml-service/model/modelos/<tipo>.pkl.

Ejecutar desde ml-service/:
  python model/entrenamiento.py

Prerequisito: haber ejecutado generar_datasets.py antes.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import r2_score, mean_absolute_error

# ── Rutas ──────────────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(__file__)
DATA_DIR    = os.path.join(BASE_DIR, "..", "data", "datasets_sinteticos")
MODELOS_DIR = os.path.join(BASE_DIR, "modelos")
os.makedirs(MODELOS_DIR, exist_ok=True)

FEATURES = ["horas_estudio", "dificultad", "repasos_previos", "calidad_estudio"]
TARGET   = "calificacion"
GRADO    = 3


def entrenar_modelo(
    X_train: np.ndarray,
    y_train: np.ndarray,
    grado: int = GRADO,
) -> Pipeline:
    """
    Construye y entrena el pipeline de regresión polinomial.
    Idéntico al definido en la documentación v3.0 (sección 6).
    """
    modelo = Pipeline([
        ("poly", PolynomialFeatures(degree=grado, include_bias=False)),
        ("reg",  LinearRegression()),
    ])
    modelo.fit(X_train, y_train)
    return modelo


def evaluar_modelo(
    modelo: Pipeline,
    X: np.ndarray,
    y: np.ndarray,
    nombre: str,
) -> dict:
    """Evalúa con 5-fold CV y métricas en el split de test."""
    scores_cv = cross_val_score(modelo, X, y, cv=5, scoring="r2")
    y_pred    = modelo.predict(X)
    return {
        "tipo":     nombre,
        "R2_cv_mean": scores_cv.mean(),
        "R2_cv_std":  scores_cv.std(),
        "R2_test":  r2_score(y, y_pred),
        "MAE_test": mean_absolute_error(y, y_pred),
    }


TIPOS = ["memoristica", "logico_matematica", "mixta"]

if __name__ == "__main__":
    resultados = []

    for tipo in TIPOS:
        csv_path = os.path.join(DATA_DIR, f"{tipo}.csv")
        if not os.path.exists(csv_path):
            raise FileNotFoundError(
                f"No se encontró {csv_path}.\n"
                "Ejecuta primero: python model/generar_datasets.py"
            )

        df = pd.read_csv(csv_path)
        X  = df[FEATURES].values
        y  = df[TARGET].values

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        modelo = entrenar_modelo(X_train, y_train, grado=GRADO)

        metricas = evaluar_modelo(modelo, X_test, y_test, tipo)
        resultados.append(metricas)

        # Serializar modelo
        pkl_path = os.path.join(MODELOS_DIR, f"{tipo}.pkl")
        joblib.dump(modelo, pkl_path)

        print(
            f"[{tipo.upper():22s}] "
            f"R2_cv={metricas['R2_cv_mean']:.4f} +-{metricas['R2_cv_std']:.4f}  "
            f"R2_test={metricas['R2_test']:.4f}  "
            f"MAE={metricas['MAE_test']:.2f} pts  "
            f"-> guardado en {pkl_path}"
        )

    # Resumen tabular
    print("\n-- Resumen ----------------------------------------------------")
    df_res = pd.DataFrame(resultados).set_index("tipo")
    print(df_res.to_string(float_format=lambda x: f"{x:.4f}"))

    umbral = 0.85
    ok = all(r["R2_cv_mean"] > umbral for r in resultados)
    status = "[OK] Todos los modelos superan R2_cv > " + str(umbral) if ok else \
             "[WARN] Algun modelo NO supera R2_cv > " + str(umbral)
    print(f"\n{status}")
