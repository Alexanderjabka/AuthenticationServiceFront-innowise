import { store } from '../store'
import { setToken, setRefreshToken } from '../store/authSlice'
import { setTokenUpdateCallback } from './api'

export const initializeTokenRefresh = () => {
  setTokenUpdateCallback((newAccess, newRefresh) => {
    store.dispatch(setToken(newAccess))
    store.dispatch(setRefreshToken(newRefresh))
  })
}
