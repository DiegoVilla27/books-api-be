import prisma from "@core/database/postgres";
import type { DashboardStatsResponseDTO } from "../dtos/response";

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

export { getDashboardStatsSvc };
