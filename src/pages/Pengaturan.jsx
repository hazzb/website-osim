import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import styles from "./Pengaturan.module.css";

// Komponen Toggle Switch Internal
const ToggleItem = ({ label, checked, onChange }) => (
  <div className={styles.toggleRow}>
    <span className={styles.toggleLabel}>{label}</span>
    <div
      className={`${styles.toggleSwitch} ${checked ? styles.active : ""}`}
      onClick={() => onChange(!checked)}
    >
      <div className={styles.toggleKnob}></div>
    </div>
  </div>
);

function Pengaturan() {
  const [settings, setSettings] = useState({
    visi_misi_layout: "modular",
    tampilkan_progja_rencana: true,
    tampilkan_progja_akan_datang: true,
    tampilkan_progja_selesai: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from("pengaturan")
        .select("*")
        .eq("id", 1)
        .single();
      if (data) setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generic Update Function
  const updateSetting = async (key, value) => {
    // Optimistic Update
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaving(true);
    try {
      await supabase
        .from("pengaturan")
        .update({ [key]: value })
        .eq("id", 1);
    } catch (err) {
      console.error("Gagal simpan:", err);
      alert("Gagal menyimpan perubahan.");
      // Revert logic could be added here
    } finally {
      setTimeout(() => setSaving(false), 500); // Delay dikit biar keliatan
    }
  };

  if (loading)
    return (
      <div className="main-content">
        <p className="loading-text">Memuat pengaturan...</p>
      </div>
    );

  return (
    <div className="main-content">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Pengaturan Website</h1>
          <p className={styles.subtitle}>
            Kelola tampilan dan konfigurasi global website.
          </p>
        </div>

        {/* 1. PENGATURAN VISI MISI */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>🎨</span>
            <h3 className={styles.cardTitle}>Tata Letak Visi & Misi</h3>
          </div>

          <p
            style={{
              fontSize: "0.9rem",
              color: "#718096",
              marginBottom: "1rem",
            }}
          >
            Pilih gaya tampilan untuk konten di halaman Visi & Misi.
          </p>

          <div className={styles.layoutGrid}>
            {["modular", "split", "zigzag"].map((mode) => (
              <div
                key={mode}
                className={`${styles.layoutOption} ${settings.visi_misi_layout === mode ? styles.active : ""}`}
                onClick={() => updateSetting("visi_misi_layout", mode)}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                  {mode === "modular" ? "▦" : mode === "split" ? "◫" : "↯"}
                </div>
                <div style={{ textTransform: "capitalize" }}>{mode}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. PENGATURAN PROGJA */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>📅</span>
            <h3 className={styles.cardTitle}>Visibilitas Program Kerja</h3>
          </div>

          <p
            style={{
              fontSize: "0.9rem",
              color: "#718096",
              marginBottom: "1rem",
            }}
          >
            Atur status program kerja apa saja yang boleh dilihat oleh
            pengunjung (Tamu).
          </p>

          <div>
            <ToggleItem
              label="Tampilkan 'Akan Datang'"
              checked={settings.tampilkan_progja_akan_datang}
              onChange={(val) =>
                updateSetting("tampilkan_progja_akan_datang", val)
              }
            />
            <ToggleItem
              label="Tampilkan 'Rencana Program'"
              checked={settings.tampilkan_progja_rencana}
              onChange={(val) => updateSetting("tampilkan_progja_rencana", val)}
            />
            <ToggleItem
              label="Tampilkan 'Selesai / Terlaksana'"
              checked={settings.tampilkan_progja_selesai}
              onChange={(val) => updateSetting("tampilkan_progja_selesai", val)}
            />
          </div>
        </div>

        {/* SAVING INDICATOR (Fixed Bottom Right) */}
        {saving && (
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              background: "#2d3748",
              color: "white",
              padding: "10px 20px",
              borderRadius: "99px",
              fontSize: "0.85rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              animation: "fadeIn 0.2s",
            }}
          >
            💾 Menyimpan...
          </div>
        )}
      </div>
    </div>
  );
}

export default Pengaturan;
