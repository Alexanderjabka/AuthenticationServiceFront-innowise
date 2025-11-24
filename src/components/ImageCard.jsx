import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { deleteImage, toggleLike } from '../store/imageSlice'
import api from '../services/api'

function ImageCard({ image, isOwner = false, onImageClick }) {
  const [isLoading, setIsLoading] = useState(true)
  const [imageBlobUrl, setImageBlobUrl] = useState(null)
  const [likeLoading, setLikeLoading] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    let blobUrl = null

    const loadImage = async () => {
      try {
        const response = await api.get(image.contentUrl, {
          responseType: 'blob'
        })
        blobUrl = URL.createObjectURL(response.data)
        setImageBlobUrl(blobUrl)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load image', error)
        setIsLoading(false)
      }
    }

    loadImage()

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [image.contentUrl])

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await dispatch(deleteImage(image.id)).unwrap()
    } catch (error) {
      console.error('Failed to delete image', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4='
  }

  const handleToggleLike = async (e) => {
    e.stopPropagation()
    if (likeLoading) return
    setLikeLoading(true)
    try {
      await dispatch(toggleLike(image.id)).unwrap()
    } catch (error) {
      console.error('Failed to toggle like', error)
    } finally {
      setLikeLoading(false)
    }
  }

  const handleCommentsOpen = (e) => {
    e.stopPropagation()
    if (onImageClick) {
      onImageClick(image)
    }
  }

  const likesCount = image.likesCount ?? 0
  const commentsCount = image.commentsCount ?? 0
  const likedByCurrentUser = Boolean(image.likedByCurrentUser)

  return (
    <div style={{
      position: 'relative',
      backgroundColor: '#fff',
      borderRadius: '16px',
      boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
      overflow: 'hidden',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer',
      border: '1px solid #f1f5f9'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
    }}
    onClick={() => onImageClick && onImageClick(image)}
    >
      <div style={{ position: 'relative', width: '100%', height: '280px', overflow: 'hidden', backgroundColor: '#0f172a' }}>
        {imageBlobUrl ? (
          <img
            src={imageBlobUrl}
            alt={image.description || 'Image'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onError={handleImageError}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0'
          }}>
            {isLoading ? (
              <div style={{
                width: '30px',
                height: '30px',
                border: '3px solid #e0e0e0',
                borderTop: '3px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <span style={{ color: '#999' }}>Failed to load</span>
            )}
          </div>
        )}

        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'rgba(231, 76, 60, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(231, 76, 60, 1)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(231, 76, 60, 0.9)'
            }}
          >
            ×
          </button>
        )}
      </div>

      <div style={{
        padding: '14px 16px 16px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: '#fff'
      }}>
        {image.description && (
          <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>{image.description}</p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleToggleLike}
            disabled={likeLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: likedByCurrentUser ? '#e74c3c' : '#888',
              fontWeight: likedByCurrentUser ? 600 : 500,
              transition: 'color 0.2s ease'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={likedByCurrentUser ? '#e74c3c' : 'none'} stroke={likedByCurrentUser ? '#e74c3c' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span style={{ fontSize: '13px' }}>{likesCount}</span>
          </button>

          <button
            onClick={handleCommentsOpen}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#0d6efd',
              fontWeight: 500
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span style={{ fontSize: '13px' }}>{commentsCount}</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default ImageCard
