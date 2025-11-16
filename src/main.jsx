// src/main.jsx
// --- VERSI 1.1 (Perbaikan: Menambahkan AuthProvider kembali) ---

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Pastikan file CSS Tailwind Anda diimpor
import { AuthProvider } from './context/AuthContext.jsx'; // <-- 1. IMPOR KEMBALI

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. BUNGKUS APLIKASI DENGAN AUTHPROVIDER */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);