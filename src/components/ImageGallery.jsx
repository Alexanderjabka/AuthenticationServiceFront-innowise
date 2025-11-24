import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ImageCard from './ImageCard'
import Pagination from './Pagination'
import api from '../services/api'
import { updateImageCommentsCount } from '../store/imageSlice'
import { getUserFromToken } from '../utils/jwt'

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
  const dispatch = useDispatch()
  const [selectedImage, setSelectedImage] = useState(null)
  const [modalImageUrl, setModalImageUrl] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalComments, setModalComments] = useState([])
  const [modalCommentsLoading, setModalCommentsLoading] = useState(false)
  const [modalCommentsError, setModalCommentsError] = useState(null)
  const [modalCommentText, setModalCommentText] = useState('')
  const [modalEditingId, setModalEditingId] = useState(null)
  const [modalSubmitting, setModalSubmitting] = useState(false)
  const token = useSelector((state) => state.auth.token)
  const currentUser = useMemo(() => getUserFromToken(token), [token])
  const currentUserId = currentUser?.id

  const syncCommentsCount = useCallback((imageId, count) => {
    dispatch(updateImageCommentsCount({ imageId, commentsCount: count }))
  }, [dispatch])

  const resetModalState = useCallback(() => {
    setModalComments([])
    setModalCommentsError(null)
    setModalCommentText('')
    setModalEditingId(null)
    setModalSubmitting(false)
  }, [])

  const handleImageClick = (image) => {
    resetModalState()
    setSelectedImage(image)
    if (onImageClick) {
      onImageClick(image)
    }
  }

  const closeModal = useCallback(() => {
    if (modalImageUrl) {
      URL.revokeObjectURL(modalImageUrl)
    }
    resetModalState()
    setModalImageUrl(null)
    setSelectedImage(null)
  }, [modalImageUrl, resetModalState])

  useEffect(() => {
    if (!selectedImage?.contentUrl) {
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
  }, [selectedImage?.contentUrl])

  useEffect(() => {
    if (!selectedImage?.id) {
      return undefined
    }

    let isMounted = true
    setModalComments([])
    setModalCommentText('')
    setModalEditingId(null)
    setModalCommentsError(null)

    const loadComments = async () => {
      setModalCommentsLoading(true)
      try {
        const { data } = await api.get(`/images/${selectedImage.id}/comments`)
        if (!isMounted) return
        setModalComments(data)
        syncCommentsCount(selectedImage.id, data.length)
      } catch (error) {
        if (!isMounted) return
        const message = error.response?.data?.message || 'Failed to load comments'
        setModalCommentsError(message)
      } finally {
        if (isMounted) {
          setModalCommentsLoading(false)
        }
      }
    }

    loadComments()

    return () => {
      isMounted = false
    }
  }, [selectedImage?.id, syncCommentsCount])

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

  const handleModalCommentSubmit = async (e) => {
    e.preventDefault()
    if (!selectedImage?.id) return
    if (!modalCommentText.trim()) {
      setModalCommentsError('Comment cannot be empty')
      return
    }
    setModalSubmitting(true)
    setModalCommentsError(null)
    try {
      if (modalEditingId) {
        const { data } = await api.put(`/images/${selectedImage.id}/comments/${modalEditingId}`, { text: modalCommentText.trim() })
        setModalComments((prev) => {
          const next = prev.map((comment) => (comment.id === modalEditingId ? data : comment))
          syncCommentsCount(selectedImage.id, next.length)
          return next
        })
      } else {
        const { data } = await api.post(`/images/${selectedImage.id}/comments`, { text: modalCommentText.trim() })
        setModalComments((prev) => {
          const next = [...prev, data]
          syncCommentsCount(selectedImage.id, next.length)
          return next
        })
      }
      setModalCommentText('')
      setModalEditingId(null)
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit comment'
      setModalCommentsError(message)
    } finally {
      setModalSubmitting(false)
    }
  }

  const handleModalEditComment = (comment) => {
    setModalEditingId(comment.id)
    setModalCommentText(comment.text)
  }

  const handleModalDeleteComment = async (commentId) => {
    if (!selectedImage?.id) return
    setModalCommentsError(null)
    try {
      await api.delete(`/images/${selectedImage.id}/comments/${commentId}`)
      setModalComments((prev) => {
        const next = prev.filter((comment) => comment.id !== commentId)
        syncCommentsCount(selectedImage.id, next.length)
        return next
      })
      if (modalEditingId === commentId) {
        setModalEditingId(null)
        setModalCommentText('')
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete comment'
      setModalCommentsError(message)
    }
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
            width: '240px',
            minWidth: '220px',
            maxWidth: '260px'
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
              width: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              gap: '0',
              alignItems: 'stretch',
              backgroundColor: '#fff',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.35)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                flex: '2',
                backgroundColor: '#0f172a',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh'
              }}
            >
              {modalLoading || !modalImageUrl ? (
                <div style={{
                  width: '100%',
                  minHeight: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                  }}
                />
              )}
            </div>

            <div
              style={{
                flex: '1',
                backgroundColor: '#fff',
                borderLeft: '1px solid #e2e8f0',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '80vh',
                minWidth: '360px'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '20px' }}>
                  Comments ({modalComments.length})
                </h3>
                {selectedImage?.description && (
                  <p style={{ margin: '4px 0 0', color: '#6c757d', fontSize: '13px' }}>
                    {selectedImage.description}
                  </p>
                )}
              </div>

              <form onSubmit={handleModalCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <textarea
                  value={modalCommentText}
                  onChange={(e) => setModalCommentText(e.target.value)}
                  placeholder={modalEditingId ? 'Edit your comment' : 'Add a comment'}
                  style={{
                    width: '100%',
                    minHeight: '70px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  {modalEditingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setModalEditingId(null)
                        setModalCommentText('')
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6c757d',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Cancel edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    style={{
                      backgroundColor: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 18px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {modalEditingId ? 'Update' : 'Comment'}
                  </button>
                </div>
              </form>

              {modalCommentsError && (
                <p style={{ color: '#e74c3c', fontSize: '13px', marginTop: '8px' }}>{modalCommentsError}</p>
              )}

              <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px', overflowY: 'auto', flex: 1 }}>
                {modalCommentsLoading ? (
                  <p style={{ fontSize: '14px', color: '#555' }}>Loading comments...</p>
                ) : modalComments.length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#777' }}>No comments yet. Be the first to leave one!</p>
                ) : (
                  modalComments.map((comment) => (
                    <div
                      key={comment.id}
                      style={{
                        border: '1px solid #f1f1f1',
                        borderRadius: '8px',
                        padding: '10px',
                        marginBottom: '10px',
                        backgroundColor: '#fdfdfd'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '14px', color: '#333', display: 'block', textAlign: 'left' }}>{comment.username}</strong>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555', whiteSpace: 'pre-wrap', wordBreak: 'break-word', textAlign: 'left' }}>{comment.text}</p>
                        </div>
                        {comment.userId === currentUserId && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleModalEditComment(comment)}
                              style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleModalDeleteComment(comment.id)}
                              style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
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
