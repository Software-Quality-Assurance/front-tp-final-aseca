export const BACKEND_BASE_URL =
  typeof process !== 'undefined' &&
  (process as any).env?.EXPO_PUBLIC_BACKEND_BASE_URL
    ? (process as any).env.EXPO_PUBLIC_BACKEND_BASE_URL
    : 'http://localhost:8080';

export const COMPANY_PLACEHOLDER =
  typeof process !== 'undefined' &&
  (process as any).env?.EXPO_PUBLIC_COMPANY_PLACEHOLDER
    ? (process as any).env.EXPO_PUBLIC_COMPANY_PLACEHOLDER
    : '';

export function buildUrl(path: string) {
  if (path.startsWith('/')) return `${BACKEND_BASE_URL}${path}`;
  return `${BACKEND_BASE_URL}/${path}`;
}
