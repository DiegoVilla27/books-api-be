import 'dotenv/config';
import { PrismaClient } from '../src/core/database/postgres/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from "bcrypt";

// Inicializamos la conexión tal como lo haces en tu app
const connectionString = process.env.POSTGRES_URI;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Modifica la función main en prisma/seed.ts
async function main() {
  console.log('🌱 Iniciando el seeding de datos...');

  // Limpiamos los registros existentes de ambas tablas
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  // 1. Creamos un usuario de prueba primero
  const defaultUser = await prisma.user.create({
    data: {
      name: 'Diego',
      lastname: 'Villa',
      email: 'diego@cabuweb.com',
      password: await bcrypt.hash('1234', 10), // En un futuro usaremos bcrypt aquí
      age: 25,
      role: "ADMIN"
    },
  });

  // 2. Generamos los 100 libros asignando el userId de ese usuario
  const booksData = Array.from({ length: 100 }, (_, i) => ({
    title: `Libro de Prueba #${i + 1}`,
    author: `Autor Ficticio #${i + 1}`,
    userId: defaultUser.id, // <-- Enlazar con el usuario creado
  }));

  // 3. Insertamos los 100 libros
  await prisma.book.createMany({
    data: booksData,
  });

  console.log('✅ Seeding completado: 1 usuario y 100 libros creados.');
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
