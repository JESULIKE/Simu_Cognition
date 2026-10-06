"""
schemas.py
----------
Modelos Pydantic para request / response de POST /simulate.
"""

from pydantic import BaseModel, Field
from typing import Literal


class SimulateRequest(BaseModel):
    tipo_materia: Literal["MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA"]
    horas_estudio: float = Field(..., ge=0.5, le=10.0)
    dificultad: int = Field(..., ge=1, le=5)
    repasos_previos: int = Field(..., ge=0, le=5)
    calidad_estudio: float = Field(..., ge=0.3, le=1.0)
    umbral_retencion: float = Field(..., ge=0.1, le=0.99)

    model_config = {
        "json_schema_extra": {
            "example": {
                "tipo_materia": "MEMORISTICA",
                "horas_estudio": 4.5,
                "dificultad": 3,
                "repasos_previos": 1,
                "calidad_estudio": 0.8,
                "umbral_retencion": 0.6,
            }
        }
    }


class CurvaAprendizaje(BaseModel):
    """Puntos (horas, calificacion) para graficar la curva de aprendizaje."""
    x: list[float]  # horas_estudio barridas
    y: list[float]  # calificacion predicha


class CurvaOlvido(BaseModel):
    """Puntos (dia, retencion) para graficar la curva de olvido."""
    x_dias: list[float]
    retencion: list[float]


class SimulateResponse(BaseModel):
    curva_aprendizaje: CurvaAprendizaje
    curva_olvido: CurvaOlvido
    calificacion_predicha: float
    dia_repaso_optimo: float


# ── Validación empírica ────────────────────────────────────────────────────────

class PuntoOlvido(BaseModel):
    """Un par (dia, retencion_real) que viene del quiz del estudiante."""
    dia: float
    retencion_real: float


class CompararRequest(BaseModel):
    tipo_materia: Literal["MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA"]
    dificultad_docente: int = Field(..., ge=1, le=5)
    dificultad_percibida: int | None = Field(default=None, ge=1, le=5)
    horas_estudio: float = Field(..., ge=0.5, le=10.0)
    repasos_previos: int = Field(..., ge=0, le=5)
    calidad_estudio: float = Field(..., ge=0.0, le=1.0)
    calificacion_real: float = Field(..., ge=0.0, le=100.0)
    puntos_olvido_reales: list[PuntoOlvido] = Field(default_factory=list)

    model_config = {
        "json_schema_extra": {
            "example": {
                "tipo_materia": "LOGICO_MATEMATICA",
                "dificultad_docente": 3,
                "horas_estudio": 5.0,
                "repasos_previos": 1,
                "calidad_estudio": 0.72,
                "calificacion_real": 68.0,
                "puntos_olvido_reales": [
                    {"dia": 0, "retencion_real": 1.0},
                    {"dia": 1, "retencion_real": 0.91},
                    {"dia": 3, "retencion_real": 0.74},
                    {"dia": 7, "retencion_real": 0.55},
                ],
            }
        }
    }


class PuntoOlvidoPredicho(BaseModel):
    dia: float
    retencion_predicha: float


class CompararResponse(BaseModel):
    calificacion_predicha: float
    error_absoluto: float
    curva_olvido_predicha: list[PuntoOlvidoPredicho]
    delta_retencion_promedio: float   # negativo → retiene menos de lo esperado
    recomendacion: str


# ── Análisis agregado ──────────────────────────────────────────────────────────

class DireccionVariable(BaseModel):
    variable: str
    pendiente: float
    r2: float
    p_valor: float
    direccion_confirmada: bool


class AnalisisAgregadoRequest(BaseModel):
    """
    Lista de datos aplanados de ComparacionResultado + variables del estudiante.
    El BFF construye esta lista desde Prisma.
    """
    rows: list[dict]


class AnalisisAgregadoResponse(BaseModel):
    n: int
    mae: float
    rmse: float
    pearson_r: float
    pearson_p: float
    spearman_r: float
    spearman_p: float
    confirmacion_direccional: list[DireccionVariable]
