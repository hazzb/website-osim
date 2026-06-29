"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/AuthContext";
import PageContainer from "@/components/ui/PageContainer";
import ProgramKerjaCard from "@/components/cards/ProgramKerjaCard";
import BeritaCard from "@/components/berita/BeritaCard";
import { HeroSkeleton } from "@/components/ui/Skeletons";
import Modal from "@/components/Modal";
import SambutanForm from "@/components/forms/SambutanForm";
import ManageSlidesModal from "@/components/home/ManageSlidesModal";

// Dynamic imports for heavy markdown libraries
const ReactMarkdown = dynamic(() => import("react-markdown"), {
  loading: () => <p className="animate-pulse">Memuat konten...</p>,
});
const remarkGfm = dynamic(() => import("remark-gfm"));

// Icons
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
  FiBookOpen,
} from "react-icons/fi";

// Note: Modals and forms should be ideally dynamic imported or separated
// For now, I'll focus on the core display logic as requested.
// Modal, BannerForm, SambutanForm imports will be added when they are migrated.

export default function HomeClient({
  initialSettings,
  initialSlides,
  initialProgja,
  initialBerita,
  stats,
}) {
  const { session } = useAuth();
  const isAdmin = !!session;
  const supabase = createClient();

  const [settings, setSettings] = useState(initialSettings);
  const [slides, setSlides] = useState(initialSlides);
  const [latestProgja, setLatestProgja] = useState(initialProgja);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeModal, setActiveModal] = useState(null);

  const fetchSlides = useCallback(async () => {
    const { data: banners } = await supabase
      .from("beranda_slides")
      .select("*")
      .order("urutan", { ascending: true })
      .order("created_at", { ascending: false });
    setSlides(banners || []);
  }, [supabase]);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase.from("pengaturan").select("*").eq("id", 1).single();
    if (data) setSettings(data);
  }, [supabase]);

  // Re-fetch everything if admin (to see hidden items)
  useEffect(() => {
    if (isAdmin) {
      fetchSlides();
    }
  }, [isAdmin, fetchSlides]);

  // SLIDER LOGIC
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(
      () =>
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1)),
      5000,
    );
    return () => clearInterval(interval);
  }, [slides]);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

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

  const showHero = settings?.beranda_tampilkan_hero || isAdmin;
  const showSambutan = settings?.tampilkan_sambutan || isAdmin;

  return (
    <PageContainer className="pt-6">
      {/* 1. HERO CAROUSEL */}
      {showHero && (
        <section
          className={`relative w-full h-[300px] md:h-[500px] rounded-2xl overflow-hidden bg-border-dim mb-16 group transition-all duration-500 ${!settings?.beranda_tampilkan_hero
              ? "opacity-60 grayscale"
              : "opacity-100"
            }`}
        >
          {isAdmin && (
            <div className="absolute top-8 right-8 z-30 flex gap-3 pointer-events-auto">
              <button
                onClick={() =>
                  toggleVisibility(
                    "beranda_tampilkan_hero",
                    settings?.beranda_tampilkan_hero,
                  )
                }
                className={`w-11 h-11 bg-bg-card rounded-xl flex items-center justify-center border-0 cursor-pointer shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${settings?.beranda_tampilkan_hero
                    ? "text-text-body"
                    : "text-red-500 bg-red-50"
                  }`}
              >
                {settings?.beranda_tampilkan_hero ? (
                  <FiEye size={18} />
                ) : (
                  <FiEyeOff size={18} />
                )}
              </button>
              <button
                onClick={() => setActiveModal("slides")}
                className="w-11 h-11 bg-bg-card rounded-xl flex items-center justify-center border-0 cursor-pointer text-text-body shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:text-primary"
                title="Kelola Slide"
              >
                <FiCamera size={18} />
              </button>
            </div>
          )}
          {!settings?.beranda_tampilkan_hero && isAdmin && (
            <div className="absolute top-0 left-0 px-4 py-2 bg-red-500 text-white text-xs font-bold z-50 rounded-br-lg">
              HIDDEN
            </div>
          )}

          {slides.length > 0 ? (
            <>
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === currentSlide
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0"
                    }`}
                >
                  <Image
                    src={slide.image_url}
                    alt={slide.judul}
                    width={1200}
                    height={500}
                    priority={index === 0}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 pt-32 pb-12 px-8 md:px-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white z-20 pointer-events-none flex flex-col justify-end">
                    <h2 className="text-2xl md:text-4xl font-extrabold mb-2 leading-tight drop-shadow-lg tracking-tight">
                      {slide.judul}
                    </h2>
                    {slide.deskripsi && (
                      <p className="text-base md:text-lg opacity-95 m-0 max-w-3xl leading-relaxed">
                        {slide.deskripsi}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <button
                className="absolute top-1/2 -translate-y-1/2 left-8 z-20 w-12 h-12 rounded-full bg-bg-card/20 backdrop-blur-md border border-white/50 text-white flex items-center justify-center hover:bg-bg-card hover:text-text-main hover:scale-110 transition-all duration-300 hidden md:flex"
                onClick={prevSlide}
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                className="absolute top-1/2 -translate-y-1/2 right-8 z-20 w-12 h-12 rounded-full bg-bg-card/20 backdrop-blur-md border border-white/50 text-white flex items-center justify-center hover:bg-bg-card hover:text-text-main hover:scale-110 transition-all duration-300 hidden md:flex"
                onClick={nextSlide}
              >
                <FiChevronRight size={24} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-muted">
              <FiCamera size={48} className="mb-4 opacity-30" />
              <p>Belum ada slide.</p>
            </div>
          )}
        </section>
      )}

      {/* 2. SAMBUTAN KETUA */}
      {showSambutan && settings && (
        <section
          className={`relative mb-16 p-8 md:p-12 rounded-2xl bg-bg-card border border-border-dim group transition-all duration-500 ${!settings.tampilkan_sambutan
              ? "opacity-60 border-dashed"
              : "opacity-100 border-solid"
            }`}
        >
          {isAdmin && (
            <div className="absolute top-8 right-8 z-10 flex gap-3 items-center">
              <button
                onClick={() =>
                  toggleVisibility(
                    "tampilkan_sambutan",
                    settings.tampilkan_sambutan,
                  )
                }
                className={`w-11 h-11 bg-bg-card rounded-xl flex items-center justify-center border-0 cursor-pointer shadow-sm transition-all hover:bg-bg-page ${settings.tampilkan_sambutan
                    ? "text-text-body"
                    : "text-red-500 bg-red-50"
                  }`}
              >
                {settings.tampilkan_sambutan ? (
                  <FiEye size={18} />
                ) : (
                  <FiEyeOff size={18} />
                )}
              </button>
              <button
                onClick={() => setActiveModal("sambutan")}
                className="h-10 px-4 bg-bg-card border border-border-dim rounded-lg flex items-center gap-2 font-semibold text-text-body shadow-sm hover:bg-bg-page transition-colors cursor-pointer"
              >
                <FiEdit size={14} /> Edit Konten
              </button>
            </div>
          )}
          {!settings.tampilkan_sambutan && isAdmin && (
            <div className="absolute top-0 left-0 px-3 py-1 bg-slate-400 text-white text-xs font-bold rounded-br-lg">
              HIDDEN
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-center text-center md:text-left">
            <div className="relative">
              <Image
                src={
                  settings.sambutan_foto_url ||
                  "https://via.placeholder.com/400x500?text=Foto+Ketua"
                }
                alt="Ketua"
                loading="lazy"
                width={280}
                height={350}
                className="w-full aspect-[3/4] object-cover rounded-2xl max-w-[280px] md:max-w-full mx-auto shadow-lg"
              />
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight text-text-main">
                {settings.sambutan_judul || "Sambutan Ketua"}
              </h2>
              <div className="text-text-body leading-relaxed text-lg mb-8 max-w-2xl prose prose-lg prose-blue">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {settings.sambutan_isi || "Belum ada isi sambutan."}
                </ReactMarkdown>
              </div>

              <Link
                href="/profile"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-all duration-300 no-underline"
              >
                <FiUsers size={18} /> Lihat Profil Lengkap
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. STATISTIK & SHORTCUT */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20">
        <Link
          href="/anggota"
          className="group relative flex flex-col justify-between min-h-[220px] p-8 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl shadow-blue-500/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 no-underline overflow-hidden"
        >
          <div className="relative z-10 w-14 h-14 bg-bg-card/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl mb-auto">
            <FiUsers />
          </div>
          <div className="relative z-10">
            <div className="text-blue-100 font-semibold text-lg mb-1">
              Anggota Aktif
            </div>
            <div className="text-5xl font-extrabold">{stats.totalAnggota}</div>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 bg-bg-card/20 backdrop-blur-sm rounded-full text-sm font-semibold group-hover:bg-bg-card group-hover:text-text-main transition-colors">
              Lihat Anggota <FiArrowRight />
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-bg-card/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        </Link>

        <Link
          href="/profile"
          className="group relative flex flex-col justify-between min-h-[220px] p-8 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-xl shadow-violet-500/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-300 no-underline overflow-hidden"
        >
          <div className="relative z-10 w-14 h-14 bg-bg-card/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl mb-auto">
            <FiBookOpen />
          </div>
          <div className="relative z-10">
            <div className="text-violet-100 font-semibold text-lg mb-1">
              Profil Organisasi
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-2">Visi & Misi</div>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 bg-bg-card/20 backdrop-blur-sm rounded-full text-sm font-semibold group-hover:bg-bg-card group-hover:text-text-main transition-colors">
              Selengkapnya <FiArrowRight />
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-bg-card/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        </Link>

        <Link
          href="/program-kerja"
          className="group relative flex flex-col justify-between min-h-[220px] p-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl shadow-emerald-500/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 no-underline overflow-hidden"
        >
          <div className="relative z-10 w-14 h-14 bg-bg-card/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl mb-auto">
            <FiCheckCircle />
          </div>
          <div className="relative z-10">
            <div className="text-emerald-100 font-semibold text-lg mb-1">
              Program Terlaksana
            </div>
            <div className="text-5xl font-extrabold">{stats.progjaSelesai}</div>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 bg-bg-card/20 backdrop-blur-sm rounded-full text-sm font-semibold group-hover:bg-bg-card group-hover:text-text-main transition-colors">
              Lihat Arsip <FiArrowRight />
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-bg-card/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        </Link>
      </section>

      {/* 4. PROGRAM KERJA MENDATANG */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-4 border-b-2 border-border-dim gap-4">
          <h3 className="text-3xl font-extrabold text-text-main m-0 flex items-center gap-3">
            <span className="p-2 bg-primary-light text-primary rounded-xl">
              <FiTarget className="text-2xl" />
            </span>
            Agenda Mendatang
          </h3>
          <Link
            href="/program-kerja"
            className="flex items-center gap-2 px-4 py-2 bg-bg-page text-text-body font-semibold rounded-lg hover:bg-primary-light hover:text-primary transition-colors no-underline"
          >
            Lihat Semua <FiArrowRight />
          </Link>
        </div>
        {latestProgja.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestProgja.map((progja) => (
              <ProgramKerjaCard key={progja.id} data={progja} />
            ))}
          </div>
        ) : (
          <div className="bg-bg-page border-2 border-dashed border-slate-300 rounded-3xl p-20 text-center text-text-muted italic text-lg">
            Belum ada agenda mendatang.
          </div>
        )}
      </section>

      {/* 5. SEKILAS BERITA */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-4 border-b-2 border-border-dim gap-4">
          <h3 className="text-3xl font-extrabold text-text-main m-0 flex items-center gap-3">
            <span className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <FiBookOpen className="text-2xl" />
            </span>
            Sekilas Berita
          </h3>
          <Link
            href="/berita"
            className="flex items-center gap-2 px-4 py-2 bg-bg-page text-text-body font-semibold rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors no-underline"
          >
            Lihat Semua <FiArrowRight />
          </Link>
        </div>
        {initialBerita && initialBerita.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {initialBerita.map((berita) => (
              <BeritaCard key={berita.id} berita={berita} />
            ))}
          </div>
        ) : (
          <div className="bg-bg-page border-2 border-dashed border-slate-300 rounded-3xl p-20 text-center text-text-muted italic text-lg">
            Belum ada berita yang diterbitkan.
          </div>
        )}
      </section>

      {/* MODALS */}
      {isAdmin && (
        <>
          <Modal
            isOpen={activeModal === "sambutan"}
            onClose={() => setActiveModal(null)}
            title="Edit Sambutan Ketua"
            maxWidth="800px"
          >
            <SambutanForm
              initialData={settings}
              onClose={() => setActiveModal(null)}
              onSuccess={() => {
                fetchSettings();
                setActiveModal(null);
              }}
            />
          </Modal>

          <Modal
            isOpen={activeModal === "slides"}
            onClose={() => setActiveModal(null)}
            title="Kelola Beranda Slides"
            maxWidth="700px"
          >
            <ManageSlidesModal
              slides={slides}
              onClose={() => setActiveModal(null)}
              onSuccess={fetchSlides}
            />
          </Modal>
        </>
      )}
    </PageContainer>
  );
}
