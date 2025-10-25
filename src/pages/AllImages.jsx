import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchAllImages, setCurrentPage } from '../store/imageSlice'
import ImageGallery from '../components/ImageGallery'

function AllImages() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { 
    allImages, 
    loading, 
    error, 
    currentPage, 
    totalPages, 
    totalImages 
  } = useSelector((state) => state.images)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    dispatch(fetchAllImages({ page: currentPage, limit: 12 }))
  }, [dispatch, currentPage])

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Search for:', searchQuery)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    // TODO: Implement sorting functionality
    console.log('Sort by:', e.target.value)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Header */}
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

      {/* Search Bar */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 32px auto',
        padding: '0 24px'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="enter user name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#007bff'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#dee2e6'
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#5a6268'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#6c757d'
              }}
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
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
