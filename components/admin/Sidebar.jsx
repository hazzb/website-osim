// src/components/admin/Sidebar.jsx
// --- VERSI 3.0 (Tailwind CSS) ---

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      alert(`Gagal Logout: ${error.message}`);
    } else {
      navigate("/");
    }
  };

  // Styles
  const linkBaseClass =
    "flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200";
  const linkInactiveClass =
    "text-slate-500 hover:text-slate-900 hover:bg-slate-100";
  const linkActiveClass = "text-blue-600 bg-blue-50 border-r-2 border-blue-600";

  const getNavLinkClass = ({ isActive }) => {
    return `${linkBaseClass} ${isActive ? linkActiveClass : linkInactiveClass}`;
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">Admin OSIM</h2>
        <p className="text-xs text-slate-500 mt-1">Panel Kontrol</p>
      </div>

      {/* Navigasi Utama */}
      <nav className="flex-1 py-4">
        {/* Dashboard */}
        <NavLink to="/admin/dashboard" className={getNavLinkClass}>
          Dashboard
        </NavLink>

        {/* Grup "Kelola Konten" */}
        <div className="px-4 mt-6 mb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Kelola Konten
          </p>
        </div>

        <NavLink to="/admin/anggota" className={getNavLinkClass}>
          Kelola Anggota
        </NavLink>
        <NavLink to="/admin/program-kerja" className={getNavLinkClass}>
          Kelola Program Kerja
        </NavLink>
        <NavLink to="/admin/divisi" className={getNavLinkClass}>
          Kelola Divisi
        </NavLink>
        <NavLink to="/admin/jabatan" className={getNavLinkClass}>
          Kelola Jabatan
        </NavLink>
        <NavLink to="/admin/periode" className={getNavLinkClass}>
          Kelola Periode
        </NavLink>
        <NavLink to="/admin/visi-misi/edit" className={getNavLinkClass}>
          Edit Visi Misi
        </NavLink>
        <NavLink to="/admin/pengaturan" className={getNavLinkClass}>
          Pengaturan
        </NavLink>

        {/* Grup "Lihat Halaman Publik" */}
        <div className="px-4 mt-6 mb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Lihat Halaman Publik
          </p>
        </div>

        <a
          href="/anggota"
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkBaseClass} ${linkInactiveClass}`}
        >
          Lihat Anggota
        </a>
        <a
          href="/program-kerja"
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkBaseClass} ${linkInactiveClass}`}
        >
          Lihat Program Kerja
        </a>
      </nav>

      {/* Footer (Tombol Logout) */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-red-50 text-red-600 text-sm font-medium rounded-md hover:bg-red-100 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
