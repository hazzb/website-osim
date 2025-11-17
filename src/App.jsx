// src/App.jsx
// --- VERSI 3.0 (Kembali ke Struktur Global Navbar) ---

import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

// Impor Komponen
import Navbar from './components/Navbar.jsx'; // Navbar global kita
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Impor Halaman Publik
import Beranda from './pages/Beranda.jsx';
import VisiMisi from './pages/VisiMisi.jsx';
import DaftarAnggota from './pages/DaftarAnggota.jsx';
import ProgramKerja from './pages/ProgramKerja.jsx';
import ProgramKerjaDetail from './pages/ProgramKerjaDetail.jsx';
import LoginPage from './pages/LoginPage.jsx';

// Impor Halaman Admin
import DashboardAdmin from './pages/DashboardAdmin.jsx';
import KelolaAnggota from './pages/KelolaAnggota.jsx';
import TambahAnggota from './pages/TambahAnggota.jsx';
import EditAnggota from './pages/EditAnggota.jsx';
import KelolaProgramKerja from './pages/KelolaProgramKerja.jsx';
import TambahProgramKerja from './pages/TambahProgramKerja.jsx';
import EditProgramKerja from './pages/EditProgramKerja.jsx';
import KelolaDivisi from './pages/KelolaDivisi.jsx';
import TambahDivisi from './pages/TambahDivisi.jsx';
import EditDivisi from './pages/EditDivisi.jsx';
import KelolaJabatan from './pages/KelolaJabatan.jsx';
import TambahJabatan from './pages/TambahJabatan.jsx';
import EditJabatan from './pages/EditJabatan.jsx';
import KelolaPeriode from './pages/KelolaPeriode.jsx';
import TambahPeriode from './pages/TambahPeriode.jsx';
import EditPeriode from './pages/EditPeriode.jsx';
import Pengaturan from './pages/Pengaturan.jsx';
import EditVisiMisi from './pages/EditVisiMisi.jsx';

function App() {
  return (
    <BrowserRouter>
      {/* Navbar sekarang ada di luar Routes, berlaku global */}
      <Navbar />
      
      <Routes>
        {/* --- RUTE PUBLIK --- */}
        {/* Konten akan dirender di bawah Navbar */}
        <Route path="/" element={<Beranda />} />
        <Route path="visi-misi" element={<VisiMisi />} />
        <Route path="anggota" element={<DaftarAnggota />} />
        <Route path="program-kerja" element={<ProgramKerja />} />
        <Route path="program-kerja/:id" element={<ProgramKerjaDetail />} />
        <Route path="/login" element={<LoginPage />} />

        {/* --- RUTE ADMIN --- */}
        {/* Konten juga akan dirender di bawah Navbar */}
        <Route
          path="/admin"
          element={<ProtectedRoute />}
        >
          {/* Arahkan /admin ke /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAdmin />} />
          
          <Route path="anggota" element={<KelolaAnggota />} />
          <Route path="anggota/tambah" element={<TambahAnggota />} />
          <Route path="anggota/edit/:id" element={<EditAnggota />} />
          
          <Route path="program-kerja" element={<KelolaProgramKerja />} />
          <Route path="program-kerja/tambah" element={<TambahProgramKerja />} />
          <Route path="program-kerja/edit/:id" element={<EditProgramKerja />} />
          
          <Route path="divisi" element={<KelolaDivisi />} />
          <Route path="divisi/tambah" element={<TambahDivisi />} />
          <Route path="divisi/edit/:id" element={<EditDivisi />} />
          
          <Route path="jabatan" element={<KelolaJabatan />} />
          <Route path="jabatan/tambah" element={<TambahJabatan />} />
          <Route path="jabatan/edit/:id" element={<EditJabatan />} />
          
          <Route path="periode" element={<KelolaPeriode />} />
          <Route path="periode/tambah" element={<TambahPeriode />} />
          <Route path="periode/edit/:id" element={<EditPeriode />} />
          
          <Route path="pengaturan" element={<Pengaturan />} />
          <Route path="visi-misi/edit" element={<EditVisiMisi />} />
        </Route>
        
        {/* Rute 404 */}
        <Route path="*" element={
          <div className="main-content" style={{ textAlign: 'center' }}>
            <h2>404: Halaman Tidak Ditemukan</h2>
            <Link to="/">Kembali ke Beranda</Link>
          </div>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;