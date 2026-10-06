"""
main.py
-------
Punto de entrada de FastAPI para desarrollo local y producción.

Arrancar con:
  uvicorn main:app --reload --port 8000

Desde ml-service/:
  uvicorn main:app --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from schemas import (
    SimulateRequest,
    SimulateResponse,
    CompararRequest,
    CompararResponse,
    AnalisisAgregadoRequest,
    AnalisisAgregadoResponse,
)
from simulate_logic import calcular_simulacion
from comparar_logic import calcular_comparacion
from analisis_logic import calcular_metricas_agregadas, generar_csv

app = FastAPI(
    title="Simu-Cognition ML Service",
    description=(
        "Microservicio de Machine Learning para Simu-Cognition. "
        "Calcula curvas de aprendizaje (regresion polinomial) y olvido "
        "(Ebbinghaus) parametrizadas por tipo de materia."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS: en produccion, restringir a la URL del proyecto Nuxt.
# En local, permitir todo para facilitar el desarrollo.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # <-- cambiar a [ML_SERVICE_ORIGIN] en prod
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/", tags=["health"])
def health_check() -> dict:
    """Endpoint de salud — confirma que el servicio esta levantado."""
    return {"status": "ok", "service": "simu-cognition-ml"}


@app.post("/simulate", response_model=SimulateResponse, tags=["simulation"])
def simulate(req: SimulateRequest) -> SimulateResponse:
    """
    Calcula la curva de aprendizaje y la curva de olvido para los
    parametros recibidos.

    - **tipo_materia**: MEMORISTICA | LOGICO_MATEMATICA | MIXTA
    - **horas_estudio**: horas dedicadas al estudio [0.5, 10]
    - **dificultad**: nivel de dificultad de la materia [1, 5]
    - **repasos_previos**: cantidad de repasos anteriores [0, 5]
    - **calidad_estudio**: factor de calidad del estudio [0.3, 1.0]
    - **umbral_retencion**: nivel de retencion minimo aceptado [0.1, 0.99]
    """
    try:
        return calcular_simulacion(req)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")


@app.post("/retrain", tags=["retraining"])
def retrain(
    tipo_materia: str,
    datos: list[dict],
) -> dict:
    """
    Reentrena dinámicamente el modelo para un tipo de materia
    usando nuevos datos proporcionados (ej. notas reales de los alumnos).
    Aplica grado adaptativo y regularización Ridge para evitar sobreajuste
    cuando el número de muestras es pequeño.
    """
    import numpy as np
    import pandas as pd
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import PolynomialFeatures
    from sklearn.linear_model import Ridge
    from sklearn.metrics import r2_score, mean_absolute_error
    from model.loader import _cache, MODELOS_DIR
    import joblib
    import os

    tipo = tipo_materia.upper()
    if tipo not in {"MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA"}:
        raise HTTPException(status_code=422, detail="Tipo de materia inválido")

    if len(datos) < 5:
        raise HTTPException(status_code=422, detail="Se requieren al menos 5 registros para entrenar")

    df = pd.DataFrame(datos)
    required_cols = ["horas_estudio", "dificultad", "repasos_previos", "calidad_estudio", "calificacion"]
    for col in required_cols:
        if col not in df.columns:
            raise HTTPException(status_code=422, detail=f"Falta columna requerida: {col}")

    X = df[["horas_estudio", "dificultad", "repasos_previos", "calidad_estudio"]].values
    y = df["calificacion"].values

    # Grado adaptativo y regularización para evitar singularidades y explosión polinomial
    n_muestras = len(df)
    if n_muestras < 12:
        degree = 1
        alpha = 1.0
    elif n_muestras < 35:
        degree = 2
        alpha = 0.5
    else:
        degree = 2
        alpha = 0.1

    pipeline = Pipeline([
        ("poly", PolynomialFeatures(degree=degree, include_bias=False)),
        ("reg", Ridge(alpha=alpha)),
    ])
    pipeline.fit(X, y)

    y_pred = pipeline.predict(X)
    r2 = float(r2_score(y, y_pred))
    mae = float(mean_absolute_error(y, y_pred))

    # Actualizar cache en memoria
    _cache[tipo] = pipeline

    # Guardar en disco
    pkl_path = os.path.join(MODELOS_DIR, f"{tipo.lower()}.pkl")
    try:
        joblib.dump(pipeline, pkl_path)
    except Exception as e:
        print(f"Aviso: no se pudo persistir en disco ({e}), pero se actualizó en memoria.")

    return {
        "status": "success",
        "tipo_materia": tipo,
        "muestras": len(df),
        "r2_score": round(max(0.0, r2), 4),
        "mae": round(mae, 2),
    }


@app.post("/reset-model", tags=["retraining"])
def reset_model(tipo_materia: str) -> dict:
    """
    Restaura el modelo base preentrenado para el tipo de materia indicado.
    """
    import os
    import shutil
    import joblib
    from model.loader import _cache, MODELOS_DIR

    tipo = tipo_materia.upper()
    if tipo not in {"MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA"}:
        raise HTTPException(status_code=422, detail="Tipo de materia inválido")

    base_path = os.path.join(MODELOS_DIR, f"base_{tipo.lower()}.pkl")
    target_path = os.path.join(MODELOS_DIR, f"{tipo.lower()}.pkl")

    if not os.path.exists(base_path):
        raise HTTPException(status_code=404, detail="No se encontró el modelo base original.")

    shutil.copyfile(base_path, target_path)
    _cache[tipo] = joblib.load(target_path)

    return {"status": "success", "message": f"Modelo {tipo} restaurado al estado base."}


# ── Módulo de Validación Empírica (v4.0) ──────────────────────────────────────

@app.post("/comparar", response_model=CompararResponse, tags=["validacion"])
def comparar(req: CompararRequest) -> CompararResponse:
    """
    Compara la predicción del modelo entrenado (v3.0) contra los datos reales
    de un estudiante.

    - Usa los modelos .pkl ya entrenados — NO los reentrena.
    - Genera la curva de olvido predicha en días [0, 1, 3, 7, 14].
    - Calcula error_absoluto (H1) y delta_retencion_promedio (H2).
    - Genera recomendación pedagógica basada en reglas (sec. 14.1 doc v4.0).
    """
    try:
        return calcular_comparacion(req)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")


@app.post("/analisis/agregado", response_model=AnalisisAgregadoResponse, tags=["validacion"])
def analisis_agregado(req: AnalisisAgregadoRequest) -> AnalisisAgregadoResponse:
    """
    Calcula métricas estadísticas agregadas sobre todos los estudiantes de una
    materia/grupo (sec. 15 doc v4.0):

    - MAE, RMSE (error de predicción global).
    - Pearson r y Spearman r (correlación predicha vs real).
    - Confirmación direccional por variable (regresión univariada).

    El BFF Nuxt consulta Prisma y pasa los datos en req.rows.
    """
    try:
        return calcular_metricas_agregadas(req.rows)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")


@app.post("/analisis/exportar", tags=["validacion"])
def analisis_exportar(req: AnalisisAgregadoRequest):
    """
    Genera y devuelve el CSV export con una fila por estudiante (sec. 15 doc v4.0).

    Columnas: codigo_anonimo, tipo_materia, dificultad_docente, dificultad_percibida,
    horas_estudio, repasos_previos, calidad_estudio, calificacion_predicha,
    calificacion_real, error_absoluto, retencion_real_dia{1,3,7,14},
    retencion_predicha_dia{1,3,7,14}.
    """
    try:
        csv_content = generar_csv(req.rows)
        return StreamingResponse(
            iter([csv_content]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=validacion_empirica.csv"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando CSV: {e}")
