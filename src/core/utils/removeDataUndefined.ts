/**
 * Elimina de manera recursiva (o superficial) las propiedades cuyo valor sea estrictamente `undefined`
 * en un objeto de entrada.
 * 
 * Es de vital importancia en entornos donde la directiva `"exactOptionalPropertyTypes": true`
 * está activa en el archivo tsconfig, o cuando interactuamos con ORMs (como Prisma) que no aceptan
 * campos con valor `undefined` de forma explícita en peticiones de actualización.
 * 
 * @template T - El tipo del objeto de entrada que extiende un registro string-any.
 * @param data - Objeto del cual se eliminarán los campos con valor `undefined`.
 * @returns Un nuevo objeto con la misma estructura pero libre de propiedades con valor `undefined`.
 */
const removeDataUndefined = <T extends Record<string, any>>(data: T) => {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );
}

export { removeDataUndefined };