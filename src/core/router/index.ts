import { Router } from "express";
import bookRoutes from "@modules/books/routes";

// Inicializamos el router y añadimos las rutas
const router = Router();

// Rutas de books
router.use(bookRoutes);

// Exportamos el router con la ruta base
export default Router().use('/api/v1', router);