import { useState } from 'react'
import ImageCard from './ImageCard'
import Pagination from './Pagination'

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

  const handleImageClick = (image) => {
    setSelectedImage(image)
    if (onImageClick) {
      onImageClick(image)
    }
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

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
      {/* Image Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        padding: '0 16px'
      }}>
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            isOwner={isOwner}
            onImageClick={handleImageClick}
          />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        loading={loading}
      />


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
