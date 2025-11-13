// src/pages/DashboardAdmin.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext'; // Kita sapa admin

function DashboardAdmin() {
  const { profile } = useAuth(); // Ambil profil dari context

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9' }}>
      <h2>Selamat Datang di Dashboard Admin OSIM</h2>

      {/* Sapa admin jika profilnya ada */}
      {profile && (
        <h3 style={{ fontWeight: 'normal' }}>
          Halo, <strong>{profile.nama_lengkap}</strong>!
        </h3>
      )}

      <p>Ini adalah halaman admin yang terproteksi.</p>
      <p>Dari sini, Anda akan bisa mengelola data website:</p>
      <ul>
        <li>Mengedit Anggota</li>
        <li>Mengelola Program Kerja</li>
        <li>Mengubah Konten Halaman</li>
      </ul>
    </div>
  );
}

export default DashboardAdmin;