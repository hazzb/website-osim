import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import Modal from "../components/Modal.jsx";
import { HeroSkeleton } from "../components/ui/Skeletons.jsx";
import ProgramKerjaCard from "../components/cards/ProgramKerjaCard.jsx";

// IMPORT FORMS BARU
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
  FiUser,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { FaCalendarCheck, FaUsers, FaBullseye } from "react-icons/fa";

function Beranda() {
  const { session } = useAuth();
  const isAdmin = !!session;

  // --- STATE ---
  const [slides, setSlides] = useState([]);
  const [sambutan, setSambutan] = useState(null);
  const [latestProgja, setLatestProgja] = useState([]);
  const [progjaSelesaiCount, setProgjaSelesaiCount] = useState(0);
  const [showBanner, setShowBanner] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Modal State (Cukup Simpan Tipe nya saja)
  const [activeModal, setActiveModal] = useState(null);

  // --- FETCH DATA ---
  const fetchAllData = async () => {
    try {
      // Slides
      const { data: slidesData } = await supabase
        .from("beranda_slides")
        .select("*")
        .order("created_at", { ascending: false });
      setSlides(slidesData || []);

      // Pengaturan
      const { data: settings } = await supabase
        .from("pengaturan")
        .select("*")
        .eq("id", 1)
        .single();
      setSambutan(settings);
      if (settings) setShowBanner(settings.tampilkan_banner);

      // Progja
      const { data: progjaData } = await supabase
        .from("program_kerja_detail_view")
        .select("*")
        .in("status", ["Akan Datang", "Rencana"])
        .order("tanggal", { ascending: true })
        .limit(3);
      setLatestProgja(progjaData || []);

      // Count
      const { data: activePeriod } = await supabase
        .from("periode_jabatan")
        .select("id")
        .eq("is_active", true)
        .single();
      if (activePeriod) {
        const { count } = await supabase
          .from("program_kerja")
          .select("*", { count: "exact", head: true })
          .eq("status", "Selesai")
          .eq("periode_id", activePeriod.id);
        setProgjaSelesaiCount(count || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- LOGIC CAROUSEL & TOGGLE ---
  const nextSlide = useCallback(() => {
    if (slides.length)
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides]);
  const prevSlide = () => {
    if (slides.length)
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [slides.length, nextSlide]);

  const handleToggleBanner = async () => {
    const newValue = !showBanner;
    setShowBanner(newValue);
    await supabase
      .from("pengaturan")
      .update({ tampilkan_banner: newValue })
      .eq("id", 1);
  };

  const handleToggleSambutan = async () => {
    if (!sambutan) return;
    const newValue = !sambutan.tampilkan_sambutan;
    setSambutan((prev) => ({ ...prev, tampilkan_sambutan: newValue }));
    await supabase
      .from("pengaturan")
      .update({ tampilkan_sambutan: newValue })
      .eq("id", 1);
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm("Hapus banner ini?")) return;
    await supabase.from("beranda_slides").delete().eq("id", id);
    fetchAllData();
  };

  // --- RENDER ---
  return (
    <PageContainer>
      {/* 1. HERO CAROUSEL */}
      {!loading && (showBanner || isAdmin) && (
        <div
          className={styles.carouselContainer}
          style={{
            opacity: !showBanner && isAdmin ? 0.7 : 1,
            border: !showBanner && isAdmin ? "2px dashed #ef4444" : "none",
          }}
        >
          {loading ? (
            <HeroSkeleton />
          ) : (
            <>
              {isAdmin && (
                <div className={styles.bannerAdminControls}>
                  <button
                    onClick={handleToggleBanner}
                    className={styles.adminBtnSmall}
                    title={showBanner ? "Sembunyikan" : "Tampilkan"}
                  >
                    {showBanner ? (
                      <FiEye />
                    ) : (
                      <FiEyeOff style={{ color: "#ef4444" }} />
                    )}
                  </button>
                  <button
                    className={styles.adminAddBtn}
                    onClick={() => setActiveModal("banner")}
                  >
                    <FiCamera /> Kelola Banner
                  </button>
                </div>
              )}

              {isAdmin && !showBanner && (
                <div className={styles.hiddenOverlayBadge}>
                  Banner Disembunyikan
                </div>
              )}

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
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyHero}>
                  <h2>Belum ada Banner</h2>
                </div>
              )}

              {slides.length > 1 && (
                <>
                  <button className={styles.navBtnLeft} onClick={prevSlide}>
                    <FiChevronLeft />
                  </button>
                  <button className={styles.navBtnRight} onClick={nextSlide}>
                    <FiChevronRight />
                  </button>
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
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* 2. SAMBUTAN KETUA */}
      {(sambutan?.tampilkan_sambutan || isAdmin) && (
        <section
          className={styles.sambutanSection}
          style={{
            opacity: !sambutan?.tampilkan_sambutan && isAdmin ? 0.6 : 1,
            border:
              !sambutan?.tampilkan_sambutan && isAdmin
                ? "2px dashed #ef4444"
                : "1px solid #e2e8f0",
          }}
        >
          <div className={styles.splitLayout}>
            <div className={styles.splitImageWrapper}>
              {sambutan?.sambutan_foto_url ? (
                <img
                  src={sambutan.sambutan_foto_url}
                  alt="Ketua"
                  className={styles.sambutanImage}
                />
              ) : (
                <div className={styles.placeholderImage}>
                  <FiUser size={48} />
                </div>
              )}
            </div>
            <div className={styles.splitContent}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  width: "100%",
                  flexWrap: "wrap",
                }}
              >
                <h2 className={styles.sectionTitle}>
                  {sambutan?.sambutan_judul || "Sambutan Ketua"}
                </h2>
                {isAdmin && (
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginLeft: "auto",
                    }}
                  >
                    <button
                      className={styles.editIconBtn}
                      onClick={handleToggleSambutan}
                      title="Toggle"
                    >
                      {sambutan?.tampilkan_sambutan ? (
                        <FiEye />
                      ) : (
                        <FiEyeOff style={{ color: "#ef4444" }} />
                      )}
                    </button>
                    <button
                      className={styles.editIconBtn}
                      onClick={() => setActiveModal("sambutan")}
                      title="Edit"
                    >
                      <FiEdit />
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.sambutanText}>
                {sambutan?.sambutan_isi?.split("\n").map((par, i) => (
                  <p key={i}>{par}</p>
                ))}
              </div>
              {isAdmin && !sambutan?.tampilkan_sambutan && (
                <span className={styles.hiddenBadge}>
                  Sambutan Disembunyikan
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. QUICK LINKS */}
      <section className={styles.quickLinksSection}>
        <div className={styles.quickLinksGrid}>
          <Link to="/program-kerja" className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${styles.iconBlue}`}>
              <FaCalendarCheck size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>Program Kerja</h3>
              <p>Lihat agenda kegiatan kami.</p>
              {progjaSelesaiCount > 0 && (
                <span className={styles.statBadge}>
                  {progjaSelesaiCount} Terlaksana
                </span>
              )}
            </div>
            <FiArrowRight className={styles.arrowIcon} />
          </Link>
          <Link to="/anggota" className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${styles.iconOrange}`}>
              <FaUsers size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>Anggota</h3>
              <p>Kenalan dengan pengurus.</p>
            </div>
            <FiArrowRight className={styles.arrowIcon} />
          </Link>
          <Link to="/visi-misi" className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${styles.iconPurple}`}>
              <FaBullseye size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>Visi Misi</h3>
              <p>Tujuan dan nilai organisasi.</p>
            </div>
            <FiArrowRight className={styles.arrowIcon} />
          </Link>
        </div>
      </section>

      {/* 4. AGENDA TERDEKAT */}
      <section className={styles.agendaSection}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              Agenda Terdekat
            </h2>
            <p style={{ color: "#64748b", margin: 0 }}>
              Kegiatan seru yang akan datang.
            </p>
          </div>
          <Link
            to="/program-kerja"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Lihat Semua <FiArrowRight />
          </Link>
        </div>
        {latestProgja.length > 0 ? (
          <div className={styles.progjaGrid}>
            {latestProgja.map((item) => (
              <div key={item.id} style={{ height: "100%" }}>
                <ProgramKerjaCard data={item} isAdmin={false} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Belum ada agenda terdekat.</p>
            {isAdmin && (
              <Link to="/program-kerja" className="button button-primary">
                + Tambah Agenda
              </Link>
            )}
          </div>
        )}
      </section>

      {/* === MODALS (Render Based on State) === */}
      <Modal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={
          activeModal === "banner" ? "Kelola Banner" : "Edit Sambutan Ketua"
        }
      >
        {activeModal === "banner" ? (
          <>
            <BannerForm
              onClose={() => setActiveModal(null)}
              onSuccess={fetchAllData}
            />
            {/* List Hapus Banner - Masih perlu di sini atau bisa dipindah ke dalam BannerForm jika mau lebih rapi */}
            {slides.length > 0 && (
              <div
                style={{
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #eee",
                }}
              >
                <p
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                  }}
                >
                  Hapus Banner:
                </p>
                <div
                  style={{ display: "flex", gap: "0.5rem", overflowX: "auto" }}
                >
                  {slides.map((s) => (
                    <div
                      key={s.id}
                      style={{ position: "relative", minWidth: "100px" }}
                    >
                      <img
                        src={s.image_url}
                        style={{
                          width: "100px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                        alt="thumb"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(s.id)}
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          background: "red",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <SambutanForm
            onClose={() => setActiveModal(null)}
            onSuccess={fetchAllData}
            initialData={sambutan}
          />
        )}
      </Modal>
    </PageContainer>
  );
}

export default Beranda;
