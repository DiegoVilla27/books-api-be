import sanitizeHtml from 'sanitize-html';

/**
 * Utilidad para sanear cadenas de texto y mitigar ataques de Scripting en Sitios Cruzados (XSS).
 * Utiliza la librería `sanitize-html` para filtrar etiquetas HTML y atributos no autorizados.
 * 
 * Por defecto, elimina cualquier etiqueta HTML y retorna texto plano limpio.
 * 
 * @param val - La cadena de texto de entrada que se desea desinfectar.
 * @param customTags - Opcional. Lista de etiquetas HTML permitidas (vacío por defecto para texto plano).
 * @param customAttributes - Opcional. Registro de atributos HTML autorizados mapeados por etiqueta.
 * @returns La cadena de texto desinfectada, recortando espacios en blanco en los extremos.
 */
const sanitizeText = (
  val: string,
  customTags: string[] = [],
  customAttributes: Record<string, string[]> = {}
) => {
  return sanitizeHtml(val, {
    allowedTags: customTags,
    allowedAttributes: customAttributes,
  }).trim();
};

export default sanitizeText;