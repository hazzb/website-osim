// src/components/Navbar.jsx

// 'Link' adalah pengganti tag <a> di React Router.
// Ini mencegah halaman me-reload penuh.
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  
  // --- Definisi Styling (CSS-in-JS) ---

  // Style dasar untuk navigasi (digunakan di dalam container)
  const navStyle = {
    backgroundColor: '#f0f0f0',
    padding: '10px',
    marginBottom: '20px',
    borderBottom: '1px solid #ccc'
  };

  // Style untuk link navigasi standar (kiri)
  const linkStyle = {
    marginRight: '15px',
    textDecoration: 'none',
    color: '#333',
    fontWeight: 'bold'
  };

  // 1. Container Utama (pembungkus)
  // Menggunakan Flexbox untuk membagi link menjadi grup kiri dan kanan
  const navContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between', // PENTING: Mendorong grup ke ujung
    alignItems: 'center',
    ...navStyle // Mengambil style dasar (background, padding, dll)
  };

  // 2. Style khusus untuk link Admin (kanan)
  // Mengambil style dasar (margin, decoration, dll) lalu menimpa/menambah
  const adminLinkStyle = {
    ...linkStyle, // Mewarisi style dari linkStyle
    color: '#007bff', // Warna biru agar beda
    border: '1px solid #007bff',
    padding: '5px 10px',
    borderRadius: '5px',
    marginRight: '0' // Tidak perlu margin kanan di item terakhir
  };

  // --- JSX (Struktur HTML) ---
  
  return (
    // Kita gunakan <div> pembungkus baru dengan style 'flex'
    <div style={navContainerStyle}>
      
      {/* Grup Link Kiri (Navigasi Publik) */}
      <div>
        <Link to="/" style={linkStyle}>
          Beranda
        </Link>
        <Link to="/anggota" style={linkStyle}>
          Daftar Anggota
        </Link>
        <Link to="/program-kerja" style={linkStyle}>
          Program Kerja
        </Link>
        <Link to="/visi-misi" style={linkStyle}>
          Visi & Misi
        </Link>
      </div>

      {/* Grup Link Kanan (Navigasi Admin) */}
      <div>
        <Link to="/login" style={adminLinkStyle}>
          Login Admin
        </Link>
      </div>
    </div>
  );
}

export default Navbar;