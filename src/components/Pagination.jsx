import { useMemo } from 'react'

function Pagination({ currentPage, totalPages, onPageChange, loading = false }) {
  const pageNumbers = useMemo(() => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
      
      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) {
          pages.push('...')
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...')
        }
        pages.push(totalPages)
      }
    }
    
    return pages
  }, [currentPage, totalPages])

  if (totalPages <= 1) {
    return null
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      marginTop: '32px',
      flexWrap: 'wrap'
    }}>
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        style={{
          padding: '8px 12px',
          backgroundColor: currentPage === 1 ? '#f8f9fa' : '#fff',
          color: currentPage === 1 ? '#6c757d' : '#007bff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          cursor: currentPage === 1 || loading ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 || loading ? 0.6 : 1,
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (currentPage > 1 && !loading) {
            e.target.style.backgroundColor = '#e9ecef'
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage > 1 && !loading) {
            e.target.style.backgroundColor = '#fff'
          }
        }}
      >
        ← Previous
      </button>

      {/* Page numbers */}
      {pageNumbers.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={typeof page !== 'number' || loading}
          style={{
            padding: '8px 12px',
            backgroundColor: page === currentPage ? '#007bff' : '#fff',
            color: page === currentPage ? '#fff' : '#007bff',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: typeof page === 'number' && !loading ? 'pointer' : 'default',
            fontSize: '14px',
            fontWeight: page === currentPage ? '600' : '500',
            minWidth: '40px',
            transition: 'all 0.2s ease',
            opacity: typeof page !== 'number' ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (typeof page === 'number' && page !== currentPage && !loading) {
              e.target.style.backgroundColor = '#e9ecef'
            }
          }}
          onMouseLeave={(e) => {
            if (typeof page === 'number' && page !== currentPage && !loading) {
              e.target.style.backgroundColor = '#fff'
            }
          }}
        >
          {page}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        style={{
          padding: '8px 12px',
          backgroundColor: currentPage === totalPages ? '#f8f9fa' : '#fff',
          color: currentPage === totalPages ? '#6c757d' : '#007bff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          cursor: currentPage === totalPages || loading ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages || loading ? 0.6 : 1,
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (currentPage < totalPages && !loading) {
            e.target.style.backgroundColor = '#e9ecef'
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage < totalPages && !loading) {
            e.target.style.backgroundColor = '#fff'
          }
        }}
      >
        Next →
      </button>

      {/* Page info */}
      <div style={{
        marginLeft: '16px',
        fontSize: '14px',
        color: '#6c757d',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span>Page</span>
        <strong>{currentPage}</strong>
        <span>of</span>
        <strong>{totalPages}</strong>
      </div>
    </div>
  )
}

export default Pagination
