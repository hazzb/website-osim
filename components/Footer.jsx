"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { useAuth } from "./context/AuthContext";
import { usePathname } from "next/navigation";

// IMPORT ICONS
import {
  FiHome,
  FiTarget,
  FiUsers,
  FiCalendar,
  FiMapPin,
  FiMail,
  FiPhone,
  FiYoutube,
  FiHeart,
  FiLogIn,
  FiLayout,
} from "react-icons/fi";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  const { session } = useAuth();
  const isAdmin = !!session;
  const supabase = createClient();
  const pathname = usePathname();

  const currentYear = new Date().getFullYear();
  const [info, setInfo] = useState(null);
  const [activePeriode, setActivePeriode] = useState("");

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const { data: settingsData } = await supabase
          .from("pengaturan")
          .select(
            "nama_organisasi, nama_sekolah, logo_osis_url, logo_sekolah_url, deskripsi_singkat, alamat, email, no_hp, instagram_url, tiktok_url, youtube_url, footer_managed_by",
          )
          .eq("id", 1)
          .single();

        if (settingsData) setInfo(settingsData);

        const { data: periodeData } = await supabase
          .from("periode_jabatan")
          .select("nama_kabinet")
          .eq("is_active", true)
          .single();

        if (periodeData) setActivePeriode(periodeData.nama_kabinet);
      } catch (err) {
        console.error("Error fetching footer info:", err);
      }
    };

    fetchInfo();
  }, [supabase]);

  if (!info) return null;
  if (pathname === "/login" || pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-blue-50/50 border-t border-blue-100/50 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-12">
          {/* KOLOM 1: IDENTITAS */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {info.logo_sekolah_url && (
                  <img
                    src={info.logo_sekolah_url}
                    alt="Logo Sekolah"
                    loading="lazy"
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain shrink-0"
                  />
                )}
                {info.logo_osis_url && (
                  <img
                    src={info.logo_osis_url}
                    alt="Logo OSIS"
                    loading="lazy"
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain shrink-0"
                  />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                  {info.nama_organisasi}
                </h3>
                {info.nama_sekolah && (
                  <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                    {info.nama_sekolah}
                  </div>
                )}
              </div>
            </div>

            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              {info.deskripsi_singkat ||
                "Wadah aspirasi dan kreasi siswa untuk mewujudkan madrasah yang unggul dan inovatif."}
            </p>

            <div className="flex gap-2.5">
              {info.instagram_url && (
                <a
                  href={info.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 bg-white text-slate-400 rounded-full flex items-center justify-center hover:bg-pink-50 hover:text-pink-500 hover:-translate-y-1 transition-all shadow-sm border border-slate-100"
                  title="Instagram"
                >
                  <FaInstagram size={18} />
                </a>
              )}
              {info.tiktok_url && (
                <a
                  href={info.tiktok_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 bg-white text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 hover:-translate-y-1 transition-all shadow-sm border border-slate-100"
                  title="TikTok"
                >
                  <FaTiktok size={16} />
                </a>
              )}
              {info.youtube_url && (
                <a
                  href={info.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 bg-white text-slate-400 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:-translate-y-1 transition-all shadow-sm border border-slate-100"
                  title="YouTube"
                >
                  <FiYoutube size={18} />
                </a>
              )}
            </div>
          </div>

          {/* KOLOM 2: TAUTAN CEPAT */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              Jelajahi
            </h4>
            <ul className="space-y-3.5">
              <li>
                <Link
                  href="/"
                  className="group flex items-center gap-3 text-sm text-slate-500 hover:text-blue-600 transition-colors no-underline"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-200 group-hover:bg-blue-600 transition-colors"></span>
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="group flex items-center gap-3 text-sm text-slate-500 hover:text-blue-600 transition-colors no-underline"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-200 group-hover:bg-blue-600 transition-colors"></span>
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/anggota"
                  className="group flex items-center gap-3 text-sm text-slate-500 hover:text-blue-600 transition-colors no-underline"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-200 group-hover:bg-blue-600 transition-colors"></span>
                  Anggota
                </Link>
              </li>
              <li>
                <Link
                  href="/program-kerja"
                  className="group flex items-center gap-3 text-sm text-slate-500 hover:text-blue-600 transition-colors no-underline"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-200 group-hover:bg-blue-600 transition-colors"></span>
                  Program Kerja
                </Link>
              </li>
              <li>
                <Link
                  href={isAdmin ? "/admin/dashboard" : "/login"}
                  className="group flex items-center gap-3 text-sm text-slate-500 hover:text-blue-600 transition-colors no-underline"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-200 group-hover:bg-blue-600 transition-colors"></span>
                  {isAdmin ? "Panel Admin" : "Login Admin"}
                </Link>
              </li>
            </ul>
          </div>

          {/* KOLOM 3: KONTAK */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              Hubungi Kami
            </h4>
            <ul className="space-y-4">
              {info.alamat && (
                <li className="flex gap-4 text-sm text-slate-500">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                    <FiMapPin size={16} />
                  </div>
                  <span className="leading-relaxed text-xs">{info.alamat}</span>
                </li>
              )}
              {info.email && (
                <li className="flex gap-4 text-sm">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                    <FiMail size={16} />
                  </div>
                  <a
                    href={`mailto:${info.email}`}
                    className="text-slate-500 hover:text-blue-600 transition-colors leading-relaxed text-xs truncate no-underline"
                  >
                    {info.email}
                  </a>
                </li>
              )}
              {info.no_hp && (
                <li className="flex gap-4 text-sm">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-green-50 text-green-500 flex items-center justify-center">
                    <FiPhone size={16} />
                  </div>
                  <a
                    href={`https://wa.me/${info.no_hp.replace(/\D/g, "")}`}
                    className="text-slate-500 hover:text-blue-600 transition-colors leading-relaxed text-xs no-underline"
                  >
                    {info.no_hp}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* COPYRIGHT & ATTRIBUTION */}
      <div className="bg-slate-50/50 border-t border-blue-100/30">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[11px] text-slate-400 font-medium">
              © {currentYear}{" "}
              <span className="text-slate-600 font-bold">
                {info.nama_organisasi}
              </span>
              . Built with passion.
            </div>

            <div className="flex items-center gap-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <span>Managed by</span>
                <span className="text-blue-500">
                  {info.footer_managed_by || "Media Center"}
                </span>
              </div>
              {activePeriode && (
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>{activePeriode}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 p-1.5 px-4 bg-white rounded-full border border-blue-100/50 shadow-sm transition-all hover:shadow-md">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                Developed by
              </span>
              <a
                href="https://api.whatsapp.com/send/?phone=6281772306374&text=Halo%2C+saya+ingin+konsultasi+terkait+pembuatan+aplikasi+sesuai+kebutuhan+saya.&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors no-underline"
              >
                <span className="flex flex-row items-center gap-1">
                  <FaWhatsapp className="text-green-600" size={14} />
                  MelekDgital
                </span>
              </a>
              <span className="w-1 h-1 rounded-full bg-blue-200"></span>
              <a
                href="https://www.instagram.com/dan_ilevan/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-700 hover:text-pink-600 transition-colors no-underline"
              >
                <span className="flex flex-row items-center gap-1">
                  <FaInstagram className="text-pink-600" size={14} />
                  dan_ilevan
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
