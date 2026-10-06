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
    # Factor de calibración de S del grupo (1.0 = valor teórico por defecto).
    escala_s: float = Field(default=1.0, ge=0.1, le=10.0)
    # Si el docente reentrenó el modelo sustituto de esta materia.
    materia_id: str | None = Field(default=None, max_length=64)

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
    estabilidad_dias: float          # S (días) usada para este escenario
    escala_s: float = 1.0            # calibración aplicada (1.0 = teórica)


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
    escala_s: float = Field(default=1.0, ge=0.1, le=10.0)
    materia_id: str | None = Field(default=None, max_length=64)

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


# ── Calibración de la estabilidad S con datos reales ───────────────────────────

class ObservacionOlvido(BaseModel):
    """Un estudiante: covariables conocidas + sus puntos reales de retención."""
    dificultad: int = Field(..., ge=1, le=5)
    repasos_previos: int = Field(..., ge=0, le=5)
    calidad_estudio: float = Field(..., ge=0.0, le=1.0)
    puntos: list[PuntoOlvido]


class CalibrarRequest(BaseModel):
    tipo_materia: Literal["MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA"]
    observaciones: list[ObservacionOlvido]


class ValidacionProspectiva(BaseModel):
    """Ajusta con días <= corte y predice días > corte (datos no usados al ajustar)."""
    dia_corte: int
    n_puntos_prueba: int
    mae_teorica: float
    mae_calibrada: float


class PuntoObservado(BaseModel):
    dia: float
    media: float        # retención real media del grupo en ese día
    n: int


class CalibrarResponse(BaseModel):
    suficiente: bool
    mensaje: str
    n_estudiantes: int
    n_puntos: int
    escala_s: float = 1.0
    escala_s_ic95: list[float] = Field(default_factory=lambda: [1.0, 1.0])
    s_base_prior: float = 0.0
    s_base_calibrada: float = 0.0
    rmse_teorica: float = 0.0
    rmse_calibrada: float = 0.0
    validacion_prospectiva: ValidacionProspectiva | None = None
    curva_dias: list[float] = Field(default_factory=list)
    curva_teorica: list[float] = Field(default_factory=list)
    curva_calibrada: list[float] = Field(default_factory=list)
    puntos_observados: list[PuntoObservado] = Field(default_factory=list)


class AnalisisAgregadoResponse(BaseModel):
    n: int
    mae: float
    rmse: float
    pearson_r: float
    pearson_p: float
    spearman_r: float
    spearman_p: float
    confirmacion_direccional: list[DireccionVariable]
