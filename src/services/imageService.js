import api from './api'

export const imageService = {
  // Fetch all images with pagination
  async fetchAllImages(page = 1, limit = 10) {
    try {
      const response = await api.get(`/images?page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch images')
    }
  },

  // Fetch user's images with pagination
  async fetchUserImages(page = 1, limit = 10) {
    try {
      const response = await api.get(`/images/user?page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user images')
    }
  },

  // Upload new image
  async uploadImage(file) {
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await api.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload image')
    }
  },

  // Delete image
  async deleteImage(imageId) {
    try {
      await api.delete(`/images/${imageId}`)
      return { success: true, imageId }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete image')
    }
  },

  // Get image by ID
  async getImageById(imageId) {
    try {
      const response = await api.get(`/images/${imageId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch image')
    }
  },

  // Search images
  async searchImages(query, page = 1, limit = 10) {
    try {
      const response = await api.get(`/images/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search images')
    }
  }
}

export default imageService
