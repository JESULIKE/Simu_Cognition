/**
 * prisma/seed.cjs — crea un docente de DEMO con 3 materias de ejemplo.
 *
 * Uso (local):
 *   SEED_EMAIL=docente@ejemplo.com SEED_PASSWORD='una-clave-larga' npx prisma db seed
 *
 * No hay credenciales por defecto a propósito: un usuario con clave conocida
 * en una base de datos pública es una puerta abierta.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;
  if (!email || !password || password.length < 8) {
    throw new Error('Define SEED_EMAIL y SEED_PASSWORD (mínimo 8 caracteres).');
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.usuario.upsert({
    where: { email },
    update: {},
    create: { nombre: 'Docente de demostración', email, passwordHash: hash },
  });
  console.log('Usuario listo:', user.email);

  const materias = [
    { nombre: 'Cálculo Diferencial e Integral', tipo: 'LOGICO_MATEMATICA' },
    { nombre: 'Anatomía Humana y Fisiología', tipo: 'MEMORISTICA' },
    { nombre: 'Química Orgánica y Bioquímica', tipo: 'MIXTA' },
  ];

  for (const m of materias) {
    const existing = await prisma.materia.findFirst({
      where: { nombre: m.nombre, usuarioId: user.id },
    });
    if (!existing) {
      await prisma.materia.create({
        data: { nombre: m.nombre, tipo: m.tipo, usuarioId: user.id, dataset: { create: { origen: 'sintetico' } } },
      });
      console.log('Materia lista:', m.nombre);
    }
  }
}

main()
  .catch((err) => {
    console.error(err.message || err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
