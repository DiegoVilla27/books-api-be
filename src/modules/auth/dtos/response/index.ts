/**
 * Data Transfer Object representing the sanitized core profile identity payload.
 * Encapsulates non-sensitive context markers returned exclusively to verified sessions.
 */
export type MeResponseDTO = {
  /** The unique numeric system identifier bound to the active database record entity. */
  id: number;
  /** The given first name of the authenticated user. */
  name: string;
  /** The matching surname tracking strings of the authenticated user. */
  lastname: string;
  /** The primary verified electronic mail address serving as the user's login credential identity key. */
  email: string;
  /** The explicit security context authorization role string assigned to the user profile (e.g., 'ADMIN', 'USER'). */
  role: string;
}

/**
 * Objeto de transferencia de datos (DTO) para la respuesta de autenticación.
 * Retorna las credenciales efímeras tras un inicio de sesión, registro, o refresh exitoso.
 */
export type AuthResponseDTO = {
  /**
   * Token de acceso (JWT) para autorizar las solicitudes HTTP subsiguientes.
   */
  access_token: string;
  /**
   * Token de refresco (JWT) utilizado para renovar el token de acceso cuando expire.
   */
  refresh_token: string;
  /**
   * Tiempo de vida del token de acceso expresado en segundos.
   */
  expires_in: number;
};