# 📚 Books & Users REST API

[![NPM Version](https://img.shields.io/badge/npm-v10.0.0+-blue.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v7.0.2-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-v5.2.1-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-v7.8.0-blue.svg)](https://www.prisma.io/)
[![Mongoose](https://img.shields.io/badge/Mongoose-v9.7.4-green.svg)](https://mongoosejs.com/)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)

*Un ecosistema digital moderno, modular y de alto rendimiento para la gestión relacional de libros y usuarios, con encriptación nativa y persistencia híbrida en PostgreSQL y MongoDB.*

---

## 📖 Resumen Técnico y Propósito del Sistema

Esta aplicación es una API REST empresarial desarrollada bajo los paradigmas de **Código Limpio**, **Separación de Responsabilidades (SoC)** y **Desacoplamiento de Capas**, utilizando **Express v5**, **TypeScript v7** y **Prisma v7**. 

El sistema implementa una persistencia de datos híbrida para optimizar las operaciones de negocio y las auditorías de rendimiento:
1. **PostgreSQL (SQL Transaccional):** Almacena de manera consistente la relación obligatoria `1 a N` entre **Usuarios** y **Libros** (no existen libros sin usuario propietario). Garantiza la integridad referencial y las transacciones ácidas (ACID).
2. **MongoDB (NoSQL de Alta Escritura):** Diseñado para la captura de logs rápidos, métricas asíncronas y auditorías del sistema.

Toda la base del código está 100% autodocumentada con **TSDoc** profesional y protegida por políticas estrictas de seguridad (hashing mediante **Bcrypt**, saneamiento contra inyecciones XSS, limitadores de tasa y control de tamaño de payloads).

---

### Matriz de Funcionalidades Clave

| Icono | Componente de Funcionalidad | Impacto en el Negocio / Rendimiento |
| :---: | :--- | :--- |
| 🛡️ | **Autenticación y Seguridad Bcrypt** | Encriptación asíncrona de contraseñas de usuarios mediante hashes seguros. Prevención nativa de fugas de datos en respuestas JSON a través DTOs y Mappers. |
| 🔄 | **Borrado Lógico Inteligente (`isActive`)** | Inhabilitación segura de usuarios sin romper la integridad referencial en cascada de los libros asociados en PostgreSQL. |
| 🚀 | **Validación Strict con Zod** | Validación estricta en el body, query y params de Express, filtrando propiedades desconocidas (strip) y rechazando payloads inválidos. |
| 📦 | **Arquitectura Modular Desacoplada** | Estructuración por capas independientes (`entities`, `models`, `mappers`, `dtos`, `schemas`) que aísla la base de datos de la lógica de negocio y del cliente. |
| ⚡ | **Persistencia Híbrida & Prisma 7** | Utilización de Prisma 7 con Driver Adapters basados en WebAssembly/Node y transacciones optimizadas sobre PostgreSQL. |

---

## 📐 Arquitectura Modular y Estructura del Proyecto

El código está organizado por **módulos de negocio delimitados**, aislando la infraestructura de la capa de transporte y de dominio.

### Estructura de Directorios Comentada

```text
books/
├── prisma/
│   ├── migrations/         # Historial de migraciones SQL generadas por Prisma.
│   ├── schema.prisma       # Modelado relacional estricto con Enums y Llaves Foráneas.
│   └── seed.ts             # Script de población de datos iniciales con relaciones íntegras.
├── src/
│   ├── core/               # Núcleo global de la aplicación.
│   │   ├── database/
│   │   │   ├── mongo/      # Conexión a MongoDB utilizando Mongoose.
│   │   │   └── postgres/   # Cliente de Prisma configurado con pg-driver-adapter.
│   │   ├── errors/         # Clase central AppError para el manejo de excepciones operacionales.
│   │   ├── middlewares/    # Middlewares globales (ErrorHandler, Zod Validation).
│   │   ├── router/         # Enrutador centralizado (Prefijado con /api/v1).
│   │   ├── types/          # Tipos transversales de TypeScript (ej. Paginación).
│   │   └── utils/          # Utilidades globales (Sanitizadores XSS, removeUndefined).
│   ├── modules/            # Módulos aislados de negocio.
│   │   ├── books/          # Módulo de Libros.
│   │   │   ├── controllers/# Controladores HTTP del recurso libros.
│   │   │   ├── dtos/       # Data Transfer Objects (Request/Response).
│   │   │   ├── entities/   # Interfaces del Dominio/Negocio (independientes de la DB).
│   │   │   ├── mappers/    # Traductores de Modelos de DB a DTOs formateados.
│   │   │   ├── models/     # Representación estricta de la tabla física en base de datos.
│   │   │   ├── routes/     # Rutas REST de libros.
│   │   │   ├── schemas/    # Esquemas Zod para validación de entrada.
│   │   │   └── services/   # Capa de Lógica de Negocio y queries de base de datos.
│   │   └── users/          # Módulo de Usuarios.
│   │       ├── controllers/# Controladores HTTP de usuarios.
│   │       ├── dtos/       # DTOs de petición y respuesta (Omiten la contraseña).
│   │       ├── entities/   # Interfaces del negocio de usuarios con isActive.
│   │       ├── mappers/    # Mapeadores de usuarios con formateo de fechas dd/MM/yyyy.
│   │       ├── models/     # Modelo físico de PostgreSQL (con rol tipo Enum y fechas).
│   │       ├── routes/     # Rutas REST de usuarios.
│   │       ├── schemas/    # Esquemas Zod para la creación y edición parcial (strict).
│   │       └── services/   # Lógica del CRUD, verificación de duplicados y encriptación con bcrypt.
│   └── index.ts            # Punto de entrada de la aplicación Express.
├── docker-compose.yml      # Orquestación local de PostgreSQL 15 y MongoDB.
├── package.json            # Scripts del sistema y dependencias declaradas.
└── tsconfig.json           # Configuración del compilador de TypeScript.
```

---

## 🚀 Flujo de Ejecución Arquitectónico

```
[ Cliente / Postman ]
       │
       ▼ (Petición HTTP)
┌────────────────────────────────────────────────────────┐
│               Middlewares Globales (src/index.ts)      │
│  - Helmet, CORS, Rate-Limit, JSON size validation      │
│  - Control de flujo y bloqueo de IPs maliciosas        │
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
│             Middleware de Validación Zod               │
│  - Sanitización contra XSS (sanitize-html)             │
│  - Filtro estricto de campos adicionales (.strict())   │
└──────────────────────┬─────────────────────────────────┘
                       │ (Datos 100% Saneados)
                       ▼
┌────────────────────────────────────────────────────────┐
│     Controladores del Módulo (src/modules/*/ctrl)      │
│  - Extrae params y query y delega al servicio          │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│      Servicios del Módulo (src/modules/*/services)     │
│  - Aplica reglas de negocio y lógica de autenticación  │
│  - Encriptación con bcrypt en escritura                │
│  - Llama a base de datos mediante Prisma (PostgreSQL)  │
└──────────────────────┬─────────────────────────────────┘
                       │ (Modelo de Persistencia)
                       ▼
┌────────────────────────────────────────────────────────┐
│        Mapeadores de DTO (src/modules/*/mappers)       │
│  - Omiten contraseñas y datos sensibles                │
│  - Formatean fechas locales (dd/MM/yyyy)               │
└──────────────────────┬─────────────────────────────────┘
                       │ (DTO de Respuesta)
                       ▼
                 [ 200 OK JSON ]
```

---

## 🗄️ Gestión de Base de Datos y Prisma 7

El proyecto utiliza **Prisma 7**, cuya configuración y flujo de desarrollo requiere:
* **Prisma Config Central (`prisma.config.ts`):** Las URIs de base de datos se leen directamente mediante TypeScript, previniendo el acoplamiento duro en `schema.prisma`.
* **Driver Adapters Obligatorios:** Conexiones gestionadas a través del controlador `pg` (Node-Postgres) inyectado al constructor de `PrismaClient` para un rendimiento asíncrono y estable.

### Ciclo de Desarrollo

1. **Iniciar contenedores de desarrollo (PostgreSQL y MongoDB):**
   ```bash
   docker compose up -d
   ```
2. **Generar y aplicar migraciones SQL en PostgreSQL:**
   ```bash
   npx prisma migrate dev --name <nombre_de_migracion>
   ```
3. **Regenerar el cliente con tipado estático personalizado:**
   ```bash
   npx prisma generate
   ```
4. **Insertar datos iniciales de prueba (Relación Usuario-Libros):**
   ```bash
   npx prisma db seed
   ```
5. **Administración Visual (Prisma Studio):**
   ```bash
   npx prisma studio
   ```

---

## 🛠️ Pila Tecnológica y Dependencias

### Dependencias de Producción
| Icono | Tecnología / Librería | Versión | Propósito en el Proyecto |
| :---: | :--- | :--- | :--- |
| 🚂 | **express** | `^5.2.1` | Servidor HTTP de última generación. |
| 🛡️ | **bcrypt** | `^6.0.0` | Algoritmo de hashing criptográfico para contraseñas. |
| 📅 | **date-fns** | `^4.4.0` | Manipulación y formateo de fechas. |
| 🛡️ | **helmet** | `^8.3.0` | Middleware para establecer cabeceras de seguridad. |
| 🌐 | **cors** | `^2.8.6` | Control de acceso HTTP y políticas de origen. |
| ⏱️ | **express-rate-limit** | `^8.5.2` | Limitador de peticiones por IP contra fuerza bruta. |
| 🍃 | **mongoose** | `^9.7.4` | ODM para la gestión de logs en MongoDB. |
| 🐘 | **pg** / **@prisma/adapter-pg** | `^8.22.0` | Adaptadores de conexión para PostgreSQL nativo. |
| 🛡️ | **zod** / **sanitize-html** | `^4.4.3` | Validación estricta y protección contra inyecciones XSS. |

### Dependencias de Desarrollo
| Icono | Tecnología / Librería | Versión | Propósito en el Proyecto |
| :---: | :--- | :--- | :--- |
| 🛠️ | **typescript** | `^7.0.2` | Superset de tipado estático para JavaScript. |
| ⚗️ | **prisma** | `^7.8.0` | Herramienta CLI de Prisma ORM para migraciones. |
| ⚡ | **tsx** | `^4.23.1` | Ejecución y recarga en caliente de archivos TypeScript. |
| 🏷️ | **@types/bcrypt** | `^6.0.0` | Tipado de desarrollo para Bcrypt. |
| 🔗 | **tsc-alias** | `^1.9.1` | Resolución de alias de directorios (`@core/*`, `@modules/*`). |

---

## ⚙️ Guía de Instalación y Ejecución

### Requisitos Previos
* **Node.js** >= 20.0.0
* **Docker Engine** y **Docker Compose** instalados localmente.

### Pasos de Despliegue Local

1. **Instalar árbol de dependencias:**
   ```bash
   npm install
   ```
2. **Configuración de Variables de Entorno:**
   Cree un archivo `.env` en la raíz del proyecto basándose en las claves obligatorias:
   ```env
   NODE_ENV=dev
   PORT=3000
   POSTGRES_URI="postgresql://user:password@localhost:5432/books_db?schema=public"
   MONGO_URI="mongodb://localhost:27017/books_audits"
   ```
3. **Iniciar servicios de infraestructura:**
   ```bash
   docker compose up -d
   ```
4. **Ejecutar migraciones y seeding inicial:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
5. **Iniciar el servidor en modo desarrollo (Watch mode):**
   ```bash
   npm run dev
   ```
6. **Ejecutar verificación de compilación estricta de TypeScript:**
   ```bash
   npx tsc --noEmit
   ```

---

## 🤝 Contribuciones

1. Crea un Fork del repositorio.
2. Crea tu rama con la característica deseada: `git checkout -b feature/nueva-caracteristica`.
3. Sube tus cambios al repositorio remoto: `git commit -am "Add feature"` & `git push origin feature/nueva-caracteristica`.
4. Abre un Pull Request estándar hacia la rama `main`.

---

> This digital ecosystem has been designed, structured, and developed to high-performance standards by **Cabuweb**.

[Cabuweb](https://cabuweb.com)