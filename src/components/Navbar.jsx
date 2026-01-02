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
  FiHome,
} from "react-icons/fi";

const Navbar = () => {
  const { session } = useAuth();
  const isAdmin = !!session;
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [orgName, setOrgName] = useState("OSIS APP");

  // Fetch Settings
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
      } catch (error) {
        console.error("Error navbar settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
    setIsOpen(false);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* LEFT SECTION */}
        <div className={styles.leftSection}>
          <Link to="/" className={styles.logoLink}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className={styles.logoImage} />
            ) : (
              <div
                style={{
                  width: 34,
                  height: 34,
                  background: "#e2e8f0",
                  borderRadius: "50%",
                }}
              />
            )}
            <span className={styles.logoText}>{orgName}</span>
          </Link>

          {/* Desktop Menu */}
          <div className={styles.desktopMenu}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              <FiHome size={18} /> Beranda
            </NavLink>
            <NavLink
              to="/visi-misi"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              <FiTarget size={18} /> Profile
            </NavLink>
            <NavLink
              to="/anggota"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              <FiUsers size={18} /> Anggota
            </NavLink>
            <NavLink
              to="/program-kerja"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              <FiCalendar size={18} /> Program
            </NavLink>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className={styles.rightSection}>
          {isAdmin ? (
            <>
              <Link to="/dashboard" className={styles.authBtn}>
                <FiLayout /> Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className={styles.authBtn}
                style={{ color: "#ef4444", borderColor: "#fee2e2" }}
              >
                <FiLogOut />
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.authBtn}>
              <FiLogIn /> Login
            </Link>
          )}

          <button
            className={styles.hamburger}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`${styles.mobileMenu} ${isOpen ? styles.show : ""}`}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${styles.mobileLink} ${isActive ? styles.active : ""}`
          }
        >
          <FiHome /> Beranda
        </NavLink>
        <NavLink
          to="/visi-misi"
          className={({ isActive }) =>
            `${styles.mobileLink} ${isActive ? styles.active : ""}`
          }
        >
          <FiTarget /> Profile
        </NavLink>
        <NavLink
          to="/anggota"
          className={({ isActive }) =>
            `${styles.mobileLink} ${isActive ? styles.active : ""}`
          }
        >
          <FiUsers /> Daftar Anggota
        </NavLink>
        <NavLink
          to="/program-kerja"
          className={({ isActive }) =>
            `${styles.mobileLink} ${isActive ? styles.active : ""}`
          }
        >
          <FiCalendar /> Program Kerja
        </NavLink>

        <div
          style={{ borderTop: "1px solid #f1f5f9", margin: "0.5rem 0" }}
        ></div>

        {isAdmin ? (
          <>
            <Link
              to="/dashboard"
              className={styles.mobileLink}
              style={{ color: "#2563eb" }}
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
                paddingLeft: "1rem",
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
