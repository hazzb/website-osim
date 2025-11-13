// src/pages/DashboardAdmin.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function DashboardAdmin() {
  const { profile } = useAuth(); 

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
      
      <ul style={listStyle}>
        <li>
          <Link to="/admin/kelola-anggota" style={linkStyle}>
            Kelola Daftar Anggota
          </Link>
        </li>
        {/* INI PERUBAHANNYA */}
        <li>
          <Link to="/admin/kelola-program-kerja" style={linkStyle}>
            Kelola Program Kerja
          </Link>
        </li>
        <li>
          <Link to="/admin/edit-visi-misi" style={linkStyle}>
            Kelola Konten Visi & Misi
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default DashboardAdmin;