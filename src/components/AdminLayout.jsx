// src/components/AdminLayout.jsx
// --- VERSI 2.0 (Refaktor CSS Murni) ---

import React from 'react';
import { Outlet } from 'react-router-dom';
// Pastikan path impor Sidebar sudah benar
import Sidebar from './admin/Sidebar.jsx';

function AdminLayout() {
  return (
    // Ini adalah wrapper utama admin layout
    <div className="admin-layout">
      
      {/* 1. Sidebar Navigasi */}
      <Sidebar />

      {/* 2. Konten Halaman Admin (Dashboard, Form, dll) */}
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;