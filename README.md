# 📚 Books & Users REST API

[![NPM Version](https://img.shields.io/badge/npm-v10.0.0+-blue.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-v10.0.0+-orange.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v7.0.2-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-v5.2.1-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-v7.9.0-blue.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15--alpine-blue.svg)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v8.0-green.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-v7--alpine-red.svg)](https://redis.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-v3--management-orange.svg)](https://www.rabbitmq.com/)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-latest-black.svg)](https://kafka.apache.org/)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)

*Un ecosistema digital moderno, modular y de alto rendimiento para la gestión relacional de libros y usuarios, con encriptación nativa, seguridad JWT con rotación de Refresh Token, capa de caché distribuida en Redis con invalidación por eventos, gestión unificada de variables de entorno, arquitectura desacoplada lista para auditorías asíncronas de microservicios e infraestructura multi-contenedor (PostgreSQL, MongoDB, Redis, RabbitMQ, Kafka).*

---

## 📖 Resumen Técnico y Propósito del Sistema

Esta aplicación es una API REST empresarial desarrollada bajo los paradigmas de **Código Limpio**, **Separación de Responsabilidades (SoC)** y **Desacoplamiento de Capas**, utilizando **Express v5**, **TypeScript v7**, **ioredis** y **Prisma v7**.

El sistema implementa una infraestructura multi-servicio orientada a persistencia híbrida, caché de alto rendimiento y preparación para auditorías distribuídas de microservicios:

1. **PostgreSQL 15 (SQL Transaccional):** Almacena de manera consistente la relación obligatoria `1 a N` entre **Usuarios** y **Libros** (no existen libros sin usuario propietario). Garantiza la integridad referencial y las transacciones ACID con verificación activa de conexión mediante `prisma.$connect()`.
2. **Redis 7 & ioredis (Caché Distribuida e Invalidación Inteligente):** Capa de aceleración en memoria que intercepta respuestas de lectura (`GET`) con el middleware `cacheRedis(ttl)`, reduciendo drásticamente la latencia y la carga de PostgreSQL. Incluye invalidación por patrones (`clearCache`) en mutaciones (`CREATE`, `UPDATE`, `DELETE`).
3. **MongoDB (NoSQL de Alta Escritura):** Diseñado para la captura de logs rápidos, métricas asíncronas y registros de auditoría sin impactar la base relacional principal.
4. **RabbitMQ & Apache Kafka (Message Brokers / Event Streaming):** Colas de mensajes asíncronas preparadas para transmitir eventos de mutación (`CREATE`, `UPDATE`, `DELETE`) hacia microservicios externos (como Spring Boot Audit Service).

Toda la base del código está 100% autodocumentada con **TSDoc** profesional de nivel empresarial y protegida por políticas estrictas de seguridad (hashing mediante **Bcrypt**, seguridad de sesiones basada en JWT con expiración configurable, saneamiento contra inyecciones XSS, limitadores de tasa y control de tamaño de payloads).

---

### Matriz de Funcionalidades Clave

| Icono | Componente de Funcionalidad | Impacto en el Negocio / Rendimiento |
| :---: | :--- | :--- |
| ⚡ | **Caché Distribuida con Redis (`cacheRedis`)** | Interceptación transparente de peticiones `GET` con TTL configurable (Cache Hit -> respuesta directa 200 OK en <2ms sin consultar PostgreSQL). |
| 🧹 | **Invalidación Automática de Caché (`clearCache`)** | Purga programática por patrones de módulo (`KEYS_REDIS.BOOKS`, `KEYS_REDIS.USERS`) al ejecutar mutaciones para mantener consistencia perfecta. |
| 🔑 | **Autenticación JWT con Refresh Token Rotation** | Firma de access tokens efímeros y refresh tokens de larga duración configurables. Rotación automática de tokens para invalidar sesiones previas. |
| ⚙️ | **Configuración Tipada Unificada (`ENVS`)** | Mapeo y validación centralizada de variables de entorno con TypeScript en `src/core/environments`, incluyendo credenciales de PostgreSQL, Mongo, Redis, RabbitMQ y Kafka. |
| 📊 | **Métricas Consolidadas de Dashboard** | Endpoint optimizado (`/dashboard/stats` y `/dashboard/history`) para la agregación paralela de métricas clave (libros totales, usuarios totales) exclusivo para administradores (`ADMIN`). |
| 🛡️ | **Seguridad y Hashing Bcrypt** | Encriptación asíncrona de contraseñas de usuarios mediante hashes seguros. Prevención nativa de fugas de datos en respuestas JSON a través de DTOs y Mappers. |
| 🛡️ | **Middleware unificado RBAC (`restrictTo`)** | Control de acceso basado en roles (RBAC) y validación de tokens unificados en un único middleware para evitar redundancias y mejorar el rendimiento de enrutamiento. |
| 🔄 | **Borrado Lógico Inteligente (`isActive`)** | Inhabilitación segura de usuarios sin romper la integridad referencial en cascada de los libros asociados en PostgreSQL. |
| 🔒 | **Filtros de Propiedad y Reglas de Dominio** | Restricciones avanzadas: un usuario `USER` no puede ver perfiles de administradores (retorna 404), endpoint dedicado `GET /books/my-books`, y los libros solo pueden ser modificados o eliminados por sus propietarios o administradores. |
| 🚀 | **Validación Strict con Zod** | Validación estricta en el body, query y params de Express, filtrando propiedades desconocidas (`.strict()`) y rechazando payloads inválidos. |
| 🟢 | **Verificación de Conexión en DB (`prisma.$connect`)** | Handshake directo al iniciar el servidor para comprobar el estado de salud de PostgreSQL en tiempo real. |
| 📨 | **Preparación para Microservicios (RabbitMQ / Kafka)** | Event loop asíncrono preparado para emitir eventos de auditoría hacia servicios desacoplados (Spring Boot Audit). |
| 📦 | **Arquitectura Modular Desacoplada** | Estructuración por capas independientes (`entities`, `mappers`, `dtos`, `schemas`, `services`, `controllers`) que aísla la base de datos de la lógica de negocio. |
| ⚡ | **Persistencia Híbrida & Prisma 7** | Utilización de Prisma 7 con Driver Adapters basados en `pg` (Node-Postgres) y transacciones optimizadas sobre PostgreSQL. |

---

## 📐 Arquitectura Modular y Estructura del Proyecto

El código está organizado por **módulos de negocio delimitados**, aislando la infraestructura de la capa de transporte y de dominio.

### Estructura de Directorios Comentada

```text
books/
├── prisma/
│   ├── migrations/         # Historial de migraciones SQL generadas por Prisma.
│   ├── schema.prisma       # Modelado relacional estricto con Enums y Llaves Foráneas.
│   └── seed.ts             # Script de población de datos iniciales con relaciones e indexación de roles.
├── src/
│   ├── core/               # Núcleo global de la aplicación.
│   │   ├── databases/      # Conexiones de infraestructura de base de datos.
│   │   │   ├── postgres/   # Cliente de Prisma configurado con pg-driver-adapter, comprobación de conexión y cliente compilado.
│   │   │   │   └── generated/ # Cliente generado de Prisma v7.
│   │   │   └── redis/      # Instancia singleton de ioredis, conexión y utilidades de invalidación (clearCache).
│   │   │       ├── config/ # Patrones de claves KEYS_REDIS e invalidación por patrón.
│   │   │       └── index.ts # Cliente ioredis con estrategias de reintento.
│   │   ├── environments/   # Configuración fuertemente tipada de variables de entorno (ENVS: PG, Mongo, Redis, RabbitMQ, Kafka).
│   │   ├── errors/         # Clase central AppError para el manejo de excepciones operacionales.
│   │   ├── middlewares/    # Middlewares globales (ErrorHandler, restrictTo de seguridad RBAC, optionalAuth, cacheRedis, Zod Validation).
│   │   ├── router/         # Enrutador centralizado (Prefijado con /api/v1).
│   │   ├── types/          # Tipos transversales de TypeScript (ej. Paginación y extensión global de Express.Request).
│   │   └── utils/          # Utilidades globales (Sanitizadores XSS, removeDataUndefined).
│   ├── modules/            # Módulos aislados de negocio.
│   │   ├── auth/           # Módulo de Autenticación.
│   │   │   ├── controllers/# Controladores de autenticación (Login, Registro y Refresh Token).
│   │   │   ├── dtos/       # Data Transfer Objects (LoginRequestDTO, RegisterRequestDTO, AuthResponseDTO).
│   │   │   ├── routes/     # Rutas REST de autenticación (/login, /register, /refresh).
│   │   │   ├── schemas/    # Esquemas Zod para la verificación y coincidencia de password.
│   │   │   └── services/   # Lógica de firmado de JWTs y validación de vigencia del Refresh Token.
│   │   ├── books/          # Módulo de Libros.
│   │   │   ├── controllers/# Controladores HTTP del recurso libros (CRUD + /my-books) con inyección de usuario.
│   │   │   ├── dtos/       # Data Transfer Objects (Request/Response).
│   │   │   ├── mappers/    # Traductores de Modelos de DB a DTOs formateados.
│   │   │   ├── routes/     # Rutas REST de libros protegidas con caché Redis y control de roles (RBAC).
│   │   │   ├── schemas/    # Esquemas Zod para validación de entrada.
│   │   │   └── services/   # Lógica de libros con verificación estricta de propiedad e invalidación de caché Redis.
│   │   ├── dashboard/      # Módulo de Dashboard.
│   │   │   ├── controllers/# Controladores para la exposición de estadísticas consolidadas e historial.
│   │   │   ├── dtos/       # DTOs de salida y tipado del dashboard (DashboardStatsResponseDTO, DashboardHistoryResponseDTO).
│   │   │   ├── routes/     # Rutas REST del dashboard protegidas por control de acceso ADMIN.
│   │   │   └── services/   # Lógica de agregación paralela y consulta de contadores sobre PostgreSQL.
│   │   └── users/          # Módulo de Usuarios.
│   │       ├── controllers/# Controladores HTTP de usuarios, me, profile, lookup y check-email.
│   │       ├── dtos/       # DTOs de petición y respuesta (Omiten la contraseña y datos sensibles).
│   │       ├── mappers/    # Mapeadores de usuarios con formateo de fechas ISO 8601.
│   │       ├── routes/     # Rutas REST de usuarios protegidas por Zod, restrictTo y caché Redis.
│   │       ├── schemas/    # Esquemas Zod para la creación y edición parcial (strict) sin defaults problemáticos.
│   │       └── services/   # Lógica del CRUD, filtrado selectivo de ADMINs, encriptación bcrypt e invalidación de caché Redis.
│   └── index.ts            # Punto de entrada de la aplicación Express y carga de seguridad global.
├── docker-compose.yml      # Orquestación multi-contenedor: PostgreSQL 15, MongoDB, Redis 7, RabbitMQ 3 y Apache Kafka.
├── package.json            # Scripts del sistema y dependencias declaradas.
├── pnpm-lock.yaml          # Grafo de resolución estricto de paquetes pnpm.
└── tsconfig.json           # Configuración del compilador de TypeScript con alias de directorios.
```

---

## 🚀 Flujo de Ejecución Arquitectónico

```
[ Cliente / Frontend / Angular / React ]
       │
       ▼ (Petición HTTP GET con Cabecera Authorization: Bearer <JWT>)
┌────────────────────────────────────────────────────────┐
│               Middlewares Globales (src/index.ts)      │
│  - Helmet, CORS, Rate-Limit, JSON body limit           │
│  - Control de flujo y protección contra inyecciones    │
└──────────────────────┬─────────────────────────────────┘
                       │ (Paso de validación)
                       ▼
┌────────────────────────────────────────────────────────┐
│               Enrutador Central (src/core/router)      │
│  - Redirecciona según la ruta a /api/v1                │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│             Middleware Unificado restrictTo            │
│  - Valida el Access Token firmado (JWT_ACCESS_SECRET)   │
│  - Verifica en PostgreSQL que el usuario esté activo   │
│  - Inyecta el usuario desencriptado en req.user        │
│  - Bloquea accesos no permitidos según el rol (RBAC)   │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│             Middleware de Caché Redis (cacheRedis)     │
│  - Consulta la clave `cache:<originalUrl>` en Redis    │
└──────────────────────┬─────────────────────────────────┘
                       │
             ┌─────────┴─────────┐
             │                   │
      (Cache Hit 🎯)      (Cache Miss ❌)
             │                   │
             ▼                   ▼
    ┌────────────────┐  ┌─────────────────────────────────┐
    │ Retorna 200 OK │  │  Middleware de Validación Zod   │
    │ desde Redis    │  │  - Sanitización contra XSS      │
    │ (< 2ms)        │  │  - Filtro estricto (.strict())  │
    └────────────────┘  └────────────────┬────────────────┘
                                         │
                                         ▼
                        ┌─────────────────────────────────┐
                        │   Controladores & Servicios     │
                        │ - Consulta a PostgreSQL (Prisma)│
                        │ - Intercepta res.json          │
                        │ - Guarda respuesta en Redis     │
                        └────────────────┬────────────────┘
                                         │
                                         ▼ (200 OK JSON)
                                  [ Respuesta HTTP ]
```

---

## 🗄️ Gestión de Base de Datos y Prisma 7

El proyecto utiliza **Prisma 7**, cuya configuración y flujo de desarrollo requiere:
* **Prisma Config Central (`prisma.config.ts`):** Las URIs de base de datos se leen directamente mediante TypeScript, previniendo el acoplamiento duro en `schema.prisma`.
* **Driver Adapters Obligatorios:** Conexiones gestionadas a través del controlador `pg` (Node-Postgres) inyectado al constructor de `PrismaClient` para un rendimiento asíncrono y estable.
* **Health Check Integrado:** Al iniciar la aplicación, se invoca `prisma.$connect()` para verificar la disponibilidad inmediata de PostgreSQL.

### Ciclo de Desarrollo

1. **Iniciar contenedores de desarrollo (PostgreSQL, MongoDB, Redis, RabbitMQ, Kafka):**
   ```bash
   docker compose up -d
   ```
2. **Generar y aplicar migraciones SQL en PostgreSQL:**
   ```bash
   npx prisma migrate dev --name <nombre_de_migracion>
   ```
3. **Reiniciar la base de datos y las migraciones:**
   ```bash
   npx prisma migrate reset
   ```
4. **Regenerar el cliente con tipado estático personalizado:**
   ```bash
   npx prisma generate
   ```
5. **Insertar datos iniciales de prueba (Relación Usuario-Libros):**
   ```bash
   npx prisma db seed
   ```
6. **Administración Visual (Prisma Studio):**
   ```bash
   npx prisma studio
   ```

---

## 🛠️ Pila Tecnológica y Dependencias

### Dependencias de Producción
| Icono | Tecnología / Librería | Versión Estricta | Propósito en el Proyecto |
| :---: | :--- | :--- | :--- |
| 🚂 | **express** | `^5.2.1` | Servidor HTTP de última generación. |
| 🔴 | **ioredis** | `^5.11.1` | Cliente Redis de alto rendimiento para almacenamiento e invalidación de caché. |
| 🛡️ | **bcrypt** | `^6.0.0` | Algoritmo de hashing criptográfico para contraseñas. |
| 🔑 | **jsonwebtoken** | `^9.0.3` | Generación y validación de tokens de acceso y refresco (JWT). |
| 📅 | **date-fns** | `^4.4.0` | Manipulación y formateo de fechas. |
| 🛡️ | **helmet** | `^8.3.0` | Middleware para establecer cabeceras de seguridad HTTP. |
| 🌐 | **cors** | `^2.8.6` | Control de acceso HTTP y políticas de origen cruzado. |
| ⏱️ | **express-rate-limit** | `^8.6.0` | Limitador de peticiones por IP contra ataques de fuerza bruta. |
| 🐘 | **pg** / **@prisma/adapter-pg** | `^8.22.0` | Adaptadores de conexión para PostgreSQL nativo. |
| 🛡️ | **zod** / **sanitize-html** | `^4.4.3` | Validación estricta y protección contra inyecciones XSS. |
| ⚙️ | **dotenv** | `^17.4.2` | Carga de variables de entorno desde archivos `.env`. |

### Dependencias de Desarrollo
| Icono | Tecnología / Librería | Versión Estricta | Propósito en el Proyecto |
| :---: | :--- | :--- | :--- |
| 🛠️ | **typescript** | `^7.0.2` | Superset de tipado estático para JavaScript. |
| ⚗️ | **prisma** / **@prisma/client** | `^7.9.0` | Herramienta ORM y CLI de Prisma para migraciones y cliente generado. |
| ⚡ | **tsx** | `^4.23.1` | Ejecución y recarga en caliente de archivos TypeScript. |
| 📦 | **ms** / **@types/ms** | `^2.1.3` | Parseo estricto de valores de expiración de tiempo. |
| 🏷️ | **@types/bcrypt** | `^6.0.0` | Tipado de desarrollo para Bcrypt. |
| 🔑 | **@types/jsonwebtoken** | `^9.0.10` | Definiciones de tipo para la biblioteca jsonwebtoken. |
| 🔗 | **tsc-alias** | `^1.9.1` | Resolución de alias de directorios (`@core/*`, `@modules/*`). |

---

## ⚙️ Guía de Instalación y Ejecución

### Requisitos Previos
* **Node.js** >= 20.0.0
* **pnpm** (recomendado) o **npm** >= 10.0.0
* **Docker Engine** y **Docker Compose** instalados localmente.

### Matriz de Variables de Entorno (`.env`)

| Variable | Descripción / Valor por Defecto | Requerido |
| :--- | :--- | :---: |
| `NODE_ENV` | Entorno de ejecución (`dev` / `prod`) | Sí |
| `PORT` | Puerto de escucha de la API (`3000`) | Sí |
| `POSTGRES_URI` | String de conexión PostgreSQL (`postgresql://user:password@localhost:5432/books_db?schema=public`) | Sí |
| `MONGO_URI` | String de conexión MongoDB (`mongodb://localhost:27017/books_audits`) | Sí |
| `JWT_ACCESS_SECRET` | Clave secreta para firmar Access Tokens | Sí |
| `JWT_REFRESH_SECRET` | Clave secreta para firmar Refresh Tokens | Sí |
| `JWT_EXPIRES_IN` | Tiempo de expiración del Access Token (ej: `3600` o `1h`) | Sí |
| `JWT_REFRESH_EXPIRES_IN` | Tiempo de expiración del Refresh Token (ej: `7d`) | Sí |
| `REDIS_HOST` | Host del servidor Redis (`localhost`) | No |
| `REDIS_PORT` | Puerto de Redis (`6379`) | No |
| `RABBITMQ_USER` | Usuario por defecto de RabbitMQ (`guest`) | No |
| `RABBITMQ_PASS` | Contraseña de RabbitMQ (`guest`) | No |
| `RABBITMQ_URL` | URL del servidor AMQP (`amqp://guest:guest@localhost:5672`) | No |
| `KAFKA_BROKERS` | Brokers de Apache Kafka (`localhost:9092`) | No |

### Pasos de Despliegue Local

1. **Clonar el repositorio e instalar dependencias:**
   ```bash
   git clone https://github.com/DiegoVilla27/books-api-be.git
   cd books-api-be
   pnpm install  # O bien: npm install
   ```
2. **Configurar Variables de Entorno:**
   Cree un archivo `.env` en la raíz del proyecto utilizando el formato descrito arriba.
3. **Iniciar servicios de infraestructura (PostgreSQL, Mongo, Redis, RabbitMQ, Kafka):**
   ```bash
   docker compose up -d
   ```
4. **Ejecutar migraciones SQL e inserción de datos (Seeding):**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
5. **Iniciar el servidor en modo desarrollo (Watch mode):**
   ```bash
   pnpm run dev  # O bien: npm run dev
   ```
6. **Ejecutar verificación de compilación estricta de TypeScript:**
   ```bash
   npx tsc --noEmit
   ```

---

## 📈 Resiliencia Arquitectónica y Rendimiento

- **Caché en Redis con Invalidación por Eventos:** Las lecturas en endpoints como `/books`, `/books/my-books`, `/books/:id`, `/users` y `/users/lookup` son retenidas en caché durante 300 segundos. Cualquier mutación (`CREATE`, `UPDATE`, `DELETE`) invoca `clearCache` para garantizar inmediatez y consistencia de datos.
- **Verificación activa de conexión (Health Check):** Al iniciar la aplicación, Prisma realiza un `prisma.$connect()` explícito y Redis inicia su `redisClient` con estrategia de reintento automático.
- **Fail-Safe Exception Boundaries:** El middleware centralizado `AppError` captura todas las excepciones no controladas en las rutas asíncronas, evitando que la aplicación sufra caídas insólitas.
- **Preparación para Event-Driven Architecture:** La inclusión de contenedores RabbitMQ y Kafka permite enviar eventos de cambios de estado a microservicios desacoplados (como Spring Boot Auditoría) sin restar rendimiento a la API principal.

---

## 🤝 Contribuciones y Licencia

1. Crea un Fork del repositorio.
2. Crea tu rama con la característica deseada: `git checkout -b feature/nueva-caracteristica`.
3. Sube tus cambios al repositorio remoto: `git commit -am "feat: agregar nueva caracteristica"` & `git push origin feature/nueva-caracteristica`.
4. Abre un Pull Request estándar hacia la rama `main`.

Este proyecto se distribuye bajo la licencia **ISC**.

---

> This digital ecosystem has been designed, structured, and developed to high-performance standards by **[Cabuweb](https://cabuweb.com)**.