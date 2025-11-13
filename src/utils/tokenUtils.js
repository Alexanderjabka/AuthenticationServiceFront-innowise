const TOKEN_KEY = 'auth_token'
const REFRESH_KEY = 'refresh_token'

export const clearExpiredTokens = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  const refreshToken = localStorage.getItem(REFRESH_KEY)
  
  if (!token || !refreshToken) {
    return
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expiresAt = payload.exp * 1000
    const now = Date.now()
    
    if (expiresAt < now) {
      const refreshPayload = JSON.parse(atob(refreshToken.split('.')[1]))
      const refreshExpiresAt = refreshPayload.exp * 1000
      
      if (refreshExpiresAt < now) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_KEY)
      }
    }
  } catch (error) {
    console.error('Failed to parse tokens while clearing expired values', error)
  }
}
