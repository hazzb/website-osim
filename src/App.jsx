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

// --- IMPOR BARU ---
import ProtectedRoute from './components/ProtectedRoute'; // 1. Impor si Penjaga
import DashboardAdmin from './pages/DashboardAdmin'; // 2. Impor Lobi Admin

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
          {/* Ini adalah cara kerjanya:
            React Router akan mencocokkan <ProtectedRoute /> dulu.
            Si penjaga (ProtectedRoute) akan cek login.
            Jika lolos, dia akan render <Outlet />, 
            yang kemudian akan diisi oleh <DashboardAdmin />.
          */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
            {/* Nanti, semua halaman admin lain kita taruh di sini:
              <Route path="/admin/edit-anggota" element={<EditAnggota />} />
              <Route path="/admin/edit-progja" element={<EditProgja />} />
            */}
          </Route>

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;