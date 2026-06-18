export function normalizeTicker(value: string) {
  return value
    .replace(/\0/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '')
    .toUpperCase();
}
