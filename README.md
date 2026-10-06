# Simu-Cognition

**Haz visible lo que tu grupo olvida y decide cuándo repasar, con datos de tu propio grupo.**

Herramienta para docentes basada en la curva del olvido de Ebbinghaus. Cierra un ciclo de tres pasos:

| Paso | Qué ocurre |
|---|---|
| **1. Planear** | El simulador propone un calendario de repasos (exportable a `.ics`) y muestra la retención proyectada **con y sin repaso**. |
| **2. Medir** | Los estudiantes responden una encuesta anónima desde el celular (enlace o código QR) y el docente registra las notas de quiz de los días 0, 1, 3, 7 y 14. |
| **3. Ajustar** | El sistema **calibra la estabilidad de memoria `S` con los datos reales del grupo** (con intervalo de confianza y validación prospectiva) y el simulador pasa a usar esa curva. |

> **Por qué importa:** el docente suele enterarse de lo que se olvidó cuando ya es tarde (el examen final o el curso siguiente).
> Aquí lo mide durante el curso y ajusta el repaso con evidencia de su propio grupo.

La fundamentación, las fórmulas, las preguntas de investigación y las limitaciones están en [docs/MODELO.md](docs/MODELO.md).

## Arquitectura

```
Navegador (Nuxt 3 + Vue 3 + Chart.js)
        │
        ▼
BFF Nitro (server/api)  ── Auth.js (JWT) ── Prisma ── PostgreSQL (Supabase)
        │
        ▼  (HTTP JSON, cabecera X-ML-Key)
Microservicio Python (FastAPI)
  · model/teoria.py        simulador teórico (única fuente de verdad)
  · model/calibracion.py   calibración de S (MAP + bootstrap + validación prospectiva)
  · modelo sustituto sklearn (regresión polinomial que aproxima el simulador)
  · estadística de validación (MAE, RMSE, Pearson, Spearman) y exportación CSV
```

`server/utils/teoria.ts` es un espejo en TypeScript de las fórmulas: si el microservicio no responde, el docente sigue viendo los mismos números (se indica "modo respaldo"). Un test verifica que ambos coinciden.

## Puesta en marcha local

Requisitos: Node 20+, Python 3.11+, una base PostgreSQL (p. ej. un proyecto de Supabase).

```bash
# 1. Variables de entorno
cp .env.example .env        # completa DATABASE_URL, DIRECT_URL y AUTH_SECRET

# 2. App Nuxt
npm install
npx prisma db push          # crea/actualiza las tablas
npm run dev                 # http://localhost:3000

# 3. Microservicio ML (otra terminal)
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Crea tu cuenta en `/registro`. Para cargar datos de demostración:

```bash
SEED_EMAIL=docente@ejemplo.com SEED_PASSWORD='una-clave-larga' npx prisma db seed
```

### Variables de entorno

| Variable | Para qué |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | Conexión a PostgreSQL (pooler y directa). **Nunca en el código.** |
| `AUTH_SECRET` | Firma de sesiones (obligatorio en producción). |
| `AUTH_ORIGIN` | Origen público de la app (`http://localhost:3000` / URL de Vercel). |
| `ML_SERVICE_URL` | URL del microservicio Python. |
| `ML_API_KEY` | Clave compartida entre la app y el microservicio (recomendado en producción; mismo valor en ambos despliegues). |

## Pruebas

```bash
cd ml-service
pip install -r requirements-dev.txt
python -m pytest            # teoría, calibración, API y paridad con TypeScript
```

Para regenerar los datos sintéticos y el modelo sustituto: `python -m model.generar_datasets && python -m model.entrenamiento`.

## Despliegue (Vercel)

- **App Nuxt:** raíz del repositorio (preset `vercel` ya configurado). Define las variables de la tabla anterior.
- **Microservicio:** proyecto aparte con *Root Directory* `ml-service` (usa `ml-service/vercel.json`). Define `ML_API_KEY`.
- Tras actualizar el esquema, ejecuta una vez `npx prisma db push` contra tu base de datos.

## Seguridad y privacidad

- Todos los endpoints de docente exigen sesión y filtran por propietario; no hay usuario por defecto sin sesión.
- La encuesta de estudiantes es anónima (códigos `EST-001…`, únicos por materia) y entra por el enlace/QR de **una** materia; no se listan materias públicamente.
- El reentrenamiento del modelo sustituto es **por materia**; un docente no puede modificar el modelo de otro.
- Para un estudio real con personas, obtén consentimiento informado y la aprobación de tu comité de ética.

## Si venías de la versión anterior

La versión anterior guardaba datos sin sesión bajo el usuario `docente-local`. Regístrate en `/registro` y ejecuta una vez:

```bash
TARGET_EMAIL=tu@correo.com node prisma/reasignar-datos.cjs
```
