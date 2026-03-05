import axios from 'axios'
import { getErrorMessage } from '../utils/errorUtils'

const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 10_000

const normalizeApiBaseUrl = (): string => {
  // Prefer explicit base URL env. Fallback to same-origin '/api' for production safety.
  const rawBase = ((import.meta.env.VITE_API_BASE_URL as string) || '/api').trim()
  const withoutTrailingSlash = rawBase.replace(/\/+$/, '')
  if (!withoutTrailingSlash) {
    return '/api'
  }
  return withoutTrailingSlash.endsWith('/api')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`
}

const API_BASE_URL = normalizeApiBaseUrl()
const TOKEN_KEY = 'auth_token'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
})

interface RetryableRequestConfig {
  _retry?: boolean
}

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`[API] ${String(config.method || 'GET').toUpperCase()} ${config.baseURL}${config.url}`)
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => {
    const payload = response.data
    if (payload && typeof payload === 'object' && 'success' in payload) {
      if (payload.success === false) {
        return Promise.reject(response)
      }
      return {
        ...response,
        data: payload.data,
        message: payload.message,
        meta: payload.meta,
      }
    }
    return response
  },
  (error) => {
    const isTimeout = error?.code === 'ECONNABORTED'
    const message = isTimeout ? `Request timed out after ${REQUEST_TIMEOUT_MS}ms` : getErrorMessage(error)
    console.error('[API ERROR]', message)

    const originalRequest = error?.config as RetryableRequestConfig | undefined

    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event('auth:unauthorized'))
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
