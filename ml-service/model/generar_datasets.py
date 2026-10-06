"""
generar_datasets.py
-------------------
Genera 3 datasets sintéticos realistas (uno por TipoMateria) y los guarda
como CSV en ml-service/data/datasets_sinteticos/.

Variables explicativas:
  - horas_estudio    : float [0.5, 10]
  - dificultad       : int   [1, 5]
  - repasos_previos  : int   [0, 5]
  - calidad_estudio  : float [0.3, 1.0]

Target:
  - calificacion : float [0, 100]

Perfiles de curva por tipo:
  MEMORISTICA       → sube rápido con pocas horas, plateau temprano
  LOGICO_MATEMATICA → sube lento al inicio, más lineal/cóncava
  MIXTA             → comportamiento intermedio

Ejecutar desde ml-service/:
  python model/generar_datasets.py
"""

import os
import numpy as np
import pandas as pd

# ── Semilla para reproducibilidad ──────────────────────────────────────────
RNG = np.random.default_rng(seed=42)
N = 2_000  # muestras por tipo

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "datasets_sinteticos")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def _base_features(n: int) -> pd.DataFrame:
    """Genera las variables explicativas comunes a los 3 tipos."""
    return pd.DataFrame({
        "horas_estudio":   RNG.uniform(0.5, 10.0, n).round(2),
        "dificultad":      RNG.integers(1, 6, n),          # [1, 5]
        "repasos_previos": RNG.integers(0, 6, n),          # [0, 5]
        "calidad_estudio": RNG.uniform(0.3, 1.0, n).round(3),
    })


def _clip_score(score: np.ndarray) -> np.ndarray:
    return np.clip(score, 0, 100).round(2)


# ─────────────────────────────────────────────────────────────────────────────
# Perfiles de calificación
# ─────────────────────────────────────────────────────────────────────────────

def score_memoristica(df: pd.DataFrame) -> np.ndarray:
    """
    Curva de aprendizaje empinada al inicio: función logarítmica de horas.
    La memoria depende mucho de repasos y calidad; la dificultad penaliza poco.
    """
    h = df["horas_estudio"].values
    d = df["dificultad"].values
    r = df["repasos_previos"].values
    q = df["calidad_estudio"].values

    base = 20 + 35 * np.log1p(h) * q          # sube rápido, plateau ~55 pts base
    repaso_bonus = 8 * r                        # cada repaso suma hasta 40 pts
    dificultad_pen = 5 * (d - 1)               # penalidad por dificultad (0–20)
    noise = RNG.normal(0, 4, len(df))

    return _clip_score(base + repaso_bonus - dificultad_pen + noise)


def score_logico_matematica(df: pd.DataFrame) -> np.ndarray:
    """
    Curva más lineal/cóncava: las horas tienen un efecto más gradual.
    La dificultad penaliza más; necesita más horas para llegar a notas altas.
    """
    h = df["horas_estudio"].values
    d = df["dificultad"].values
    r = df["repasos_previos"].values
    q = df["calidad_estudio"].values

    # Crecimiento cuadrático suave (refleja necesidad de práctica acumulada)
    base = 15 + 2.8 * h * q + 0.4 * (h ** 1.6) * q
    repaso_bonus = 5 * r                        # repasos ayudan menos que en memorística
    dificultad_pen = 9 * (d - 1)               # dificultad castiga más (0–36)
    noise = RNG.normal(0, 5, len(df))

    return _clip_score(base + repaso_bonus - dificultad_pen + noise)


def score_mixta(df: pd.DataFrame) -> np.ndarray:
    """
    Promedio ponderado de los dos comportamientos anteriores.
    """
    w = 0.5
    return _clip_score(
        w * score_memoristica(df) + (1 - w) * score_logico_matematica(df)
    )


# ─────────────────────────────────────────────────────────────────────────────
# Generación y guardado
# ─────────────────────────────────────────────────────────────────────────────

TIPOS = {
    "memoristica":        score_memoristica,
    "logico_matematica":  score_logico_matematica,
    "mixta":              score_mixta,
}

if __name__ == "__main__":
    for nombre, fn_score in TIPOS.items():
        df = _base_features(N)
        df["calificacion"] = fn_score(df)

        out_path = os.path.join(OUTPUT_DIR, f"{nombre}.csv")
        df.to_csv(out_path, index=False)

        print(
            f"[{nombre.upper():20s}] {len(df)} filas -> {out_path}\n"
            f"  calificacion: min={df['calificacion'].min():.1f}  "
            f"mean={df['calificacion'].mean():.1f}  "
            f"max={df['calificacion'].max():.1f}"
        )

    print("\n[OK] Datasets generados correctamente.")
