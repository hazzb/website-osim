import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
// Pastikan nama file CSS juga disesuaikan
import styles from "./DashboardAdmin.module.css";

// Komponen Kecil untuk Kartu Statistik
const StatCard = ({ label, value, icon, colorClass }) => (
  <div className={styles.statCard}>
    <div className={`${styles.statIcon} ${styles[colorClass]}`}>{icon}</div>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

function DashboardAdmin() {
  const [stats, setStats] = useState({
    anggota: 0,
    divisi: 0,
    progja: 0,
    periode: "-",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // 1. Hitung Total Anggota
      const { count: countAnggota } = await supabase
        .from("anggota")
        .select("*", { count: "exact", head: true });

      // 2. Hitung Total Divisi
      const { count: countDivisi } = await supabase
        .from("divisi")
        .select("*", { count: "exact", head: true });

      // 3. Hitung Total Program Kerja
      const { count: countProgja } = await supabase
        .from("program_kerja")
        .select("*", { count: "exact", head: true });

      // 4. Ambil Nama Periode Aktif
      const { data: activePeriod } = await supabase
        .from("periode_jabatan")
        .select("nama_kabinet")
        .eq("is_active", true)
        .single();

      setStats({
        anggota: countAnggota || 0,
        divisi: countDivisi || 0,
        progja: countProgja || 0,
        periode: activePeriod ? activePeriod.nama_kabinet : "Tidak ada aktif",
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="main-content">
        <p className="loading-text">Memuat dashboard...</p>
      </div>
    );

  return (
    <div className="main-content">
      <div className={styles.container}>
        {/* 1. WELCOME SECTION */}
        <div className={styles.welcomeSection}>
          <h1 className={styles.greeting}>👋 Halo, Admin!</h1>
          <p className={styles.subGreeting}>
            Selamat datang di Dashboard Pengurus{" "}
            <strong>{stats.periode}</strong>.
          </p>
        </div>

        {/* 2. STATISTICS CARDS */}
        <div className={styles.statsGrid}>
          <StatCard
            label="Total Anggota"
            value={stats.anggota}
            icon="👥"
            colorClass="icon-blue"
          />
          <StatCard
            label="Divisi & Biro"
            value={stats.divisi}
            icon="🏢"
            colorClass="icon-orange"
          />
          <StatCard
            label="Program Kerja"
            value={stats.progja}
            icon="📅"
            colorClass="icon-green"
          />
          <StatCard
            label="Periode Aktif"
            value="1"
            icon="⏳"
            colorClass="icon-purple"
          />
        </div>

        {/* 3. QUICK ACTIONS / SHORTCUTS */}
        <h2 className={styles.sectionTitle}>Pintasan Menu</h2>
        <div className={styles.shortcutGrid}>
          <Link to="/daftar-anggota" className={styles.shortcutCard}>
            <span>👥</span> Kelola Anggota
          </Link>
          <Link to="/program-kerja" className={styles.shortcutCard}>
            <span>📅</span> Kelola Progja
          </Link>
          <Link to="/visi-misi" className={styles.shortcutCard}>
            <span>🎯</span> Edit Visi Misi
          </Link>
          <Link to="/pengaturan" className={styles.shortcutCard}>
            <span>⚙️</span> Pengaturan Website
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;
