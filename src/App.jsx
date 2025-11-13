// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Impor Navbar & Halaman Publik
import Navbar from './components/Navbar';
import Beranda from './pages/Beranda';
import DaftarAnggota from './pages/DaftarAnggota';
import ProgramKerja from './pages/ProgramKerja';
import VisiMisi from './pages/VisiMisi';
import LoginPage from './pages/LoginPage';

// Impor Admin
import ProtectedRoute from './components/ProtectedRoute'; 
import DashboardAdmin from './pages/DashboardAdmin';
import KelolaAnggota from './pages/KelolaAnggota';
import TambahAnggota from './pages/TambahAnggota';
import EditAnggota from './pages/EditAnggota'; // <-- 1. IMPOR HALAMAN EDIT

function App() {
  const appStyle = {
    fontFamily: 'Arial, sans-serif',
    padding: '0 20px'
  };

  return (
    <BrowserRouter>
      <div style={appStyle}>
        <Navbar />
        <Routes>
          {/* --- Rute Publik --- */}
          <Route path="/" element={<Beranda />} />
          <Route path="/anggota" element={<DaftarAnggota />} />
          <Route path="/program-kerja" element={<ProgramKerja />} />
          <Route path="/visi-misi" element={<VisiMisi />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* --- Rute Admin yang Diproteksi --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
            <Route path="/admin/kelola-anggota" element={<KelolaAnggota />} />
            <Route path="/admin/anggota/tambah" element={<TambahAnggota />} />
            
            {/* 2. RUTE DINAMIS BARU UNTUK EDIT */}
            <Route path="/admin/anggota/edit/:id" element={<EditAnggota />} />
            
          </Route>

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;