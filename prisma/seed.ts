import { PrismaClient } from '../src/core/database/postgres/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// Inicializamos la conexión tal como lo haces en tu app
const connectionString = process.env.POSTGRES_URI;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando el seeding de libros...');

  // Limpiamos los registros existentes (opcional)
  await prisma.book.deleteMany();

  // Generamos un array con 100 libros
  const booksData = Array.from({ length: 100 }, (_, i) => ({
    title: `Libro de Prueba #${i + 1}`,
    author: `Autor Ficticio #${i + 1}`,
  }));

  // Insertamos los 100 libros en la base de datos
  await prisma.book.createMany({
    data: booksData,
  });

  console.log('✅ ¡Seeding completado con éxito! Se insertaron 100 libros.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Cerramos el pool de conexiones al terminar
    await prisma.$disconnect();
    await pool.end();
  });
