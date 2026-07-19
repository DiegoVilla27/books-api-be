/**
 * Data Transfer Object representing the consolidated statistics displayed on the admin dashboard.
 */
export interface DashboardStatsResponseDTO {
  /**
   * The total number of book assets cataloged in the system database.
   */
  totalBooks: number;

  /**
   * The total count of registered user accounts in the system.
   */
  totalUsers: number;
}
