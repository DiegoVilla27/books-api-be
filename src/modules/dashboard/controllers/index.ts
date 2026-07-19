import type { NextFunction, Request, Response } from "express";
import { getDashboardStatsSvc, getDashboardHistorySvc } from "../services";
import type { DashboardHistoryQuery } from "../dtos/request";

/**
 * Controller handler to retrieve consolidated statistics and system health indicators.
 * 
 * @param req - Express request object representing the incoming HTTP call.
 * @param res - Express response object utilized to return JSON stats with a 200 HTTP status code.
 * @param next - Express next function delegated to forward errors to the global boundary middleware.
 * 
 * @returns A promise resolving to the Express response payload containing {@link DashboardStatsResponseDTO}.
 * 
 * @throws Passes any caught persistence or unexpected connection errors downstream to {@link next}.
 */
const getDashboardStatsCtrl = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getDashboardStatsSvc();

    return res.status(200).json(stats);
  } catch (e) {
    console.log(`Error al obtener las estadísticas: ${e}`);
    return next(e);
  }
}

/**
 * Controller handler to retrieve historical statistics of created assets (books/users) by month for a given year.
 * 
 * @param req - Express request object containing the validated `year` query parameter.
 * @param res - Express response object utilized to return JSON stats with a 200 HTTP status code.
 * @param next - Express next function delegated to forward errors to the global boundary middleware.
 * 
 * @returns A promise resolving to the Express response payload containing {@link DashboardHistoryResponseDTO[]}.
 * 
 * @throws Passes any caught parsing, persistence, or connection errors downstream to {@link next}.
 */
const getDashboardHistoryCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queries = req.query as unknown as DashboardHistoryQuery;

    const stats = await getDashboardHistorySvc(queries.year);

    return res.status(200).json(stats);
  } catch (e) {
    console.log(`Error al obtener el historial del dashboard: ${e}`);
    return next(e);
  }
}

export { getDashboardStatsCtrl, getDashboardHistoryCtrl };
