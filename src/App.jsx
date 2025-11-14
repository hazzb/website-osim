// src/App.jsx
// --- VERSI LENGKAP (Termasuk Rute Kelola Jabatan) ---

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Impor Navbar & Komponen Utama
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'; 

// === Impor Halaman Publik ===
import Beranda from './pages/Beranda';
import DaftarAnggota from './pages/DaftarAnggota';
import ProgramKerja from './pages/ProgramKerja';
import VisiMisi from './pages/VisiMisi';
import LoginPage from './pages/LoginPage';

// === Impor Halaman Admin ===
import DashboardAdmin from './pages/DashboardAdmin';
import EditVisiMisi from './pages/EditVisiMisi';
import Pengaturan from './pages/Pengaturan';

// Rute Fondasi (Periode, Divisi, Jabatan)
import KelolaPeriode from './pages/KelolaPeriode'; 
import TambahPeriode from './pages/TambahPeriode';
import KelolaDivisi from './pages/KelolaDivisi';
import TambahDivisi from './pages/TambahDivisi';
import KelolaJabatan from './pages/KelolaJabatan';
import TambahJabatan from './pages/TambahJabatan';
import EditJabatan from './pages/EditJabatan';

// Rute Anggota (Sudah diperbaiki)
import KelolaAnggota from './pages/KelolaAnggota';
import TambahAnggota from './pages/TambahAnggota';
import EditAnggota from './pages/EditAnggota';

// Rute Program Kerja (Masih rusak)
import KelolaProgramKerja from './pages/KelolaProgramKerja';
import TambahProgramKerja from './pages/TambahProgramKerja';
import EditProgramKerja from './pages/EditProgramKerja';


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
            
            {/* Rute Pengaturan & Konten */}
            <Route path="/admin/edit-visi-misi" element={<EditVisiMisi />} />
            <Route path="/admin/pengaturan" element={<Pengaturan />} />

            {/* Rute Fondasi (Periode, Divisi, Jabatan) */}
            <Route path="/admin/kelola-periode" element={<KelolaPeriode />} />
            <Route path="/admin/periode/tambah" element={<TambahPeriode />} />
            <Route path="/admin/kelola-divisi" element={<KelolaDivisi />} /> 
            <Route path="/admin/divisi/tambah" element={<TambahDivisi />} />
            <Route path="/admin/kelola-jabatan" element={<KelolaJabatan />} />
            <Route path="/admin/jabatan/tambah" element={<TambahJabatan />} />
            <Route path="/admin/jabatan/edit/:id" element={<EditJabatan />} />

            {/* Rute Anggota */}
            <Route path="/admin/kelola-anggota" element={<KelolaAnggota />} />
            <Route path="/admin/anggota/tambah" element={<TambahAnggota />} />
            <Route path="/admin/anggota/edit/:id" element={<EditAnggota />} />
            
            {/* Rute Program Kerja (Masih perlu perbaikan) */}
            <Route path="/admin/kelola-program-kerja" element={<KelolaProgramKerja />} />
            <Route path="/admin/program-kerja/tambah" element={<TambahProgramKerja />} />
            <Route path="/admin/program-kerja/edit/:id" element={<EditProgramKerja />} />
          </Route>
          
          {/* Rute 'catch-all' */}
          <Route path="*" element={<div><h2>404: Halaman Tidak Ditemukan</h2></div>} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;