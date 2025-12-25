import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Breadcrumbs.module.css";
import { FiChevronRight, FiHome } from "react-icons/fi";

const Breadcrumbs = ({ overrideLastText }) => {
  const location = useLocation();

  // Sembunyikan breadcrumb di halaman Home dan Login
  if (location.pathname === "/" || location.pathname === "/login") return null;

  // 1. Ambil segmen URL asli
  let pathnames = location.pathname.split("/").filter((x) => x);

  // --- LOGIKA PERBAIKAN HIERARKI (VIRTUAL NESTING) ---
  // Daftar halaman yang secara visual harus ada di bawah "Dashboard"
  const adminRoutes = ["kelola-anggota", "pengaturan", "kelola-jabatan"];

  // Cek apakah halaman saat ini adalah halaman admin tapi URL-nya tidak ada 'dashboard'
  const isAdminPage = pathnames.length > 0 && adminRoutes.includes(pathnames[0]);

  // Jika ya, kita suntikkan 'dashboard' ke depan array agar breadcrumb terlihat rapi
  if (isAdminPage) {
    pathnames.unshift("dashboard");
  }
  // ----------------------------------------------------

  const routeNameMap = {
    "visi-misi": "Visi & Misi",
    "daftar-anggota": "Daftar Anggota",
    "kelola-anggota": "Kelola Anggota", // Tambahkan mapping nama
    "program-kerja": "Program Kerja",
    "dashboard": "Dashboard",
    "pengaturan": "Pengaturan",
    "divisi": "Divisi",
  };

  const isId = (str) => !isNaN(str) || str.length > 15;

  return (
    <div className={styles.container}>
      <nav aria-label="Breadcrumb">
        <ol className={styles.list}>
          {/* Home */}
          <li className={styles.item}>
            <Link to="/" className={styles.link}>
              <FiHome className={styles.homeIcon} /> Beranda
            </Link>
          </li>

          {/* Loop Segments */}
          {pathnames.map((value, index) => {
            const isLast = index === pathnames.length - 1;

            // 2. Generate Link (Hati-hati dengan path virtual)
            // Default logic: gabungkan path dari awal sampai index ini
            let to = `/${pathnames.slice(0, index + 1).join("/")}`;

            // FIX URL: Jika kita menyuntikkan 'dashboard' secara virtual, 
            // URL seperti '/dashboard/kelola-anggota' mungkin tidak valid di router.
            // Kita harus menghapus '/dashboard' dari string URL untuk child-nya.
            if (isAdminPage && index > 0) {
               to = to.replace("/dashboard", ""); // Kembalikan ke /kelola-anggota
            }

            // Formatting Nama Tampilan
            let displayName = routeNameMap[value] || value.replace(/-/g, " ");
            if (isId(value)) displayName = "Detail";
            
            // Kapitalisasi huruf pertama setiap kata
            displayName = displayName
              .split(" ")
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            if (isLast && overrideLastText) displayName = overrideLastText;

            return (
              <li key={`${to}-${index}`} className={styles.item}>
                <span className={styles.separator}>
                  <FiChevronRight />
                </span>

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