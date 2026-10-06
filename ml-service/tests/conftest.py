import os
import sys

# Permite importar main y model al ejecutar pytest desde ml-service/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
