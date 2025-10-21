import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token'
const REFRESH_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refresh_token'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let pendingRequests = []

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    if (status === 401 && !original._retry) {
      original._retry = true
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const refreshToken = localStorage.getItem(REFRESH_KEY)
          if (!refreshToken) throw new Error('No refresh token')
          const { data } = await api.post('/auth/refresh', { refreshToken })
          const newAccess = data.accessToken || data.token
          const newRefresh = data.refreshToken
          if (newAccess) localStorage.setItem(TOKEN_KEY, newAccess)
          if (newRefresh) localStorage.setItem(REFRESH_KEY, newRefresh)
          pendingRequests.forEach((cb) => cb(newAccess))
          pendingRequests = []
          return api(original)
        } catch (e) {
          pendingRequests = []
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(REFRESH_KEY)
          return Promise.reject(e)
        } finally {
          isRefreshing = false
        }
      }
      return new Promise((resolve, reject) => {
        pendingRequests.push((token) => {
          if (token) {
            original.headers.Authorization = `Bearer ${token}`
          }
          api(original).then(resolve).catch(reject)
        })
      })
    }
    return Promise.reject(error)
  },
)

export default api

