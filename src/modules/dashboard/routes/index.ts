import { restrictTo } from "@core/middlewares/restrictTo";
import { Router } from "express";
import { getDashboardHistoryCtrl, getDashboardStatsCtrl } from "../controllers";
import validateDataMiddleware from "@core/middlewares/validateDataZod";
import { DashboardHistorySchema } from "../schemas";

/**
 * Base URI path segment for the dashboard module endpoints.
 */
const ENTITY_BASE = '/dashboard';

/**
 * Express router instance managing all routes associated with the dashboard metrics.
 * 
 * @remarks
 * This router secures all downstream routes using role-based access control (RBAC).
 * Specifically, endpoints are restricted to users with the 'ADMIN' role.
 * 
 * @internal
 */
const dashboardRoutes = Router();

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