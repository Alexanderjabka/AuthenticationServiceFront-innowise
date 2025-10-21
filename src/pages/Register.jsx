import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { register, logout } from '../store/authSlice'

function Register() {
  const dispatch = useDispatch()
  const { status, error } = useSelector((s) => s.auth)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (status === 'succeeded') {
      dispatch(logout())
      window.location.href = import.meta.env.VITE_REGISTER_REDIRECT_URL || 'http://localhost:8086/login'
    }
  }, [status, dispatch])

  const onSubmit = (e) => {
    e.preventDefault()
    if (password.length < 6) {
      return
    }
    dispatch(register({ email, username, password }))
  }

  return (
    <div style={{ maxWidth: 360, margin: '40px auto' }}>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} style={{ width: '100%' }} />
        </div>
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating...' : 'Create account'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p style={{ marginTop: 12 }}>
        Have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  )
}

export default Register

