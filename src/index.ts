// Cargar variables de entorno
import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import routes from '@core/router';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectMongo } from '@core/database/mongo';
import globalErrorHandler from '@core/middlewares/errorHandler';

// Inicia conexión a mongodb
connectMongo();

// Se crea la instancia de la aplicación
const app = express();
// Puerto en el que correrá el servidor
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet()); // Middleware para asegurar la app de diferentes ataques 
app.use(express.json({ limit: '10kb' })); // Middleware para entender formato json en request and response y limitar tamaño
const allowedOrigins = ['http://localhost:3000', 'https://miwebprofesional.com'];
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
  standardHeaders: true, // Devuelve información de límite en las cabeceras `RateLimit-*`
  legacyHeaders: false, // Deshabilita las cabeceras antiguas `X-RateLimit-*`
}));

// Monta todas las rutas
app.use(routes);

// Ruta de salud de la API
app.get('/health', (_: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Manejo de errores globales
app.use(globalErrorHandler);

// Iniciamos el servidor con el puerto configurado
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo de forma segura en http://localhost:${PORT}`);
  console.log(`⚙️ Entorno activo: ${process.env.NODE_ENV || 'production'}`);
});