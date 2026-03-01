"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { createClient } from "../lib/supabase/client";
import { useAuth } from "./context/AuthContext";

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
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

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
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    setIsOpen(false);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinkClass = (href) => {
    const isActive = pathname === href;
    return `flex items-center gap-1.5 no-underline font-semibold text-xs px-4 py-1.5 rounded-full transition-all ${
      isActive
        ? "bg-gradient-to-br from-primary-border to-primary-light text-secondary font-bold shadow-md shadow-primary/15"
        : "text-slate-500 hover:text-primary hover:bg-white/80 hover:-translate-y-px"
    }`;
  };

  const mobileNavLinkClass = (href) => {
    const isActive = pathname === href;
    return `flex items-center gap-3 px-3 py-3 mb-1 rounded-lg no-underline font-semibold text-sm transition-all ${
      isActive
        ? "bg-primary-light text-secondary border-primary-border"
        : "text-slate-500 hover:bg-slate-50 hover:text-secondary hover:pl-4"
    }`;
  };

  if (pathname === "/login") return null;

  return (
    <nav className="sticky top-0 z-[1000] bg-blue-50/95 sm:bg-blue-50/90 backdrop-blur-sm sm:backdrop-blur-lg border-b border-primary-border/50 shadow-sm transition-all w-full leading-relaxed">
      <div className="max-w-6xl mx-auto px-4 h-14 flex justify-between items-center">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo"
                width={30}
                height={30}
                priority
                className="w-[30px] h-[30px] object-contain"
              />
            ) : (
              <div className="w-[34px] h-[34px] bg-slate-200 rounded-full" />
            )}
            <span className="font-extrabold text-sm sm:text-lg tracking-tight bg-gradient-to-br from-secondary to-indigo-600 bg-clip-text text-transparent line-clamp-1">
              {orgName}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-1 bg-slate-100/50 p-0.5 rounded-full border border-white/50">
            <Link href="/" className={navLinkClass("/")}>
              <FiHome size={18} /> Beranda
            </Link>
            <Link href="/profile" className={navLinkClass("/profile")}>
              <FiTarget size={18} /> Profile
            </Link>
            <Link href="/anggota" className={navLinkClass("/anggota")}>
              <FiUsers size={18} /> Anggota
            </Link>
            <Link
              href="/program-kerja"
              className={navLinkClass("/program-kerja")}
            >
              <FiCalendar size={18} /> Program
            </Link>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <Link
                href="/admin/dashboard"
                className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold no-underline transition-all border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-primary hover:text-secondary hover:-translate-y-px"
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
              href="/login"
              className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold no-underline transition-all border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-primary hover:text-secondary hover:-translate-y-px"
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
        <Link href="/" className={mobileNavLinkClass("/")}>
          <FiHome /> Beranda
        </Link>
        <Link href="/profile" className={mobileNavLinkClass("/profile")}>
          <FiTarget /> Profile
        </Link>
        <Link href="/anggota" className={mobileNavLinkClass("/anggota")}>
          <FiUsers /> Daftar Anggota
        </Link>
        <Link
          href="/program-kerja"
          className={mobileNavLinkClass("/program-kerja")}
        >
          <FiCalendar /> Program Kerja
        </Link>

        <div className="border-t border-slate-100 my-2"></div>

        {isAdmin ? (
          <>
            <Link
              href="/admin/dashboard"
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
            href="/login"
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
