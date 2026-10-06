"""
loader.py
---------
Carga y cachea los modelos .pkl en memoria para evitar re-deserializarlos
en cada petición (en serverless esto se reutiliza entre invocaciones "calientes").
"""

import os
import joblib
from sklearn.pipeline import Pipeline

MODELOS_DIR = os.path.join(os.path.dirname(__file__), "modelos")

TIPOS_VALIDOS = {"MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA"}

_cache: dict[str, Pipeline] = {}


def cargar_modelo(tipo_materia: str) -> Pipeline:
    """
    Devuelve el modelo entrenado para el tipo de materia indicado.
    El modelo se carga desde disco solo la primera vez; el resto se
    sirve desde _cache (singleton por proceso).

    Args:
        tipo_materia: "MEMORISTICA" | "LOGICO_MATEMATICA" | "MIXTA"

    Raises:
        ValueError: si el tipo de materia no es válido.
        FileNotFoundError: si el .pkl no existe (hay que ejecutar entrenamiento.py).
    """
    if tipo_materia not in TIPOS_VALIDOS:
        raise ValueError(
            f"tipo_materia invalido: '{tipo_materia}'. "
            f"Opciones: {sorted(TIPOS_VALIDOS)}"
        )

    if tipo_materia not in _cache:
        nombre_archivo = tipo_materia.lower() + ".pkl"
        ruta = os.path.join(MODELOS_DIR, nombre_archivo)
        if not os.path.exists(ruta):
            raise FileNotFoundError(
                f"Modelo no encontrado: {ruta}. "
                "Ejecuta primero: python model/entrenamiento.py"
            )
        _cache[tipo_materia] = joblib.load(ruta)

    return _cache[tipo_materia]
