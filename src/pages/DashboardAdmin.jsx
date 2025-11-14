// src/pages/DashboardAdmin.jsx
// --- VERSI FINAL (Semua Link Aktif) ---

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

function DashboardAdmin() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      alert('Anda telah logout.');
      navigate('/login'); 
    } catch (error) {
      alert('Gagal logout: ' + error.message);
    }
  };

  // --- Styling ---
  const dashboardStyle = {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px'
  };
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '10px'
  };
  const logoutButtonStyle = {
    padding: '8px 15px',
    fontSize: '0.9em',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  };
  const listStyle = {
    listStyleType: 'none',
    padding: 0,
    marginTop: '20px'
  };
  const linkStyle = {
    display: 'block',
    padding: '15px',
    margin: '10px 0',
    backgroundColor: '#f9f9f9',
    color: '#333',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    border: '1px solid #eee'
  };
  const sectionTitleStyle = {
    marginTop: '20px',
    marginBottom: '0px',
    fontSize: '0.9em',
    color: '#777',
    textTransform: 'uppercase'
  };

  return (
    <div style={dashboardStyle}>
      <div style={headerStyle}>
        <h2>Dashboard Admin</h2>
        <button style={logoutButtonStyle} onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <p>Selamat datang, Admin. Silakan kelola konten website dari menu di bawah ini.</p>

      <ul style={listStyle}>
        
        {/* === FONDASI & STRUKTUR === */}
        <h3 style={sectionTitleStyle}>Fondasi & Struktur</h3>
        <li>
          <Link to="/admin/kelola-periode" style={{...linkStyle, color: '#007bff', border: '1px solid #007bff'}}>
            Kelola Periode Jabatan (Panel Kontrol Utama)
          </Link>
        </li>
        <li>
          <Link to="/admin/kelola-divisi" style={linkStyle}>
            Kelola Divisi
          </Link>
        </li>
        <li>
          <Link to="/admin/kelola-jabatan" style={linkStyle}>
            Kelola Master Jabatan
          </Link>
        </li>

        {/* === MANAJEMEN KONTEN === */}
        <h3 style={sectionTitleStyle}>Manajemen Konten</h3>
        <li>
          <Link to="/admin/kelola-anggota" style={{...linkStyle, borderLeft: '3px solid #28a745'}}>
            Kelola Anggota
          </Link>
        </li>
        <li>
          <Link to="/admin/kelola-program-kerja" style={{...linkStyle, borderLeft: '3px solid #28a745'}}>
            Kelola Program Kerja
          </Link>
        </li>
        
        {/* === PENGATURAN === */}
        <h3 style={sectionTitleStyle}>Pengaturan & Halaman Statis</h3>
        <li>
          <Link to="/admin/edit-visi-misi" style={linkStyle}>
            Edit Visi & Misi
          </Link>
        </li>
        <li>
          <Link to="/admin/pengaturan" style={{...linkStyle, color: '#663399'}}>
            Pengaturan Tampilan Website
          </Link>
        </li>
        
      </ul>
    </div>
  );
}

export default DashboardAdmin;