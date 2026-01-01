import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

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
} from "react-icons/fi";

const Navbar = () => {
  const { session } = useAuth();
  const isAdmin = !!session;
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [orgName, setOrgName] = useState("OSIS APP");

  // Fetch Settings (Logo & Nama)
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
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  // Tutup menu mobile saat pindah halaman
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* === KIRI: LOGO & MENU DESKTOP === */}
        <div className={styles.leftSection}>
          {/* Logo */}
          <Link to="/" className={styles.logoLink}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className={styles.logoImg} />
            ) : (
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: "#e2e8f0",
                  borderRadius: "50%",
                }}
              ></div>
            )}
            <span className={styles.logoText}>{orgName}</span>
          </Link>

          {/* Menu Desktop (Hilang di Mobile) */}
          <div className={styles.navLinks}>
            <NavLink
              to="/visi-misi"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              Profile
            </NavLink>
            <NavLink
              to="/anggota"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              Anggota
            </NavLink>
            <NavLink
              to="/program-kerja"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              Progja
            </NavLink>
          </div>
        </div>

        {/* === KANAN: AUTH & MOBILE TOGGLE === */}
        <div className={styles.rightSection}>
          {isAdmin ? (
            <>
              {/* Tombol Dashboard (Hidden di Mobile) */}
              <Link to="/dashboard" className={styles.btnDashboard}>
                <FiLayout /> <span>Dashboard</span>
              </Link>

              {/* Tombol Logout (Hidden di Mobile) */}
              <button
                onClick={handleLogout}
                className={styles.btnLogout}
                title="Keluar"
              >
                <FiLogOut />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={styles.btnDashboard}
              style={{
                backgroundColor: "transparent",
                color: "#475569",
                border: "1px solid #cbd5e0",
              }}
            >
              <FiLogIn /> Login
            </Link>
          )}

          {/* Tombol Burger Menu (Hanya muncul di Mobile) */}
          <button
            className={styles.mobileToggle}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* === MOBILE MENU DROPDOWN === */}
      <div className={`${styles.mobileMenu} ${isOpen ? styles.show : ""}`}>
        <NavLink to="/visi-misi" className={styles.mobileLink}>
          <FiTarget /> Profile
        </NavLink>
        <NavLink to="/anggota" className={styles.mobileLink}>
          <FiUsers /> Daftar Anggota
        </NavLink>
        <NavLink to="/program-kerja" className={styles.mobileLink}>
          <FiCalendar /> Program Kerja
        </NavLink>

        <div
          style={{ borderTop: "1px solid #f1f5f9", margin: "0.5rem 0" }}
        ></div>

        {/* Menu Auth Mobile */}
        {isAdmin ? (
          <>
            <Link
              to="/dashboard"
              className={styles.mobileLink}
              style={{ color: "#2563eb", fontWeight: 600 }}
            >
              <FiLayout /> Dashboard Admin
            </Link>
            <button
              onClick={handleLogout}
              className={styles.mobileLink}
              style={{
                color: "#ef4444",
                width: "100%",
                background: "none",
                border: "none",
                textAlign: "left",
                paddingLeft: 0,
                cursor: "pointer",
              }}
            >
              <FiLogOut /> Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className={styles.mobileLink}
            style={{ color: "#475569" }}
          >
            <FiLogIn /> Login Admin
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
