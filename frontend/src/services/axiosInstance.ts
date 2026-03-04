import axios from 'axios'
import { getErrorMessage } from '../utils/errorUtils'

const API_ORIGIN = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'
const normalizeApiBaseUrl = () => {
  const rawBase = ((import.meta.env.VITE_API_BASE_URL as string) || API_ORIGIN).trim()
  const withoutTrailingSlash = rawBase.replace(/\/+$/, '')
  return withoutTrailingSlash.endsWith('/api')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`
}

const API_BASE_URL = normalizeApiBaseUrl()
const TOKEN_KEY = 'auth_token'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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
    const message = getErrorMessage(error)
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
