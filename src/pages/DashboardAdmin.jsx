import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import PageContainer from "../components/ui/PageContainer.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 -tracking-tight">
            {greeting}, Admin! 👋
          </h1>
          <p className="text-slate-500 text-base m-0">
            Ringkasan data organisasi hari ini.
          </p>
        </div>
        <div>
          <div className="bg-white px-4 py-2.5 rounded-xl font-semibold text-slate-600 text-sm flex items-center gap-2 shadow-sm border border-slate-200">
            <FiClock className="text-blue-500" />{" "}
            {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
          </div>
        </div>
      </div>

      {/* --- BAGIAN 1: STATISTIK UTAMA --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* KOLOM KIRI: DATABASE MASTER */}
        <div>
          <h3 className="text-base font-bold text-slate-500 uppercase tracking-wider mb-5 border-b-2 border-slate-200 pb-2 inline-block">
            Database Master
          </h3>
          <div className="flex flex-col gap-4">
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
          <h3 className="text-base font-bold text-slate-500 uppercase tracking-wider mb-5 border-b-2 border-slate-200 pb-2 inline-block">
            Operasional & Web
          </h3>
          <div className="flex flex-col gap-4">
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
  // Tailwind color classes mapping based on theme
  const getThemeClasses = (t) => {
    switch (t) {
      case "blue":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          iconBg: "bg-blue-100",
          border: "hover:border-blue-300",
        };
      case "green":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          iconBg: "bg-green-100",
          border: "hover:border-green-300",
        };
      case "purple":
        return {
          bg: "bg-purple-50",
          text: "text-purple-700",
          iconBg: "bg-purple-100",
          border: "hover:border-purple-300",
        };
      case "orange":
        return {
          bg: "bg-orange-50",
          text: "text-orange-700",
          iconBg: "bg-orange-100",
          border: "hover:border-orange-300",
        };
      default:
        return {
          bg: "bg-slate-50",
          text: "text-slate-700",
          iconBg: "bg-slate-100",
          border: "hover:border-slate-300",
        };
    }
  };

  const tc = getThemeClasses(theme);

  return (
    <div
      className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md group ${tc.border}`}
    >
      <div className="flex justify-between items-start mb-6">
        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`p-2.5 rounded-xl text-xl flex items-center justify-center ${tc.iconBg} ${tc.text}`}
        >
          {icon}
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-2 mb-2">
          <span
            className={`font-extrabold text-slate-800 leading-none ${isTextValue ? "text-2xl" : "text-4xl"}`}
          >
            {value}
          </span>
          {unit && (
            <span className="text-base font-semibold text-slate-400">
              {unit}
            </span>
          )}
        </div>
        <div
          className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${tc.bg} ${tc.text}`}
        >
          {subtext}
        </div>
      </div>
    </div>
  );
};

const NavCard = ({ to, label, icon, color, desc }) => {
  const getColors = (c) => {
    switch (c) {
      case "blue":
        return "text-blue-500 bg-blue-50 group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:border-blue-200";
      case "indigo":
        return "text-indigo-500 bg-indigo-50 group-hover:bg-indigo-100 group-hover:text-indigo-600 group-hover:border-indigo-200";
      case "green":
        return "text-emerald-500 bg-emerald-50 group-hover:bg-emerald-100 group-hover:text-emerald-600 group-hover:border-emerald-200";
      case "orange":
        return "text-orange-500 bg-orange-50 group-hover:bg-orange-100 group-hover:text-orange-600 group-hover:border-orange-200";
      case "purple":
        return "text-purple-500 bg-purple-50 group-hover:bg-purple-100 group-hover:text-purple-600 group-hover:border-purple-200";
      case "pink":
        return "text-pink-500 bg-pink-50 group-hover:bg-pink-100 group-hover:text-pink-600 group-hover:border-pink-200";
      case "red":
        return "text-red-500 bg-red-50 group-hover:bg-red-100 group-hover:text-red-600 group-hover:border-red-200";
      case "slate":
        return "text-slate-500 bg-slate-50 group-hover:bg-slate-100 group-hover:text-slate-600 group-hover:border-slate-200";
      default:
        return "text-slate-500 bg-slate-50";
    }
  };

  const iconClass = getColors(color);

  return (
    <Link
      to={to}
      className="flex items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 no-underline transition-all duration-200 hover:translate-x-1 hover:border-blue-400 hover:shadow-md group relative overflow-hidden"
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-colors ${iconClass.split(" group-hover")[0]}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-slate-800 text-base mb-0.5 group-hover:text-blue-700 transition-colors">
          {label}
        </div>
        <div className="text-sm text-slate-500 truncate">{desc}</div>
      </div>
      <div className="text-slate-300 transition-all duration-200 group-hover:text-blue-500 group-hover:translate-x-1">
        <FiArrowRight />
      </div>
    </Link>
  );
};

export default DashboardAdmin;
