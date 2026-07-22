/**
 * Objeto de transferencia de datos (DTO) para la respuesta de autenticación.
 * Retorna las credenciales efímeras tras un inicio de sesión, registro o renovación de token exitosos.
 *
 * @remarks
 * El `access_token` debe enviarse en el encabezado `Authorization: Bearer <access_token>` de las peticiones protegidas.
 * El `refresh_token` se utiliza únicamente en la ruta `POST /auth/refresh`.
 *
 * @example
 * ```typescript
 * const authPayload: AuthResponseDTO = {
 *   access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
 *   refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
 *   expires_in: 900
 * };
 * ```
 */
export type AuthResponseDTO = {
  /**
   * Token de acceso (JWT) para autorizar solicitudes HTTP protegidas.
   */
  access_token: string;
  /**
   * Token de refresco (JWT) utilizado para renovar el token de acceso al expirar.
   */
  refresh_token: string;
  /**
   * Tiempo de vigencia del token de acceso expresado en segundos (ej: `900` para 15 minutos).
   */
  expires_in: number;
};