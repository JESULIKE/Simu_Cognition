"""
api/simulate.py
---------------
Handler de Vercel Serverless Functions (Python runtime).

Vercel detecta este archivo como una función serverless porque está en /api/.
Expone el mismo comportamiento que main.py pero adaptado al runtime de Vercel,
que espera un objeto ASGI (FastAPI/Starlette es compatible de forma nativa).

En Vercel, la función recibe peticiones a:
  POST https://<tu-proyecto>.vercel.app/api/simulate

Referencia: https://vercel.com/docs/functions/runtimes/python
"""

import sys
import os

# Asegurar que el directorio raíz de ml-service esté en el path
# para poder importar schemas y simulate_logic desde /api/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app  # noqa: E402  — re-exporta la app FastAPI como handler ASGI

# Vercel busca un objeto llamado `app` o `handler` en el módulo.
# Como FastAPI/Starlette implementa la interfaz ASGI, basta con exportar `app`.
handler = app
