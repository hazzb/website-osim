// src/App.jsx
// --- VERSI LENGKAP (Termasuk Rute Progja Detail) ---

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Impor Navbar & Komponen Utama
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'; 

// === Impor Halaman Publik ===
import Beranda from './pages/Beranda';
import DaftarAnggota from './pages/DaftarAnggota';
import ProgramKerja from './pages/ProgramKerja';
import ProgramKerjaDetail from './pages/ProgramKerjaDetail'; // <-- 1. IMPOR BARU
import VisiMisi from './pages/VisiMisi';
import LoginPage from './pages/LoginPage';

// === Impor Halaman Admin ===
import DashboardAdmin from './pages/DashboardAdmin';
import EditVisiMisi from './pages/EditVisiMisi';
import Pengaturan from './pages/Pengaturan';

// Rute Fondasi
import KelolaPeriode from './pages/KelolaPeriode'; 
import TambahPeriode from './pages/TambahPeriode';
import EditPeriode from './pages/EditPeriode';

import KelolaDivisi from './pages/KelolaDivisi';
import TambahDivisi from './pages/TambahDivisi';
import EditDivisi from './pages/EditDivisi';
import KelolaJabatan from './pages/KelolaJabatan';
import TambahJabatan from './pages/TambahJabatan';
import EditJabatan from './pages/EditJabatan';

// Rute Anggota
import KelolaAnggota from './pages/KelolaAnggota';
import TambahAnggota from './pages/TambahAnggota';
import EditAnggota from './pages/EditAnggota';

// Rute Program Kerja
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
          <Route path="/visi-misi" element={<VisiMisi />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* --- Rute Progja Baru --- */}
          <Route path="/program-kerja" element={<ProgramKerja />} />
          <Route path="/program-kerja/:id" element={<ProgramKerjaDetail />} /> {/* <-- 2. RUTE BARU */}

          
          {/* --- Rute Admin yang Diproteksi --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
            
            <Route path="/admin/edit-visi-misi" element={<EditVisiMisi />} />
            <Route path="/admin/pengaturan" element={<Pengaturan />} />

            {/* Rute Fondasi */}
            <Route path="/admin/kelola-periode" element={<KelolaPeriode />} />
            <Route path="/admin/periode/tambah" element={<TambahPeriode />} />
            <Route path="/admin/periode/edit/:id" element={<EditPeriode />} />

            <Route path="/admin/kelola-divisi" element={<KelolaDivisi />} /> 
            <Route path="/admin/divisi/tambah" element={<TambahDivisi />} />
            <Route path="/admin/divisi/edit/:id" element={<EditDivisi />} />

            <Route path="/admin/kelola-jabatan" element={<KelolaJabatan />} />
            <Route path="/admin/jabatan/tambah" element={<TambahJabatan />} />
            <Route path="/admin/jabatan/edit/:id" element={<EditJabatan />} />

            {/* Rute Anggota */}
            <Route path="/admin/kelola-anggota" element={<KelolaAnggota />} />
            <Route path="/admin/anggota/tambah" element={<TambahAnggota />} />
            <Route path="/admin/anggota/edit/:id" element={<EditAnggota />} />
            
            {/* Rute Program Kerja */}
            <Route path="/admin/kelola-program-kerja" element={<KelolaProgramKerja />} />
            <Route path="/admin/program-kerja/tambah" element={<TambahProgramKerja />} />
            <Route path="/admin/program-kerja/edit/:id" element={<EditProgramKerja />} />
          </Route>
          
          <Route path="*" element={<div><h2>404: Halaman Tidak Ditemukan</h2></div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;