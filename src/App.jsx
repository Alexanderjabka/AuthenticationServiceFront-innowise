import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import { useDispatch } from 'react-redux'
import { logout } from './store/authSlice'

function App() {
  const dispatch = useDispatch()
  return (
    <BrowserRouter>
      <div style={{ position: 'fixed', right: 16, top: 12 }}>
        <button onClick={() => dispatch(logout())}>Logout</button>
      </div>
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
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
