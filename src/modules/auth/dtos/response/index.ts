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