import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { OrderProvider } from './context/OrderContext';

// import { AuthProvider } from './context/AuthContext'; // Replaced by Neon
import { ToastProvider } from './components/Toast';
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react';
import { auth } from './lib/auth';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NeonAuthUIProvider auth={auth}>
      <OrderProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </OrderProvider>
    </NeonAuthUIProvider>
  </StrictMode>,
)
