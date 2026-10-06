"""
main.py
-------
Punto de entrada de FastAPI para desarrollo local y producción.

Arrancar con (desde ml-service/):
  uvicorn main:app --reload --port 8000

Variables de entorno opcionales:
  ML_API_KEY       Si se define, toda petición (salvo GET /) debe traer la
                   cabecera  X-ML-Key: <valor>  (el BFF Nuxt la envía).
  ML_ALLOWED_ORIGINS  Orígenes CORS separados por coma (por defecto: ninguno,
                   porque solo el BFF —servidor a servidor— llama a este servicio).
"""

import os
import secrets

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from schemas import (
    SimulateRequest,
    SimulateResponse,
    CompararRequest,
    CompararResponse,
    AnalisisAgregadoRequest,
    AnalisisAgregadoResponse,
    CalibrarRequest,
    CalibrarResponse,
)
from simulate_logic import calcular_simulacion
from comparar_logic import calcular_comparacion
from analisis_logic import calcular_metricas_agregadas, generar_csv
from model import calibracion


def verificar_clave(x_ml_key: str | None = Header(default=None)) -> None:
    esperada = os.environ.get("ML_API_KEY")
    if not esperada:
        return  # sin clave configurada (desarrollo local)
    if not x_ml_key or not secrets.compare_digest(x_ml_key, esperada):
        raise HTTPException(status_code=401, detail="Clave del servicio ML inválida")


app = FastAPI(
    title="Simu-Cognition ML Service",
    description=(
        "Microservicio de cálculo de Simu-Cognition: simulador teórico de "
        "aprendizaje y olvido (Ebbinghaus), modelo sustituto de sklearn, "
        "calibración de la estabilidad S con datos reales y estadística de validación."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    dependencies=[Depends(verificar_clave)],
)

_origenes = [o.strip() for o in os.environ.get("ML_ALLOWED_ORIGINS", "").split(",") if o.strip()]
if _origenes:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_origenes,
        allow_methods=["POST", "GET", "OPTIONS"],
        allow_headers=["*"],
    )


@app.get("/", tags=["health"])
def health_check() -> dict:
    return {"status": "ok", "service": "simu-cognition-ml", "version": app.version}


def _manejar(fn, req):
    try:
        return fn(req)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")


@app.post("/simulate", response_model=SimulateResponse, tags=["simulation"])
def simulate(req: SimulateRequest) -> SimulateResponse:
    """
    Curva de aprendizaje (modelo sustituto sklearn), curva de olvido de
    Ebbinghaus y día de repaso óptimo. `escala_s` aplica la calibración del grupo.
    """
    return _manejar(calcular_simulacion, req)


@app.post("/retrain", tags=["retraining"])
def retrain(tipo_materia: str, materia_id: str, datos: list[dict]) -> dict:
    """
    Reentrena el modelo sustituto SOLO para la materia indicada (no afecta a
    otros docentes). Grado adaptativo + Ridge para evitar sobreajuste con pocas
    muestras.

    Aviso metodológico: no uses los mismos estudiantes para reentrenar y para
    validar H1; se contaminaría la validación.
    """
    import pandas as pd
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import PolynomialFeatures
    from sklearn.linear_model import Ridge
    from sklearn.metrics import r2_score, mean_absolute_error
    from model.loader import guardar_custom

    tipo = tipo_materia.upper()
    if tipo not in {"MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA"}:
        raise HTTPException(status_code=422, detail="Tipo de materia inválido")
    if len(datos) < 5:
        raise HTTPException(status_code=422, detail="Se requieren al menos 5 registros para entrenar")

    df = pd.DataFrame(datos)
    cols = ["horas_estudio", "dificultad", "repasos_previos", "calidad_estudio"]
    for col in cols + ["calificacion"]:
        if col not in df.columns:
            raise HTTPException(status_code=422, detail=f"Falta columna requerida: {col}")

    X, y = df[cols].values, df["calificacion"].values
    n = len(df)
    degree, alpha = (1, 1.0) if n < 12 else (2, 0.5) if n < 35 else (2, 0.1)

    pipeline = Pipeline([
        ("poly", PolynomialFeatures(degree=degree, include_bias=False)),
        ("reg", Ridge(alpha=alpha)),
    ])
    pipeline.fit(X, y)
    y_pred = pipeline.predict(X)

    try:
        persistido = guardar_custom(materia_id, pipeline)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return {
        "status": "success",
        "tipo_materia": tipo,
        "muestras": n,
        "r2_score": round(max(0.0, float(r2_score(y, y_pred))), 4),
        "mae": round(float(mean_absolute_error(y, y_pred)), 2),
        "persistido_en_disco": persistido,
    }


@app.post("/reset-model", tags=["retraining"])
def reset_model(tipo_materia: str, materia_id: str) -> dict:
    """Elimina el modelo personalizado de la materia; vuelve a usar el modelo base."""
    from model.loader import borrar_custom

    if tipo_materia.upper() not in {"MEMORISTICA", "LOGICO_MATEMATICA", "MIXTA"}:
        raise HTTPException(status_code=422, detail="Tipo de materia inválido")
    try:
        borrar_custom(materia_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return {"status": "success", "message": "Modelo restaurado al modelo base."}


# ── Validación empírica y calibración ─────────────────────────────────────────

@app.post("/comparar", response_model=CompararResponse, tags=["validacion"])
def comparar(req: CompararRequest) -> CompararResponse:
    """Compara predicción (H1) y retención (H2) contra los datos reales de un estudiante."""
    return _manejar(calcular_comparacion, req)


@app.post("/calibrar", response_model=CalibrarResponse, tags=["validacion"])
def calibrar(req: CalibrarRequest) -> CalibrarResponse:
    """
    Calibra la estabilidad S del grupo con sus mediciones reales (MAP con
    shrinkage al prior teórico + IC95 por bootstrap + validación prospectiva).
    """
    def _run(r: CalibrarRequest) -> CalibrarResponse:
        obs = [o.model_dump() for o in r.observaciones]
        return CalibrarResponse(**calibracion.calibrar(obs, r.tipo_materia))

    return _manejar(_run, req)


@app.post("/analisis/agregado", response_model=AnalisisAgregadoResponse, tags=["validacion"])
def analisis_agregado(req: AnalisisAgregadoRequest) -> AnalisisAgregadoResponse:
    """MAE, RMSE, Pearson, Spearman y confirmación direccional (BFF pasa las filas)."""
    return _manejar(lambda r: calcular_metricas_agregadas(r.rows), req)


@app.post("/analisis/exportar", tags=["validacion"])
def analisis_exportar(req: AnalisisAgregadoRequest):
    """CSV con una fila por estudiante, listo para R / SPSS / Python / Excel."""
    try:
        csv_content = generar_csv(req.rows)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Error generando CSV: {e}")
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=validacion_empirica.csv"},
    )
