// src/components/Navbar.jsx
// --- VERSI 5.0 (Refaktor CSS Murni) ---

import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Kita tidak lagi mengimpor dari Chakra UI

function Navbar() {
  const { session, signOut } = useAuth();
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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-brand">
          <RouterLink to="/">
            OSIM Website
          </RouterLink>
        </h1>
        
        <div className="navbar-spacer"></div>

        <div className="navbar-links">
          <RouterLink to="/" className="navbar-link">
            Beranda
          </RouterLink>
          <RouterLink to="/visi-misi" className="navbar-link">
            Visi Misi
          </RouterLink>
          <RouterLink to="/anggota" className="navbar-link">
            Anggota
          </RouterLink>
          <RouterLink to="/program-kerja" className="navbar-link">
            Program Kerja
          </RouterLink>
          {session && (
            <RouterLink to="/admin/dashboard" className="navbar-link admin-link">
              ADMIN DASHBOARD
            </RouterLink>
          )}
        </div>

        <div className="navbar-spacer"></div>

        <div className="navbar-actions">
          {session ? (
            <button
              onClick={handleLogout}
              className="button button-danger"
            >
              Logout
            </button>
          ) : (
            <RouterLink
              to="/login"
              className="button button-primary"
            >
              Login Admin
            </RouterLink>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;