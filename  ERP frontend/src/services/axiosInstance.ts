import axios from 'axios'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

axiosInstance.interceptors.response.use(
  (response) => {
    const payload = response.data
    if (payload && typeof payload === 'object' && 'success' in payload) {
      if (payload.success === false) {
        return Promise.reject(new Error(payload.message || 'Request failed'))
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
    const message = error?.response?.data?.message || error?.message || 'Request failed'
    return Promise.reject(new Error(message))
  }
)

export default axiosInstance
