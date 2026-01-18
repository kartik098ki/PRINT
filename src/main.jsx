import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { OrderProvider } from './context/OrderContext';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <OrderProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </OrderProvider>
    </AuthProvider>
  </StrictMode>,
)
