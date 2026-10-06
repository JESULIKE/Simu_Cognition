"""
analisis_logic.py
-----------------
Lógica del módulo de análisis estadístico agregado (sec. 15 doc v4.0).

Recibe los datos ya consultados desde Prisma (via BFF Nuxt) y calcula:
  - MAE, RMSE, Pearson r/p, Spearman r/p  (sobre H1: calificaciones)
  - Confirmación direccional univariada por variable (sec. 15 doc v4.0)
  - Generación del CSV export (sec. 15 doc v4.0)

NO accede directamente a la DB — el BFF le pasa los datos como lista de dicts.
NO reentrena ningún modelo.
"""

import io
import json
import csv
import numpy as np
from scipy import stats

from schemas import AnalisisAgregadoResponse, DireccionVariable

# Días de referencia para la curva de olvido (deben coincidir con MomentoMedicion)
DIAS_REF = [1, 3, 7, 14]

# Variables sobre las que se corre la regresión univariada.
# direction_positive=True → pendiente > 0 confirma H
VARIABLES_DIRECCION = [
    {"campo": "horasEstudio",    "label": "horas_estudio",    "direction_positive": True},
    {"campo": "repasosPrevios",  "label": "repasos_previos",  "direction_positive": True},
    {"campo": "calidadEstudio",  "label": "calidad_estudio",  "direction_positive": True},
    {"campo": "dificultadDocente","label": "dificultad_docente","direction_positive": False},
]


def _clean_float(val, default: float = 0.0, decimals: int = 4) -> float:
    if val is None:
        return default
    try:
        f = float(val)
        if np.isnan(f) or np.isinf(f):
            return default
        return round(f, decimals)
    except (ValueError, TypeError):
        return default


def calcular_metricas_agregadas(rows: list[dict]) -> AnalisisAgregadoResponse:
    """
    Calcula MAE, RMSE, Pearson, Spearman y confirmación direccional por variable.

    Args:
        rows: lista de dicts con campos mínimos:
              {calificacionPredicha, calificacionReal,
               horasEstudio, repasosPrevios, calidadEstudio, dificultadDocente}
    """
    if len(rows) < 2:
        raise ValueError("Se necesitan al menos 2 registros para calcular métricas.")

    predichas = np.array([r["calificacionPredicha"] for r in rows], dtype=float)
    reales = np.array([r["calificacionReal"] for r in rows], dtype=float)

    mae = float(np.mean(np.abs(predichas - reales)))
    rmse = float(np.sqrt(np.mean((predichas - reales) ** 2)))

    # Pearson
    if len(np.unique(predichas)) < 2 or len(np.unique(reales)) < 2:
        pearson_r, pearson_p = 0.0, 1.0
    else:
        p_res = stats.pearsonr(predichas, reales)
        pearson_r, pearson_p = p_res[0], p_res[1]

    # Spearman
    if len(np.unique(predichas)) < 2 or len(np.unique(reales)) < 2:
        spearman_r, spearman_p = 0.0, 1.0
    else:
        s_res = stats.spearmanr(predichas, reales)
        spearman_r, spearman_p = s_res[0], s_res[1]

    # Confirmación direccional por variable (regresión univariada)
    confirmacion = []
    for var in VARIABLES_DIRECCION:
        x = np.array([r[var["campo"]] for r in rows], dtype=float)
        if len(np.unique(x)) < 2 or len(np.unique(reales)) < 2:
            # Sin varianza en esta variable, no se puede calcular regresión
            confirmacion.append(DireccionVariable(
                variable=var["label"],
                pendiente=0.0,
                r2=0.0,
                p_valor=1.0,
                direccion_confirmada=False,
            ))
            continue
        slope, _, r_value, p_value, _ = stats.linregress(x, reales)
        confirmacion.append(DireccionVariable(
            variable=var["label"],
            pendiente=_clean_float(slope, 0.0, 3),
            r2=_clean_float(r_value ** 2, 0.0, 3),
            p_valor=_clean_float(p_value, 1.0, 4),
            direccion_confirmada=(slope > 0) if var["direction_positive"] else (slope < 0),
        ))

    return AnalisisAgregadoResponse(
        n=len(rows),
        mae=_clean_float(mae, 0.0, 3),
        rmse=_clean_float(rmse, 0.0, 3),
        pearson_r=_clean_float(pearson_r, 0.0, 3),
        pearson_p=_clean_float(pearson_p, 1.0, 4),
        spearman_r=_clean_float(spearman_r, 0.0, 3),
        spearman_p=_clean_float(spearman_p, 1.0, 4),
        confirmacion_direccional=confirmacion,
    )


