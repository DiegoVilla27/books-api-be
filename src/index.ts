// Cargar variables de entorno
import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import routes from '@core/router';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectMongo } from '@core/database/mongo';
import globalErrorHandler from '@core/middlewares/errorHandler';
import ENVS from '@core/environments';

// Inicia conexión a mongodb
connectMongo();

/**
 * Main Express application instance configured with security headers, CORS, rate limiting, and core routes.
 */
const app = express();

/**
 * HTTP server listening port bound to the `PORT` environment configuration variable.
 */
const PORT = ENVS.PORT;

// Middlewares de Seguridad e Infraestructura
app.use(helmet()); // Middleware para asegurar la app de diferentes ataques 
app.use(express.json({ limit: '10kb' })); // Middleware para entender formato json en request and response y limitar tamaño

/** 
 * Allowed CORS origins whitelist permitted to cross-communicate with this API service.
 */
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4200'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por políticas de seguridad (CORS)'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
})); // Middleware para permitir peticiones desde diferentes origenes

app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Middleware para entender formato urlencoded en request and response y limitar tamaño

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita a 100 peticiones por ventana de tiempo
  message: {
    message: 'Demasiadas peticiones desde esta IP. Por favor intenta de nuevo en 15 minutos.'
  },
  skip: (_) => ENVS.NODE_ENV === 'dev',
  standardHeaders: true, // Devuelve información de límite en las cabeceras `RateLimit-*`
  legacyHeaders: false, // Deshabilita las cabeceras antiguas `X-RateLimit-*`
}));

// Monta todas las rutas bajo la versión de la API configurada
app.use(routes);

/**
 * Public health-check endpoint for system monitoring and load balancer sanity checks.
 * 
 * @param _ - Express request object (unused).
 * @param res - Express response object.
 * @returns JSON payload containing system status `UP` and current server timestamp.
 */
app.get('/health', (_: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Middleware controlador de errores global (debe ser el último en acoplarse)
app.use(globalErrorHandler);

// Iniciamos el servidor con el puerto configurado
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo de forma segura en http://localhost:${PORT}`);
  console.log(`⚙️ Entorno activo: ${ENVS.NODE_ENV}`);
});