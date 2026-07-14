import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "@core/database/postgres/generated/prisma/client";

// Extraemos la URL de conexión
const connectionString = process.env.POSTGRES_URI;

// 1. Inicializamos el Pool de conexiones nativo de Node-Postgres (pg)
const pool = new Pool({ connectionString });

// 2. Creamos el adaptador de Prisma para pg
const adapter = new PrismaPg(pool);

// 3. Pasamos el adaptador al constructor de PrismaClient
const prisma = new PrismaClient({ adapter });

export default prisma;