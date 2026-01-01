import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import styles from "./Footer.module.css";

// IMPORT ICONS
import {
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
  FiLogIn,
  FiLayout,
} from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";

const Footer = () => {
  const { session } = useAuth();
  const isAdmin = !!session;

  const currentYear = new Date().getFullYear();
  const [info, setInfo] = useState(null);
  const [activePeriode, setActivePeriode] = useState("");

  useEffect(() => {
    const fetchInfo = async () => {
      const { data } = await supabase
        .from("pengaturan")
        .select("*")
        .eq("id", 1)
        .single();
      if (data) setInfo(data);

      const { data: periode } = await supabase
        .from("periode_jabatan")
        .select("nama_kabinet")
        .eq("is_active", true)
        .single();
      if (periode) setActivePeriode(periode.nama_kabinet);
    };
    fetchInfo();
  }, []);

  if (!info) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* --- KOLOM 1: INFO & BRAND (Span 2 di Mobile) --- */}
        <div className={styles.infoSection}>
          <div className={styles.logoRow}>
            {/* Logo Sekolah */}
            {info.logo_sekolah_url && (
              <img
                src={info.logo_sekolah_url}
                alt="Logo Sekolah"
                className={styles.logoImg}
              />
            )}

            {/* Separator Line */}
            {info.logo_sekolah_url && info.logo_osis_url && (
              <div className={styles.logoSeparator}></div>
            )}

            {/* Logo OSIS */}
            {info.logo_osis_url && (
              <img
                src={info.logo_osis_url}
                alt="Logo Organisasi"
                className={styles.logoImg}
              />
            )}

            {/* Teks Nama Brand */}
            <div className={styles.brandName}>
              <span className={styles.orgName}>
                {/* HAPUS 'OSIS', Ganti dengan data database */}
                {info.singkatan_organisasi || info.nama_organisasi}
              </span>
              <span className={styles.schoolName}>{info.nama_sekolah}</span>
            </div>
          </div>

          <p className={styles.description}>
            Wadah aspirasi dan kreasi siswa untuk mewujudkan lingkungan sekolah
            yang aktif, kreatif, dan berprestasi.
          </p>

          <div className={styles.socialRow}>
            {info.instagram_url && (
              <a
                href={`https://instagram.com/${info.instagram_url}`}
                target="_blank"
                rel="noreferrer"
                className={styles.socialIcon}
                title="Instagram"
              >
                <FiInstagram />
              </a>
            )}
            {info.youtube_url && (
              <a
                href={info.youtube_url}
                target="_blank"
                rel="noreferrer"
                className={styles.socialIcon}
                title="YouTube"
              >
                <FiYoutube />
              </a>
            )}
            {info.tiktok_url && (
              <a
                href={`https://tiktok.com/@${info.tiktok_url}`}
                target="_blank"
                rel="noreferrer"
                className={styles.socialIcon}
                title="TikTok"
              >
                <FaTiktok />
              </a>
            )}
          </div>
        </div>

        {/* --- KOLOM 2: MENU (Kiri di Mobile) --- */}
        <div>
          <h4 className={styles.colTitle}>Menu</h4>
          <div className={styles.linkGroup}>
            <Link to="/" className={styles.footerLink}>
              <FiHome size={14} /> Beranda
            </Link>
            <Link to="/visi-misi" className={styles.footerLink}>
              <FiTarget size={14} /> Profile
            </Link>
            <Link to="/anggota" className={styles.footerLink}>
              <FiUsers size={14} /> Anggota
            </Link>
            <Link to="/program-kerja" className={styles.footerLink}>
              <FiCalendar size={14} /> Progja
            </Link>

            {isAdmin ? (
              <Link
                to="/dashboard"
                className={styles.footerLink}
                style={{ color: "#0284c7", fontWeight: 700 }}
              >
                <FiLayout size={14} /> Dashboard
              </Link>
            ) : (
              <Link to="/login" className={styles.footerLink}>
                <FiLogIn size={14} /> Login
              </Link>
            )}
          </div>
        </div>

        {/* --- KOLOM 3: KONTAK (Kanan di Mobile) --- */}
        <div>
          <h4 className={styles.colTitle}>Kontak</h4>
          <div className={styles.linkGroup}>
            <div className={styles.contactItem}>
              <FiMapPin className={styles.contactIcon} size={14} />
              <span>{info.alamat_sekolah || "-"}</span>
            </div>
            <div className={styles.contactItem}>
              <FiMail className={styles.contactIcon} size={14} />
              <span>{info.email_kontak || "-"}</span>
            </div>
            <div className={styles.contactItem}>
              <FiPhone className={styles.contactIcon} size={14} />
              <span>{info.telepon_kontak || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- COPYRIGHT --- */}
      <div className={styles.copyright}>
        <div className={styles.copyrightContainer}>
          <div>
            &copy; {currentYear} <strong>{info.nama_organisasi}</strong>. All
            Rights Reserved.
          </div>

          <div className={styles.managedBy}>
            <span>Managed by</span>
            <strong style={{ color: "#0284c7" }}>
              {info.footer_managed_by || "Divisi Media"}
            </strong>
            {activePeriode && (
              <>
                <span style={{ color: "#cbd5e1", fontSize: "0.8em" }}>|</span>
                <span>{activePeriode}</span>
              </>
            )}
          </div>

          <div className={styles.signature}>
            <span>Made with</span>
            <FiHeart size={10} fill="#ef4444" color="#ef4444" />
            <span>by</span>
            <a
              href="https://github.com/hazzb/website-osim"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.devLink}
            >
              <FiGithub size={12} /> hazzb
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
