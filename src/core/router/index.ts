import authRoutes from "@modules/auth/routes";
import bookRoutes from "@modules/books/routes";
import dashboardRoutes from "@modules/dashboard/routes";
import userRoutes from "@modules/users/routes";
import { Router } from "express";

/**
 * Enrutador secundario de Express que agrupa y monta todos los enrutadores de los módulos de dominio.
 * 
 * @remarks
 * Centraliza los módulos de Autenticación, Libros, Dashboard y Usuarios en un único árbol de rutas
 * previo a la aplicación del prefijo de versión de API.
 * 
 * @internal
 */
const router = Router();

// Mount individual domain routing endpoints
router.use(authRoutes);
router.use(dashboardRoutes);
router.use(bookRoutes);
router.use(userRoutes);

/**
 * Enrutador principal de la aplicación que expone la puerta de entrada de la API.
 * 
 * @remarks
 * Aplica el prefijo de espacio de nombres `/api/v1` a todos los endpoints de los módulos del sistema.
 * 
 * @example
 * ```typescript
 * app.use(mainRouter);
 * ```
 */
const mainRouter: Router = Router().use('/api/v1', router);

export default mainRouter;