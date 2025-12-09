import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import PageContainer from "../components/ui/PageContainer.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import styles from "./DashboardAdmin.module.css"; // Pastikan file CSS Module ini ada

// Icons
import {
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiGrid,
  FiClock,
  FiLayout,
  FiTarget,
  FiSettings,
  FiArrowRight,
  FiAward,
  FiActivity,
} from "react-icons/fi";

function DashboardAdmin() {
  const { session } = useAuth();
  const [stats, setStats] = useState({
    anggota: 0,
    divisi: 0,
    periodeName: "-",
    progjaTotal: 0,
    progjaSelesai: 0,
    progjaRencana: 0,
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");

  // 1. Sapaan Waktu
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Selamat Pagi");
    else if (hour < 15) setGreeting("Selamat Siang");
    else if (hour < 18) setGreeting("Selamat Sore");
    else setGreeting("Selamat Malam");
  }, []);

  // 2. Fetch Data Statistik
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Hitung Anggota
        const { count: countAnggota } = await supabase
          .from("anggota")
          .select("*", { count: "exact", head: true });

        // Hitung Divisi
        const { count: countDivisi } = await supabase
          .from("divisi")
          .select("*", { count: "exact", head: true });

        // Ambil Periode Aktif
        const { data: per } = await supabase
          .from("periode_jabatan")
          .select("nama_kabinet")
          .eq("is_active", true)
          .single();

        // Ambil Data Progja untuk Statistik
        const { data: progjaData } = await supabase
          .from("program_kerja")
          .select("status");

        const total = progjaData?.length || 0;
        const selesai =
          progjaData?.filter((p) => p.status === "Selesai").length || 0;
        const rencana =
          progjaData?.filter((p) => p.status === "Rencana").length || 0;

        setStats({
          anggota: countAnggota || 0,
          divisi: countDivisi || 0,
          periodeName: per ? per.nama_kabinet : "Non-Aktif",
          progjaTotal: total,
          progjaSelesai: selesai,
          progjaRencana: rencana,
        });
      } catch (err) {
        console.error("Error stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <PageContainer>
        <LoadingState message="Memuat Dashboard..." />
      </PageContainer>
    );

  return (
    <PageContainer breadcrumbText="Dashboard">
      {/* HEADER */}
      <div className={styles.headerContainer}>
        <div>
          <h1 className={styles.greetingTitle}>{greeting}, Admin! 👋</h1>
          <p className={styles.greetingSubtitle}>
            Ringkasan data organisasi hari ini.
          </p>
        </div>
        <div>
          <div className={styles.dateBadge}>
            <FiClock />{" "}
            {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
          </div>
        </div>
      </div>

      {/* --- BAGIAN 1: STATISTIK UTAMA --- */}
      <div className={styles.statsGrid}>
        <BigStatCard
          title="Total Personil"
          value={stats.anggota}
          unit="Anggota"
          icon={<FiUsers />}
          theme="blue"
          subtext="Status Aktif"
        />
        <BigStatCard
          title="Kinerja Program"
          value={`${
            stats.progjaTotal > 0
              ? Math.round((stats.progjaSelesai / stats.progjaTotal) * 100)
              : 0
          }%`}
          unit="Terlaksana"
          icon={<FiActivity />}
          theme="green"
          subtext={`${stats.progjaSelesai} Selesai dari ${stats.progjaTotal} Total`}
        />
        <BigStatCard
          title="Struktur Organisasi"
          value={stats.divisi}
          unit="Divisi"
          icon={<FiBriefcase />}
          theme="purple"
          subtext="Unit Kerja Aktif"
        />
        <BigStatCard
          title="Periode Berjalan"
          value={stats.periodeName}
          unit=""
          icon={<FiAward />}
          theme="orange"
          subtext="Kabinet Saat Ini"
          isTextValue
        />
      </div>

      {/* --- BAGIAN 2: NAVIGASI KELOLA --- */}
      <div className={styles.navSectionGrid}>
        {/* KOLOM KIRI: DATABASE MASTER */}
        <div>
          <h3 className={styles.sectionTitle}>Database Master</h3>
          <div className={styles.navGroup}>
            {/* LINK KE KELOLA ANGGOTA */}
            <NavCard
              to="/kelola-anggota"
              label="Kelola Data Anggota"
              icon={<FiUsers />}
              color="blue"
              desc="Database seluruh pengurus."
            />

            {/* LINK KE KELOLA DIVISI */}
            <NavCard
              to="/kelola-divisi"
              label="Kelola Data Divisi"
              icon={<FiGrid />}
              color="indigo"
              desc="Pengaturan unit kerja."
            />

            {/* LINK KE KELOLA JABATAN */}
            <NavCard
              to="/kelola-jabatan"
              label="Master Jabatan"
              icon={<FiAward />}
              color="pink"
              desc="Hierarki struktur."
            />

            {/* LINK KE KELOLA PERIODE */}
            <NavCard
              to="/kelola-periode"
              label="Periode & Arsip"
              icon={<FiClock />}
              color="red"
              desc="Ganti tahun kepengurusan."
            />
          </div>
        </div>

        {/* KOLOM KANAN: OPERASIONAL & WEB */}
        <div>
          <h3 className={styles.sectionTitle}>Operasional & Web</h3>
          <div className={styles.navGroup}>
            {/* LINK KE KELOLA PROGRAM KERJA */}
            <NavCard
              to="/kelola-program-kerja"
              label="Kelola Program Kerja"
              icon={<FiCalendar />}
              color="green"
              desc="Update status & laporan."
            />

            {/* EDIT HALAMAN LAIN */}
            <NavCard
              to="/"
              label="Edit Beranda"
              icon={<FiLayout />}
              color="orange"
              desc="Banner & info utama."
            />
            <NavCard
              to="/visi-misi"
              label="Edit Visi Misi"
              icon={<FiTarget />}
              color="purple"
              desc="Profil organisasi."
            />
            <NavCard
              to="/pengaturan"
              label="Pengaturan Akun"
              icon={<FiSettings />}
              color="slate"
              desc="Keamanan sistem."
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

// --- KOMPONEN KECIL (HELPER) ---

const BigStatCard = ({
  title,
  value,
  unit,
  icon,
  theme,
  subtext,
  isTextValue,
}) => {
  const themes = {
    blue: { bg: "#eff6ff", text: "#1d4ed8", iconBg: "#dbeafe" },
    green: { bg: "#f0fdf4", text: "#15803d", iconBg: "#dcfce7" },
    purple: { bg: "#faf5ff", text: "#7e22ce", iconBg: "#f3e8ff" },
    orange: { bg: "#fff7ed", text: "#c2410c", iconBg: "#ffedd5" },
  };
  const t = themes[theme] || themes.blue;

  return (
    <div className={styles.statCard}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{title}</span>
        <div
          className={styles.iconBox}
          style={{ background: t.iconBg, color: t.text }}
        >
          {icon}
        </div>
      </div>
      <div>
        <div className={styles.cardValueRow}>
          <span
            className={styles.cardValue}
            style={{ fontSize: isTextValue ? "1.5rem" : "2.25rem" }}
          >
            {value}
          </span>
          {unit && <span className={styles.cardUnit}>{unit}</span>}
        </div>
        <div
          className={styles.cardSubtext}
          style={{ background: t.bg, color: t.text }}
        >
          {subtext}
        </div>
      </div>
    </div>
  );
};

const NavCard = ({ to, label, icon, color, desc }) => {
  const colors = {
    blue: "#3b82f6",
    indigo: "#6366f1",
    green: "#10b981",
    orange: "#f59e0b",
    purple: "#a855f7",
    pink: "#ec4899",
    red: "#ef4444",
    slate: "#64748b",
  };
  const c = colors[color] || "#64748b";

  return (
    <Link to={to} className={styles.navCard}>
      <div
        className={styles.navIconBox}
        style={{ background: `${c}15`, color: c }}
      >
        {icon}
      </div>
      <div className={styles.navContent}>
        <div className={styles.navLabel}>{label}</div>
        <div className={styles.navDesc}>{desc}</div>
      </div>
      <div className={styles.arrowIcon}>
        <FiArrowRight />
      </div>
    </Link>
  );
};

export default DashboardAdmin;
