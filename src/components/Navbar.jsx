// src/components/Navbar.jsx
// --- VERSI RESPONSIVE (Hamburger Menu) ---

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import styles from './Navbar.module.css'; // Impor CSS Module Baru

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State untuk menu mobile
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsOpen(false); // Tutup menu setelah logout
      navigate('/login');
    } catch (error) {
      alert(`Gagal Logout: ${error.message}`);
    }
  };

  // Fungsi untuk menutup menu saat link diklik
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        
        {/* 1. LOGO */}
        <div className={styles.brand}>
          <Link to="/" onClick={closeMenu}>OSIM APP</Link>
        </div>

        {/* 2. TOMBOL HAMBURGER (Hanya muncul di HP) */}
        <button 
          className={styles.hamburger} 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* 3. MENU LINKS */}
        {/* Tambahkan class 'active' jika isOpen true */}
        <div className={`${styles.links} ${isOpen ? styles.active : ''}`}>
          
          <Link to="/" className={styles.link} onClick={closeMenu}>
            Beranda
          </Link>
          <Link to="/visi-misi" className={styles.link} onClick={closeMenu}>
            Visi Misi
          </Link>
          <Link to="/anggota" className={styles.link} onClick={closeMenu}>
            Anggota
          </Link>
          <Link to="/program-kerja" className={styles.link} onClick={closeMenu}>
            Program Kerja
          </Link>
          
          {/* Logika Login/Logout */}
          {user ? (
            <>
              <Link to="/admin/dashboard" className={`${styles.link} ${styles.adminLink}`} onClick={closeMenu}>
                Dashboard
              </Link>
              
              <span className={styles.separator}></span>
              
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <span className={styles.separator}></span>
              <Link to="/login" className={styles.link} onClick={closeMenu}>
                Login
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;