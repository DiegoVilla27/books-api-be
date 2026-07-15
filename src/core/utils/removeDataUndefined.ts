const removeDataUndefined = <T extends Record<string, any>>(data: T) => {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );
}

export { removeDataUndefined };