// src/components/MainLayout.jsx
// --- VERSI 3.0 (Refaktor CSS Murni) ---

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx'; // Impor Navbar versi CSS

function MainLayout() {
  return (
    // 'body' kita di index.css sudah mengatur bg-gray-50
    <div className="app-layout">
      <Navbar />
      <main>
        {/* Konten halaman akan dirender di sini */}
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;