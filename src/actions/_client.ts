import { useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { buildUrl } from '@/lib/api'

export function useClient() {
  const { authorizedFetch } = useAuth()

  return useCallback(
    async <T>(path: string, options?: RequestInit): Promise<T> => {
      const mergedOptions: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers as Record<string, string>),
        },
      }
      const response = await authorizedFetch(buildUrl(path), mergedOptions)
      if (!response.ok) {
    const text = await response.text()
    throw { status: response.status, message: text || `Request failed with status ${response.status}` }
  }
      if (response.status === 204) return undefined as T
      return response.json() as Promise<T>
    },
    [authorizedFetch],
  )
}
