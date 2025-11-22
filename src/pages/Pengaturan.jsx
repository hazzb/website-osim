// src/pages/Pengaturan.jsx (Update Bagian Render)

import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import styles from "./Pengaturan.module.css";
import FormInput from "../components/admin/FormInput.jsx"; // Reuse komponen input
import formStyles from "../components/admin/AdminForm.module.css";

// Komponen Toggle Kecil
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
  // State mencakup semua kolom database baru
  const [settings, setSettings] = useState({
    visi_misi_layout: "modular",
    tampilkan_progja_rencana: true,
    tampilkan_progja_akan_datang: true,
    tampilkan_progja_selesai: true,
    nama_sekolah: "",
    nama_organisasi: "",
    deskripsi_singkat: "",
    alamat: "",
    email: "",
    no_hp: "",
    instagram_url: "",
    youtube_url: "",
    tiktok_url: "",
    logo_osis_url: "",
    logo_sekolah_url: "",
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

  // Handler Simpan Text Biasa
  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  // Handler Simpan ke DB (Tombol Save di bawah)
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("pengaturan")
        .update(settings)
        .eq("id", 1);
      if (error) throw error;
      alert("Pengaturan berhasil disimpan!");
    } catch (err) {
      alert("Gagal simpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handler Upload Logo
  const handleUploadLogo = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    setSaving(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `logo_${fieldName}_${Date.now()}.${ext}`;
      await supabase.storage.from("avatars").upload(`logos/${fileName}`, file);
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(`logos/${fileName}`);

      // Update state & DB langsung
      const newUrl = data.publicUrl;
      setSettings((prev) => ({ ...prev, [fieldName]: newUrl }));
      await supabase
        .from("pengaturan")
        .update({ [fieldName]: newUrl })
        .eq("id", 1);
    } catch (err) {
      alert("Gagal upload: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Update Toggle khusus (Optimistic)
  const updateToggle = async (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    await supabase
      .from("pengaturan")
      .update({ [key]: value })
      .eq("id", 1);
  };

  if (loading)
    return (
      <div className="main-content">
        <p className="loading-text">Memuat...</p>
      </div>
    );

  return (
    <div className="main-content">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Pengaturan Website</h1>
        </div>

        {/* 1. IDENTITAS WEBSITE (NEW) */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>🏫</span>
            <h3 className={styles.cardTitle}>Identitas & Footer</h3>
          </div>

          <div
            className={formStyles["form-grid"]}
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
            {/* Nama */}
            <FormInput
              label="Nama Organisasi (OSIS)"
              name="nama_organisasi"
              type="text"
              value={settings.nama_organisasi}
              onChange={handleChange}
              span="col-span-1"
            />
            <FormInput
              label="Nama Sekolah"
              name="nama_sekolah"
              type="text"
              value={settings.nama_sekolah}
              onChange={handleChange}
              span="col-span-1"
            />

            {/* Deskripsi */}
            <div
              style={{
                gridColumn: "span 2",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <label className={formStyles["input-label"]}>
                Deskripsi Singkat (About Us)
              </label>
              <textarea
                name="deskripsi_singkat"
                value={settings.deskripsi_singkat}
                onChange={handleChange}
                rows="3"
                className={formStyles["input-field"]}
              />
            </div>

            {/* Kontak */}
            <FormInput
              label="Alamat Sekolah"
              name="alamat"
              type="text"
              value={settings.alamat}
              onChange={handleChange}
              span="col-span-2"
            />
            <FormInput
              label="Email Resmi"
              name="email"
              type="text"
              value={settings.email}
              onChange={handleChange}
              span="col-span-1"
            />
            <FormInput
              label="No. HP / WhatsApp"
              name="no_hp"
              type="text"
              value={settings.no_hp}
              onChange={handleChange}
              span="col-span-1"
            />

            {/* Sosmed */}
            <FormInput
              label="Link Instagram"
              name="instagram_url"
              type="text"
              value={settings.instagram_url}
              onChange={handleChange}
              span="col-span-2"
            />
            <FormInput
              label="Link YouTube"
              name="youtube_url"
              type="text"
              value={settings.youtube_url}
              onChange={handleChange}
              span="col-span-1"
            />
            <FormInput
              label="Link TikTok"
              name="tiktok_url"
              type="text"
              value={settings.tiktok_url}
              onChange={handleChange}
              span="col-span-1"
            />
          </div>

          {/* Upload Logo */}
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #edf2f7",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <label className={formStyles["input-label"]}>Logo OSIS</label>
              <input
                type="file"
                onChange={(e) => handleUploadLogo(e, "logo_osis_url")}
                style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}
              />
              {settings.logo_osis_url && (
                <img
                  src={settings.logo_osis_url}
                  alt="Preview"
                  style={{
                    height: "40px",
                    marginTop: "0.5rem",
                    objectFit: "contain",
                  }}
                />
              )}
            </div>
            <div>
              <label className={formStyles["input-label"]}>Logo Sekolah</label>
              <input
                type="file"
                onChange={(e) => handleUploadLogo(e, "logo_sekolah_url")}
                style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}
              />
              {settings.logo_sekolah_url && (
                <img
                  src={settings.logo_sekolah_url}
                  alt="Preview"
                  style={{
                    height: "40px",
                    marginTop: "0.5rem",
                    objectFit: "contain",
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* 2. TATA LETAK VISI MISI */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>🎨</span>
            <h3 className={styles.cardTitle}>Tata Letak Visi & Misi</h3>
          </div>
          <div className={styles.layoutGrid}>
            {["modular", "split", "zigzag"].map((mode) => (
              <div
                key={mode}
                className={`${styles.layoutOption} ${settings.visi_misi_layout === mode ? styles.active : ""}`}
                onClick={() => updateToggle("visi_misi_layout", mode)}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                  {mode === "modular" ? "▦" : mode === "split" ? "◫" : "↯"}
                </div>
                <div style={{ textTransform: "capitalize" }}>{mode}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. VISIBILITAS PROGJA */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>📅</span>
            <h3 className={styles.cardTitle}>Visibilitas Program Kerja</h3>
          </div>
          <div>
            <ToggleItem
              label="Tampilkan 'Akan Datang'"
              checked={settings.tampilkan_progja_akan_datang}
              onChange={(val) =>
                updateToggle("tampilkan_progja_akan_datang", val)
              }
            />
            <ToggleItem
              label="Tampilkan 'Rencana Program'"
              checked={settings.tampilkan_progja_rencana}
              onChange={(val) => updateToggle("tampilkan_progja_rencana", val)}
            />
            <ToggleItem
              label="Tampilkan 'Selesai'"
              checked={settings.tampilkan_progja_selesai}
              onChange={(val) => updateToggle("tampilkan_progja_selesai", val)}
            />
          </div>
        </div>

        {/* GLOBAL SAVE BUTTON */}
        <button
          onClick={handleSaveAll}
          className="button button-primary"
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1.1rem",
            boxShadow: "0 4px 14px rgba(49, 130, 206, 0.4)",
          }}
          disabled={saving}
        >
          {saving ? "Menyimpan..." : "Simpan Semua Perubahan"}
        </button>
      </div>
    </div>
  );
}

export default Pengaturan;
