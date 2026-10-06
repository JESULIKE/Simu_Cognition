"""
generar_datasets.py
-------------------
Genera datasets SINTÉTICOS (uno por tipo de materia) a partir del simulador
teórico de model/teoria.py más ruido gaussiano.

IMPORTANTE (honestidad metodológica): estos datos NO son observaciones reales.
Sirven para entrenar un modelo sustituto (regresión polinomial de sklearn) que
aproxima el simulador teórico de forma rápida e interactiva. La validez
empírica se evalúa con datos reales de estudiantes (módulo de Validación
Empírica y calibración), nunca con estos datos.

Ejecutar desde ml-service/:
  python -m model.generar_datasets
"""

import os
import numpy as np
import pandas as pd

from model import teoria

RNG = np.random.default_rng(seed=42)
N = 2_000          # muestras por tipo
RUIDO_SD = 3.0     # desviación estándar del ruido (puntos de nota)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "datasets_sinteticos")


def generar(tipo: str, n: int = N) -> pd.DataFrame:
    df = pd.DataFrame({
        "horas_estudio":   RNG.uniform(0.5, 10.0, n).round(2),
        "dificultad":      RNG.integers(1, 6, n),
        "repasos_previos": RNG.integers(0, 6, n),
        "calidad_estudio": RNG.uniform(0.3, 1.0, n).round(3),
    })
    nota = teoria.nota_esperada(
        tipo, df["horas_estudio"], df["dificultad"], df["repasos_previos"], df["calidad_estudio"]
    )
    df["calificacion"] = np.clip(nota + RNG.normal(0, RUIDO_SD, n), 0, 100).round(2)
    return df


if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for tipo in teoria.TIPOS_VALIDOS:
        df = generar(tipo)
        out_path = os.path.join(OUTPUT_DIR, f"{tipo.lower()}.csv")
        df.to_csv(out_path, index=False)
        print(
            f"[{tipo:18s}] {len(df)} filas -> {out_path}  "
            f"min={df.calificacion.min():.1f} mean={df.calificacion.mean():.1f} max={df.calificacion.max():.1f}"
        )
    print("\n[OK] Datasets sintéticos generados desde el simulador teórico.")
