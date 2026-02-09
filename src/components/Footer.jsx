import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

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
  FiGithub,
  FiInstagram,
} from "react-icons/fi";
import { FaInstagram, FaTiktok } from "react-icons/fa";

const Footer = () => {
  const { session } = useAuth();
  const isAdmin = !!session;

  const currentYear = new Date().getFullYear();
  const [info, setInfo] = useState(null);
  const [activePeriode, setActivePeriode] = useState("");

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const { data: settingsData } = await supabase
          .from("pengaturan")
          .select("*")
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
  }, []);

  if (!info) return null;

  return (
    <footer className="bg-gradient-to-br from-slate-50 to-slate-100 border-t border-slate-200 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-8 md:gap-12">
          {/* KOLOM 1: IDENTITAS (Full Width di Mobile) */}
          <div>
            <div className="flex flex-col gap-4 mb-6">
              {/* Container Logo */}
              <div className="flex items-center gap-4">
                {info.logo_sekolah_url && (
                  <img
                    src={info.logo_sekolah_url}
                    alt="Logo Sekolah"
                    className="w-14 h-14 object-contain"
                  />
                )}
                {info.logo_osis_url && (
                  <img
                    src={info.logo_osis_url}
                    alt="Logo OSIS"
                    className="w-14 h-14 object-contain"
                  />
                )}
              </div>

              {/* Container Teks: Nama Organisasi & Sekolah */}
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-1">
                  {info.nama_organisasi}
                </h3>
                {info.nama_sekolah && (
                  <div className="text-sm text-slate-600 font-medium">
                    {info.nama_sekolah}
                  </div>
                )}
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {info.deskripsi_singkat || "Wadah aspirasi dan kreasi siswa."}
            </p>

            <div className="flex gap-3">
              {info.instagram_url && (
                <a
                  href={info.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:text-pink-500 hover:border-pink-300 hover:-translate-y-1 transition-all shadow-sm"
                >
                  <FaInstagram size={20} />
                </a>
              )}
              {info.tiktok_url && (
                <a
                  href={info.tiktok_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:-translate-y-1 transition-all shadow-sm"
                >
                  <FaTiktok size={18} />
                </a>
              )}
              {info.youtube_url && (
                <a
                  href={info.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-500 hover:border-red-300 hover:-translate-y-1 transition-all shadow-sm"
                >
                  <FiYoutube size={20} />
                </a>
              )}
            </div>
          </div>

          {/* KOLOM 2: JELAJAHI (Kiri di Mobile) */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Jelajahi
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors no-underline"
                >
                  <FiHome size={16} /> Beranda
                </Link>
              </li>
              <li>
                <Link
                  to="/visi-misi"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors no-underline"
                >
                  <FiTarget size={16} /> Visi & Misi
                </Link>
              </li>
              <li>
                <Link
                  to="/daftar-anggota"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors no-underline"
                >
                  <FiUsers size={16} /> Anggota
                </Link>
              </li>
              <li>
                <Link
                  to="/program-kerja"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors no-underline"
                >
                  <FiCalendar size={16} /> Progja
                </Link>
              </li>
              {isAdmin ? (
                <li>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors no-underline"
                  >
                    <FiLayout size={16} /> Admin
                  </Link>
                </li>
              ) : (
                <li>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors no-underline"
                  >
                    <FiLogIn size={16} /> Login
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* KOLOM 3: HUBUNGI KAMI (Kanan di Mobile) */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Hubungi Kami
            </h4>
            <ul className="space-y-3">
              {info.alamat && (
                <li className="flex gap-3 text-sm text-slate-600">
                  <FiMapPin
                    size={16}
                    className="text-slate-400 mt-0.5 shrink-0"
                  />
                  <span className="leading-relaxed">{info.alamat}</span>
                </li>
              )}
              {info.email && (
                <li className="flex gap-3 text-sm">
                  <FiMail
                    size={16}
                    className="text-slate-400 mt-0.5 shrink-0"
                  />
                  <a
                    href={`mailto:${info.email}`}
                    className="text-slate-600 hover:text-primary transition-colors leading-relaxed"
                  >
                    {info.email}
                  </a>
                </li>
              )}
              {info.no_hp && (
                <li className="flex gap-3 text-sm">
                  <FiPhone
                    size={16}
                    className="text-slate-400 mt-0.5 shrink-0"
                  />
                  <a
                    href={`https://wa.me/${info.no_hp.replace(/\D/g, "")}`}
                    className="text-slate-600 hover:text-primary transition-colors leading-relaxed"
                  >
                    {info.no_hp}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <div>
              © {currentYear} <strong>{info.nama_organisasi}</strong>. All
              Rights Reserved.
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span>Managed by</span>
              <strong className="text-secondary">
                {info.footer_managed_by || "Divisi Media"}
              </strong>
              {activePeriode && (
                <>
                  <span className="text-slate-300 text-[0.8em]">|</span>
                  <span>{activePeriode}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              <span>Made with</span>
              <FiHeart size={10} fill="#ef4444" color="#ef4444" />
              <span>by</span>
              <a
                href="https://github.com/hazzb/website-osim"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors no-underline"
              >
                <FiGithub size={12} /> hazzb
              </a>
              <span>|</span>
              <a
                href="https://www.instagram.com/dan_ilevan/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-600 hover:text-pink-600 transition-colors no-underline"
              >
                <FiInstagram size={12} /> dan_ilevan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
