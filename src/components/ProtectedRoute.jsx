// src/components/ProtectedRoute.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';

// Navigate: komponen untuk "menendang" (redirect) pengguna
// Outlet:   placeholder untuk halaman yang kita proteksi (misal: Dashboard)
import { Navigate, Outlet } from 'react-router-dom';

/*
* Dokumentasi Komponen 'ProtectedRoute':
* Ini adalah penjaga pintu.
* 1. Ia memeriksa 'session' dari 'useAuth()'.
* 2. Jika TIDAK ADA 'session' (session === null),
* ia akan me-render komponen <Navigate>,
* mengarahkan pengguna ke "/login" dan 'mengganti' riwayat
* (agar pengguna tidak bisa klik "back" kembali ke admin).
* 3. Jika ADA 'session',
* ia akan me-render <Outlet />, yang merupakan
* halaman admin yang kita inginkan (misal: <DashboardAdmin />).
*/
function ProtectedRoute() {
  const { session } = useAuth();

  if (!session) {
    // Pengguna tidak login, tendang ke halaman login
    return <Navigate to="/login" replace />;
  }

  // Pengguna sudah login, izinkan masuk (tampilkan halaman)
  return <Outlet />;
}

export default ProtectedRoute;