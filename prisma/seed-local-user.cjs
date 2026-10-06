const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Verificar si ya existe
  const existing = await prisma.usuario.findUnique({ where: { id: 'docente-local' } });
  if (existing) {
    console.log('Usuario docente-local ya existe:', existing.email);
    return;
  }

  // Crear usuario por defecto que usa el fallback sin sesión
  const u = await prisma.usuario.create({
    data: {
      id: 'docente-local',
      email: 'docente@local.dev',
      nombre: 'Docente Local',
      passwordHash: null,
    }
  });
  console.log('Usuario creado exitosamente:', u.id, u.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
