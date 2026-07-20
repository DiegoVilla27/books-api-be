import 'dotenv/config';
import { PrismaClient } from '../src/core/database/postgres/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from "bcrypt";
import ENVS from '../src/core/environments';

const connectionString = ENVS.POSTGRES_URI;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const FIRST_NAMES = ['Diego', 'Laura', 'Carlos', 'Sofía', 'Andrés', 'Mateo', 'Valentina', 'Santiago', 'Camila', 'Felipe', 'Mariana', 'Lucas', 'Daniela', 'Nicolás', 'Isabella', 'Alejandro', 'Gabriela', 'Sebastián', 'Lucía', 'Martín'];
const LAST_NAMES = ['Villa', 'Sánchez', 'Velasco', 'Gómez', 'Rodríguez', 'González', 'Martínez', 'López', 'Pérez', 'García', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres'];

const BOOK_SUBJECTS = ['El Secreto de', 'La Historia de', 'Principios de', 'Manual de', 'Guía Completa de', 'Las Aventuras de', 'El Misterio de', 'Crónicas de', 'El Arte de', 'La Leyenda de'];
const BOOK_TOPICS = ['React y Node', 'Angular Moderno', 'Spring Boot Avanzado', 'Arquitectura Limpia', 'Algoritmos y Estructuras', 'Diseño de Sistemas', 'Bases de Datos con Prisma', 'TypeScript Eficiente', 'Microservicios', 'Ciberseguridad Práctica'];

/**
 * Genera una fecha aleatoria contenida estrictamente entre el 1 de enero de 2025
 * y el instante exacto de la ejecución actual en 2026.
 * 
 * @returns Instancia de objeto Date formateada para la inserción en base de datos.
 */
function getRandomCreatedAt(): Date {
  const start = new Date('2025-01-01T00:00:00.000Z').getTime();
  const end = new Date().getTime(); // Límite dinámico dependiente del día de hoy en 2026

  const randomTimestamp = Math.floor(Math.random() * (end - start + 1)) + start;
  return new Date(randomTimestamp);
}

async function main() {
  console.log('🌱 [SEED] Iniciando el vaciado de tablas...');

  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 [SEED] Base de datos limpia. Generando datos...');

  const hashedPassword = await bcrypt.hash('1234', 10);

  // 1. Estructura para los 100 usuarios con marcas temporales dispersas
  const usersData = Array.from({ length: 100 }, (_, i) => {
    const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastname = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

    const cleanName = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cleanLastname = lastname.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const email = `${cleanName}.${cleanLastname}.${i + 1}@example.com`;
    const age = Math.floor(Math.random() * (60 - 18 + 1)) + 18;
    const role = i === 0 ? 'ADMIN' : 'USER';

    return {
      name,
      lastname,
      email,
      password: hashedPassword,
      age,
      role: role as any,
      isActive: Math.random() > 0.15,
      createdAt: getRandomCreatedAt() // 🟢 Inyección de fecha aleatoria 2025-2026
    };
  });

  console.log('👥 [SEED] Insertando 100 usuarios con histórico temporal...');
  await prisma.user.createMany({
    data: usersData,
  });

  const createdUsers = await prisma.user.findMany({
    select: { id: true }
  });

  const userIds = createdUsers.map(user => user.id);

  // 2. Estructura para los 1000 libros distribuidos temporal y lógicamente
  console.log('📚 [SEED] Generando lote de 1000 libros...');
  const booksData = Array.from({ length: 1000 }, (_, i) => {
    const subject = BOOK_SUBJECTS[Math.floor(Math.random() * BOOK_SUBJECTS.length)];
    const topic = BOOK_TOPICS[Math.floor(Math.random() * BOOK_TOPICS.length)];
    const authorName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const authorLastname = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];

    return {
      title: `${subject} ${topic} (Vol. ${Math.floor(Math.random() * 5) + 1}) - #${i + 1}`,
      author: `${authorName} ${authorLastname}`,
      userId: randomUserId,
      createdAt: getRandomCreatedAt() // 🟢 Inyección de fecha aleatoria 2025-2026
    };
  });

  console.log('🚀 [SEED] Insertando 1000 libros distribuidos...');
  await prisma.book.createMany({
    data: booksData,
  });

  console.log('✅ [SEED] Seeding completado con éxito:');
  console.log(`   - Usuarios creados: ${userIds.length}`);
  console.log(`   - Libros distribuidos: 1000`);
}

main()
  .catch((e) => {
    console.error('❌ Error crítico durante el proceso de Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
    console.log('🔌 Conexiones de base de datos cerradas de forma segura.');
  });