def generar_csv(rows: list[dict]) -> str:
    """
    Genera el CSV export con una fila por estudiante.

    Columnas (spec sec. 15 doc v4.0):
        codigo_anonimo, tipo_materia, dificultad_docente, dificultad_percibida,
        horas_estudio, repasos_previos, calidad_estudio,
        calificacion_predicha, calificacion_real, error_absoluto,
        retencion_real_dia1, retencion_real_dia3, retencion_real_dia7, retencion_real_dia14,
        retencion_predicha_dia1, retencion_predicha_dia3, retencion_predicha_dia7, retencion_predicha_dia14

    Args:
        rows: lista de dicts enriquecidos desde el BFF (incluye los JSON de retención).
    """
    fieldnames = [
        "codigo_anonimo", "tipo_materia", "dificultad_docente", "dificultad_percibida",
        "horas_estudio", "repasos_previos", "calidad_estudio",
        "calificacion_predicha", "calificacion_real", "error_absoluto",
        "retencion_real_dia1", "retencion_real_dia3", "retencion_real_dia7", "retencion_real_dia14",
        "retencion_predicha_dia1", "retencion_predicha_dia3", "retencion_predicha_dia7", "retencion_predicha_dia14",
    ]

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()

    for r in rows:
        # Deserializar JSON de retención
        ret_real = _parse_retencion_json(r.get("retencionRealJson", "[]"))
        ret_pred = _parse_retencion_json(r.get("retencionPredichaJson", "[]"))

        row_csv = {
            "codigo_anonimo":      r.get("codigoAnonimo", ""),
            "tipo_materia":        r.get("tipoMateriaDocente", ""),
            "dificultad_docente":  r.get("dificultadDocente", ""),
            "dificultad_percibida":r.get("dificultadPercibida", ""),
            "horas_estudio":       r.get("horasEstudio", ""),
            "repasos_previos":     r.get("repasosPrevios", ""),
            "calidad_estudio":     r.get("calidadEstudio", ""),
            "calificacion_predicha":r.get("calificacionPredicha", ""),
            "calificacion_real":   r.get("calificacionReal", ""),
            "error_absoluto":      r.get("errorAbsoluto", ""),
        }

        # Retenciones por día
        for dia in DIAS_REF:
            key = f"dia_{dia}"
            row_csv[f"retencion_real_dia{dia}"] = ret_real.get(key, "")
            row_csv[f"retencion_predicha_dia{dia}"] = ret_pred.get(key, "")

        writer.writerow(row_csv)

    return output.getvalue()


def _parse_retencion_json(json_str: str) -> dict:
    """
    Convierte el JSON serializado de retención a un dict {dia_N: valor}.
    Soporta tanto la clave 'retencion_real' como 'retencion_predicha'.
    """
    result = {}
    try:
        items = json.loads(json_str) if json_str else []
        for item in items:
            dia = item.get("dia")
            # Acepta cualquiera de las dos claves posibles
            valor = item.get("retencion_real", item.get("retencion_predicha"))
            if dia is not None and valor is not None:
                result[f"dia_{int(dia)}"] = valor
    except (json.JSONDecodeError, TypeError):
        pass
    return result
