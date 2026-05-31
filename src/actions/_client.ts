import { useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { buildUrl } from '@/lib/api'

export function useClient() {
  const { authorizedFetch } = useAuth()

  return useCallback(
    async <T>(path: string, options?: RequestInit): Promise<T> => {
      const response = await authorizedFetch(buildUrl(path), options ?? {})
      if (!response.ok) throw { status: response.status, message: await response.text() }
      if (response.status === 204) return undefined as T
      return response.json() as Promise<T>
    },
    [authorizedFetch],
  )
}
