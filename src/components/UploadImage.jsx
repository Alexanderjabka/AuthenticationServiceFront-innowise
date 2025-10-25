import { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { uploadImage } from '../store/imageSlice'

function UploadImage({ onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const dispatch = useDispatch()

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      await dispatch(uploadImage(selectedFile)).unwrap()
      
      // Reset form
      setSelectedFile(null)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      if (onUploadSuccess) {
        onUploadSuccess()
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed: ' + (error.message || 'Unknown error'))
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div style={{
      backgroundColor: 'white',
      border: '2px dashed transparent',
      borderRadius: '8px',
      padding: '24px',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      borderColor: dragActive ? '#007bff' : 'transparent',
      backgroundColor: dragActive ? '#e3f2fd' : 'white'
    }}
    onDragEnter={handleDrag}
    onDragLeave={handleDrag}
    onDragOver={handleDrag}
    onDrop={handleDrop}
    >
      {!selectedFile ? (
        <>
          <div style={{
            fontSize: '48px',
            color: '#6c757d',
            marginBottom: '16px'
          }}>
            📁
          </div>
          
          <h3 style={{
            margin: '0 0 8px 0',
            color: '#495057',
            fontSize: '18px'
          }}>
            {dragActive ? 'Drop your image here' : 'Upload an image'}
          </h3>
          
          <p style={{
            margin: '0 0 16px 0',
            color: '#6c757d',
            fontSize: '14px'
          }}>
            Drag and drop an image file here, or click to select
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              backgroundColor: '#007bff',
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
              e.target.style.backgroundColor = '#0056b3'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#007bff'
            }}
          >
            Choose File
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          
          <p style={{
            margin: '16px 0 0 0',
            fontSize: '12px',
            color: '#6c757d'
          }}>
            Supported formats: JPG, PNG, GIF, WebP (Max 10MB)
          </p>
        </>
      ) : (
        <div>
          <div style={{
            marginBottom: '16px'
          }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                objectFit: 'cover',
                borderRadius: '4px',
                border: '1px solid #dee2e6'
              }}
            />
          </div>
          
          <p style={{
            margin: '0 0 16px 0',
            color: '#495057',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{
                backgroundColor: uploading ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 20px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: uploading ? 0.6 : 1
              }}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={uploading}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 20px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
          </div>
          
          {uploading && (
            <div style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #e0e0e0',
              borderTop: '2px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
              <span style={{ fontSize: '14px', color: '#6c757d' }}>
                Uploading image...
              </span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default UploadImage
