import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

// --- 1. KOMPONEN GLOBAL ---
import Navbar from './components/Navbar.jsx'; 
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Breadcrumbs from './components/Breadcrumbs.jsx';

// --- 2. HALAMAN PUBLIK ---
import Beranda from './pages/Beranda.jsx';
import VisiMisi from './pages/VisiMisi.jsx';
import DaftarAnggota from './pages/DaftarAnggota.jsx';
import ProgramKerja from './pages/ProgramKerja.jsx';
import ProgramKerjaDetail from './pages/ProgramKerjaDetail.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DivisiDetail from './pages/DivisiDetail.jsx'; 

// --- 3. HALAMAN ADMIN (Sekarang hanya halaman utama) ---
// Kita tidak lagi mengimpor halaman Tambah/Edit terpisah karena sudah pakai Modal
import DashboardAdmin from './pages/DashboardAdmin.jsx';
import KelolaAnggota from './pages/KelolaAnggota.jsx';
import KelolaProgramKerja from './pages/KelolaProgramKerja.jsx';
import KelolaDivisi from './pages/KelolaDivisi.jsx';
import KelolaJabatan from './pages/KelolaJabatan.jsx';
import KelolaPeriode from './pages/KelolaPeriode.jsx';
import Pengaturan from './pages/Pengaturan.jsx';
import EditVisiMisi from './pages/EditVisiMisi.jsx'; // Ini pengecualian, biasanya satu halaman khusus

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Breadcrumbs />
      
      <Routes>
        {/* === RUTE PUBLIK === */}
        <Route path="/" element={<Beranda />} />
        <Route path="visi-misi" element={<VisiMisi />} />
        <Route path="anggota" element={<DaftarAnggota />} />
        <Route path="program-kerja" element={<ProgramKerja />} />
        <Route path="program-kerja/:id" element={<ProgramKerjaDetail />} />
        <Route path="divisi/:id" element={<DivisiDetail />} />
        <Route path="/login" element={<LoginPage />} />

        {/* === RUTE ADMIN (DILINDUNGI) === */}
        <Route path="/admin" element={<ProtectedRoute />}>
          {/* Redirect /admin ke dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<DashboardAdmin />} />
          
          {/* Halaman Kelola (Sudah termasuk fitur Tambah & Edit via Modal) */}
          <Route path="anggota" element={<KelolaAnggota />} />
          <Route path="program-kerja" element={<KelolaProgramKerja />} />
          <Route path="divisi" element={<KelolaDivisi />} />
          <Route path="jabatan" element={<KelolaJabatan />} />
          <Route path="periode" element={<KelolaPeriode />} />
          
          {/* Halaman Pengaturan & Edit Konten Statis */}
          <Route path="pengaturan" element={<Pengaturan />} />
          <Route path="visi-misi/edit" element={<EditVisiMisi />} />
        </Route>
        
        {/* === RUTE 404 NOT FOUND === */}
        <Route path="*" element={
          <div className="main-content" style={{ textAlign: 'center', marginTop: '3rem' }}>
            <h2 className="page-title">404: Halaman Tidak Ditemukan</h2>
            <p className="info-text">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
            <br />
            <Link to="/" className="button button-primary">Kembali ke Beranda</Link>
          </div>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;