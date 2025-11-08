import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchUserImages, setCurrentPage } from '../store/imageSlice'
import ImageGallery from '../components/ImageGallery'
import UploadImage from '../components/UploadImage'

function MyImages() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { 
    userImages, 
    loading, 
    error, 
    currentPage, 
    totalPages, 
    totalImages,
    uploadLoading 
  } = useSelector((state) => state.images)
  
  const [showUpload, setShowUpload] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    dispatch(fetchUserImages({ page: currentPage, limit: 10 }))
  }, [dispatch, currentPage])

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUploadSuccess = () => {
    setShowUpload(false)
    dispatch(fetchUserImages({ page: currentPage, limit: 10 }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px 0',
        borderBottom: '1px solid #dee2e6',
        flexShrink: 0
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                margin: '0 0 8px 0',
                fontSize: '32px',
                fontWeight: '700',
                color: '#212529'
              }}>
                My Images
              </h1>
              <p style={{
                margin: 0,
                color: '#6c757d',
                fontSize: '16px'
              }}>
                {totalImages > 0 ? `${totalImages} images` : ''}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Link
                to="/images"
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5a6268'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6c757d'
                }}
              >
                All Images
              </Link>
              
              <button
                onClick={() => setShowUpload(!showUpload)}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#218838'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#28a745'
                }}
              >
                {showUpload ? 'Cancel Upload' : '+ Upload Image'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        gap: '24px'
      }}>
        {showUpload && (
          <div style={{
            flex: '0 0 300px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            height: 'fit-content'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#212529'
            }}>
              Upload New Image
            </h3>
            <UploadImage onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        <div style={{ flex: 1 }}>
          {!showUpload && (
            <ImageGallery
              images={userImages}
              loading={loading}
              error={error}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isOwner={true}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default MyImages
