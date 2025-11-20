// src/pages/Login.jsx
// --- VERSI MODERN & RESPONSIF ---

import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import styles from "./LoginPage.module.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // Login Sukses
      if (data.user) {
        navigate("/dashboard"); // Arahkan ke dashboard admin
      }
    } catch (error) {
      setErrorMsg("Email atau password salah. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-card"]}>
        {/* Logo Organisasi */}
        <div className={styles["logo-container"]}>
          {/* Ganti src ini dengan path logo Anda yang sebenarnya */}
          <img
            src="/logo-osim.png"
            alt="Logo OSIM"
            className={styles.logo}
            onError={(e) => {
              e.target.style.display = "none";
            }} // Sembunyikan jika gambar tidak ada
          />
        </div>

        <h1 className={styles.title}>Selamat Datang</h1>
        <p className={styles.subtitle}>
          Silakan login untuk masuk ke panel admin
        </p>

        {errorMsg && <div className={styles["error-box"]}>⚠️ {errorMsg}</div>}

        <form onSubmit={handleLogin}>
          <div className={styles["form-group"]}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <div className={styles["input-wrapper"]}>
              <input
                id="email"
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sekolah.sch.id"
                required
              />
            </div>
          </div>

          <div className={styles["form-group"]}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <div className={styles["input-wrapper"]}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password..."
                required
              />
              {/* Tombol Mata (Show/Hide) */}
              <button
                type="button"
                className={styles["toggle-password"]}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1" // Agar tidak bisa di-tab
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles["btn-login"]}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk Sekarang"}
          </button>
        </form>

        <Link to="/" className={styles["home-link"]}>
          &larr; Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default Login;
