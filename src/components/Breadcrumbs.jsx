// src/components/Breadcrumbs.jsx

import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Breadcrumbs.module.css";

const Breadcrumbs = () => {
  const location = useLocation();

  // 1. Sembunyikan di halaman Home atau Login
  if (location.pathname === "/" || location.pathname === "/login") {
    return null;
  }

  // 2. Pecah URL menjadi array
  const pathnames = location.pathname.split("/").filter((x) => x);

  // 3. Kamus untuk mengubah URL slug menjadi teks yang cantik
  const routeNameMap = {
    "visi-misi": "Visi & Misi",
    anggota: "Daftar Anggota",
    "program-kerja": "Program Kerja",
    dashboard: "Dashboard Admin",
    pengaturan: "Pengaturan",
    divisi: "Divisi",
  };

  // Fungsi helper untuk cek apakah string adalah ID (angka atau UUID panjang)
  const isId = (str) => {
    // Cek jika angka atau string panjang (>10 char biasanya UUID)
    return !isNaN(str) || str.length > 15;
  };

  return (
    <div className={styles.container}>
      <nav className={styles.nav} aria-label="Breadcrumb">
        <ol className={styles.list}>
          {/* Item 1: Beranda (Selalu ada) */}
          <li className={styles.item}>
            <Link to="/" className={styles.link}>
              Beranda
            </Link>
          </li>

          {/* Item Loop: Sisa URL */}
          {pathnames.map((value, index) => {
            const isLast = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;

            // Tentukan label: Gunakan map, atau "Detail" jika itu ID, atau format biasa
            let displayName = routeNameMap[value] || value.replace(/-/g, " ");

            // Jika ini adalah segmen ID (misal: /divisi/123), ubah teks jadi "Detail"
            if (isId(value)) {
              displayName = "Detail";
            }

            // Kapitalisasi huruf pertama
            displayName =
              displayName.charAt(0).toUpperCase() + displayName.slice(1);

            return (
              <li key={to} className={styles.item}>
                <span className={styles.separator}>/</span>
                {isLast ? (
                  <span className={styles.active} aria-current="page">
                    {displayName}
                  </span>
                ) : (
                  <Link to={to} className={styles.link}>
                    {displayName}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumbs;
