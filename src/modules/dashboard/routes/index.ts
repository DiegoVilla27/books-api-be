import { restrictTo } from "@core/middlewares/restrictTo";
import { Router } from "express";
import { getDashboardHistoryCtrl, getDashboardStatsCtrl } from "../controllers";
import validateDataMiddleware from "@core/middlewares/validateDataZod";
import { DashboardHistorySchema } from "../schemas";

/**
 * Prefijo de ruta base para los endpoints del módulo Dashboard.
 */
const ENTITY_BASE = '/dashboard';

/**
 * Enrutador de Express encargado de exponer los endpoints de estadísticas y métricas del Dashboard.
 * 
 * @remarks
 * Restringe el acceso de todos sus endpoints exclusivamente a usuarios con rol `ADMIN` mediante el middleware `restrictTo`.
 * 
 * @see {@link restrictTo}
 * @internal
 */
const dashboardRoutes: Router = Router();

/**
 * GET /api/v1/dashboard/stats
 * 
 * Retrieve consolidated system-wide metrics and stats for dashboard visualization.
 * 
 * @remarks
 * Restricts access solely to administrators.
 * 
 * @see {@link restrictTo} for role enforcement middleware.
 * @see {@link getDashboardStatsCtrl} for controller handler.
 */
dashboardRoutes.get(`${ENTITY_BASE}/stats`, [
  restrictTo('ADMIN')
], getDashboardStatsCtrl);

/**
 * GET /api/v1/dashboard/history
 * 
 * Retrieve historical metrics of books and users created on a month-by-month basis.
 * 
 * @remarks
 * Restricts access solely to administrators. Validates query parameters using {@link DashboardHistorySchema}.
 * 
 * @see {@link restrictTo} for role enforcement middleware.
 * @see {@link validateDataMiddleware} for Zod validation middleware.
 * @see {@link getDashboardHistoryCtrl} for controller handler.
 */
dashboardRoutes.get(`${ENTITY_BASE}/history`, [
  restrictTo('ADMIN'),
  validateDataMiddleware(DashboardHistorySchema)
], getDashboardHistoryCtrl);

export default dashboardRoutes;