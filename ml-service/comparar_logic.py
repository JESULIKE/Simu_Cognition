"""
comparar_logic.py
-----------------
Lógica pura del endpoint /comparar: sin FastAPI, sin I/O.

Recibe los datos de un estudiante (horas, dificultad, repasos, calidad)
y sus resultados reales de quiz, y los compara contra las predicciones
del modelo ya entrenado (v3.0) y la curva de Ebbinghaus.

NO reentrena los modelos — solo usa .predict().
"""

import numpy as np
from model.loader import cargar_modelo
from model.ebbinghaus import retencion
from schemas import (
    CompararRequest,
    CompararResponse,
    PuntoOlvidoPredicho,
)

# Días de referencia para la curva de olvido (coinciden con MomentoMedicion)
DIAS_REFERENCIA = [0, 1, 3, 7, 14]


def generar_recomendacion(
    calificacion_predicha: float,
    calificacion_real: float,
    delta_retencion_promedio: float,
    tiene_puntos_retencion: bool,
    calidad_estudio: float,
    repasos_previos: int,
    dificultad_docente: int = 3,
    dificultad_percibida: int | None = None,
) -> str:
    """
    Motor de recomendación pedagógica basado en reglas interpretables (sec. 14.1 doc v4.0).
    Evalúa de forma independiente y complementaria:
    1. Desempeño en calificación inicial (H1: predicho vs real).
    2. Decaimiento de la curva de olvido (H2: retención vs Ebbinghaus).
    3. Calidad y hábitos de estudio activo (Likert normalizado).
    4. Repasos previos realizados.
    5. Divergencia metacognitiva (dificultad percibida vs docente).
    """
    recomendaciones = []
    diff_calif = calificacion_real - calificacion_predicha

    # ── 1. Desempeño inicial (H1) ──
    if diff_calif < -10:
        recomendaciones.append(
            f"Tu calificación real ({calificacion_real:.1f} pts) estuvo notablemente por debajo de lo predicho por el modelo "
            f"({calificacion_predicha:.1f} pts) para tus horas de estudio reportadas. "
            "Esto sugiere que la sesión de estudio pudo haber tenido distracciones o baja asimilación activa; "
            "te recomendamos aplicar técnicas de recuerdo activo y auto-evaluación frecuente."
        )
    elif diff_calif > 10:
        recomendaciones.append(
            f"¡Excelente desempeño! Tu calificación real ({calificacion_real:.1f} pts) superó con creces "
            f"la predicción del modelo ({calificacion_predicha:.1f} pts), reflejando una muy buena asimilación "
            "conceptual y alto rendimiento en tu tiempo de estudio."
        )
    else:
        recomendaciones.append(
            f"Tu calificación inicial ({calificacion_real:.1f} pts) se alinea estrechamente con la predicción del modelo "
            f"({calificacion_predicha:.1f} pts)."
        )

    # ── 2. Curva de olvido y retención temporal (H2) ──
    if not tiene_puntos_retencion:
        recomendaciones.append(
            "Aún no registras quizzes de seguimiento posteriores al Día 0. Registra los resultados del Día 1, 3, 7 o 14 "
            "para evaluar tu curva real de olvido frente a Ebbinghaus."
        )
    else:
        if delta_retencion_promedio < -0.10:
            recomendaciones.append(
                f"Tu retención en el tiempo decae más rápido de lo estimado por el modelo "
                f"(variación: {delta_retencion_promedio * 100:+.1f}%). Te beneficiaría adelantar tu próximo repaso antes del día 3."
            )
        elif delta_retencion_promedio > 0.10:
            recomendaciones.append(
                f"Tu retención temporal se mantiene significativamente por encima de la curva teórica "
                f"(variación: {delta_retencion_promedio * 100:+.1f}%), demostrando una consolidación de memoria a largo plazo sólida."
            )
        else:
            recomendaciones.append(
                "Tu tasa de retención a lo largo de los días se ajusta de forma consistente con la curva de olvido prevista."
            )

    # ── 3. Técnicas de estudio activo ──
    if calidad_estudio < 0.50:
        recomendaciones.append(
            f"Tus técnicas de estudio activo autoreportadas son bajas ({calidad_estudio * 100:.0f}%). "
            "Practicar recuerdo activo (sin mirar apuntes) y espaciado de sesiones suele mejorar sustancialmente la memoria."
        )
    elif calidad_estudio >= 0.80:
        recomendaciones.append(
            f"Tus hábitos de estudio activo son sobresalientes ({calidad_estudio * 100:.0f}%), lo que fortalece la fijación de contenidos."
        )

    # ── 4. Repasos previos ──
    if repasos_previos == 0:
        recomendaciones.append(
            "No reportaste repasos previos al quiz. Un solo repaso espaciado antes de la prueba suele frenar notablemente el olvido inicial."
        )
    elif repasos_previos >= 2:
        recomendaciones.append(
            f"El número de repasos previos reportados ({repasos_previos}) ha actuado como un amortiguador clave contra el olvido."
        )

    # ── 5. Metacognición (Dificultad Percibida vs Docente) ──
    if dificultad_percibida is not None:
        if dificultad_percibida >= dificultad_docente + 2:
            recomendaciones.append(
                f"Percibes este tema como mucho más difícil (nivel {dificultad_percibida}) de lo estimado por el docente (nivel {dificultad_docente}). "
                "Considera pedir asesoría docente o fragmentar el tema en partes más pequeñas para evitar sobrecarga cognitiva."
            )
        elif dificultad_percibida <= dificultad_docente - 2:
            recomendaciones.append(
                f"Percibes este tema más accesible (nivel {dificultad_percibida}) que el docente (nivel {dificultad_docente}), indicando una sólida preparación previa."
            )

    return " ".join(recomendaciones)


