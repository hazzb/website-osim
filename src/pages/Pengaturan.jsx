import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import FormInput from "../components/admin/FormInput.jsx";
import { uploadImage } from "../utils/uploadHelper";

// Styles
import styles from "./Pengaturan.module.css";
import formStyles from "../components/admin/AdminForm.module.css";

// Icons
import { FiSave, FiMonitor, FiInfo, FiPhone, FiImage } from "react-icons/fi";

function Pengaturan() {
  const { session } = useAuth();
  const isAdmin = !!session;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("umum");

  // Data State (Sesuai kolom tabel public.pengaturan)
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({ logo_sekolah: null, logo_osis: null });
  const [previews, setPreviews] = useState({
    logo_sekolah: null,
    logo_osis: null,
  });

  // 1. FETCH DATA SESUAI TABEL
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("pengaturan")
          .select("*") // Mengambil semua kolom sesuai tabel
          .eq("id", 1)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setFormData(data);
          // Set preview gambar
          setPreviews({
            logo_sekolah: data.logo_sekolah_url,
            logo_osis: data.logo_osis_url,
          });
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 2. HANDLERS
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [field]: file }));
      setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let updates = { ...formData, id: 1 };

      // Upload Images jika ada file baru
      if (files.logo_sekolah) {
        updates.logo_sekolah_url = await uploadImage(
          files.logo_sekolah,
          "logos"
        );
      }
      if (files.logo_osis) {
        updates.logo_osis_url = await uploadImage(files.logo_osis, "logos");
      }

      const { error } = await supabase.from("pengaturan").upsert(updates);
      if (error) throw error;

      alert("Pengaturan berhasil disimpan!");
      window.location.reload();
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <PageContainer>
      <PageHeader
        title="Pengaturan Website"
        subtitle="Kelola informasi umum, kontak, dan tampilan sesuai database."
        actions={
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="button button-primary"
            style={{ minWidth: "120px" }}
          >
            {saving ? (
              "Menyimpan..."
            ) : (
              <>
                <FiSave /> Simpan
              </>
            )}
          </button>
        }
      />

      {/* Tabs Navigation */}
      <div className={styles.tabContainer}>
        <div className={styles.tabGroup}>
          <button
            onClick={() => setActiveTab("umum")}
            className={`${styles.tabBtn} ${
              activeTab === "umum" ? styles.active : ""
            }`}
          >
            <FiMonitor /> Umum & Tampilan
          </button>
          <button
            onClick={() => setActiveTab("kontak")}
            className={`${styles.tabBtn} ${
              activeTab === "kontak" ? styles.active : ""
            }`}
          >
            <FiPhone /> Kontak & Sosmed
          </button>
          <button
            onClick={() => setActiveTab("tentang")}
            className={`${styles.tabBtn} ${
              activeTab === "tentang" ? styles.active : ""
            }`}
          >
            <FiInfo /> Tentang & Footer
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={formStyles.formWrapper}>
          <form onSubmit={handleSubmit} className={formStyles.formGrid}>
            {/* --- TAB 1: UMUM & TAMPILAN --- */}
            {activeTab === "umum" && (
              <>
                <div className={formStyles.colSpan12}>
                  <h3 className={styles.sectionTitle}>Identitas Organisasi</h3>
                </div>

                <div className={formStyles.colSpan6}>
                  <FormInput
                    label="Nama Organisasi"
                    name="nama_organisasi"
                    value={formData.nama_organisasi || ""}
                    onChange={handleChange}
                    placeholder="Contoh: OSIS SMAN Contoh"
                  />
                </div>
                <div className={formStyles.colSpan6}>
                  <FormInput
                    label="Nama Sekolah"
                    name="nama_sekolah"
                    value={formData.nama_sekolah || ""}
                    onChange={handleChange}
                    placeholder="Nama sekolah lengkap"
                  />
                </div>

                {/* Upload Logos */}
                <div className={formStyles.colSpan6}>
                  <div className={formStyles.formGroup}>
                    <label className={formStyles.formLabel}>
                      <FiImage style={{ marginRight: 4 }} /> Logo Sekolah
                    </label>
                    <div className={formStyles.uploadRow}>
                      <div className={formStyles.previewBox}>
                        {previews.logo_sekolah ? (
                          <img
                            src={previews.logo_sekolah}
                            className={formStyles.previewImage}
                            alt="Preview"
                          />
                        ) : (
                          <span
                            style={{ fontSize: "0.7rem", color: "#cbd5e1" }}
                          >
                            No img
                          </span>
                        )}
                      </div>
                      <div className={formStyles.fileInputWrapper}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "logo_sekolah")}
                          className={formStyles.fileInput}
                        />
                        <span className={formStyles.helperText}>
                          Maks 2MB (PNG/JPG)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={formStyles.colSpan6}>
                  <div className={formStyles.formGroup}>
                    <label className={formStyles.formLabel}>
                      <FiImage style={{ marginRight: 4 }} /> Logo OSIS
                    </label>
                    <div className={formStyles.uploadRow}>
                      <div className={formStyles.previewBox}>
                        {previews.logo_osis ? (
                          <img
                            src={previews.logo_osis}
                            className={formStyles.previewImage}
                            alt="Preview"
                          />
                        ) : (
                          <span
                            style={{ fontSize: "0.7rem", color: "#cbd5e1" }}
                          >
                            No img
                          </span>
                        )}
                      </div>
                      <div className={formStyles.fileInputWrapper}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "logo_osis")}
                          className={formStyles.fileInput}
                        />
                        <span className={formStyles.helperText}>
                          Maks 2MB (PNG/JPG)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={formStyles.colSpan12}>
                  <FormInput
                    label="Alamat Lengkap"
                    name="alamat"
                    type="textarea"
                    value={formData.alamat || ""}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* --- TAB 2: KONTAK & SOSMED --- */}
            {activeTab === "kontak" && (
              <>
                <div className={formStyles.colSpan12}>
                  <h3 className={styles.sectionTitle}>Kontak & Sosial Media</h3>
                </div>

                <div className={formStyles.colSpan6}>
                  <FormInput
                    label="Email Resmi"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className={formStyles.colSpan6}>
                  <FormInput
                    label="Nomor HP / WA"
                    name="no_hp"
                    value={formData.no_hp || ""}
                    onChange={handleChange}
                  />
                </div>

                <div
                  className={formStyles.colSpan12}
                  style={{ margin: "1rem 0", borderTop: "1px dashed #e2e8f0" }}
                ></div>

                <div className={formStyles.colSpan6}>
                  <FormInput
                    label="Instagram URL"
                    name="instagram_url"
                    value={formData.instagram_url || ""}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className={formStyles.colSpan6}>
                  <FormInput
                    label="TikTok URL"
                    name="tiktok_url"
                    value={formData.tiktok_url || ""}
                    onChange={handleChange}
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
                <div className={formStyles.colSpan6}>
                  <FormInput
                    label="YouTube URL"
                    name="youtube_url"
                    value={formData.youtube_url || ""}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* --- TAB 3: TENTANG & FOOTER --- */}
            {activeTab === "tentang" && (
              <>
                <div className={formStyles.colSpan12}>
                  <h3 className={styles.sectionTitle}>Konfigurasi Halaman</h3>
                </div>

                <div className={formStyles.colSpan12}>
                  <FormInput
                    label="Deskripsi Singkat (Footer)"
                    name="deskripsi_singkat"
                    type="textarea"
                    value={formData.deskripsi_singkat || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className={formStyles.colSpan6}>
                  <div className={formStyles.formGroup}>
                    <label className={formStyles.formLabel}>
                      Tampilan Hero Section
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "6px",
                      }}
                    >
                      <input
                        type="checkbox"
                        name="beranda_tampilkan_hero"
                        checked={formData.beranda_tampilkan_hero || false}
                        onChange={handleChange}
                        id="chkHero"
                        style={{ width: "16px", height: "16px" }}
                      />
                      <label
                        htmlFor="chkHero"
                        style={{ fontSize: "0.9rem", color: "#334155" }}
                      >
                        Tampilkan judul besar di halaman utama
                      </label>
                    </div>
                  </div>
                </div>

                <div className={formStyles.colSpan6}>
                  <FormInput
                    label="Layout Visi Misi"
                    name="visi_misi_layout"
                    type="select"
                    value={formData.visi_misi_layout || "modular"}
                    onChange={handleChange}
                  >
                    <option value="modular">Modular Grid (Modern)</option>
                    <option value="split">Split Card (Klasik)</option>
                    <option value="zigzag">Zig-Zag Story</option>
                  </FormInput>
                </div>

                {/* SETTING FOOTER */}
                <div
                  className={formStyles.colSpan12}
                  style={{
                    marginTop: "1rem",
                    paddingTop: "1rem",
                    borderTop: "1px dashed #e2e8f0",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#334155",
                    }}
                  >
                    Pengaturan Footer
                  </strong>
                  <FormInput
                    label="Divisi Pengelola (Managed By)"
                    name="footer_managed_by"
                    value={formData.footer_managed_by || ""}
                    onChange={handleChange}
                    span={12}
                    placeholder="Contoh: Divisi Media"
                  />
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </PageContainer>
  );
}

export default Pengaturan;
