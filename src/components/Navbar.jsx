// src/components/Navbar.jsx
// --- VERSI 3.2 (Perbaikan Navbar - Menghapus 'hidden') ---

import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  const navLinkClass = "font-bold text-gray-600 hover:text-blue-500 hover:underline";
  
  const buttonClass = "px-3 py-1.5 text-sm font-semibold rounded-md shadow-sm";
  const loginButtonClass = `${buttonClass} bg-blue-600 text-white hover:bg-blue-700`;
  const logoutButtonClass = `${buttonClass} bg-red-600 text-white hover:bg-red-700`;

  return (
    <nav className="flex items-center py-4 px-8 border-b border-gray-200 mb-6">
      
      {/* Judul Website */}
      <div>
        <h1 className="text-2xl font-bold text-blue-600">
          <RouterLink to="/" className="hover:no-underline">
            OSIM Website
          </RouterLink>
        </h1>
      </div>
      
      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Link Navigasi (Desktop)
        'hidden md:flex' DIGANTI DENGAN 'flex' agar selalu terlihat
      */}
      <div className="flex gap-6"> 
        <RouterLink to="/" className={navLinkClass}>
          Beranda
        </RouterLink>
        <RouterLink to="/visi-misi" className={navLinkClass}>
          Visi Misi
        </RouterLink>
        <RouterLink to="/anggota" className={navLinkClass}>
          Anggota
        </RouterLink>
        <RouterLink to="/program-kerja" className={navLinkClass}>
          Program Kerja
        </RouterLink>
        {session && (
          <RouterLink to="/admin/dashboard" className={`${navLinkClass} text-red-500`}>
            ADMIN DASHBOARD
          </RouterLink>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Tombol Login/Logout */}
      <div>
        {session ? (
          <button
            onClick={handleLogout}
            className={logoutButtonClass}
          >
            Logout
          </button>
        ) : (
          <RouterLink
            to="/login"
            className={loginButtonClass}
          >
            Login Admin
          </RouterLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;