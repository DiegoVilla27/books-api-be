import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "@core/database/postgres/generated/prisma/client";
import ENVS from '@core/environments';

/**
 * Cadena de conexión de PostgreSQL obtenida de las variables de entorno.
 */
const connectionString = ENVS.POSTGRES_URI;

/**
 * Pool de conexiones nativo de Node-Postgres (`pg`).
 * Se encarga de gestionar el ciclo de vida y la reutilización de las conexiones físicas a PostgreSQL.
 */
const pool = new Pool({ connectionString });

/**
 * Adaptador de base de datos de Prisma para `pg`.
 * Permite a Prisma Client v7 interactuar con PostgreSQL de manera eficiente
 * delegando la gestión de conexiones al Pool de `pg`.
 */
const adapter = new PrismaPg(pool);

/**
 * Cliente global inicializado de Prisma.
 * Configurado con el adaptador de controlador Pg para PostgreSQL.
 * Debe ser importado en los servicios para realizar operaciones sobre la base de datos.
 */
const prisma = new PrismaClient({ adapter });

export default prisma;