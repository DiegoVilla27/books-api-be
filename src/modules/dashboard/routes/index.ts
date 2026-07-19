import { restrictTo } from "@core/middlewares/restrictTo";
import { Router } from "express";
import { getDashboardStatsCtrl } from "../controllers";

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

export default dashboardRoutes;