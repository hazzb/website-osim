import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // 1. TAHAP LOADING (PENTING!)
  // Jika AuthContext masih sibuk mengecek sesi ke Supabase,
  // kita TAHAN dulu. Jangan redirect, jangan render konten.
  // Tampilkan indikator loading sederhana.
  if (loading) {
    return (
      <div className="main-content" style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p className="loading-text">Memeriksa izin akses...</p>
      </div>
    );
  }

  // 2. TAHAP PENGECEKAN
  // Jika loading sudah selesai (false), tapi user masih null (tidak ada),
  // berarti pengguna memang belum login. Tendang ke /login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. TAHAP AKSES DITERIMA
  // Jika loading selesai dan user ada, izinkan masuk ke rute anak (Outlet).
  return <Outlet />;
};

export default ProtectedRoute;