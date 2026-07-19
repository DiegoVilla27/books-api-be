import type z from "zod";
import type { DashboardHistorySchema } from "../../schemas";

/**
 * Data Transfer Object representing the filter queries for the dashboard history.
 */
export type DashboardHistoryQuery = z.infer<typeof DashboardHistorySchema>['query'];