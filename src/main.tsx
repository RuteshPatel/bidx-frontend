import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1c1917',
            color: '#f5f5f4',
            border: '1px solid #44403c',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#f97316', secondary: '#1c1917' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#1c1917' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
