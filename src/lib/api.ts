import { Platform } from 'react-native';

const rawUrl =
  typeof process !== 'undefined' &&
  (process as any).env?.EXPO_PUBLIC_BACKEND_BASE_URL
    ? (process as any).env.EXPO_PUBLIC_BACKEND_BASE_URL
    : 'http://localhost:8080';


export const BACKEND_BASE_URL =
  Platform.OS === 'android'
    ? rawUrl.includes('appium-host')
      ? rawUrl.replace('appium-host', '127.0.0.1')
      : rawUrl
          .replace('localhost', '10.0.2.2')
          .replace('127.0.0.1', '10.0.2.2')
    : rawUrl;

export const COMPANY_PLACEHOLDER =
  typeof process !== 'undefined' &&
  (process as any).env?.EXPO_PUBLIC_COMPANY_PLACEHOLDER
    ? (process as any).env.EXPO_PUBLIC_COMPANY_PLACEHOLDER
    : '';


export function buildUrl(path: string) {
  if (path.startsWith('/')) return `${BACKEND_BASE_URL}${path}`;
  return `${BACKEND_BASE_URL}/${path}`;
}
