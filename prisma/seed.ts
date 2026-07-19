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

// Nombres y apellidos realistas para generar datos de prueba creíbles
const FIRST_NAMES = ['Diego', 'Laura', 'Carlos', 'Sofía', 'Andrés', 'Mateo', 'Valentina', 'Santiago', 'Camila', 'Felipe', 'Mariana', 'Lucas', 'Daniela', 'Nicolás', 'Isabella', 'Alejandro', 'Gabriela', 'Sebastián', 'Lucía', 'Martín'];
const LAST_NAMES = ['Villa', 'Sánchez', 'Velasco', 'Gómez', 'Rodríguez', 'González', 'Martínez', 'López', 'Pérez', 'García', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres'];

const BOOK_SUBJECTS = ['El Secreto de', 'La Historia de', 'Principios de', 'Manual de', 'Guía Completa de', 'Las Aventuras de', 'El Misterio de', 'Crónicas de', 'El Arte de', 'La Leyenda de'];
const BOOK_TOPICS = ['React y Node', 'Angular Moderno', 'Spring Boot Avanzado', 'Arquitectura Limpia', 'Algoritmos y Estructuras', 'Diseño de Sistemas', 'Bases de Datos con Prisma', 'TypeScript Eficiente', 'Microservicios', 'Ciberseguridad Práctica'];

async function main() {
  console.log('🌱 [SEED] Iniciando el vaciado de tablas...');

  // Limpiamos la base de datos en orden para no romper restricciones de llave foránea
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 [SEED] Base de datos limpia. Generando datos...');

  // 1. Encriptamos la contraseña una sola vez para no ralentizar el script con 100 llamadas de bcrypt
  const hashedPassword = await bcrypt.hash('1234', 10);

  // 2. Generamos la estructura para los 100 usuarios
  const usersData = Array.from({ length: 100 }, (_, i) => {
    const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastname = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

    // Aseguramos emails únicos concatenando el índice
    // Convertimos a minúsculas, separamos los acentos de las letras y removemos los caracteres diacríticos (tildes)
    // Construimos el email seguro (sin tildes, compatible con cualquier validador del mundo)
    const cleanName = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cleanLastname = lastname.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const email = `${cleanName}.${cleanLastname}.${i + 1}@example.com`;
    const age = Math.floor(Math.random() * (60 - 18 + 1)) + 18; // Edad aleatoria entre 18 y 60 años
    const role = i === 0 ? 'ADMIN' : 'USER'; // El primer usuario será ADMIN, los demás USER

    return {
      name,
      lastname,
      email,
      password: hashedPassword,
      age,
      role: role as any, // Cast para evitar quejas del enum tipado de Prisma
      isActive: Math.random() > 0.15, // 85% de probabilidad de estar activo
    };
  });

  console.log('👥 [SEED] Insertando 100 usuarios...');
  await prisma.user.createMany({
    data: usersData,
  });

  // 3. Recuperamos los IDs asignados por la base de datos
  const createdUsers = await prisma.user.findMany({
    select: { id: true }
  });

  const userIds = createdUsers.map(user => user.id);

  // 4. Generamos los 1000 libros distribuidos de manera aleatoria
  console.log('📚 [SEED] Generando lote de 1000 libros...');
  const booksData = Array.from({ length: 1000 }, (_, i) => {
    const subject = BOOK_SUBJECTS[Math.floor(Math.random() * BOOK_SUBJECTS.length)];
    const topic = BOOK_TOPICS[Math.floor(Math.random() * BOOK_TOPICS.length)];
    const authorName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const authorLastname = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

    // Asignamos un ID de usuario aleatorio de nuestra lista recuperada
    const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];

    return {
      title: `${subject} ${topic} (Vol. ${Math.floor(Math.random() * 5) + 1}) - #${i + 1}`,
      author: `${authorName} ${authorLastname}`,
      userId: randomUserId,
    };
  });

  console.log('🚀 [SEED] Insertando 1000 libros...');
  await prisma.book.createMany({
    data: booksData,
  });

  console.log('✅ [SEED] Seeding completado de forma ultra rápida:');
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