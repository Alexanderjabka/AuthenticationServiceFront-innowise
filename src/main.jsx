import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { store } from './store'
import { initializeTokenRefresh } from './services/tokenRefresh'
import { clearExpiredTokens } from './utils/tokenUtils'

clearExpiredTokens()
initializeTokenRefresh()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
