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
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* KOLOM 1: IDENTITAS (Full Width di Mobile) */}
          <div className={`${styles.col} ${styles.colIdentity}`}>
            <div className={styles.logoGroup}>
              {/* Container Logo */}
              <div className={styles.logoImages}>
                {info.logo_sekolah_url && (
                  <img
                    src={info.logo_sekolah_url}
                    alt="Logo Sekolah"
                    className={styles.logo}
                  />
                )}
                {info.logo_osis_url && (
                  <img
                    src={info.logo_osis_url}
                    alt="Logo OSIS"
                    className={styles.logo}
                  />
                )}
              </div>

              {/* Container Teks: Nama Organisasi & Sekolah */}
              <div className={styles.textGroup}>
                <h3 className={styles.orgName}>{info.nama_organisasi}</h3>
                {info.nama_sekolah && (
                  <div className={styles.schoolName}>{info.nama_sekolah}</div>
                )}
              </div>
            </div>

            <p className={styles.desc}>
              {info.deskripsi_singkat || "Wadah aspirasi dan kreasi siswa."}
            </p>

            <div className={styles.socialIcons}>
              {info.instagram_url && (
                <a href={info.instagram_url} target="_blank" rel="noreferrer">
                  <FaInstagram />
                </a>
              )}
              {info.tiktok_url && (
                <a href={info.tiktok_url} target="_blank" rel="noreferrer">
                  <FaTiktok />
                </a>
              )}
              {info.youtube_url && (
                <a href={info.youtube_url} target="_blank" rel="noreferrer">
                  <FiYoutube />
                </a>
              )}
            </div>
          </div>

          {/* KOLOM 2: JELAJAHI (Kiri di Mobile) */}
          <div className={`${styles.col} ${styles.colNav}`}>
            <h4 className={styles.colTitle}>Jelajahi</h4>
            <ul className={styles.links}>
              <li>
                <Link to="/">
                  <FiHome /> Beranda
                </Link>
              </li>
              <li>
                <Link to="/visi-misi">
                  <FiTarget /> Visi & Misi
                </Link>
              </li>
              <li>
                <Link to="/daftar-anggota">
                  <FiUsers /> Anggota
                </Link>
              </li>
              <li>
                <Link to="/program-kerja">
                  <FiCalendar /> Progja
                </Link>
              </li>
              {isAdmin ? (
                <li>
                  <Link to="/dashboard" style={{ color: "#3b82f6" }}>
                    <FiLayout /> Admin
                  </Link>
                </li>
              ) : (
                <li>
                  <Link to="/login">
                    <FiLogIn /> Login
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* KOLOM 3: HUBUNGI KAMI (Kanan di Mobile) */}
          <div className={`${styles.col} ${styles.colContact}`}>
            <h4 className={styles.colTitle}>Hubungi Kami</h4>
            <ul className={styles.contactList}>
              {info.alamat && (
                <li>
                  <FiMapPin className={styles.icon} />
                  <span>{info.alamat}</span>
                </li>
              )}
              {info.email && (
                <li>
                  <FiMail className={styles.icon} />
                  <a href={`mailto:${info.email}`}>{info.email}</a>
                </li>
              )}
              {info.no_hp && (
                <li>
                  <FiPhone className={styles.icon} />
                  <a href={`https://wa.me/${info.no_hp.replace(/\D/g, "")}`}>
                    {info.no_hp}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
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
            <span>|</span>
            <a
              href="https://www.instagram.com/dan_ilevan/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.devLink}
            >
              <FiInstagram size={12} /> dan_ilevan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
