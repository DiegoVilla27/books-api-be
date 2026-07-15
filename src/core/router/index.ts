import { Router } from "express";
import bookRoutes from "@modules/books/routes";
import userRoutes from "@modules/users/routes";

// Inicializamos el router y añadimos las rutas
const router = Router();

// Rutas de books y users
router.use(bookRoutes);
router.use(userRoutes);

// Exportamos el router con la ruta base
export default Router().use('/api/v1', router);