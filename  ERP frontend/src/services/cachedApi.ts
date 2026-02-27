import axiosInstance from './axiosInstance'

const cache = new Map<string, { expiresAt: number; value: any }>()

const keyFor = (url: string, params?: Record<string, any>) => `${url}::${JSON.stringify(params || {})}`

export const cachedGet = async <T = any>(url: string, params?: Record<string, any>, ttlMs = 30_000): Promise<T> => {
  const key = keyFor(url, params)
  const now = Date.now()
  const hit = cache.get(key)
  if (hit && hit.expiresAt > now) {
    return hit.value as T
  }

  const response: any = await axiosInstance.get(url, { params })
  cache.set(key, { expiresAt: now + ttlMs, value: response })
  return response as T
}

export const invalidateCacheByPrefix = (prefix: string) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
    }
  }
}
