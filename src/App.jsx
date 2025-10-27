import './App.css'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import AllImages from './pages/AllImages'
import MyImages from './pages/MyImages'
import { useDispatch } from 'react-redux'
import { logout } from './store/authSlice'

function LogoutButton() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }
  
  return (
    <div style={{ position: 'fixed', right: 16, top: 12 }}>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

function AppContent() {
  const location = useLocation()
  
  // Показываем кнопку logout только на страницах my-images и images
  const shouldShowLogout = location.pathname === '/my-images' || location.pathname === '/images'
  
  return (
    <>
      {shouldShowLogout && <LogoutButton />}
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <div style={{ padding: 24 }}>
                <h2>Protected Home</h2>
                <p>You are authenticated.</p>
              </div>
            }
          />
          <Route path="/my-images" element={<MyImages />} />
        </Route>
        <Route path="/images" element={<AllImages />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
