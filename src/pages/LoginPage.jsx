// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import styles from "./LoginPage.module.css"; // Pastikan nama file CSS sesuai

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);

  // 1. Ambil Logo dari Database (Supaya Dinamis)
  useEffect(() => {
    const fetchLogo = async () => {
      const { data } = await supabase
        .from("pengaturan")
        .select("logo_osis_url")
        .eq("id", 1)
        .single();
      if (data && data.logo_osis_url) {
        setLogoUrl(data.logo_osis_url);
      }
    };
    fetchLogo();
  }, []);

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

      if (data.user) {
        navigate("/dashboard");
      }
    } catch (error) {
      setErrorMsg("Email atau password salah. Coba lagi ya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-card"]}>
        {/* LOGO */}
        <div className={styles["logo-container"]}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo OSIS" className={styles.logo} />
          ) : (
            // Placeholder Icon jika logo belum diload/tidak ada
            <div style={{ fontSize: "3rem" }}>🔐</div>
          )}
        </div>

        <h1 className={styles.title}>Login Admin</h1>
        <p className={styles.subtitle}>Masuk untuk mengelola website</p>

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
                placeholder="nama@email.com"
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
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className={styles["toggle-password"]}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                title={showPassword ? "Sembunyikan" : "Tampilkan"}
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
            {loading ? "Memproses..." : "Masuk Dashboard"}
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
