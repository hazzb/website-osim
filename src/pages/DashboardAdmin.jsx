// src/pages/DashboardAdmin.jsx
// --- VERSI 8.0 (Compact Grid Layout) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import styles from './DashboardAdmin.module.css'; // CSS Module Baru

function DashboardAdmin() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ anggota: 0, progja: 0, divisi: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const { count: cAnggota } = await supabase.from('anggota').select('*', { count: 'exact', head: true });
        const { count: cProgja } = await supabase.from('program_kerja').select('*', { count: 'exact', head: true });
        const { count: cDivisi } = await supabase.from('divisi').select('*', { count: 'exact', head: true });

        setStats({
          anggota: cAnggota || 0,
          progja: cProgja || 0,
          divisi: cDivisi || 0
        });
      } catch (err) {
        console.error("Gagal load stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="main-content">
      
      {/* 1. Header Section (Compact) */}
      <div className={styles['header-section']}>
        <div>
          <h1 className="page-title" style={{marginBottom: '0.25rem'}}>Dashboard</h1>
          <p className={styles['welcome-text']}>Halo, <strong>{user?.email}</strong></p>
        </div>
        <span className={styles['admin-badge']}>Administrator</span>
      </div>

      <div className={styles['dashboard-container']}>
        
        {/* 2. Stats Widgets (Baris Atas) */}
        <div className={styles['stats-grid']}>
          
          {/* Widget Anggota */}
          <Link to="/admin/anggota" className={styles['stat-card']}>
            <div className={styles['stat-info']}>
              <h3>Total Anggota</h3>
              <div className={styles['stat-value']}>{loading ? '-' : stats.anggota}</div>
            </div>
            <div className={`${styles['stat-icon']} ${styles['icon-blue']}`}>👥</div>
          </Link>

          {/* Widget Divisi */}
          <Link to="/admin/divisi" className={styles['stat-card']}>
            <div className={styles['stat-info']}>
              <h3>Total Divisi</h3>
              <div className={styles['stat-value']}>{loading ? '-' : stats.divisi}</div>
            </div>
            <div className={`${styles['stat-icon']} ${styles['icon-purple']}`}>🏢</div>
          </Link>

          {/* Widget Progja */}
          <Link to="/admin/program-kerja" className={styles['stat-card']}>
            <div className={styles['stat-info']}>
              <h3>Program Kerja</h3>
              <div className={styles['stat-value']}>{loading ? '-' : stats.progja}</div>
            </div>
            <div className={`${styles['stat-icon']} ${styles['icon-green']}`}>📅</div>
          </Link>
        
        </div>

        {/* 3. Quick Actions (Tiles Grid) */}
        <div>
          <h2 className={styles['section-title']}>🚀 Akses Cepat</h2>
          <div className={styles['actions-grid']}>
            
            {/* Tile: Anggota */}
            <Link to="/admin/anggota" className={styles['action-tile']}>
              <div className={styles['tile-icon']}>👤</div>
              <div className={styles['tile-label']}>Kelola Anggota</div>
              <div className={styles['tile-sub']}>Data Siswa</div>
            </Link>

            {/* Tile: Program Kerja */}
            <Link to="/admin/program-kerja" className={styles['action-tile']}>
              <div className={styles['tile-icon']}>📝</div>
              <div className={styles['tile-label']}>Program Kerja</div>
              <div className={styles['tile-sub']}>Event & Proyek</div>
            </Link>

             {/* Tile: Divisi */}
             <Link to="/admin/divisi" className={styles['action-tile']}>
              <div className={styles['tile-icon']}>🛡️</div>
              <div className={styles['tile-label']}>Kelola Divisi</div>
              <div className={styles['tile-sub']}>Struktur Organisasi</div>
            </Link>

            {/* Tile: Jabatan */}
            <Link to="/admin/jabatan" className={styles['action-tile']}>
              <div className={styles['tile-icon']}>🥇</div>
              <div className={styles['tile-label']}>Master Jabatan</div>
              <div className={styles['tile-sub']}>Daftar Posisi</div>
            </Link>

            {/* Tile: Periode */}
            <Link to="/admin/periode" className={styles['action-tile']}>
              <div className={styles['tile-icon']}>⏳</div>
              <div className={styles['tile-label']}>Periode</div>
              <div className={styles['tile-sub']}>Tahun Ajaran</div>
            </Link>

            {/* Tile: Visi Misi */}
            <Link to="/admin/visi-misi/edit" className={styles['action-tile']}>
              <div className={styles['tile-icon']}>🎯</div>
              <div className={styles['tile-label']}>Edit Visi Misi</div>
              <div className={styles['tile-sub']}>Halaman Publik</div>
            </Link>

             {/* Tile: Pengaturan */}
             <Link to="/admin/pengaturan" className={styles['action-tile']}>
              <div className={styles['tile-icon']}>⚙️</div>
              <div className={styles['tile-label']}>Pengaturan</div>
              <div className={styles['tile-sub']}>Tampilan Web</div>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardAdmin;