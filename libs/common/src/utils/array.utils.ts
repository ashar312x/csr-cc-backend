export function getNewItems<T>(existing: T[], incoming: T[]): T[] {
  const existingSet = new Set(existing);
  return Array.from(new Set(incoming)).filter((item) => !existingSet.has(item));
}
