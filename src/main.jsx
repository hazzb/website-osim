// src/main.jsx (KODE PERBAIKAN)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Kita tetap mengimpor dan menggunakan AuthProvider (Versi Debug)
import { AuthProvider } from './context/AuthContext.jsx' 

ReactDOM.createRoot(document.getElementById('root')).render(
  // Hapus Tag <React.StrictMode> dari sini
  <AuthProvider>
    <App />
  </AuthProvider>
  // Hapus Tag </React.StrictMode> dari sini
)