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
import {
  FiSave,
  FiMonitor,
  FiInfo,
  FiShare2,
  FiPhone,
  FiImage,
  FiCheck
} from "react-icons/fi";

function Pengaturan() {
  const { session } = useAuth();
  const isAdmin = !!session;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("umum"); 

  // Data State
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({ logo_sekolah: null, logo_osis: null });
  const [previews, setPreviews] = useState({ logo_sekolah: null, logo_osis: null });

  // 1. FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("pengaturan").select("*").eq("id", 1).single();
        if (error) throw error;
        if (data) {
          setFormData(data);
          setPreviews({
            logo_sekolah: data.logo_sekolah_url,
            logo_osis: data.logo_osis_url,
          });
        }
      } catch (err) {
        console.error("Gagal load pengaturan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. HANDLERS
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [fieldName]: file }));
      setPreviews((prev) => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
    }
  };

  // Submit Handler (Bisa dipanggil dari tombol Header)
  const handleSubmit = async (e) => {
    if(e) e.preventDefault(); // Mencegah reload jika dipanggil dari form
    
    setSaving(true);
    try {
      let updatedData = { ...formData };

      // Upload Images jika ada perubahan
      if (files.logo_sekolah) {
        const url1 = await uploadImage(files.logo_sekolah, "logo");
        updatedData.logo_sekolah_url = url1;
      }

      if (files.logo_osis) {
        const url2 = await uploadImage(files.logo_osis, "logo");
        updatedData.logo_osis_url = url2;
      }

      const { error } = await supabase.from("pengaturan").update(updatedData).eq("id", 1);
      if (error) throw error;

      alert("Pengaturan berhasil disimpan!");
      window.location.reload(); 
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // --- RENDER ---
  if (loading) return <PageContainer><LoadingState /></PageContainer>;

  return (
    <PageContainer breadcrumbText="Pengaturan">
      
      {/* HEADER STICKY */}
      <PageHeader
        title="Pengaturan"
        subtitle="Kelola identitas dan tampilan."
        
        // 1. TOMBOL SIMPAN DI HEADER (ACTIONS)
        actions={
          <button 
            onClick={handleSubmit} 
            disabled={saving}
            className="button button-primary"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              padding: "0.5rem 1.2rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
            }}
          >
            {saving ? (
               <>Menyimpan...</>
            ) : (
               <><FiCheck size={18} /> Simpan Perubahan</>
            )}
          </button>
        }

        // 2. NAVIGASI TABS DI HEADER (SEARCH BAR SLOT)
        // Ini membuat Tabs ikut sticky di bawah judul
        searchBar={
          <div className={styles.tabGroup} style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            overflowX: 'auto', 
            padding: '2px',
            width: '100%' 
          }}>
            {[
              { id: "umum", label: "Umum", icon: <FiInfo /> },
              { id: "kontak", label: "Kontak", icon: <FiPhone /> },
              { id: "sosmed", label: "Sosmed", icon: <FiShare2 /> },
              { id: "tampilan", label: "Tampilan", icon: <FiMonitor /> },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={styles.tabBtn}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.4rem 1rem',
                  borderRadius: '6px',
                  border: activeTab === tab.id ? '1px solid #bfdbfe' : '1px solid transparent',
                  backgroundColor: activeTab === tab.id ? '#eff6ff' : 'transparent',
                  color: activeTab === tab.id ? '#2563eb' : '#64748b',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        }
      />

      {/* FORM CONTENT */}
      {/* Tidak perlu margin top besar karena header sudah menghandle space */}
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>
        
        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={formStyles.form}>
            
            {/* TAB: UMUM */}
            {activeTab === "umum" && (
              <div className={formStyles.formGrid} style={{ animation: "fadeIn 0.3s" }}>
                <div className={formStyles.colSpan12}>
                  <h3 className={styles.sectionTitle}><FiInfo /> Identitas Organisasi</h3>
                </div>

                <FormInput label="Nama Organisasi" name="nama_organisasi" value={formData.nama_organisasi || ""} onChange={handleChange} required span={6} placeholder="Contoh: OSIS SMA 1..." />
                <FormInput label="Singkatan" name="singkatan_organisasi" value={formData.singkatan_organisasi || ""} onChange={handleChange} required span={6} placeholder="Contoh: OSIM / OSIS" />
                
                <FormInput label="Nama Sekolah" name="nama_sekolah" value={formData.nama_sekolah || ""} onChange={handleChange} span={12} />
                <FormInput label="Alamat Lengkap" name="alamat_sekolah" type="textarea" value={formData.alamat_sekolah || ""} onChange={handleChange} span={12} rows={2} />

                <div className={formStyles.colSpan12}>
                  <h3 className={styles.sectionTitle} style={{ marginTop: '1rem' }}><FiImage /> Logo</h3>
                </div>

                {/* Upload Logo Sekolah */}
                <div className={formStyles.colSpan6}>
                  <div className={styles.uploadPreviewContainer}>
                    <img src={previews.logo_sekolah || "/placeholder.png"} alt="Sekolah" className={styles.logoPreview} />
                    <div className={styles.uploadInfo}>
                      <label>Logo Sekolah</label>
                      <p>Format PNG/JPG, Max 1MB</p>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "logo_sekolah")} style={{ fontSize: "0.8rem" }} />
                    </div>
                  </div>
                </div>

                {/* Upload Logo OSIS */}
                <div className={formStyles.colSpan6}>
                  <div className={styles.uploadPreviewContainer}>
                    <img src={previews.logo_osis || "/placeholder.png"} alt="OSIS" className={styles.logoPreview} />
                    <div className={styles.uploadInfo}>
                      <label>Logo OSIS</label>
                      <p>Format PNG/JPG, Max 1MB</p>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "logo_osis")} style={{ fontSize: "0.8rem" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: KONTAK */}
            {activeTab === "kontak" && (
              <div className={formStyles.formGrid} style={{ animation: "fadeIn 0.3s" }}>
                <div className={formStyles.colSpan12}>
                  <h3 className={styles.sectionTitle}><FiPhone /> Informasi Kontak</h3>
                </div>
                <FormInput label="Email Resmi" name="email_kontak" type="email" value={formData.email_kontak || ""} onChange={handleChange} span={6} />
                <FormInput label="Nomor Telepon / WA" name="telepon_kontak" value={formData.telepon_kontak || ""} onChange={handleChange} span={6} />
              </div>
            )}

            {/* TAB: SOSMED */}
            {activeTab === "sosmed" && (
              <div className={formStyles.formGrid} style={{ animation: "fadeIn 0.3s" }}>
                <div className={formStyles.colSpan12}>
                  <h3 className={styles.sectionTitle}><FiShare2 /> Media Sosial</h3>
                </div>
                <FormInput label="Instagram Username" name="instagram_url" value={formData.instagram_url || ""} onChange={handleChange} span={6} placeholder="tanpa @" helper="Contoh: osis.sma1" />
                <FormInput label="YouTube Channel" name="youtube_url" value={formData.youtube_url || ""} onChange={handleChange} span={6} placeholder="Nama Channel" />
                <FormInput label="TikTok Username" name="tiktok_url" value={formData.tiktok_url || ""} onChange={handleChange} span={6} placeholder="tanpa @" />
                <FormInput label="Facebook Page" name="facebook_url" value={formData.facebook_url || ""} onChange={handleChange} span={6} />
              </div>
            )}

            {/* TAB: TAMPILAN */}
            {activeTab === "tampilan" && (
              <div className={formStyles.formGrid} style={{ animation: "fadeIn 0.3s" }}>
                <div className={formStyles.colSpan12}>
                  <h3 className={styles.sectionTitle}><FiMonitor /> Pengaturan Tampilan</h3>
                </div>
                
                <div className={formStyles.colSpan6}>
                  <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center', height: '100%' }}>
                    <input type="checkbox" name="tampilkan_hero" checked={formData.tampilkan_hero || false} onChange={handleChange} style={{ width: 20, height: 20, cursor: 'pointer' }} />
                    <div>
                      <strong style={{ display: 'block', marginBottom: '4px', color: '#1e293b' }}>Hero Banner</strong>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Tampilkan judul besar di halaman utama.</span>
                    </div>
                  </div>
                </div>

                <div className={formStyles.colSpan6}>
                  <FormInput label="Layout Visi Misi" name="visi_misi_layout" type="select" value={formData.visi_misi_layout || "modular"} onChange={handleChange}>
                    <option value="modular">Modular Grid (Modern)</option>
                    <option value="split">Split Card (Klasik)</option>
                    <option value="zigzag">Zig-Zag Story</option>
                  </FormInput>
                </div>

                {/* SETTING FOOTER */}
                <div className={formStyles.colSpan12} style={{marginTop:'1rem', paddingTop:'1rem', borderTop:'1px dashed #e2e8f0'}}>
                    <strong style={{display:'block', marginBottom:'0.5rem', color:'#334155'}}>Pengaturan Footer</strong>
                    <FormInput 
                        label="Divisi Pengelola (Managed By)" 
                        name="footer_managed_by" 
                        value={formData.footer_managed_by || ""} 
                        onChange={handleChange} 
                        span={12} 
                        placeholder="Contoh: Divisi Media / Divisi IT"
                    />
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </PageContainer>
  );
}

export default Pengaturan;