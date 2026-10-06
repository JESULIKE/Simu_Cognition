/**
 * prisma/reasignar-datos.cjs
 *
 * Antes la app guardaba datos sin sesión bajo el usuario "docente-local".
 * Ahora se exige iniciar sesión. Este script pasa todo lo de "docente-local"
 * a TU cuenta (regístrate primero en /registro).
 *
 *   TARGET_EMAIL=tu@correo.com node prisma/reasignar-datos.cjs
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.env.TARGET_EMAIL;
  if (!email) throw new Error('Define TARGET_EMAIL.');
  const destino = await prisma.usuario.findUnique({ where: { email } });
  if (!destino) throw new Error(`No existe un usuario con email ${email}. Regístrate primero.`);
  const origen = await prisma.usuario.findUnique({ where: { id: 'docente-local' } });
  if (!origen) { console.log('No hay datos de "docente-local" para reasignar.'); return; }

  const [m, e, s] = await prisma.$transaction([
    prisma.materia.updateMany({ where: { usuarioId: origen.id }, data: { usuarioId: destino.id } }),
    prisma.estudianteEvaluacion.updateMany({ where: { docenteId: origen.id }, data: { docenteId: destino.id } }),
    prisma.simulacion.updateMany({ where: { usuarioId: origen.id }, data: { usuarioId: destino.id } }),
  ]);
  console.log(`Reasignado a ${email}: ${m.count} materias, ${e.count} evaluaciones, ${s.count} simulaciones.`);
  console.log('El usuario "docente-local" ya no tiene datos; puedes eliminarlo desde Supabase si quieres.');
}

main().catch((err) => { console.error(err.message || err); process.exitCode = 1; }).finally(() => prisma.$disconnect());
