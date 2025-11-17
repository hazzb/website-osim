// src/pages/DashboardAdmin.jsx
// --- VERSI 6.1 (Refaktor CSS Modules) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
// --- [PERUBAHAN 1] ---
import styles from './DashboardAdmin.module.css'; // Impor CSS Module

function DashboardAdmin() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    anggota: 0,
    progja: 0,
    divisi: 0
  });
  const [loading, setLoading] = useState(true);

  // ... (useEffect untuk fetchStats tidak berubah) ...
  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const { count: anggotaCount, error: anggotaError } = await supabase
          .from('anggota')
          .select('*', { count: 'exact', head: true });
        
        const { count: progjaCount, error: progjaError } = await supabase
          .from('program_kerja')
          .select('*', { count: 'exact', head: true });

        const { count: divisiCount, error: divisiError } = await supabase
          .from('divisi')
          .select('*', { count: 'exact', head: true });
        
        if (anggotaError) console.error("Error fetching anggota count:", anggotaError.message);
        if (progjaError) console.error("Error fetching progja count:", progjaError.message);
        if (divisiError) console.error("Error fetching divisi count:", divisiError.message);

        setStats({
          anggota: anggotaCount || 0,
          progja: progjaCount || 0,
          divisi: divisiCount || 0
        });
      } catch (err) {
        console.error("Gagal memuat statistik:", err);
      } finally {
        setLoading(false);
      }
    }
    
    // Kita aktifkan lagi fetchStats()
    fetchStats();

  }, []);

  return (
    // 'main-content' adalah class GLOBAL
    <div className={`main-content ${styles['dashboard-page']}`}>
      {/* 'page-title' adalah class GLOBAL */}
      <h1 className="page-title">Dashboard</h1>
      <p className={styles['page-subtitle']}>
        Selamat datang kembali, 
        <strong className={styles['admin-email']}>{user ? user.email : 'Admin'}</strong>!
      </p>

      {/* Grid Statistik */}
      <div className={styles['dashboard-grid']}>
        {/* 'card' adalah class GLOBAL, 'stat-card' dari MODULE */}
        <div className={`card ${styles['stat-card']}`}>
          <h3 className={styles['stat-title']}>Total Anggota</h3>
          <p className={styles['stat-value']}>{loading ? '...' : stats.anggota}</p>
          {/* 'card-detail-link' adalah class GLOBAL */}
          <Link to="/admin/anggota" className="card-detail-link">
            Kelola Anggota →
          </Link>
        </div>

        <div className={`card ${styles['stat-card']}`}>
          <h3 className={styles['stat-title']}>Total Program Kerja</h3>
          <p className={styles['stat-value']}>{loading ? '...' : stats.progja}</p>
          <Link to="/admin/program-kerja" className="card-detail-link">
            Kelola Progja →
          </Link>
        </div>

        <div className={`card ${styles['stat-card']}`}>
          <h3 className={styles['stat-title']}>Total Divisi</h3>
          <p className={styles['stat-value']}>{loading ? '...' : stats.divisi}</p>
          <Link to="/admin/divisi" className="card-detail-link">
            Kelola Divisi →
          </Link>
        </div>
      </div>
      
      {/* Area Aksi Cepat */}
      <div className={`card ${styles['quick-actions']}`}>
        {/* 'divisi-title' adalah class GLOBAL */}
        <h2 className="divisi-title">Aksi Cepat</h2>
        <div className={styles['quick-actions-grid']}>
          {/* 'button' adalah class GLOBAL */}
          <Link to="/admin/anggota/tambah" className="button button-primary">
            + Tambah Anggota
          </Link>
          <Link to="/admin/program-kerja/tambah" className="button button-primary">
            + Tambah Progja
          </Link>
          <Link to="/admin/divisi/tambah" className="button button-secondary">
            + Tambah Divisi
          </Link>
          <Link to="/admin/pengaturan" className="button button-secondary">
            Pengaturan Website
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;