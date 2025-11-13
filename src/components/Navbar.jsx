// src/components/Navbar.jsx
// --- Versi dengan Link Dashboard ---

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { session, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); 
      navigate('/'); 
    } catch (error) {
      alert(error.message);
    }
  };

  // --- Styling (Tidak berubah) ---
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
  const navContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...navStyle
  };
  const logoutButtonStyle = {
    ...linkStyle,
    color: '#dc3545',
    cursor: 'pointer',
    fontWeight: 'normal',
    marginRight: '0', // Hapus margin kanan
    marginLeft: '10px', // Tambah margin kiri
    border: 'none',
    background: 'none',
    fontFamily: 'inherit',
    fontSize: 'inherit'
  };
  const adminInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    marginRight: '0'
  };
  const adminLinkStyle = {
    ...linkStyle,
    color: '#007bff',
    border: '1px solid #007bff',
    padding: '5px 10px',
    borderRadius: '5px',
    marginRight: '0'
  };
  // Style baru untuk link dashboard, kita pakai ulang 'adminLinkStyle'
  const dashboardLinkStyle = {
    ...adminLinkStyle,
    marginRight: '10px' // Beri jarak ke tombol logout
  };


  return (
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

      {/* Grup Link Kanan (Cek Kondisi) */}
      <div style={adminInfoStyle}>
        
        {session ? (
          // Jika ADA Sesi (sudah login):
          <>
            <span style={{ marginRight: '10px', color: '#555' }}>
              Halo, {profile ? profile.nama_lengkap : session.user.email}
            </span>
            
            {/* --- LINK BARU KITA --- */}
            <Link to="/admin/dashboard" style={dashboardLinkStyle}>
              Dashboard
            </Link>

            <button onClick={handleLogout} style={logoutButtonStyle}>
              Logout
            </button>
          </>
        ) : (
          // Jika TIDAK ADA Sesi (belum login):
          <Link to="/login" style={adminLinkStyle}>
            Login Admin
          </Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;