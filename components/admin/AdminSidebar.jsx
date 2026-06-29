"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
// Removed server action import
import {
  FiGrid,
  FiUsers,
  FiActivity,
  FiLayers,
  FiAward,
  FiClock,
  FiSettings,
  FiLogOut,
  FiExternalLink,
  FiFileText,
} from "react-icons/fi";

function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      if (confirm("Apakah anda yakin ingin keluar dari panel admin?")) {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
      }
    } catch (err) {
      alert(`Gagal Logout: ${err.message}`);
    }
  };

  const menuItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: <FiGrid size={18} />,
    },
    { type: "divider", label: "Kelola Organisasi" },
    {
      href: "/admin/anggota",
      label: "Kelola Anggota",
      icon: <FiUsers size={18} />,
    },
    {
      href: "/admin/divisi",
      label: "Kelola Divisi",
      icon: <FiLayers size={18} />,
    },
    {
      href: "/admin/jabatan",
      label: "Kelola Jabatan",
      icon: <FiAward size={18} />,
    },
    {
      href: "/admin/periode",
      label: "Kelola Periode",
      icon: <FiClock size={18} />,
    },
    { type: "divider", label: "Kelola Kegiatan" },
    {
      href: "/admin/program-kerja",
      label: "Program Kerja",
      icon: <FiActivity size={18} />,
    },
    {
      href: "/admin/berita",
      label: "Berita & Reportase",
      icon: <FiFileText size={18} />,
    },
    { type: "divider", label: "Sistem" },
    {
      href: "/admin/visi-misi",
      label: "Visi & Misi",
      icon: <FiLayers size={18} />,
    },
    {
      href: "/admin/pengaturan",
      label: "Pengaturan Web",
      icon: <FiSettings size={18} />,
    },
  ];

  return (
    <div className="w-72 h-screen bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 z-40 text-slate-300 shadow-2xl relative overflow-hidden">
      {/* Background Ornament */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

      {/* Header */}
      <div className="p-6 border-b border-white/10 relative z-10 flex flex-col justify-center min-h-[100px]">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <span className="text-primary">ADMIN</span> OSIM
        </h2>
        <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">
          Control Panel v3.0
        </p>
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto custom-scrollbar relative z-10 hidden-scrollbar">
        <ul className="flex flex-col gap-1.5">
          {menuItems.map((item, index) => {
            if (item.type === "divider") {
              return (
                <li key={index} className="px-3 mt-6 mb-2">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                    {item.label}
                  </span>
                </li>
              );
            }

            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-blue-900/50"
                      : "text-text-muted hover:text-slate-200 hover:bg-bg-card/5 active:bg-bg-card/10"
                  }`}
                >
                  <span
                    className={`transition-transform ${isActive ? "scale-110" : ""}`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Grup "Lihat Halaman Publik" */}
        <div className="px-3 mt-10 mb-2">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
            Public Pages
          </p>
        </div>
        <ul className="flex flex-col gap-1.5">
          <li>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-xl text-text-muted hover:text-blue-400 hover:bg-blue-500/10 transition-all border border-transparent hover:border-blue-500/20 group"
            >
              <div className="flex items-center gap-2">Halaman Utama</div>
              <FiExternalLink
                className="opacity-50 group-hover:opacity-100 transition-opacity"
                size={14}
              />
            </a>
          </li>
          <li>
            <a
              href="/anggota"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-xl text-text-muted hover:text-blue-400 hover:bg-blue-500/10 transition-all border border-transparent hover:border-blue-500/20 group"
            >
              <div className="flex items-center gap-2">Direktori Anggota</div>
              <FiExternalLink
                className="opacity-50 group-hover:opacity-100 transition-opacity"
                size={14}
              />
            </a>
          </li>
          <li>
            <a
              href="/program-kerja"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-xl text-text-muted hover:text-blue-400 hover:bg-blue-500/10 transition-all border border-transparent hover:border-blue-500/20 group"
            >
              <div className="flex items-center gap-2">Katalog Program</div>
              <FiExternalLink
                className="opacity-50 group-hover:opacity-100 transition-opacity"
                size={14}
              />
            </a>
          </li>
          <li>
            <a
              href="/berita"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-xl text-text-muted hover:text-blue-400 hover:bg-blue-500/10 transition-all border border-transparent hover:border-blue-500/20 group"
            >
              <div className="flex items-center gap-2">Berita & Reportase</div>
              <FiExternalLink
                className="opacity-50 group-hover:opacity-100 transition-opacity"
                size={14}
              />
            </a>
          </li>
        </ul>
      </nav>

      {/* Footer (Tombol Logout) */}
      <div className="p-4 border-t border-white/5 relative z-10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-tight rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-sm active:scale-95 group"
        >
          <FiLogOut className="group-hover:-translate-x-1 transition-transform" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;