def calcular_comparacion(req: CompararRequest) -> CompararResponse:
    """
    Compara la predicción del modelo entrenado contra los datos reales
    del estudiante. No modifica ni reentrena los modelos.

    Pasos:
    1. Predice calificacion con el pipeline polinomial (igual que /simulate).
    2. Genera curva de olvido predicha en los días de referencia.
    3. Si hay puntos reales de olvido (días > 0), calcula delta promedio.
    4. Genera recomendación basada en reglas pedagógicas.
    """
    modelo = cargar_modelo(req.tipo_materia, req.materia_id)

    # ── H1: predicción de calificación ──────────────────────────────────────
    X = np.array([[
        req.horas_estudio,
        req.dificultad_docente,
        req.repasos_previos,
        # El modelo sustituto se entrenó con calidad en [0.3, 1.0]: no extrapolar.
        min(max(req.calidad_estudio, 0.3), 1.0),
    ]])
    calificacion_predicha = float(np.clip(modelo.predict(X)[0], 0, 100))
    error_absoluto = abs(calificacion_predicha - req.calificacion_real)

    # ── H2: curva de olvido predicha ─────────────────────────────────────────
    dias = np.array(DIAS_REFERENCIA, dtype=float)
    ret_predicha = retencion(
        dias,
        req.tipo_materia,
        req.dificultad_docente,
        req.repasos_previos,
        req.calidad_estudio,
        req.escala_s,
    )
    curva_predicha = [
        PuntoOlvidoPredicho(dia=float(d), retencion_predicha=float(r))
        for d, r in zip(dias, ret_predicha)
    ]

    # ── delta_retencion_promedio ─────────────────────────────────────────────
    # Sólo sobre los puntos reales posteriores al Día 0 (Día 0 es la línea base = 1.0)
    deltas = []
    if req.puntos_olvido_reales:
        pred_map = {float(d): float(r) for d, r in zip(dias, ret_predicha)}
        for punto in req.puntos_olvido_reales:
            dia_key = float(punto.dia)
            if dia_key > 0 and dia_key in pred_map:
                deltas.append(punto.retencion_real - pred_map[dia_key])

    tiene_puntos_retencion = len(deltas) > 0
    delta_retencion_promedio = float(np.mean(deltas)) if tiene_puntos_retencion else 0.0

    # ── Recomendación ────────────────────────────────────────────────────────
    recomendacion = generar_recomendacion(
        calificacion_predicha=calificacion_predicha,
        calificacion_real=req.calificacion_real,
        delta_retencion_promedio=delta_retencion_promedio,
        tiene_puntos_retencion=tiene_puntos_retencion,
        calidad_estudio=req.calidad_estudio,
        repasos_previos=req.repasos_previos,
        dificultad_docente=req.dificultad_docente,
        dificultad_percibida=req.dificultad_percibida,
    )

    return CompararResponse(
        calificacion_predicha=round(calificacion_predicha, 2),
        error_absoluto=round(error_absoluto, 2),
        curva_olvido_predicha=curva_predicha,
        delta_retencion_promedio=round(delta_retencion_promedio, 4),
        recomendacion=recomendacion,
    )
