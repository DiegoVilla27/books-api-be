import { Router } from "express";
import bookRoutes from "@modules/books/routes";
import userRoutes from "@modules/users/routes";

/**
 * Enrutador secundario que agrupa los módulos de la aplicación.
 */
const router = Router();

// Rutas de books y users acopladas al router secundario
router.use(bookRoutes);
router.use(userRoutes);

/**
 * Enrutador principal de la aplicación Express.
 * Expone la versión de la API prefijando todos los endpoints con `/api/v1`.
 */
export default Router().use('/api/v1', router);