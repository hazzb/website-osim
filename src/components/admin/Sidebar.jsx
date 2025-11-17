// src/components/admin/Sidebar.jsx
// --- VERSI 2.0 (Refaktor CSS Murni) ---

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// Pastikan path impor AuthContext sudah benar
import { useAuth } from '../../context/AuthContext.jsx';

function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      alert(`Gagal Logout: ${error.message}`);
    } else {
      alert('Berhasil Logout');
      navigate('/');
    }
  };

  // Fungsi ini akan otomatis menambahkan class 'active' ke link yang sedang aktif
  const getNavLinkClass = ({ isActive }) => {
    return isActive ? "sidebar-link active" : "sidebar-link";
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-brand">Admin OSIM</h2>
        <p className="sidebar-subtitle">Panel Kontrol</p>
      </div>

      {/* Navigasi Utama */}
      <nav className="sidebar-nav">
        <NavLink to="/admin/dashboard" className={getNavLinkClass}>
          Dashboard
        </NavLink>

        {/* Grup "Kelola Konten" */}
        <p className="sidebar-group-title">Kelola Konten</p>
        <NavLink to="/admin/anggota" className={getNavLinkClass}>
          Kelola Anggota
        </NavLink>
        <NavLink to="/admin/program-kerja" className={getNavLinkClass}>
          Kelola Program Kerja
        </NavLink>
        <NavLink to="/admin/divisi" className={getNavLinkClass}>
          Kelola Divisi
        </NavLink>
        <NavLink to="/admin/jabatan" className={getNavLinkClass}>
          Kelola Jabatan
        </NavLink>
        <NavLink to="/admin/periode" className={getNavLinkClass}>
          Kelola Periode
        </NavLink>
        <NavLink to="/admin/visi-misi/edit" className={getNavLinkClass}>
          Edit Visi Misi
        </NavLink>
        <NavLink to="/admin/pengaturan" className={getNavLinkClass}>
          Pengaturan
        </NavLink>

        {/* Grup "Lihat Halaman Publik" */}
        <p className="sidebar-group-title">Lihat Halaman Publik</p>
        <a href="/anggota" target="_blank" rel="noopener noreferrer" className="sidebar-link">
          Lihat Anggota
        </a>
        <a href="/program-kerja" target="_blank" rel="noopener noreferrer" className="sidebar-link">
          Lihat Program Kerja
        </a>
      </nav>

      {/* Footer (Tombol Logout) */}
      <div className="sidebar-footer">
        <button 
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;