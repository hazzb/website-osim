// src/components/Footer.jsx

import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // Sembunyikan footer di halaman login
  if (location.pathname === "/login") return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* KOLOM 1: Info Organisasi */}
        <div className={styles.infoSection}>
          <h3 className={styles.brandName}>OSIS SMA NUSA BANGSA</h3>
          <p className={styles.brandDesc}>
            Organisasi Siswa Intra Sekolah yang berdedikasi untuk mengembangkan
            potensi, kreativitas, dan kepemimpinan siswa demi masa depan yang
            gemilang.
          </p>
          {/* Sosial Media Icons (Contoh Text) */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
            <a href="#" className={styles.footerLink}>
              Instagram
            </a>
            <a href="#" className={styles.footerLink}>
              YouTube
            </a>
            <a href="#" className={styles.footerLink}>
              TikTok
            </a>
          </div>
        </div>

        {/* KOLOM 2: Navigasi Cepat */}
        <div className={styles.linksSection}>
          <h4 className={styles.columnTitle}>Jelajahi</h4>
          <div className={styles.linkGroup}>
            <Link to="/" className={styles.footerLink}>
              🏠 Beranda
            </Link>
            <Link to="/visi-misi" className={styles.footerLink}>
              🎯 Visi & Misi
            </Link>
            <Link to="/anggota" className={styles.footerLink}>
              👥 Daftar Anggota
            </Link>
            <Link to="/program-kerja" className={styles.footerLink}>
              📅 Program Kerja
            </Link>
          </div>
        </div>

        {/* KOLOM 3: Kontak & Alamat */}
        <div className={styles.contactSection}>
          <h4 className={styles.columnTitle}>Hubungi Kami</h4>

          <div className={styles.contactItem}>
            <span>📍</span>
            <span>
              Jl. Merdeka No. 45, Jakarta Selatan,
              <br />
              DKI Jakarta, 12345
            </span>
          </div>

          <div className={styles.contactItem}>
            <span>📧</span>
            <span>osis@smanusabangsa.sch.id</span>
          </div>

          <div className={styles.contactItem}>
            <span>📞</span>
            <span>(021) 555-1234</span>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className={styles.copyright}>
        &copy; {currentYear} Tim IT OSIS SMA Nusa Bangsa. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
