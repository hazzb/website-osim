// src/App.jsx
// --- VERSI 3.2 (Menambahkan Breadcrumbs Global) ---

import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

// Impor Komponen
import Navbar from './components/Navbar.jsx'; 
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Breadcrumbs from './components/Breadcrumbs.jsx'; // <-- 1. IMPOR BARU

// Impor Halaman Publik
import Beranda from './pages/Beranda.jsx';
import VisiMisi from './pages/VisiMisi.jsx';
import DaftarAnggota from './pages/DaftarAnggota.jsx';
import ProgramKerja from './pages/ProgramKerja.jsx';
import ProgramKerjaDetail from './pages/ProgramKerjaDetail.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DivisiDetail from './pages/DivisiDetail.jsx'; // (Sudah ada dari langkah sebelumnya)

// Impor Halaman Admin
// ... (semua impor admin Anda) ...
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
   <Navbar />
   <Breadcrumbs /> {/* <-- 2. TAMBAHKAN DI SINI */}
   
   <Routes>
    {/* --- RUTE PUBLIK --- */}
    <Route path="/" element={<Beranda />} />
    <Route path="visi-misi" element={<VisiMisi />} />
    <Route path="anggota" element={<DaftarAnggota />} />
    <Route path="program-kerja" element={<ProgramKerja />} />
    <Route path="program-kerja/:id" element={<ProgramKerjaDetail />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="divisi/:id" element={<DivisiDetail />} />

    {/* --- RUTE ADMIN --- */}
    <Route path="/admin" element={<ProtectedRoute />}>
     {/* ... (sisa rute admin tidak berubah) ... */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAdmin />} />
          <Route path="anggota" element={<KelolaAnggota />} />
          <Route path="anggota/tambah" element={<TambahAnggota />} />
          <Route path="anggota/edit/:id" element={<EditAnggota />} />
          {/* ... (dst) ... */}
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