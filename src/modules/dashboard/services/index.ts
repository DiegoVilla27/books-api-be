import prisma from "@core/databases/postgres";
import type { DashboardHistoryResponseDTO, DashboardStatsResponseDTO } from "../dtos/response";

/**
 * Service method queries the relational database via Prisma Client to aggregate dashboard indicators.
 * Executes parallel counts to optimize server response times.
 * 
 * @returns A promise resolving to a {@link DashboardStatsResponseDTO} object featuring counts of active system resources.
 * 
 * @example
 * ```typescript
 * const stats = await getDashboardStatsSvc();
 * console.log(`Total books: ${stats.totalBooks}, Total users: ${stats.totalUsers}`);
 * ```
 */
const getDashboardStatsSvc = async (): Promise<DashboardStatsResponseDTO> => {
  const [totalBooks, totalUsers] = await Promise.all([
    prisma.book.count(),
    prisma.user.count()
  ]);

  return {
    totalBooks,
    totalUsers,
  };
}

/**
 * Service method queries the relational database via Prisma Client to compile historical creation records.
 * Uses RAW SQL to construct a LEFT JOIN query with a generate_series calendar matrix to ensure 12 monthly rows are returned.
 * 
 * @param year - The integer year to query metrics from.
 * 
 * @returns A promise resolving to a collection of {@link DashboardHistoryResponseDTO}.
 * 
 * @example
 * ```typescript
 * const history = await getDashboardHistorySvc(2026);
 * console.log(`Stats for January:`, history[0].records);
 * ```
 */
const getDashboardHistorySvc = async (year: number): Promise<DashboardHistoryResponseDTO[]> => {

  // 🚀 SQL RAW SENIOR: Generamos una matriz de meses (1 al 12) y cruzamos con LEFT JOINS
  // para asegurar que si un mes no tiene registros, devuelva valor 0 en lugar de saltarse el mes.
  const queryResult = await prisma.$queryRaw<DashboardHistoryResponseDTO[]>`
    WITH months_series AS (
      SELECT generate_series(1, 12) AS month_num
    ),
    books_metrics AS (
      SELECT 
        EXTRACT(MONTH FROM "createdAt")::INTEGER AS month_num,
        COUNT(*)::INTEGER AS total
      FROM "Book"
      WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
      GROUP BY EXTRACT(MONTH FROM "createdAt")
    ),
    users_metrics AS (
      SELECT 
        EXTRACT(MONTH FROM "createdAt")::INTEGER AS month_num,
        COUNT(*)::INTEGER AS total
      FROM "User"
      WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
      GROUP BY EXTRACT(MONTH FROM "createdAt")
    )
    SELECT 
      -- LPAD asegura que el mes tenga siempre 2 dígitos: "01", "02"... "12"
      LPAD(m.month_num::text, 2, '0') AS "month",
      COALESCE(
        json_build_array(
          json_build_object('name', 'Libros', 'value', COALESCE(b.total, 0)),
          json_build_object('name', 'Usuarios', 'value', COALESCE(u.total, 0))
        ),
        '[]'::json
      ) AS "records"
    FROM months_series m
    LEFT JOIN books_metrics b ON m.month_num = b.month_num
    LEFT JOIN users_metrics u ON m.month_num = u.month_num
    ORDER BY m.month_num;
  `;

  return queryResult;
}

export { getDashboardStatsSvc, getDashboardHistorySvc };
