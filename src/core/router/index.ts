import authRoutes from "@modules/auth/routes";
import bookRoutes from "@modules/books/routes";
import dashboardRoutes from "@modules/dashboard/routes";
import userRoutes from "@modules/users/routes";
import { Router } from "express";

/**
 * Secondary Express Router that aggregates and mounts all module-specific sub-routers.
 * 
 * @remarks
 * Bundles separate domain modules like authentication, books, admin dashboard, and users 
 * into a single unified routing tree before applying version prefixing.
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
 * Main application routing gateway.
 * 
 * @remarks
 * Prefixes all aggregated module endpoints under the `/api/v1` namespace.
 * Serves as the primary entry point for all API network requests routing through the Express application.
 */
const mainRouter = Router().use('/api/v1', router);

export default mainRouter;