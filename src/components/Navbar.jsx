// src/components/Navbar.jsx

// 'Link' adalah pengganti tag <a> di React Router.
// Ini mencegah halaman me-reload penuh.
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  // Styling sederhana untuk Navbar
  const navStyle = {
    backgroundColor: '#f0f0f0',
    padding: '10px',
    marginBottom: '20px',
    borderBottom: '1px solid #ccc'
  };

  const linkStyle = {
    marginRight: '15px',
    textDecoration: 'none',
    color: '#333',
    fontWeight: 'bold'
  };

  return (
    <nav style={navStyle}>
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

      {/* Kita akan tambahkan link Visi Misi, dll. di sini nanti */}
    </nav>
  );
}

export default Navbar;