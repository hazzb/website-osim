// src/components/Breadcrumbs.jsx
// --- KOMPONEN BARU ---

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.css'; // Kita akan buat file style-nya

// Peta untuk menerjemahkan path URL ke nama yang mudah dibaca
const breadcrumbNameMap = {
  'anggota': 'Anggota',
  'program-kerja': 'Program Kerja',
  'visi-misi': 'Visi & Misi',
  'divisi': 'Detail Divisi',
  'admin': 'Admin',
  'dashboard': 'Dashboard',
  'tambah': 'Tambah',
  'edit': 'Edit',
  // Tambahkan path admin lain jika perlu
  'kelola-anggota': 'Kelola Anggota', 
  'kelola-program-kerja': 'Kelola Program Kerja',
  'kelola-divisi': 'Kelola Divisi',
};

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x); // Pecah URL

  // Jangan tampilkan di Halaman Beranda
  if (pathnames.length === 0) {
    return null;
  }

  return (
    // Kita gunakan class 'main-content' global agar posisinya selaras
    <div className="main-content" style={{ paddingTop: 0, paddingBottom: 0, marginBottom: '-1.5rem' }}>
      <nav className={styles.breadcrumb} aria-label="breadcrumbs">
        <ol>
          <li><Link to="/">Home</Link></li>
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            
            // Cek apakah 'value' adalah angka (seperti ID)
            const isDynamic = !isNaN(Number(value)); 
            
            // Tentukan nama
            let name = breadcrumbNameMap[value];
            if (isDynamic) {
              name = "Detail"; // Untuk path seperti /program-kerja/123
            } else if (!name) {
              name = value.charAt(0).toUpperCase() + value.slice(1); // Kapitalisasi
            }

            return (
              <li key={to}>
                {last ? (
                  <span aria-current="page">{name}</span>
                ) : (
                  <Link to={to}>{name}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

export default Breadcrumbs;