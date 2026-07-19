import { z } from "zod/v4";

/**
 * Zod validation schema representing client query payload constraints for retrieving dashboard history.
 * 
 * @remarks
 * Coerces the `year` parameter from a string representation to a validated integer via regex validation and mapping.
 */
const DashboardHistorySchema = z.object({
  query: z.object({
    /**
     * Target year for metric query calculations.
     * Must be a valid numeric string, transformed to a base-10 number representation.
     */
    year: z
      .string()
      .regex(/^\d+$/, 'El año debe ser un número válido') // Solo números
      .transform((val) => parseInt(val, 10)),            // Transforma a número
  }),
});

export { DashboardHistorySchema };