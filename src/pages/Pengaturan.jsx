import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

// Components & Utils
import PageContainer from "../components/ui/PageContainer.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import FormInput from "../components/admin/FormInput.jsx";
import { uploadImage } from "../utils/uploadHelper";

// Styles
import styles from "./Pengaturan.module.css";
import formStyles from "../components/admin/AdminForm.module.css";

// Icons
import {
  FiSave,
  FiMonitor,
  FiInfo,
  FiShare2,
  FiPhone,
  FiImage,
} from "react-icons/fi";

function Pengaturan() {
  const { session } = useAuth();
  const isAdmin = !!session;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("umum"); // Tabs: umum, kontak, sosmed, tampilan

  // State Data Form
  const [formData, setFormData] = useState({});

  // State File Baru (Untuk Upload)
  const [files, setFiles] = useState({
    logo_sekolah: null,
    logo_osis: null,
  });

  // State Preview (Untuk Tampilan Langsung)
  const [previews, setPreviews] = useState({
    logo_sekolah: null,
    logo_osis: null,
  });

  // 1. Fetch Data Saat Load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("pengaturan")
          .select("*")
          .eq("id", 1)
          .single();

        if (error && error.code !== "PGRST116") throw error; // Abaikan jika data kosong

        if (data) {
          setFormData(data);
          // Set preview awal dari URL database
          setPreviews({
            logo_sekolah: data.logo_sekolah_url,
            logo_osis: data.logo_osis_url,
          });
        }
      } catch (err) {
        console.error("Gagal memuat pengaturan:", err);
        alert("Gagal memuat data pengaturan.");
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) fetchData();
  }, [isAdmin]);

  // 2. Handler Input Teks
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  // 3. Handler Input File (Khusus Logo)
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];

    if (file) {
      // --- KITA HAPUS BAGIAN VALIDASI ALERT DISINI ---
      // Biarkan helper yang bekerja mengompresnya.

      // Simpan file ke state files
      setFiles((prev) => ({ ...prev, [fieldName]: file }));
      // Buat preview URL
      setPreviews((prev) => ({
        ...prev,
        [fieldName]: URL.createObjectURL(file),
      }));
    }
  };

  // 4. Submit & Upload Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let updatedData = { ...formData };

      // A. Upload Logo Sekolah (Jika ada file baru)
      if (files.logo_sekolah) {
        const url = await uploadImage(files.logo_sekolah, "assets", 0.2);
        updatedData.logo_sekolah_url = url;
      }

      // B. Upload Logo OSIS (Jika ada file baru)
      if (files.logo_osis) {
        const url = await uploadImage(files.logo_osis, "assets", 0.2);
        updatedData.logo_osis_url = url;
      }

      // C. Simpan ke Database (Update ID 1)
      // Cek dulu apakah data ID 1 sudah ada
      const { data: existing } = await supabase
        .from("pengaturan")
        .select("id")
        .eq("id", 1)
        .single();

      if (existing) {
        // Update
        const { error } = await supabase
          .from("pengaturan")
          .update(updatedData)
          .eq("id", 1);
        if (error) throw error;
      } else {
        // Insert (Pertama kali)
        const { error } = await supabase
          .from("pengaturan")
          .insert({ ...updatedData, id: 1 });
        if (error) throw error;
      }

      alert("Pengaturan berhasil disimpan!");

      // Reset file state agar tidak upload ulang jika klik simpan lagi
      setFiles({ logo_sekolah: null, logo_osis: null });
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    );
  if (!isAdmin)
    return (
      <PageContainer>
        <div>Akses ditolak.</div>
      </PageContainer>
    );

  return (
    <PageContainer breadcrumbText="Pengaturan Website">
      <div className="page-header">
        <h1 className="page-title">Pengaturan Umum</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Kelola identitas website, kontak, dan tampilan.
        </p>
      </div>

      {/* --- TABS NAVIGATION --- */}
      <div className={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab("umum")}
          className={`${styles.tabButton} ${
            activeTab === "umum" ? styles.activeTab : ""
          }`}
        >
          <FiInfo /> Identitas & Logo
        </button>
        <button
          onClick={() => setActiveTab("kontak")}
          className={`${styles.tabButton} ${
            activeTab === "kontak" ? styles.activeTab : ""
          }`}
        >
          <FiPhone /> Kontak & Alamat
        </button>
        <button
          onClick={() => setActiveTab("sosmed")}
          className={`${styles.tabButton} ${
            activeTab === "sosmed" ? styles.activeTab : ""
          }`}
        >
          <FiShare2 /> Sosial Media
        </button>
        <button
          onClick={() => setActiveTab("tampilan")}
          className={`${styles.tabButton} ${
            activeTab === "tampilan" ? styles.activeTab : ""
          }`}
        >
          <FiMonitor /> Tampilan
        </button>
      </div>

      {/* --- FORM CARD --- */}
      <form onSubmit={handleSubmit} className={styles.card}>
        {/* TAB 1: UMUM */}
        {activeTab === "umum" && (
          <div className={formStyles.formGrid}>
            <h3 className={styles.sectionTitle}>Identitas Organisasi</h3>

            <FormInput
              label="Nama Organisasi (OSIS)"
              name="nama_organisasi"
              value={formData.nama_organisasi || ""}
              onChange={handleChange}
              span={6}
              required
            />
            <FormInput
              label="Nama Sekolah"
              name="nama_sekolah"
              value={formData.nama_sekolah || ""}
              onChange={handleChange}
              span={6}
              required
            />
            <FormInput
              label="Deskripsi Singkat (Footer)"
              name="deskripsi_singkat"
              type="textarea"
              value={formData.deskripsi_singkat || ""}
              onChange={handleChange}
              span={12}
              rows={2}
            />

            <h3
              className={styles.sectionTitle}
              style={{ marginTop: "1rem", width: "100%" }}
            >
              Aset Logo
            </h3>

            {/* Logo Sekolah */}
            <div className={formStyles.colSpan6}>
              <FormInput
                type="file"
                label="Logo Sekolah"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "logo_sekolah")}
                preview={previews.logo_sekolah}
                helper="Maksimal 200 KB. Format PNG transparan."
              />
            </div>

            {/* Logo OSIS */}
            <div className={formStyles.colSpan6}>
              <FormInput
                type="file"
                label="Logo OSIS"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "logo_osis")}
                preview={previews.logo_osis}
                helper="Maksimal 200 KB. Format PNG transparan."
              />
            </div>
          </div>
        )}

        {/* TAB 2: KONTAK */}
        {activeTab === "kontak" && (
          <div className={formStyles.formGrid}>
            <h3 className={styles.sectionTitle}>Informasi Kontak</h3>

            <FormInput
              label="Email Resmi"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              span={6}
            />
            <FormInput
              label="Nomor HP / WhatsApp"
              name="no_hp"
              value={formData.no_hp || ""}
              onChange={handleChange}
              span={6}
              placeholder="+62..."
            />
            <FormInput
              label="Alamat Lengkap"
              name="alamat"
              type="textarea"
              value={formData.alamat || ""}
              onChange={handleChange}
              span={12}
            />
            <FormInput
              label="Link Google Maps (Embed URL)"
              name="google_maps_url"
              value={formData.google_maps_url || ""}
              onChange={handleChange}
              span={12}
              placeholder="https://www.google.com/maps/..."
            />
          </div>
        )}

        {/* TAB 3: SOSMED */}
        {activeTab === "sosmed" && (
          <div className={formStyles.formGrid}>
            <h3 className={styles.sectionTitle}>Tautan Sosial Media</h3>

            <FormInput
              label="Link Instagram"
              name="instagram_url"
              value={formData.instagram_url || ""}
              onChange={handleChange}
              span={12}
              placeholder="https://instagram.com/..."
            />
            <FormInput
              label="Link YouTube"
              name="youtube_url"
              value={formData.youtube_url || ""}
              onChange={handleChange}
              span={12}
              placeholder="https://youtube.com/..."
            />
            <FormInput
              label="Link TikTok"
              name="tiktok_url"
              value={formData.tiktok_url || ""}
              onChange={handleChange}
              span={12}
              placeholder="https://tiktok.com/..."
            />
          </div>
        )}

        {/* TAB 4: TAMPILAN */}
        {activeTab === "tampilan" && (
          <div className={formStyles.formGrid}>
            <h3 className={styles.sectionTitle}>Konfigurasi Halaman</h3>

            <div className={formStyles.colSpan12}>
              <label
                className={formStyles.checkboxLabel}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="tampilkan_hero"
                  checked={formData.tampilkan_hero || false}
                  onChange={handleChange}
                  style={{ width: 20, height: 20 }}
                />
                <div>
                  <strong>Tampilkan Hero Banner (Visi Misi)</strong>
                  <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Jika dicentang, judul besar akan muncul di halaman Visi
                    Misi.
                  </p>
                </div>
              </label>
            </div>

            <div className={formStyles.colSpan6}>
              <FormInput
                label="Layout Default Visi Misi"
                name="visi_misi_layout"
                type="select"
                value={formData.visi_misi_layout || "modular"}
                onChange={handleChange}
              >
                <option value="modular">Modular Grid</option>
                <option value="split">Split Card</option>
                <option value="zigzag">Zig-Zag Story</option>
              </FormInput>
            </div>
          </div>
        )}

        {/* BUTTON SAVE (Sticky Bottom) */}
        <div className={styles.actionFooter}>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            <FiSave /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}

export default Pengaturan;
