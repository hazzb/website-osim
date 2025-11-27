import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import Modal from "../components/Modal.jsx";
import FormInput from "../components/admin/FormInput.jsx";
import { HeroSkeleton } from "../components/ui/Skeletons.jsx"; // Pastikan Skeleton ada

// Styles & Icons
import styles from "./Beranda.module.css";
import formStyles from "../components/admin/AdminForm.module.css";
import {
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiCamera,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";

function Beranda() {
  const { session } = useAuth();
  const isAdmin = !!session; // Cek Admin

  // --- STATE ---
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // State Modal & Upload
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formData, setFormData] = useState({ judul: "", deskripsi: "" });
  const [formFile, setFormFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // --- 1. FETCH SLIDES ---
  const fetchSlides = async () => {
    try {
      // Mengambil data dari tabel 'beranda_slides'
      const { data, error } = await supabase
        .from("beranda_slides")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSlides(data || []);
    } catch (err) {
      console.error("Gagal load slides:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  // --- 2. CAROUSEL ANIMATION ---
  const nextSlide = useCallback(() => {
    setSlides((prev) => {
      if (prev.length === 0) return [];
      setCurrentSlide((curr) => (curr === prev.length - 1 ? 0 : curr + 1));
      return prev;
    });
  }, []);

  const prevSlide = () => {
    setCurrentSlide((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [slides.length, nextSlide]);

  // --- 3. ADMIN HANDLERS (UPLOAD & DELETE) ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formFile) return alert("Pilih gambar dulu!");

    setUploadLoading(true);
    try {
      // 1. Upload ke Storage
      const ext = formFile.name.split(".").pop();
      const fileName = `banner_${Date.now()}.${ext}`;

      // Pastikan bucket 'banners' sudah dibuat di Supabase Storage & set Public
      const { error: upErr } = await supabase.storage
        .from("banners")
        .upload(fileName, formFile);
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage
        .from("banners")
        .getPublicUrl(fileName);

      // 2. Simpan ke Database
      const { error: dbErr } = await supabase.from("beranda_slides").insert({
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        image_url: urlData.publicUrl,
        is_active: true,
      });

      if (dbErr) throw dbErr;

      alert("Banner berhasil ditambahkan!");
      setIsModalOpen(false);
      setFormData({ judul: "", deskripsi: "" });
      setFormFile(null);
      setPreview(null);
      fetchSlides(); // Refresh Data
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteSlide = async (id, imageUrl) => {
    if (!confirm("Yakin hapus banner ini?")) return;
    try {
      await supabase.from("beranda_slides").delete().eq("id", id);
      // Opsional: Hapus gambar dari storage juga
      fetchSlides();
    } catch (err) {
      alert("Gagal hapus: " + err.message);
    }
  };

  // --- RENDER ---
  return (
    <PageContainer>
      {/* SECTION 1: HERO CAROUSEL */}
      {loading ? (
        <HeroSkeleton />
      ) : (
        <div className={styles.carouselContainer}>
          {/* === FITUR CMS: TOMBOL TAMBAH (ADMIN ONLY) === */}
          {/* Ini tombol yang kemarin hilang, sekarang saya kembalikan */}
          {isAdmin && (
            <button
              className={styles.adminAddBtn}
              onClick={() => setIsModalOpen(true)}
              title="Kelola Banner"
            >
              <FiCamera /> Kelola Banner
            </button>
          )}

          {/* Render Slides */}
          {slides.length > 0 ? (
            slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`${styles.slide} ${
                  index === currentSlide ? styles.active : ""
                }`}
                style={{ backgroundImage: `url(${slide.image_url})` }}
              >
                <div className={styles.overlay}>
                  <div className={styles.slideContent}>
                    <h1 className={styles.slideTitle}>{slide.judul}</h1>
                    <p className={styles.slideDesc}>{slide.deskripsi}</p>
                    <Link to="/visi-misi" className={styles.ctaButton}>
                      Pelajari Selengkapnya <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Tampilan jika belum ada gambar
            <div className={styles.emptyHero}>
              <h2>Belum ada Banner</h2>
              {isAdmin && (
                <p>
                  Klik tombol "Kelola Banner" di pojok kanan atas untuk upload.
                </p>
              )}
            </div>
          )}

          {/* Navigasi Panah */}
          {slides.length > 1 && (
            <>
              <button className={styles.navBtnLeft} onClick={prevSlide}>
                <FiChevronLeft />
              </button>
              <button className={styles.navBtnRight} onClick={nextSlide}>
                <FiChevronRight />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {slides.length > 1 && (
            <div className={styles.dotsContainer}>
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  className={`${styles.dot} ${
                    idx === currentSlide ? styles.activeDot : ""
                  }`}
                  onClick={() => setCurrentSlide(idx)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: INTRO (Static) */}
      <section className={styles.introSection}>
        <h2 className={styles.sectionTitle}>Tentang Kami</h2>
        <p className={styles.sectionText}>
          Selamat datang di platform digital resmi organisasi kami. Wadah
          aspirasi, kreasi, dan inovasi siswa untuk kemajuan bersama.
        </p>

        <div className={styles.quickLinks}>
          <Link to="/program-kerja" className={styles.quickCard}>
            <h3>📅 Program Kerja</h3>
            <p>Lihat agenda kegiatan kami.</p>
          </Link>
          <Link to="/anggota" className={styles.quickCard}>
            <h3>👥 Anggota</h3>
            <p>Kenalan dengan pengurus.</p>
          </Link>
          <Link to="/visi-misi" className={styles.quickCard}>
            <h3>🎯 Visi Misi</h3>
            <p>Tujuan dan nilai organisasi.</p>
          </Link>
        </div>
      </section>

      {/* === MODAL CMS: TAMBAH / HAPUS BANNER === */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Kelola Banner Beranda"
      >
        <form onSubmit={handleUpload}>
          <div className={formStyles.formGrid}>
            {/* Upload Gambar */}
            <div
              className={`${formStyles.colSpan2} ${formStyles.uploadSection}`}
            >
              <label className={formStyles.formLabel}>
                Gambar Banner (Landscape)
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  marginTop: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: "120px",
                    height: "70px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #cbd5e0",
                    flexShrink: 0,
                    background: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {preview ? (
                    <img
                      src={preview}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      alt="preview"
                    />
                  ) : (
                    <FiCamera size={24} color="#cbd5e0" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={formStyles.formInput}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <FormInput
              label="Judul Utama"
              name="judul"
              type="text"
              value={formData.judul}
              onChange={(e) =>
                setFormData({ ...formData, judul: e.target.value })
              }
              required
              span="col-span-2"
            />
            <FormInput
              label="Deskripsi Singkat"
              name="deskripsi"
              type="text"
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
              span="col-span-2"
            />
          </div>

          {/* LIST BANNER YANG SUDAH ADA (FITUR HAPUS) */}
          {slides.length > 0 && (
            <div
              style={{
                marginTop: "1.5rem",
                borderTop: "1px solid #e2e8f0",
                paddingTop: "1rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "#64748b",
                }}
              >
                Banner Aktif (Klik X untuk hapus):
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.8rem",
                  overflowX: "auto",
                  paddingBottom: "0.5rem",
                }}
              >
                {slides.map((s) => (
                  <div
                    key={s.id}
                    style={{ position: "relative", minWidth: "140px" }}
                  >
                    <img
                      src={s.image_url}
                      style={{
                        width: "140px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                      alt="slide thumbnail"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(s.id, s.image_url)}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        background: "#ef4444",
                        color: "white",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        border: "2px solid white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                      title="Hapus Banner Ini"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={formStyles.formFooter}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="button button-secondary"
            >
              Batal
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={uploadLoading}
            >
              {uploadLoading ? "Mengupload..." : "Simpan Banner"}
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}

export default Beranda;
