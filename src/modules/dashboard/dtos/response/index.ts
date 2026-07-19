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

/**
 * Data Transfer Object representing historical creation logs segmented by month.
 */
export interface DashboardHistoryResponseDTO {
  /**
   * The month represented in two-digit format (e.g., "01", "02" ... "12").
   */
  month: string;

  /**
   * Collection of metric records representing resource aggregation values for that month.
   */
  records: {
    /**
     * The resource indicator classification name (e.g. "Libros", "Usuarios").
     */
    name: string;
    /**
     * Total number of records created within the month scope.
     */
    value: number;
  }[];
}