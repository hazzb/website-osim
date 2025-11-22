import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import styles from './DashboardAdmin.module.css';

// Icons
import { FiUsers, FiCalendar, FiLayers, FiClock, FiTarget, FiSettings } from 'react-icons/fi';

const StatCard = ({ label, value, icon, color }) => (
  <div className={styles.statCard}>
    <div className={`${styles.statIconBox} ${styles[color]}`}>{icon}</div>
    <div className={styles.statInfo}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  </div>
);

const MenuTile = ({ title, icon, to }) => (
  <Link to={to} className={styles.menuTile}>
    <div className={styles.tileIcon}>{icon}</div>
    <span className={styles.tileTitle}>{title}</span>
  </Link>
);

function DashboardAdmin() {
  const [stats, setStats] = useState({ anggota: 0, divisi: 0, progja: 0, periode: '-' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: cA } = await supabase.from('anggota').select('*', { count: 'exact', head: true });
        const { count: cD } = await supabase.from('divisi').select('*', { count: 'exact', head: true });
        const { count: cP } = await supabase.from('program_kerja').select('*', { count: 'exact', head: true });
        const { data: per } = await supabase.from('periode_jabatan').select('nama_kabinet').eq('is_active', true).single();
        setStats({ anggota: cA || 0, divisi: cD || 0, progja: cP || 0, periode: per ? per.nama_kabinet : '-' });
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="main-content"><p className="loading-text">...</p></div>;

  const today = new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' });

  return (
    <div className="main-content">
      <div className={styles.container}>
        
        {/* HEADER COMPACT */}
        <div className={styles.header}>
          <h1 className={styles.greeting}>Dashboard ({stats.periode})</h1>
          <span className={styles.dateBadge}>{today}</span>
        </div>

        {/* STATS BAR */}
        <div className={styles.statsGrid}>
          <StatCard label="Anggota" value={stats.anggota} icon={<FiUsers />} color="blue" />
          <StatCard label="Divisi" value={stats.divisi} icon={<FiLayers />} color="orange" />
          <StatCard label="Progja" value={stats.progja} icon={<FiCalendar />} color="green" />
          <StatCard label="Periode" value="1" icon={<FiClock />} color="purple" />
        </div>

        {/* MENU GRID UTAMA */}
        <h2 className={styles.sectionTitle}>Kelola Data</h2>
        <div className={styles.menuGrid}>
          <MenuTile to="/anggota" title="Anggota" icon={<FiUsers />} />
          <MenuTile to="/program-kerja" title="Program Kerja" icon={<FiCalendar />} />
          <MenuTile to="/anggota" title="Divisi" icon={<FiLayers />} />
          <MenuTile to="/anggota" title="Periode" icon={<FiClock />} />
        </div>

        {/* MENU GRID PENGATURAN */}
        <h2 className={styles.sectionTitle}>Sistem</h2>
        <div className={styles.menuGrid}>
          <MenuTile to="/visi-misi" title="Konten Web" icon={<FiTarget />} />
          <MenuTile to="/pengaturan" title="Pengaturan" icon={<FiSettings />} />
        </div>

      </div>
    </div>
  );
}

export default DashboardAdmin;