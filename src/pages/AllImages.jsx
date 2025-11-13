import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchAllImages, setCurrentPage } from '../store/imageSlice'
import ImageGallery from '../components/ImageGallery'

function AllImages() {
  const dispatch = useDispatch()
  const { 
    allImages, 
    loading, 
    error, 
    currentPage, 
    totalPages, 
    totalImages 
  } = useSelector((state) => state.images)
  
  useEffect(() => {
    dispatch(fetchAllImages({ page: currentPage, limit: 10 }))
  }, [dispatch, currentPage])

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px 0',
        borderBottom: '1px solid #dee2e6',
        marginBottom: '32px'
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
                Image Gallery
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
                to="/my-images"
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0056b3'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#007bff'
                }}
              >
                My Images
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
        <ImageGallery
          images={allImages}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isOwner={false}
        />
      </div>

    </div>
  )
}

export default AllImages
