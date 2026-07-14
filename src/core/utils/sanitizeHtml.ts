import sanitizeHtml from 'sanitize-html';

// Auxiliar para desinfectar strings contra XSS
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