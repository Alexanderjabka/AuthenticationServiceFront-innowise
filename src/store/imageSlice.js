import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../services/api'

const initialState = {
  allImages: [],
  userImages: [],
  currentPage: 1,
  totalPages: 0,
  totalImages: 0,
  loading: false,
  error: null,
  uploadLoading: false,
  uploadError: null,
}

// Fetch all images with pagination
export const fetchAllImages = createAsyncThunk(
  'images/fetchAllImages',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/images?page=${page}&limit=${limit}`)
      return data
    } catch (err) {
      const message = err.response?.data?.message || err.message
      return rejectWithValue(message)
    }
  }
)

// Fetch user's images with pagination
export const fetchUserImages = createAsyncThunk(
  'images/fetchUserImages',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/images/user?page=${page}&limit=${limit}`)
      return data
    } catch (err) {
      const message = err.response?.data?.message || err.message
      return rejectWithValue(message)
    }
  }
)

// Upload new image
export const uploadImage = createAsyncThunk(
  'images/uploadImage',
  async ({ file, description = '' }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('description', description)
      
      const { data } = await api.post('/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return data
    } catch (err) {
      const message = err.response?.data?.message || err.message
      return rejectWithValue(message)
    }
  }
)

// Delete image
export const deleteImage = createAsyncThunk(
  'images/deleteImage',
  async (imageId, { rejectWithValue }) => {
    try {
      await api.delete(`/images/${imageId}`)
      return imageId
    } catch (err) {
      const message = err.response?.data?.message || err.message
      return rejectWithValue(message)
    }
  }
)


const imageSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
    clearError: (state) => {
      state.error = null
      state.uploadError = null
    },
    clearImages: (state) => {
      state.allImages = []
      state.userImages = []
      state.currentPage = 1
      state.totalPages = 0
      state.totalImages = 0
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all images
      .addCase(fetchAllImages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllImages.fulfilled, (state, action) => {
        state.loading = false
        state.allImages = action.payload.images || action.payload.data || []
        state.totalPages = action.payload.totalPages || action.payload.pagination?.totalPages || Math.ceil((action.payload.total || 0) / 10)
        state.totalImages = action.payload.total || action.payload.pagination?.total || 0
        state.currentPage = action.payload.currentPage || action.payload.pagination?.currentPage || 1
      })
      .addCase(fetchAllImages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch images'
      })
      
      // Fetch user images
      .addCase(fetchUserImages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserImages.fulfilled, (state, action) => {
        state.loading = false
        state.userImages = action.payload.images || action.payload.data || []
        state.totalPages = action.payload.totalPages || action.payload.pagination?.totalPages || Math.ceil((action.payload.total || 0) / 10)
        state.totalImages = action.payload.total || action.payload.pagination?.total || 0
        state.currentPage = action.payload.currentPage || action.payload.pagination?.currentPage || 1
      })
      .addCase(fetchUserImages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch user images'
      })
      
      // Upload image
      .addCase(uploadImage.pending, (state) => {
        state.uploadLoading = true
        state.uploadError = null
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.uploadLoading = false
        // Add new image to user images
        state.userImages.unshift(action.payload)
        state.totalImages += 1
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.uploadLoading = false
        state.uploadError = action.payload || 'Failed to upload image'
      })
      
      // Delete image
      .addCase(deleteImage.fulfilled, (state, action) => {
        const imageId = action.payload
        state.userImages = state.userImages.filter(img => img.id !== imageId)
        state.allImages = state.allImages.filter(img => img.id !== imageId)
        state.totalImages = Math.max(0, state.totalImages - 1)
      })
  },
})

export const { setCurrentPage, clearError, clearImages } = imageSlice.actions
export default imageSlice.reducer
