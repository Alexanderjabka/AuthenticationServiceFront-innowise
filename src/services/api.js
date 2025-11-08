import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token'
const REFRESH_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refresh_token'

let updateTokensCallback = null
export const setTokenUpdateCallback = (callback) => {
  updateTokensCallback = callback
}

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

const refreshApi = axios.create({
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
          if (!refreshToken) {
            throw new Error('No refresh token')
          }
          
          const response = await refreshApi.post('/auth/refresh', { 
            token: refreshToken 
          })
          
          if (!response || !response.data) {
            throw new Error('Invalid refresh response')
          }
          
          const { data } = response
          
          const newAccess = data.accessToken || data.token
          const newRefresh = data.refreshToken || refreshToken
          
          if (!newAccess) {
            throw new Error('No access token in refresh response')
          }
          
          localStorage.setItem(TOKEN_KEY, newAccess)
          localStorage.setItem(REFRESH_KEY, newRefresh)
          
          if (updateTokensCallback) {
            updateTokensCallback(newAccess, newRefresh)
          }
          
          original.headers.Authorization = `Bearer ${newAccess}`
          pendingRequests.forEach((cb) => cb(newAccess))
          pendingRequests = []
          
          return api(original)
        } catch (e) {
          const isRefreshTokenExpired = e.response?.status === 401 || 
                                        e.response?.status === 403 ||
                                        e.message?.includes('refresh')
          
          pendingRequests.forEach((cb) => cb(null))
          pendingRequests = []
          
          if (isRefreshTokenExpired) {
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(REFRESH_KEY)
            
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
              window.location.href = '/login'
            }
          }
          
          return Promise.reject(e)
        } finally {
          isRefreshing = false
        }
      }
      
      return new Promise((resolve, reject) => {
        pendingRequests.push((token) => {
          if (token) {
            original.headers.Authorization = `Bearer ${token}`
            api(original).then(resolve).catch(reject)
          } else {
            reject(error)
          }
        })
      })
    }
    
    return Promise.reject(error)
  },
)

export default api
