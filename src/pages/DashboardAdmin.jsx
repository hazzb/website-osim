// src/pages/DashboardAdmin.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // <-- 1. IMPOR LINK

function DashboardAdmin() {
  const { profile } = useAuth(); 

  // Style untuk link di dalam list
  const linkStyle = {
    textDecoration: 'none',
    color: '#007bff',
    fontWeight: 'bold'
  };
  const listStyle = {
    listStyleType: 'disc',
    paddingLeft: '20px',
    lineHeight: '1.8'
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9' }}>
      <h2>Selamat Datang di Dashboard Admin OSIM</h2>
      
      {profile && (
        <h3 style={{ fontWeight: 'normal' }}>
          Halo, <strong>{profile.nama_lengkap}</strong>!
        </h3>
      )}

      <p>Dari sini, Anda bisa mengelola data website:</p>
      
      {/* 2. UBAH DAFTAR INI MENJADI LINK */}
      <ul style={listStyle}>
        <li>
          <Link to="/admin/kelola-anggota" style={linkStyle}>
            Kelola Daftar Anggota
          </Link>
        </li>
        <li>
          <span style={{ color: '#888' }}>(Segera) Kelola Program Kerja</span>
        </li>
        <li>
          <span style={{ color: '#888' }}>(Segera) Kelola Konten Halaman</span>
        </li>
      </ul>
    </div>
  );
}

export default DashboardAdmin;