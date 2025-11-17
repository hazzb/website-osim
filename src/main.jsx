// src/main.jsx
// --- VERSI BERSIH ---

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// --- [INI PERBAIKANNYA] ---
import './index.css'; // Impor file CSS global kita
// --- [AKHIR PERBAIKAN] ---

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);