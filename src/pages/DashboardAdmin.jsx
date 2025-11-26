import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import PageContainer from "../components/ui/PageContainer.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";

// --- PERBAIKAN DI SINI: Menambahkan FiActivity ke dalam import ---
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
  FiCheckCircle,
  FiLoader,
  FiActivity, // <--- SUDAH DITAMBAHKAN
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
        const { count: countAnggota } = await supabase
          .from("anggota")
          .select("*", { count: "exact", head: true });
        const { count: countDivisi } = await supabase
          .from("divisi")
          .select("*", { count: "exact", head: true });

        // Ambil Periode Aktif
        const { data: per } = await supabase
          .from("periode_jabatan")
          .select("nama_kabinet")
          .eq("is_active", true)
          .single();

        // Ambil Detail Progja
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
      {/* HEADER: Sapaan & Tanggal */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.8rem",
              color: "#1e293b",
              marginBottom: "0.2rem",
            }}
          >
            {greeting}, Admin! 👋
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Ringkasan data organisasi hari ini.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              background: "#f1f5f9",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontWeight: "600",
              color: "#475569",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FiClock />{" "}
            {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
          </div>
        </div>
      </div>

      {/* --- BAGIAN 1: STATISTIK UTAMA (BIG NUMBERS) --- */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        {/* Card 1: Anggota */}
        <BigStatCard
          title="Total Personil"
          value={stats.anggota}
          unit="Anggota"
          icon={<FiUsers />}
          theme="blue"
          subtext="Status Aktif"
        />

        {/* Card 2: Progja (Menggunakan FiActivity yang sudah difix) */}
        <BigStatCard
          title="Kinerja Program"
          value={`${Math.round(
            (stats.progjaSelesai / (stats.progjaTotal || 1)) * 100
          )}%`}
          unit="Terlaksana"
          icon={<FiActivity />}
          theme="green"
          subtext={`${stats.progjaSelesai} Selesai dari ${stats.progjaTotal} Total`}
        />

        {/* Card 3: Divisi */}
        <BigStatCard
          title="Struktur Organisasi"
          value={stats.divisi}
          unit="Divisi"
          icon={<FiBriefcase />}
          theme="purple"
          subtext="Unit Kerja Aktif"
        />

        {/* Card 4: Periode */}
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

      {/* --- BAGIAN 2: NAVIGASI KELOLA (Grid Rapi) --- */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
        }}
      >
        {/* KOLOM KIRI: DATABASE MASTER */}
        <div>
          <h3
            style={{
              fontSize: "1rem",
              color: "#94a3b8",
              fontWeight: "700",
              textTransform: "uppercase",
              marginBottom: "1rem",
              letterSpacing: "0.05em",
            }}
          >
            Database Master
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <NavCard
              to="/kelola-anggota"
              label="Kelola Data Anggota"
              icon={<FiUsers />}
              color="blue"
              desc="Database seluruh pengurus."
            />
            <NavCard
              to="/kelola-divisi"
              label="Kelola Data Divisi"
              icon={<FiGrid />}
              color="indigo"
              desc="Pengaturan unit kerja."
            />
            <NavCard
              to="/kelola-jabatan"
              label="Master Jabatan"
              icon={<FiAward />}
              color="pink"
              desc="Hierarki struktur."
            />
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
          <h3
            style={{
              fontSize: "1rem",
              color: "#94a3b8",
              fontWeight: "700",
              textTransform: "uppercase",
              marginBottom: "1rem",
              letterSpacing: "0.05em",
            }}
          >
            Operasional & Web
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <NavCard
              to="/program-kerja"
              label="Program Kerja"
              icon={<FiCalendar />}
              color="green"
              desc="Update status & laporan."
            />
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

// --- KOMPONEN: BIG STAT CARD ---
const BigStatCard = ({
  title,
  value,
  unit,
  icon,
  theme,
  subtext,
  isTextValue,
}) => {
  const colors = {
    blue: {
      bg: "#eff6ff",
      text: "#1d4ed8",
      border: "#bfdbfe",
      iconBg: "#dbeafe",
    },
    green: {
      bg: "#f0fdf4",
      text: "#15803d",
      border: "#bbf7d0",
      iconBg: "#dcfce7",
    },
    purple: {
      bg: "#faf5ff",
      text: "#7e22ce",
      border: "#e9d5ff",
      iconBg: "#f3e8ff",
    },
    orange: {
      bg: "#fff7ed",
      text: "#c2410c",
      border: "#fed7aa",
      iconBg: "#ffedd5",
    },
  };
  const t = colors[theme] || colors.blue;

  return (
    <div
      style={{
        background: "white",
        padding: "1.5rem",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          marginBottom: "1rem",
        }}
      >
        <span
          style={{ fontSize: "0.9rem", fontWeight: "600", color: "#64748b" }}
        >
          {title}
        </span>
        <div
          style={{
            padding: "0.5rem",
            borderRadius: "10px",
            background: t.iconBg,
            color: t.text,
            fontSize: "1.2rem",
            display: "flex",
          }}
        >
          {icon}
        </div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
          <span
            style={{
              fontSize: isTextValue ? "1.5rem" : "2.5rem",
              fontWeight: "800",
              color: "#1e293b",
              lineHeight: 1,
            }}
          >
            {value}
          </span>
          {unit && (
            <span
              style={{ fontSize: "1rem", fontWeight: "600", color: "#94a3b8" }}
            >
              {unit}
            </span>
          )}
        </div>
        <div
          style={{
            marginTop: "0.5rem",
            fontSize: "0.85rem",
            color: t.text,
            fontWeight: "500",
            background: t.bg,
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: "6px",
          }}
        >
          {subtext}
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN: NAV CARD ---
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
    <Link
      to={to}
      className="nav-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        background: "white",
        padding: "1rem",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        textDecoration: "none",
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: `${c}15`,
          color: c,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{ fontWeight: "700", color: "#334155", fontSize: "0.95rem" }}
        >
          {label}
        </div>
        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{desc}</div>
      </div>
      <div style={{ color: "#cbd5e0" }}>
        <FiArrowRight />
      </div>

      <style>{`
        .nav-card:hover {
          border-color: ${c};
          transform: translateX(4px);
          box-shadow: 0 4px 12px -2px rgba(0,0,0,0.05);
        }
        .nav-card:hover div:last-child { color: ${c}; }
      `}</style>
    </Link>
  );
};

export default DashboardAdmin;
