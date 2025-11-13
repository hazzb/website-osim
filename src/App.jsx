// src/App.jsx

import React from 'react';
// 1. Impor komponen-komponen inti dari React Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 2. Impor Navbar dan semua Halaman (Pages) kita
import Navbar from './components/Navbar';
import Beranda from './pages/Beranda';
import DaftarAnggota from './pages/DaftarAnggota';
import ProgramKerja from './pages/ProgramKerja';
import VisiMisi from './pages/VisiMisi';

import LoginPage from './pages/LoginPage';

function App() {
  // 'App' sekarang bertugas sebagai 'Layout' utama
  const appStyle = {
    fontFamily: 'Arial, sans-serif',
    padding: '0 20px'
  };

  return (
    // 3. 'BrowserRouter' membungkus seluruh aplikasi
    //    Ini "mengaktifkan" routing.
    <BrowserRouter>
      <div style={appStyle}>

        {/* 4. Navbar kita letakkan di sini,
            DI LUAR <Routes>, agar ia tampil di *setiap* halaman. */}
        <Navbar />

        {/* 5. 'Routes' adalah "saklar" pintar.
            Ia hanya akan me-render *satu* <Route> yang cocok
            dengan URL saat ini. */}
        <Routes>
          {/* 6. Definisikan setiap rute:
              - path="/" (Beranda) akan me-render komponen <Beranda />
              - path="/anggota" akan me-render <DaftarAnggota />
          */}
          <Route path="/" element={<Beranda />} />
          <Route path="/anggota" element={<DaftarAnggota />} />
          <Route path="/program-kerja" element={<ProgramKerja />} />
          <Route path="/visi-misi" element={<VisiMisi />} />

          <Route path="/login" element={<LoginPage />} />

          {/* Kita akan menambahkan rute /visi-misi, /program-kerja, dll. di sini */}
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;