import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { login } from '../store/authSlice'

function Login() {
  const dispatch = useDispatch()
  const { token, status, error } = useSelector((s) => s.auth)
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (token) {
      window.location.href = '/images'
    }
  }, [token])

  const onSubmit = (e) => {
    e.preventDefault()
    dispatch(login({ usernameOrEmail, password }))
  }

  return (
    <div style={{ maxWidth: 360, margin: '40px auto' }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Username or Email</label>
          <input value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} type="text" required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required style={{ width: '100%' }} />
        </div>
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p style={{ marginTop: 12 }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}

export default Login

