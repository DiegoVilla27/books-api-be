# 📚 Books REST API

[![NPM Version](https://img.shields.io/badge/npm-v10.0.0+-blue.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v7.0.2-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-v5.2.1-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-v7.8.0-blue.svg)](https://www.prisma.io/)
[![Mongoose](https://img.shields.io/badge/Mongoose-v9.7.4-green.svg)](https://mongoosejs.com/)

*Un ecosistema digital moderno y modular para la gestión de libros, que integra bases de datos relacionales y no relacionales bajo estándares óptimos de rendimiento y seguridad.*

---

## 📖 Resumen Técnico y Propósito del Sistema

Este proyecto es una API REST construida sobre **Node.js**, **Express v5** y **TypeScript**. El sistema implementa un entorno híbrido de persistencia de datos:
1. **PostgreSQL** (base de datos relacional) para la gestión del catálogo de libros.
2. **MongoDB** (base de datos documental) para tareas complementarias como registros de auditoría y almacenamiento de documentos flexibles.

La aplicación utiliza la versión más moderna de **Prisma ORM (v7)** y middlewares de seguridad global como Helmet, control de tasa (Rate Limiting), políticas CORS personalizadas y límites estrictos en el tamaño de los datos recibidos (Payload Limiting).

### Matriz de Funcionalidades Clave

| Icono | Componente de Funcionalidad | Impacto en el Negocio / Rendimiento |
| :---: | :--- | :--- |
| 📦 | **Arquitectura Modular (Vertical Slicing)** | Agrupación de código por dominios funcionales (libros, auditoría, etc.). Permite un escalado limpio y minimiza los conflictos en equipos grandes. |
| 🛡️ | **Middlewares de Seguridad Avanzada** | Prevención nativa de ataques comunes (Clickjacking, inyección XSS, DoS) mediante cabeceras seguras (Helmet) y validación estructurada con Zod. |
| 💾 | **Persistencia Híbrida Inteligente** | Lo mejor de dos mundos: consistencia de datos fuerte con PostgreSQL y flexibilidad/auditoría rápida con MongoDB. |

---

## 📐 Arquitectura Modular y Estructura del Proyecto

El proyecto sigue una estructura **modular (o basada en características / Vertical Slices)**. En lugar de agrupar todo el código en carpetas técnicas globales, el código que pertenece a un mismo dominio de negocio vive en un módulo aislado, facilitando su escalado.

### Estructura de Directorios

```text
books/
├── prisma/
│   ├── migrations/         # Historial de migraciones SQL generadas por Prisma.
│   ├── schema.prisma       # Definición de modelos de datos (Prisma Schema).
│   └── seed.ts             # Script de población de datos iniciales (Seeding).
├── src/
│   ├── core/               # Núcleo de la app. Configuraciones globales y conexiones de BD.
│   │   ├── database/
│   │   │   ├── mongo/      # Conexión a MongoDB usando Mongoose.
│   │   │   └── postgres/   # Cliente de Prisma configurado con Driver Adapter (pg).
│   │   └── router/         # Enrutador central global (Prefijo /api/v1).
│   ├── middlewares/        # Middlewares reutilizables (ej: validación de esquemas Zod).
│   ├── modules/            # Módulos aislados de negocio.
│   │   └── books/          # Módulo de Libros.
│   │       ├── controllers/# Controladores HTTP del módulo.
│   │       ├── data/       # Tipos e interfaces de datos de libros.
│   │       ├── routes/     # Definición de rutas del módulo.
│   │       └── services/   # Lógica de negocio (interactúa con Prisma y Mongo).
│   └── index.ts            # Punto de entrada de la aplicación.
├── docker-compose.yml      # Definición de servicios locales (PostgreSQL y MongoDB).
├── package.json            # Scripts de ejecución y dependencias del sistema.
└── prisma.config.ts        # Archivo de configuración centralizado obligatorio de Prisma 7.
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
│  - Saneamiento automático contra XSS (sanitize-html)   │
└──────────────────────┬─────────────────────────────────┘
                       │ (Datos 100% Saneados)
                       ▼
┌────────────────────────────────────────────────────────┐
│     Controladores del Módulo (src/modules/books/ctrl)  │
│  - Interpreta datos y responde al cliente             │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│     Servicios del Módulo (src/modules/books/services)  │
│  - Interactúa de forma asíncrona con PostgreSQL/Prisma │
│  - Guarda auditoría / registros duplicados en MongoDB  │
└────────────────────────────────────────────────────────┘
```

---

## 🗄️ Gestión y Flujo de Bases de Datos con Prisma 7

### ¿Qué es Prisma 7 y qué cambió?
**Prisma 7** introduce una arquitectura completamente libre de motores nativos de Rust para entornos Node.js convencionales. Ahora utiliza un motor basado en TypeScript/Wasm, lo que obliga a seguir ciertas pautas de configuración:

1. **Configuración en `prisma.config.ts`**: La URL de la base de datos ya no se puede colocar directamente en `schema.prisma`. En su lugar, se administra en el archivo de configuración `prisma.config.ts` mediante variables de entorno.
2. **Driver Adapters Obligatorios**: Para conectarse a bases de datos relacionales directamente en Node.js, es obligatorio instalar e inicializar un Driver Adapter, en nuestro caso `pg` (Node-Postgres) y `@prisma/adapter-pg`.

### Ciclo de Vida del Desarrollo

#### 1. Iniciar los Servidores de Base de Datos locales (Docker)
Antes de ejecutar la aplicación, levanta los contenedores con PostgreSQL y MongoDB definidos en [docker-compose.yml](file:///Users/diegovilla/Desktop/books/docker-compose.yml):
```bash
docker compose up -d
```

#### 2. Generar Migraciones (Sincronizar Esquema)
Cada vez que modifiques el archivo [prisma/schema.prisma](file:///Users/diegovilla/Desktop/books/prisma/schema.prisma), ejecuta este comando para generar y aplicar la migración SQL en PostgreSQL:
```bash
npx prisma migrate dev --name <nombre_migracion>
```

#### 3. Generar el Cliente de Prisma
Para recompilar el cliente con tipado estático según tus tablas actuales (generado en la ruta personalizada `src/core/database/postgres/generated/prisma`):
```bash
npx prisma generate
```

#### 4. Ejecutar el Seeding de Datos (100 libros)
Prisma 7 lee la propiedad `seed` configurada en la sección `migrations` de `prisma.config.ts`. Para insertar 100 libros de prueba automáticamente:
```bash
npx prisma db seed
```

#### 5. Visualizar la Base de Datos (Prisma Studio)
Para abrir la interfaz visual de administración de base de datos en tu navegador:
```bash
npx prisma studio
```
*(Disponible por defecto en `http://localhost:5555` o el puerto asignado).*

---

## 🛡️ Guía de Middlewares y Pruebas en Postman

### 1. Helmet
* **Propósito:** Previene ataques como *Clickjacking*, inyecciones de scripts maliciosos (*XSS*) a través de políticas CSP, y elimina la cabecera `X-Powered-By`.
* **Prueba en Postman:** Realiza una petición `GET` a `http://localhost:3000/health` y comprueba en la pestaña **Headers** la presencia de `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` y la ausencia de `X-Powered-By`.

### 2. Express JSON Limit (10kb)
* **Propósito:** Evita ataques DoS denegando cuerpos JSON de más de 10 KB.
* **Prueba en Postman:** Intenta hacer una petición `POST` a `http://localhost:3000/api/v1/books` con un cuerpo JSON de gran tamaño (superior a 10 KB). Recibirás un error `413 Payload Too Large`.

### 3. CORS
* **Propósito:** Permite el acceso únicamente a orígenes autorizados (`http://localhost:3000` y `https://miwebprofesional.com`).
* **Prueba en Postman:** Agrega en la cabecera de la petición `Origin: https://miwebprofesional.com` y comprueba en los headers de respuesta la cabecera `Access-Control-Allow-Origin`. Si envías un origen no listado, el middleware rechazará la petición.

### 4. Rate Limiter (express-rate-limit)
* **Propósito:** Limita las peticiones a un máximo de 100 por cada 15 minutos por dirección IP.
* **Prueba en Postman:** Realiza peticiones repetidas. Comprueba las cabeceras de respuesta `RateLimit-Limit` y `RateLimit-Remaining`. Si llegas a 0, recibirás un error `429 Too Many Requests`.

---

## 🛠️ Pila Tecnológica y Dependencias

### Dependencias de Producción
| Icono | Tecnología / Librería | Versión | Propósito en el Proyecto |
| :---: | :--- | :--- | :--- |
| 🚂 | **express** | `^5.2.1` | Framework del servidor HTTP. |
| 🛡️ | **helmet** | `^8.3.0` | Middleware para establecer cabeceras de seguridad. |
| 🌐 | **cors** | `^2.8.6` | Control de políticas CORS. |
| ⏱️ | **express-rate-limit** | `^8.5.2` | Control de tasa de peticiones entrantes. |
| 🍃 | **mongoose** | `^9.7.4` | ORM/ODM para la conexión y consultas a MongoDB. |
| 🐘 | **pg** / **@prisma/adapter-pg** | `^8.22.0` | Driver nativo y adaptador para conectar Prisma con PostgreSQL. |
| 🛡️ | **zod** / **sanitize-html** | *(Varios)* | Validación de datos con saneamiento automático contra XSS. |

---

## ⚙️ Guía de Instalación y Ejecución

### Requisitos Previos
* **Node.js** >= 20.0.0
* **Docker Engine** y **Docker Compose** instalado.

### Pasos de Configuración y Despliegue

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar el entorno:**
   Crea un archivo `.env` en la raíz del proyecto basándote en las variables requeridas:
   ```env
   NODE_ENV=dev
   PORT=3000
   POSTGRES_URI="postgresql://dv:1234@localhost:5432/books_db?schema=public"
   MONGO_URI="mongodb://localhost:27017/books_audits"
   ```

3. **Iniciar las Bases de Datos:**
   ```bash
   docker compose up -d
   ```

4. **Aplicar Migraciones y Poblar la Base de Datos:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Iniciar el Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```

---

> This digital ecosystem has been designed, structured, and developed to high-performance standards by **Cabuweb**.

[Cabuweb](https://cabuweb.com)