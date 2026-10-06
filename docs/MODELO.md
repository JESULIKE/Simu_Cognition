# Modelo, fundamentación y limitaciones

## 1. Problema
El docente rara vez ve **cuánto se olvida entre una clase y la siguiente**; lo descubre en el examen final o en el curso siguiente, y el repaso se decide por intuición. Simu-Cognition mide ese olvido en el grupo y lo usa para planear el repaso.

Base científica (a verificar con revisión de literatura propia antes de publicar):
- Curva del olvido: Ebbinghaus (1885); replicación de Murre y Dros (2015).
- Efecto del espaciado: Cepeda et al. (2006).
- Efecto de la práctica de recuperación: Roediger y Karpicke (2006).
- Técnicas de estudio: Dunlosky et al. (2013).

## 2. Modelo teórico (`ml-service/model/teoria.py`)

**Olvido:** `R(t) = exp(−t / S)`, con `S` en días.

`S = S_base(tipo) · θ · (1 + 0.5·repasos) · (0.6 + 0.8·calidad) · (1.2 − 0.1·(dificultad−1))`

| Tipo de materia | `S_base` (días, valor de partida) |
|---|---|
| Memorística | 4 |
| Mixta | 7 |
| Lógico-matemática | 10 |

`θ` es el **factor de calibración del grupo** (1.0 = teoría).

> Los `S_base` son órdenes de magnitud coherentes con la literatura, **no constantes universales**. Los factores multiplicativos (repasos, calidad, dificultad) son **hipótesis de trabajo**. Por eso el sistema los contrasta y calibra con datos reales.

**Aprendizaje (nota esperada):** `nota = techo · (1 − exp(−k · horas_efectivas))`, con `techo = min(100, 85 + 3·repasos)`, horas efectivas = `horas·(0.5 + 0.5·calidad)` y `k` dependiente del tipo y la dificultad. También es una hipótesis de trabajo, no un ajuste a datos.

**Modelo sustituto (sklearn):** una regresión polinomial de grado 3 se entrena con datos sintéticos generados **desde el simulador teórico** más ruido gaussiano. Su función es responder rápido y de forma interactiva; **no descubre la realidad**. Aproxima al simulador con error medio < 1.5 puntos (verificado en los tests). La evidencia empírica sale de los datos de estudiantes, no de estos datos sintéticos.

## 3. Calibración con datos reales (`ml-service/model/calibracion.py`)

- Retención real de cada medición: `min(1, nota_día_n / nota_inicial)`; se excluyen las mediciones con re-estudio reportado y el día 0.
- Se estima `θ` minimizando `SSE/σ² + (ln θ)²/τ²` (MAP): con pocos datos el resultado se queda cerca de la teoría (*shrinkage*), con más datos domina la evidencia.
- **IC 95 %** por bootstrap sobre estudiantes.
- **Validación prospectiva:** se calibra solo con los días ≤ 3 y se predicen los días posteriores (datos no usados al ajustar); se compara el error con el de la curva teórica.
- Mínimos para calibrar: 5 estudiantes y 8 mediciones posteriores al día 0.

## 4. Preguntas de investigación

1. ¿Una curva ajustada con los quizzes de los días 0, 1 y 3 predice la retención de los días 7 y 14 mejor que la teórica? *(error fuera de muestra: validación prospectiva)*
2. ¿Los temas con repaso espaciado programado retienen más que los temas sin repaso? *(requiere diseño de comparación entre grupos o entre temas)*
3. ¿Difiere la estabilidad `S` entre contenido memorístico y lógico-matemático?
4. ¿Es usable y útil para el docente? *(escala SUS, tiempo para crear un quiz)*

## 5. Limitaciones que debes declarar

- Con grupos de ~30 estudiantes las conclusiones son **exploratorias**; el IC lo refleja.
- `R(t)` no depende de la nota inicial; la curva de aprendizaje y la de olvido se tratan por separado.
- Los hábitos de estudio son **autorreportados** (sesgo de deseabilidad social).
- La retención se mide con notas de quizzes: depende de la dificultad y equivalencia de los instrumentos entre días.
- No reentrenes el modelo sustituto con los mismos estudiantes que usas para validar (contamina la validación).
- La proyección de repasos es una simulación del modelo, no una promesa de resultado.

## 6. Cómo cambiar las fórmulas
Edita `ml-service/model/teoria.py` **y** `server/utils/teoria.ts`, regenera datos y modelo (`python -m model.generar_datasets && python -m model.entrenamiento`) y ejecuta `python -m pytest` (el test de paridad falla si los dos archivos divergen).
