import { useState, useEffect, useCallback } from 'react'
import ImageCard from './ImageCard'
import Pagination from './Pagination'
import api from '../services/api'

function ImageGallery({ 
  images, 
  loading, 
  error, 
  currentPage, 
  totalPages, 
  onPageChange, 
  isOwner = false,
  onImageClick 
}) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [modalImageUrl, setModalImageUrl] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  const handleImageClick = (image) => {
    setSelectedImage(image)
    if (onImageClick) {
      onImageClick(image)
    }
  }

  const closeModal = useCallback(() => {
    if (modalImageUrl) {
      URL.revokeObjectURL(modalImageUrl)
    }
    setModalImageUrl(null)
    setSelectedImage(null)
  }, [modalImageUrl])

  useEffect(() => {
    if (!selectedImage) {
      return undefined
    }

    let blobUrl = null

    const loadModalImage = async () => {
      setModalLoading(true)
      try {
        const response = await api.get(selectedImage.contentUrl, {
          responseType: 'blob'
        })
        blobUrl = URL.createObjectURL(response.data)
        setModalImageUrl(blobUrl)
      } catch (error) {
        console.error('Failed to load modal image', error)
      } finally {
        setModalLoading(false)
      }
    }

    loadModalImage()

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [selectedImage])

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden'
      
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          closeModal()
        }
      }

      document.addEventListener('keydown', handleEscape)
      
      return () => {
        document.body.style.overflow = 'unset'
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [selectedImage, closeModal])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#333', fontSize: '16px' }}>Loading images...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: '16px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          color: '#e74c3c'
        }}>
          ⚠️
        </div>
        <h3 style={{ color: '#e74c3c', margin: 0 }}>Error loading images</h3>
        <p style={{ color: '#666', margin: 0 }}>{error}</p>
      </div>
    )
  }

  if (!images || images.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: '16px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          color: '#bdc3c7'
        }}>
          📷
        </div>
        <h3 style={{ color: '#7f8c8d', margin: 0 }}>No images found</h3>
        <p style={{ color: '#95a5a6', margin: 0 }}>
          {isOwner ? 'Upload your first image to get started!' : 'No images have been uploaded yet.'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '0 16px',
        justifyContent: 'flex-start'
      }}>
        {images.map((image) => (
          <div key={image.id} style={{ 
            flex: '0 0 auto',
            width: 'calc(10% - 14.4px)',
            minWidth: '120px',
            maxWidth: '180px'
          }}>
            <ImageCard
              image={image}
              isOwner={isOwner}
              onImageClick={handleImageClick}
            />
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        loading={loading}
      />

      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s ease',
              zIndex: 2001
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
            }}
          >
            ×
          </button>

          <div 
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {modalLoading || !modalImageUrl ? (
              <div style={{
                width: '100%',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  border: '5px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '5px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
            ) : (
              <img
                src={modalImageUrl}
                alt={selectedImage.description || 'Image'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                }}
              />
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export default ImageGallery
