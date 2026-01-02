import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import Modal from "../components/Modal.jsx";
import { HeroSkeleton } from "../components/ui/Skeletons.jsx";
import ProgramKerjaCard from "../components/cards/ProgramKerjaCard.jsx";

// Import Form
import BannerForm from "../components/forms/BannerForm.jsx";
import SambutanForm from "../components/forms/SambutanForm.jsx";

// Styles & Icons
import styles from "./Beranda.module.css";
import {
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiCamera,
  FiTrash2,
  FiEdit,
  FiTarget,
  FiCheckCircle,
  FiUsers,
  FiEye,
  FiEyeOff,
  FiList,
  FiBookOpen,
} from "react-icons/fi";

function Beranda() {
  const { session } = useAuth();
  const isAdmin = !!session;

  // --- STATE ---
  const [slides, setSlides] = useState([]);
  const [settings, setSettings] = useState(null);
  const [latestProgja, setLatestProgja] = useState([]);

  const [stats, setStats] = useState({
    totalAnggota: 0,
    totalProgja: 0,
    progjaSelesai: 0,
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  // --- FETCH DATA ---
  const fetchAllData = useCallback(async () => {
    if (!settings) setLoading(true);

    try {
      // 1. Pengaturan
      const { data: settingsData } = await supabase
        .from("pengaturan")
        .select("*")
        .eq("id", 1)
        .single();
      setSettings(settingsData);

      // 2. Slides
      let slideQuery = supabase
        .from("beranda_slides")
        .select("*")
        .order("urutan", { ascending: true })
        .order("created_at", { ascending: false });
      if (!isAdmin) slideQuery = slideQuery.eq("is_active", true);
      const { data: banners } = await slideQuery;
      setSlides(banners || []);

      // 3. Progja Rencana
      const today = new Date().toISOString().split("T")[0];
      const { data: progjaNew } = await supabase
        .from("program_kerja")
        .select(`*, divisi(nama_divisi), pj:anggota!penanggung_jawab_id(nama)`)
        .eq("status", "Rencana")
        .gte("tanggal", today)
        .order("tanggal", { ascending: true })
        .limit(6);
      setLatestProgja(progjaNew || []);

      // 4. Statistik (Hitung saja)
      const { count: countAnggota } = await supabase
        .from("anggota")
        .select("id", { count: "exact", head: true });
      const { count: countTotalProgja } = await supabase
        .from("program_kerja")
        .select("id", { count: "exact", head: true });
      const { count: countDone } = await supabase
        .from("program_kerja")
        .select("id", { count: "exact", head: true })
        .eq("status", "Selesai");

      setStats({
        totalAnggota: countAnggota || 0,
        totalProgja: countTotalProgja || 0,
        progjaSelesai: countDone || 0,
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- SLIDER LOGIC ---
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(
      () =>
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1)),
      5000
    );
    return () => clearInterval(interval);
  }, [slides]);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  // --- ACTIONS ---
  const toggleVisibility = async (field, currentValue) => {
    try {
      await supabase
        .from("pengaturan")
        .update({ [field]: !currentValue })
        .eq("id", 1);
      setSettings((prev) => ({ ...prev, [field]: !currentValue }));
    } catch (err) {
      alert("Gagal update.");
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm("Hapus slide?")) return;
    try {
      await supabase.from("beranda_slides").delete().eq("id", id);
      fetchAllData();
    } catch (err) {
      alert("Gagal hapus.");
    }
  };

  if (loading)
    return (
      <PageContainer>
        <HeroSkeleton />
      </PageContainer>
    );

  const showHero = settings?.beranda_tampilkan_hero || isAdmin;
  const showSambutan = settings?.tampilkan_sambutan || isAdmin;

  return (
    <PageContainer>
      {/* 1. HERO CAROUSEL */}
      {showHero && (
        <section
          className={styles.carouselContainer}
          style={{
            opacity: settings?.beranda_tampilkan_hero ? 1 : 0.6,
            filter: settings?.beranda_tampilkan_hero
              ? "none"
              : "grayscale(100%)",
          }}
        >
          {isAdmin && (
            <div className={styles.bannerAdminControls}>
              <button
                onClick={() =>
                  toggleVisibility(
                    "beranda_tampilkan_hero",
                    settings?.beranda_tampilkan_hero
                  )
                }
                className={styles.adminBtnSmall}
                style={{
                  backgroundColor: settings?.beranda_tampilkan_hero
                    ? "white"
                    : "#fee2e2",
                  color: settings?.beranda_tampilkan_hero
                    ? "#475569"
                    : "#ef4444",
                }}
              >
                {settings?.beranda_tampilkan_hero ? (
                  <FiEye size={18} />
                ) : (
                  <FiEyeOff size={18} />
                )}
              </button>
              <button
                onClick={() => setActiveModal("banner")}
                className={styles.adminBtnSmall}
                title="Kelola Slide"
              >
                <FiCamera size={18} />
              </button>
            </div>
          )}
          {!settings?.beranda_tampilkan_hero && isAdmin && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                padding: "0.5rem 1rem",
                background: "#ef4444",
                color: "white",
                fontSize: "0.8rem",
                fontWeight: "bold",
                zIndex: 50,
                borderBottomRightRadius: "8px",
              }}
            >
              HIDDEN
            </div>
          )}

          {slides.length > 0 ? (
            <>
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`${styles.slideItem} ${
                    index === currentSlide ? styles.active : ""
                  }`}
                >
                  <img
                    src={slide.image_url}
                    alt={slide.judul}
                    className={styles.slideImage}
                  />
                  <div className={styles.overlay}>
                    <h2 className={styles.slideTitle}>{slide.judul}</h2>
                    {slide.deskripsi && (
                      <p className={styles.slideDesc}>{slide.deskripsi}</p>
                    )}
                  </div>
                </div>
              ))}
              <button className={styles.navBtnLeft} onClick={prevSlide}>
                <FiChevronLeft size={24} />
              </button>
              <button className={styles.navBtnRight} onClick={nextSlide}>
                <FiChevronRight size={24} />
              </button>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#94a3b8",
                flexDirection: "column",
              }}
            >
              <FiCamera
                size={48}
                style={{ marginBottom: "1rem", opacity: 0.3 }}
              />
              <p>Belum ada slide.</p>
            </div>
          )}
        </section>
      )}

      {/* 2. SAMBUTAN KETUA */}
      {showSambutan && settings && (
        <section
          className={styles.sambutanSection}
          style={{
            opacity: settings.tampilkan_sambutan ? 1 : 0.6,
            border: settings.tampilkan_sambutan
              ? "1px solid #e0f2fe"
              : "2px dashed #94a3b8",
          }}
        >
          {isAdmin && (
            <div className={styles.sambutanControls}>
              <button
                onClick={() =>
                  toggleVisibility(
                    "tampilkan_sambutan",
                    settings.tampilkan_sambutan
                  )
                }
                className={styles.adminBtnSmall}
                style={{
                  backgroundColor: settings.tampilkan_sambutan
                    ? "white"
                    : "#fee2e2",
                  color: settings.tampilkan_sambutan ? "#475569" : "#ef4444",
                }}
              >
                {settings.tampilkan_sambutan ? (
                  <FiEye size={16} />
                ) : (
                  <FiEyeOff size={16} />
                )}
              </button>
              <button
                onClick={() => setActiveModal("sambutan")}
                className={styles.editSambutanBtn}
              >
                <FiEdit size={14} /> Edit Konten
              </button>
            </div>
          )}
          {!settings.tampilkan_sambutan && isAdmin && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                padding: "0.25rem 0.75rem",
                background: "#94a3b8",
                color: "white",
                fontSize: "0.7rem",
                fontWeight: "bold",
                borderBottomRightRadius: "8px",
              }}
            >
              HIDDEN
            </div>
          )}

          <div className={styles.splitLayout}>
            <div className={styles.imageContainer}>
              <img
                src={
                  settings.sambutan_foto_url ||
                  "https://via.placeholder.com/400x500?text=Foto+Ketua"
                }
                alt="Ketua"
                className={styles.sambutanImage}
              />
            </div>
            <div className={styles.sambutanContent}>
              <h2>{settings.sambutan_judul || "Sambutan Ketua"}</h2>
              <p className={styles.sambutanText}>
                {settings.sambutan_isi || "Belum ada isi sambutan."}
              </p>

              {/* TOMBOL ACTION PROFIL */}
              <Link to="/visi-misi" className={styles.btnPrimary}>
                <FiUsers size={18} /> Lihat Profil Lengkap
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. STATISTIK & SHORTCUT (COLORFUL) */}
      <section className={styles.statsSection}>
        {/* Card 1: Anggota (BIRU) */}
        <Link to="/anggota" className={`${styles.statCard} ${styles.cardBlue}`}>
          <div className={styles.statIconWrapper}>
            <FiUsers />
          </div>
          <div className={styles.statLabel}>Anggota Aktif</div>
          <div className={styles.statNumber}>{stats.totalAnggota}</div>
          <div className={styles.statActionText}>
            Lihat Anggota <FiArrowRight />
          </div>
        </Link>

        {/* Card 2: Visi Misi (UNGU/VIOLET) - Menggantikan "Total Program" */}
        <Link
          to="/visi-misi"
          className={`${styles.statCard} ${styles.cardViolet}`}
        >
          <div className={styles.statIconWrapper}>
            <FiBookOpen />
          </div>
          <div className={styles.statLabel}>Profil Organisasi</div>
          <div
            style={{
              color: "white",
              fontSize: "1.8rem",
              fontWeight: 800,
              margin: "1rem 0 0 0",
            }}
          >
            Visi & Misi
          </div>
          <div className={styles.statActionText}>
            Selengkapnya <FiArrowRight />
          </div>
        </Link>

        {/* Card 3: Program Terlaksana (HIJAU) - Menjadi Action */}
        <Link
          to="/program-kerja"
          className={`${styles.statCard} ${styles.cardGreen}`}
        >
          <div className={styles.statIconWrapper}>
            <FiCheckCircle />
          </div>
          <div className={styles.statLabel}>Program Terlaksana</div>
          <div className={styles.statNumber}>{stats.progjaSelesai}</div>
          <div className={styles.statActionText}>
            Lihat Arsip <FiArrowRight />
          </div>
        </Link>
      </section>

      {/* 4. PROGRAM KERJA MENDATANG (MASONRY) */}
      <section className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <FiTarget className={styles.iconTitle} /> Agenda Mendatang
          </h3>
          <Link to="/program-kerja" className={styles.linkAll}>
            Lihat Semua <FiArrowRight />
          </Link>
        </div>
        {latestProgja.length > 0 ? (
          <div className={styles.progjaGrid}>
            {latestProgja.map((progja) => (
              <div key={progja.id} className={styles.masonryItem}>
                <ProgramKerjaCard data={progja} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>Belum ada agenda mendatang.</div>
        )}
      </section>

      {/* MODALS */}
      <Modal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={activeModal === "banner" ? "Kelola Slide" : "Edit Sambutan"}
      >
        {activeModal === "banner" ? (
          <div style={{ padding: "1rem" }}>
            <BannerForm onSuccess={fetchAllData} />
            <div
              style={{
                marginTop: "2rem",
                borderTop: "1px solid #cbd5e1",
                paddingTop: "1rem",
              }}
            >
              <h4 style={{ marginBottom: "1rem", color: "#334155" }}>
                Daftar Slide Aktif
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "10px",
                }}
              >
                {slides.map((s) => (
                  <div key={s.id} style={{ position: "relative" }}>
                    <img
                      src={s.image_url}
                      style={{
                        width: "100%",
                        aspectRatio: "16/9",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                      }}
                      alt="thumb"
                    />
                    <button
                      onClick={() => handleDeleteBanner(s.id)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                      }}
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <SambutanForm
            initialData={{
              nama_ketua: settings?.sambutan_judul,
              isi_sambutan: settings?.sambutan_isi,
              foto_url: settings?.sambutan_foto_url,
            }}
            onClose={() => setActiveModal(null)}
            onSuccess={fetchAllData}
          />
        )}
      </Modal>
    </PageContainer>
  );
}

export default Beranda;
