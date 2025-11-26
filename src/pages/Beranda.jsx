import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import { HeroSkeleton } from "../components/ui/Skeletons.jsx";

// Styles
import styles from "./Beranda.module.css"; // Pastikan file ini ada!

// Icons
import { FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";

function Beranda() {
  // --- STATE ---
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH DATA CAROUSEL ---
  useEffect(() => {
    const fetchSlides = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("beranda_slides")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSlides(data || []);
      } catch (err) {
        console.error("Gagal memuat carousel:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // --- 2. CAROUSEL LOGIC ---
  const nextSlide = useCallback(() => {
    setSlides((prevSlides) => {
      if (prevSlides.length === 0) return [];
      setCurrentSlide((prev) =>
        prev === prevSlides.length - 1 ? 0 : prev + 1
      );
      return prevSlides;
    });
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Auto Slide
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // --- RENDER ---
  return (
    <PageContainer>
      {/* HERO CAROUSEL SECTION */}
      {loading ? (
        <HeroSkeleton />
      ) : slides.length > 0 ? (
        <div className={styles.carouselContainer}>
          {/* Slides */}
          {slides.map((slide, index) => (
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
          ))}

          {/* Navigation */}
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

          {/* Dots */}
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
        </div>
      ) : (
        // Fallback State
        <div className={styles.emptyHero}>
          <h2>Selamat Datang</h2>
          <p>Website Organisasi Resmi</p>
        </div>
      )}

      {/* INTRO SECTION */}
      <section className={styles.introSection}>
        <h2 className={styles.sectionTitle}>Tentang Kami</h2>
        <p className={styles.sectionText}>
          Selamat datang di platform digital resmi organisasi kami. Pusat
          informasi kegiatan, struktur, dan dokumentasi.
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
    </PageContainer>
  );
}

export default Beranda;
