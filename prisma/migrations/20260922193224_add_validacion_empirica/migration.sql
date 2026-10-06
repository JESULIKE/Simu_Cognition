-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "nombre" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Materia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "Materia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dataset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "origen" TEXT NOT NULL,
    "rutaArchivo" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "materiaId" TEXT NOT NULL,
    CONSTRAINT "Dataset_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Simulacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dificultad" INTEGER NOT NULL,
    "horasEstudio" REAL NOT NULL,
    "repasosPrevios" INTEGER NOT NULL,
    "calidadEstudio" REAL NOT NULL,
    "umbralRetencion" REAL NOT NULL,
    "calificacionPredicha" REAL NOT NULL,
    "diaRepasoOptimo" REAL NOT NULL,
    "etiqueta" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    CONSTRAINT "Simulacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Simulacion_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EstudianteEvaluacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigoAnonimo" TEXT NOT NULL,
    "dificultadDocente" INTEGER NOT NULL,
    "tipoMateriaDocente" TEXT NOT NULL,
    "horasEstudio" REAL NOT NULL,
    "repasosPrevios" INTEGER NOT NULL,
    "calidadEstudio" REAL NOT NULL,
    "dificultadPercibida" INTEGER NOT NULL,
    "creadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "materiaId" TEXT NOT NULL,
    "docenteId" TEXT NOT NULL,
    CONSTRAINT "EstudianteEvaluacion_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EstudianteEvaluacion_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResultadoQuiz" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "momento" TEXT NOT NULL,
    "notaObtenida" REAL NOT NULL,
    "reestudioReportado" BOOLEAN NOT NULL DEFAULT false,
    "fechaAplicacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluacionId" TEXT NOT NULL,
    CONSTRAINT "ResultadoQuiz_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "EstudianteEvaluacion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComparacionResultado" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "calificacionPredicha" REAL NOT NULL,
    "calificacionReal" REAL NOT NULL,
    "errorAbsoluto" REAL NOT NULL,
    "retencionPredichaJson" TEXT NOT NULL,
    "retencionRealJson" TEXT NOT NULL,
    "recomendacionTexto" TEXT NOT NULL,
    "generadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluacionId" TEXT NOT NULL,
    CONSTRAINT "ComparacionResultado_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "EstudianteEvaluacion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Materia_usuarioId_idx" ON "Materia"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Dataset_materiaId_key" ON "Dataset"("materiaId");

-- CreateIndex
CREATE INDEX "Simulacion_usuarioId_idx" ON "Simulacion"("usuarioId");

-- CreateIndex
CREATE INDEX "Simulacion_materiaId_idx" ON "Simulacion"("materiaId");

-- CreateIndex
CREATE INDEX "Simulacion_usuarioId_creadoEn_idx" ON "Simulacion"("usuarioId", "creadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "EstudianteEvaluacion_codigoAnonimo_key" ON "EstudianteEvaluacion"("codigoAnonimo");

-- CreateIndex
CREATE INDEX "EstudianteEvaluacion_materiaId_idx" ON "EstudianteEvaluacion"("materiaId");

-- CreateIndex
CREATE INDEX "EstudianteEvaluacion_docenteId_idx" ON "EstudianteEvaluacion"("docenteId");

-- CreateIndex
CREATE INDEX "ResultadoQuiz_evaluacionId_idx" ON "ResultadoQuiz"("evaluacionId");

-- CreateIndex
CREATE UNIQUE INDEX "ComparacionResultado_evaluacionId_key" ON "ComparacionResultado"("evaluacionId");
