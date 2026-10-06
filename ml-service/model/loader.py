"""
loader.py
---------
Carga y cachea los modelos .pkl en memoria para evitar re-deserializarlos
en cada petición (en serverless esto se reutiliza entre invocaciones "calientes").

Hay dos niveles:
  * Modelo base por tipo de materia (compartido, solo lectura): <tipo>.pkl
  * Modelo personalizado por materia (si el docente reentrenó): custom/<materia_id>.pkl
    Un docente NUNCA modifica el modelo de otro: el reentrenamiento se guarda
    bajo la clave de SU materia.
"""

import os
import re
import joblib
from sklearn.pipeline import Pipeline

MODELOS_DIR = os.path.join(os.path.dirname(__file__), "modelos")
CUSTOM_DIR = os.path.join(MODELOS_DIR, "custom")

TIPOS_VALIDOS = {"MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA"}
_ID_SEGURO = re.compile(r"^[A-Za-z0-9_-]{1,64}$")

_cache: dict[str, Pipeline] = {}
_cache_custom: dict[str, Pipeline] = {}


def _validar_materia_id(materia_id: str) -> None:
    # Evita path traversal: el id se usa como nombre de archivo.
    if not _ID_SEGURO.match(materia_id):
        raise ValueError("materia_id inválido")


def ruta_custom(materia_id: str) -> str:
    _validar_materia_id(materia_id)
    return os.path.join(CUSTOM_DIR, f"{materia_id}.pkl")


def guardar_custom(materia_id: str, modelo: Pipeline) -> bool:
    """Guarda en memoria y, si el disco lo permite, en disco. Devuelve si persistió."""
    _validar_materia_id(materia_id)
    _cache_custom[materia_id] = modelo
    try:
        os.makedirs(CUSTOM_DIR, exist_ok=True)
        joblib.dump(modelo, ruta_custom(materia_id))
        return True
    except OSError:
        return False


def borrar_custom(materia_id: str) -> None:
    _validar_materia_id(materia_id)
    _cache_custom.pop(materia_id, None)
    try:
        os.remove(ruta_custom(materia_id))
    except FileNotFoundError:
        pass


def cargar_modelo(tipo_materia: str, materia_id: str | None = None) -> Pipeline:
    """
    Devuelve el modelo para el tipo de materia; si hay un modelo personalizado
    de `materia_id`, lo usa.

    Raises:
        ValueError: tipo de materia inválido.
        FileNotFoundError: falta el .pkl base (ejecuta model/entrenamiento.py).
    """
    if tipo_materia not in TIPOS_VALIDOS:
        raise ValueError(
            f"tipo_materia invalido: '{tipo_materia}'. Opciones: {sorted(TIPOS_VALIDOS)}"
        )

    if materia_id:
        if materia_id in _cache_custom:
            return _cache_custom[materia_id]
        ruta = ruta_custom(materia_id)
        if os.path.exists(ruta):
            _cache_custom[materia_id] = joblib.load(ruta)
            return _cache_custom[materia_id]

    if tipo_materia not in _cache:
        ruta = os.path.join(MODELOS_DIR, tipo_materia.lower() + ".pkl")
        if not os.path.exists(ruta):
            raise FileNotFoundError(
                f"Modelo no encontrado: {ruta}. Ejecuta: python -m model.entrenamiento"
            )
        _cache[tipo_materia] = joblib.load(ruta)

    return _cache[tipo_materia]
