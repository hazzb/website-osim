import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

// ICONS
import {
  FiMenu,
  FiX,
  FiTarget,
  FiUsers,
  FiCalendar,
  FiLogIn,
  FiLogOut,
  FiLayout,
  FiHome,
} from "react-icons/fi";

const Navbar = () => {
  const { session } = useAuth();
  const isAdmin = !!session;
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [orgName, setOrgName] = useState("OSIS APP");

  // Fetch Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from("pengaturan")
          .select("nama_organisasi, logo_osis_url")
          .eq("id", 1)
          .single();

        if (data) {
          if (data.logo_osis_url) setLogoUrl(data.logo_osis_url);
          if (data.nama_organisasi) setOrgName(data.nama_organisasi);
        }
      } catch (error) {
        console.error("Error navbar settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
    setIsOpen(false);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className="sticky top-0 z-[1000] bg-white/85 backdrop-blur-lg border-b border-primary-border/50 shadow-sm transition-all w-full">
      <div className="max-w-6xl mx-auto px-4 h-14 flex justify-between items-center">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-[30px] h-[30px] object-contain"
              />
            ) : (
              <div className="w-[34px] h-[34px] bg-slate-200 rounded-full" />
            )}
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-br from-secondary to-indigo-600 bg-clip-text text-transparent">
              {orgName}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-1 bg-slate-100/50 p-0.5 rounded-full border border-white/50">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-1.5 no-underline font-semibold text-xs px-4 py-1.5 rounded-full transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-primary-border to-primary-light text-secondary font-bold shadow-md shadow-primary/15"
                    : "text-slate-500 hover:text-primary hover:bg-white/80 hover:-translate-y-px"
                }`
              }
            >
              <FiHome size={18} /> Beranda
            </NavLink>
            <NavLink
              to="/visi-misi"
              className={({ isActive }) =>
                `flex items-center gap-1.5 no-underline font-semibold text-xs px-4 py-1.5 rounded-full transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-primary-border to-primary-light text-secondary font-bold shadow-md shadow-primary/15"
                    : "text-slate-500 hover:text-primary hover:bg-white/80 hover:-translate-y-px"
                }`
              }
            >
              <FiTarget size={18} /> Profile
            </NavLink>
            <NavLink
              to="/anggota"
              className={({ isActive }) =>
                `flex items-center gap-1.5 no-underline font-semibold text-xs px-4 py-1.5 rounded-full transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-primary-border to-primary-light text-secondary font-bold shadow-md shadow-primary/15"
                    : "text-slate-500 hover:text-primary hover:bg-white/80 hover:-translate-y-px"
                }`
              }
            >
              <FiUsers size={18} /> Anggota
            </NavLink>
            <NavLink
              to="/program-kerja"
              className={({ isActive }) =>
                `flex items-center gap-1.5 no-underline font-semibold text-xs px-4 py-1.5 rounded-full transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-primary-border to-primary-light text-secondary font-bold shadow-md shadow-primary/15"
                    : "text-slate-500 hover:text-primary hover:bg-white/80 hover:-translate-y-px"
                }`
              }
            >
              <FiCalendar size={18} /> Program
            </NavLink>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <Link
                to="/dashboard"
                className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold no-underline transition-all border border-border bg-white text-slate-700 shadow-sm hover:border-primary hover:text-secondary hover:-translate-y-px"
              >
                <FiLayout /> Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border bg-white shadow-sm text-danger border-danger-border hover:border-danger hover:-translate-y-px"
              >
                <FiLogOut />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold no-underline transition-all border border-border bg-white text-slate-700 shadow-sm hover:border-primary hover:text-secondary hover:-translate-y-px"
            >
              <FiLogIn /> Login
            </Link>
          )}

          <button
            className="md:hidden bg-slate-100 border-0 cursor-pointer text-slate-700 p-1.5 rounded-md transition-all hover:bg-slate-200 hover:text-slate-900"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`${
          isOpen ? "flex" : "hidden"
        } md:hidden flex-col absolute top-14 left-0 w-full z-[999] bg-white border-b border-slate-200 p-4 shadow-xl animate-slideDown`}
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-3 mb-1 rounded-lg no-underline font-semibold text-sm transition-all ${
              isActive
                ? "bg-primary-light text-secondary border-primary-border"
                : "text-slate-500 hover:bg-slate-50 hover:text-secondary hover:pl-4"
            }`
          }
        >
          <FiHome /> Beranda
        </NavLink>
        <NavLink
          to="/visi-misi"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-3 mb-1 rounded-lg no-underline font-semibold text-sm transition-all ${
              isActive
                ? "bg-primary-light text-secondary border-primary-border"
                : "text-slate-500 hover:bg-slate-50 hover:text-secondary hover:pl-4"
            }`
          }
        >
          <FiTarget /> Profile
        </NavLink>
        <NavLink
          to="/anggota"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-3 mb-1 rounded-lg no-underline font-semibold text-sm transition-all ${
              isActive
                ? "bg-primary-light text-secondary border-primary-border"
                : "text-slate-500 hover:bg-slate-50 hover:text-secondary hover:pl-4"
            }`
          }
        >
          <FiUsers /> Daftar Anggota
        </NavLink>
        <NavLink
          to="/program-kerja"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-3 mb-1 rounded-lg no-underline font-semibold text-sm transition-all ${
              isActive
                ? "bg-primary-light text-secondary border-primary-border"
                : "text-slate-500 hover:bg-slate-50 hover:text-secondary hover:pl-4"
            }`
          }
        >
          <FiCalendar /> Program Kerja
        </NavLink>

        <div className="border-t border-slate-100 my-2"></div>

        {isAdmin ? (
          <>
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-3 mb-1 rounded-lg no-underline font-semibold text-sm text-blue-600 hover:bg-slate-50 transition-all"
            >
              <FiLayout /> Dashboard Admin
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 mb-1 rounded-lg font-semibold text-sm text-danger w-full bg-transparent border-0 text-left cursor-pointer hover:bg-slate-50 transition-all"
            >
              <FiLogOut /> Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-3 px-3 py-3 mb-1 rounded-lg no-underline font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-all"
          >
            <FiLogIn /> Login Admin
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
