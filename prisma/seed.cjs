const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('docente123', 10);
  const user = await prisma.usuario.upsert({
    where: { email: 'docente@simu-cognition.app' },
    update: {},
    create: {
      id: 'docente-local',
      nombre: 'Prof. Alejandro Morales',
      email: 'docente@simu-cognition.app',
      passwordHash: hash,
    },
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
        data: {
          nombre: m.nombre,
          tipo: m.tipo,
          usuarioId: user.id,
          dataset: { create: { origen: 'sintetico' } },
        },
      });
      console.log('Materia lista:', m.nombre);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    return prisma.$disconnect();
  });
