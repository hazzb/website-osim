import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

// ICONS
import {
  FiMenu,
  FiX,
  FiHome,
  FiTarget,
  FiUsers,
  FiCalendar,
  FiLogIn,
  FiLogOut,
  FiLayout,
} from "react-icons/fi";

const Navbar = () => {
  const { session } = useAuth();
  const isAdmin = !!session;
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [orgName, setOrgName] = useState("OSIS APP"); // Default sementara

  // Fetch Logo & Nama Organisasi dari Database
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("pengaturan")
        .select("nama_organisasi, logo_osis_url") // Ambil nama & logo
        .eq("id", 1)
        .single();

      if (data) {
        if (data.logo_osis_url) setLogoUrl(data.logo_osis_url);
        if (data.nama_organisasi) setOrgName(data.nama_organisasi);
      }
    };
    fetchSettings();
  }, []);

  // Tutup mobile menu saat pindah halaman
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    if (window.confirm("Yakin ingin keluar?")) {
      await supabase.auth.signOut();
      navigate("/login");
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* 1. LOGO & NAMA ORGANISASI (DINAMIS) */}
        <Link to="/" className={styles.logoLink}>
          {/* Jika ada logo di DB, pakai. Jika tidak, pakai placeholder */}
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo Organisasi"
              className={styles.logoImg}
            />
          ) : (
            <div style={{ fontSize: "1.5rem" }}>🏫</div>
          )}

          {/* Tampilkan Nama Organisasi dari Database */}
          <span className={styles.logoText}>{orgName}</span>
        </Link>

        {/* 2. DESKTOP MENU */}
        <div className={styles.navMenu}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.activeLink}`
                : styles.navLink
            }
          >
            <FiHome /> Beranda
          </NavLink>
          <NavLink
            to="/visi-misi"
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.activeLink}`
                : styles.navLink
            }
          >
            <FiTarget /> Visi Misi
          </NavLink>
          <NavLink
            to="/anggota"
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.activeLink}`
                : styles.navLink
            }
          >
            <FiUsers /> Anggota
          </NavLink>
          <NavLink
            to="/program-kerja"
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.activeLink}`
                : styles.navLink
            }
          >
            <FiCalendar /> Progja
          </NavLink>

          {/* AUTH BUTTONS */}
          {isAdmin ? (
            <>
              <Link
                to="/dashboard"
                className={`${styles.authBtn} ${styles.btnDashboard}`}
              >
                <FiLayout /> Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className={styles.btnLogout}
                title="Logout"
              >
                <FiLogOut />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={`${styles.authBtn} ${styles.btnLogin}`}
            >
              <FiLogIn /> Login
            </Link>
          )}
        </div>

        {/* 3. MOBILE MENU TOGGLE */}
        <button
          className={styles.mobileToggle}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* 4. MOBILE MENU DROPDOWN */}
      <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ""}`}>
        <NavLink to="/" className={styles.mobileLink}>
          <FiHome /> Beranda
        </NavLink>
        <NavLink to="/visi-misi" className={styles.mobileLink}>
          <FiTarget /> Visi & Misi
        </NavLink>
        <NavLink to="/anggota" className={styles.mobileLink}>
          <FiUsers /> Daftar Anggota
        </NavLink>
        <NavLink to="/program-kerja" className={styles.mobileLink}>
          <FiCalendar /> Program Kerja
        </NavLink>

        <div
          style={{ borderTop: "1px solid #edf2f7", margin: "0.5rem 0" }}
        ></div>

        {isAdmin ? (
          <>
            <Link
              to="/dashboard"
              className={styles.mobileLink}
              style={{ color: "#2a9df4" }}
            >
              <FiLayout /> Dashboard Admin
            </Link>
            <button
              onClick={handleLogout}
              className={styles.mobileLink}
              style={{
                color: "#e53e3e",
                width: "100%",
                background: "none",
                border: "none",
                textAlign: "left",
                paddingLeft: 0,
              }}
            >
              <FiLogOut /> Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className={styles.mobileLink}
            style={{ color: "#2a9df4" }}
          >
            <FiLogIn /> Login Pengurus
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
