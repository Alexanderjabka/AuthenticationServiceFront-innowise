import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../services/api'

const tokenKey = import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token'
const refreshKey = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refresh_token'

const initialState = {
  user: null,
  token: localStorage.getItem(tokenKey) || null,
  refreshToken: localStorage.getItem(refreshKey) || null,
  status: 'idle',
  error: null,
}

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials)
    return data
  } catch (err) {
    const message = err.response?.data?.message || err.message
    return rejectWithValue(message)
  }
})

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', payload)
    return data
  } catch (err) {
    const message = err.response?.data?.message || err.message
    return rejectWithValue(message)
  }
})

export const fetchProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/profile')
    return data
  } catch (err) {
    const message = err.response?.data?.message || err.message
    return rejectWithValue(message)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.refreshToken = null
      localStorage.removeItem(tokenKey)
      localStorage.removeItem(refreshKey)
    },
    setToken(state, action) {
      state.token = action.payload
      if (action.payload) {
        localStorage.setItem(tokenKey, action.payload)
      }
    },
    setRefreshToken(state, action) {
      state.refreshToken = action.payload
      if (action.payload) {
        localStorage.setItem(refreshKey, action.payload)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.error = null
        state.user = action.payload.user || null
        state.token = action.payload.accessToken || action.payload.token || null
        state.refreshToken = action.payload.refreshToken || null
        if (state.token) localStorage.setItem(tokenKey, state.token)
        if (state.refreshToken) localStorage.setItem(refreshKey, state.refreshToken)
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Login failed'
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.error = null
        state.user = action.payload.user || null
        state.token = action.payload.accessToken || action.payload.token || null
        state.refreshToken = action.payload.refreshToken || null
        if (state.token) localStorage.setItem(tokenKey, state.token)
        if (state.refreshToken) localStorage.setItem(refreshKey, state.refreshToken)
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Registration failed'
      })
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load profile'
      })
  },
})

export const { logout, setToken, setRefreshToken } = authSlice.actions
export default authSlice.reducer
