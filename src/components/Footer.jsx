import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import styles from "./Footer.module.css";

// IMPORT ICONS
import {
  FiSettings,
  FiHome,
  FiTarget,
  FiUsers,
  FiCalendar,
  FiMapPin,
  FiMail,
  FiPhone,
  FiInstagram,
  FiYoutube,
  FiGithub,
  FiHeart,
} from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAdmin = !!session;

  const currentYear = new Date().getFullYear();
  const [info, setInfo] = useState(null);
  const [activePeriode, setActivePeriode] = useState("");

  useEffect(() => {
    const fetchInfo = async () => {
      // 1. Info Umum
      const { data } = await supabase
        .from("pengaturan")
        .select("*")
        .eq("id", 1)
        .single();
      if (data) setInfo(data);

      // 2. Periode Aktif (Untuk Managed By)
      const { data: periode } = await supabase
        .from("periode_jabatan")
        .select("tahun_mulai, tahun_selesai")
        .eq("is_active", true)
        .single();

      if (periode) {
        setActivePeriode(`${periode.tahun_mulai}/${periode.tahun_selesai}`);
      } else {
        setActivePeriode(`${currentYear}/${currentYear + 1}`);
      }
    };
    fetchInfo();
  }, [currentYear]);

  // Logic Sembunyikan Footer
  const hideFooterPaths = ["/login", "/dashboard"];
  const isHidden =
    hideFooterPaths.includes(location.pathname) ||
    location.pathname.startsWith("/kelola-");

  if (isHidden) return null;
  if (!info) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* KOLOM 1: IDENTITAS */}
        <div className={styles.infoSection}>
          <div className={styles.logoRow}>
            {info.logo_sekolah_url && (
              <img
                src={info.logo_sekolah_url}
                alt="Logo Sekolah"
                className={styles.logoImg}
              />
            )}
            {info.logo_osis_url && (
              <img
                src={info.logo_osis_url}
                alt="Logo OSIS"
                className={styles.logoImg}
              />
            )}
          </div>
          <div className={styles.brandRow}>
            <h3 className={styles.brandName}>{info.nama_organisasi}</h3>
            {isAdmin && (
              <button
                onClick={() => navigate("/pengaturan")}
                className={styles.editBtn}
                title="Pengaturan Footer"
              >
                <FiSettings size={14} />
              </button>
            )}
          </div>
          <p className={styles.schoolName}>{info.nama_sekolah}</p>
          <p className={styles.brandDesc}>{info.deskripsi_singkat}</p>
          <div className={styles.socialRow}>
            {info.instagram_url && (
              <a
                href={info.instagram_url}
                target="_blank"
                rel="noreferrer"
                className={styles.socialIcon}
              >
                <FiInstagram size={20} />
              </a>
            )}
            {info.youtube_url && (
              <a
                href={info.youtube_url}
                target="_blank"
                rel="noreferrer"
                className={styles.socialIcon}
              >
                <FiYoutube size={20} />
              </a>
            )}
            {info.tiktok_url && (
              <a
                href={info.tiktok_url}
                target="_blank"
                rel="noreferrer"
                className={styles.socialIcon}
              >
                <FaTiktok size={18} />
              </a>
            )}
          </div>
        </div>

        {/* KOLOM 2: JELAJAHI */}
        <div className={styles.linksSection}>
          <h4 className={styles.columnTitle}>Jelajahi</h4>
          <div className={styles.linkGroup}>
            <Link to="/" className={styles.footerLink}>
              <FiHome size={16} /> Beranda
            </Link>
            <Link to="/visi-misi" className={styles.footerLink}>
              <FiTarget size={16} /> Visi & Misi
            </Link>
            <Link to="/daftar-anggota" className={styles.footerLink}>
              <FiUsers size={16} /> Daftar Anggota
            </Link>
            <Link to="/program-kerja" className={styles.footerLink}>
              <FiCalendar size={16} /> Program Kerja
            </Link>
          </div>
        </div>

        {/* KOLOM 3: KONTAK */}
        <div className={styles.contactSection}>
          <h4 className={styles.columnTitle}>Hubungi Kami</h4>
          <div className={styles.contactItem}>
            <FiMapPin className={styles.contactIcon} />
            <span>{info.alamat}</span>
          </div>
          <div className={styles.contactItem}>
            <FiMail className={styles.contactIcon} />
            <span>{info.email}</span>
          </div>
          <div className={styles.contactItem}>
            <FiPhone className={styles.contactIcon} />
            <span>{info.no_hp}</span>
          </div>
        </div>
      </div>

      {/* --- BAGIAN BAWAH (3 BAGIAN) --- */}
      <div className={styles.copyright}>
        {/* 1. Copyright Text */}
        <div>
          &copy; {currentYear} {info.nama_organisasi}. All Rights Reserved.
        </div>

        {/* 2. MANAGED BY (BARU - DI TENGAH) */}
        <div className={styles.managedBy}>
          <span>Managed by</span>
          <strong style={{ color: "#0284c7" }}>Divisi Media</strong>
          <span>|</span>
          <span>{activePeriode}</span>
        </div>

        {/* 3. SIGNATURE GITHUB (TETAP ADA) */}
        <div className={styles.signature}>
          <span>Made with</span>
          <FiHeart
            className={styles.heartIcon}
            size={14}
            fill="#ef4444"
            color="#ef4444"
          />
          <span>by</span>
          <a
            href="https://github.com/username-anda" // Ganti link github Anda
            target="_blank"
            rel="noreferrer"
            className={styles.githubLink}
          >
            <FiGithub size={14} /> Developer
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
