"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/AuthContext";
import PageContainer from "@/components/ui/PageContainer";
import ProgramKerjaCard from "@/components/cards/ProgramKerjaCard";
import { HeroSkeleton } from "@/components/ui/Skeletons";

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

  // Re-fetch everything if admin (to see hidden items)
  useEffect(() => {
    if (isAdmin) {
      const fetchAdminData = async () => {
        const { data: banners } = await supabase
          .from("beranda_slides")
          .select("*")
          .order("urutan", { ascending: true })
          .order("created_at", { ascending: false });
        setSlides(banners || []);
      };
      fetchAdminData();
    }
  }, [isAdmin, supabase]);

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
    <PageContainer>
      {/* 1. HERO CAROUSEL */}
      {showHero && (
        <section
          className={`relative w-full h-[300px] md:h-[500px] rounded-2xl overflow-hidden bg-slate-200 mb-16 group transition-all duration-500 ${
            !settings?.beranda_tampilkan_hero
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
                className={`w-11 h-11 bg-white rounded-xl flex items-center justify-center border-0 cursor-pointer shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
                  settings?.beranda_tampilkan_hero
                    ? "text-slate-600"
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
                onClick={() => alert("Admin Modal Logic to be implemented")}
                className="w-11 h-11 bg-white rounded-xl flex items-center justify-center border-0 cursor-pointer text-slate-600 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:text-blue-600"
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
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                    index === currentSlide
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
                className="absolute top-1/2 -translate-y-1/2 left-8 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/50 text-white flex items-center justify-center hover:bg-white hover:text-slate-900 hover:scale-110 transition-all duration-300 hidden md:flex"
                onClick={prevSlide}
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                className="absolute top-1/2 -translate-y-1/2 right-8 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/50 text-white flex items-center justify-center hover:bg-white hover:text-slate-900 hover:scale-110 transition-all duration-300 hidden md:flex"
                onClick={nextSlide}
              >
                <FiChevronRight size={24} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <FiCamera size={48} className="mb-4 opacity-30" />
              <p>Belum ada slide.</p>
            </div>
          )}
        </section>
      )}

      {/* 2. SAMBUTAN KETUA */}
      {showSambutan && settings && (
        <section
          className={`relative mb-16 p-8 md:p-12 rounded-2xl bg-white border border-slate-200 group transition-all duration-500 ${
            !settings.tampilkan_sambutan
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
                className={`w-11 h-11 bg-white rounded-xl flex items-center justify-center border-0 cursor-pointer shadow-sm transition-all hover:bg-slate-50 ${
                  settings.tampilkan_sambutan
                    ? "text-slate-600"
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
                onClick={() => alert("Admin Modal Logic to be implemented")}
                className="h-10 px-4 bg-white border border-slate-200 rounded-lg flex items-center gap-2 font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
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
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight text-slate-800">
                {settings.sambutan_judul || "Sambutan Ketua"}
              </h2>
              <div className="text-slate-600 leading-relaxed text-lg mb-8 max-w-2xl prose prose-lg prose-blue">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {settings.sambutan_isi || "Belum ada isi sambutan."}
                </ReactMarkdown>
              </div>

              <Link
                href="/profile"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 no-underline"
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
          <div className="relative z-10 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl mb-auto">
            <FiUsers />
          </div>
          <div className="relative z-10">
            <div className="text-blue-100 font-semibold text-lg mb-1">
              Anggota Aktif
            </div>
            <div className="text-5xl font-extrabold">{stats.totalAnggota}</div>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold group-hover:bg-white group-hover:text-slate-800 transition-colors">
              Lihat Anggota <FiArrowRight />
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        </Link>

        <Link
          href="/profile"
          className="group relative flex flex-col justify-between min-h-[220px] p-8 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-xl shadow-violet-500/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-300 no-underline overflow-hidden"
        >
          <div className="relative z-10 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl mb-auto">
            <FiBookOpen />
          </div>
          <div className="relative z-10">
            <div className="text-violet-100 font-semibold text-lg mb-1">
              Profil Organisasi
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-2">Visi & Misi</div>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold group-hover:bg-white group-hover:text-slate-800 transition-colors">
              Selengkapnya <FiArrowRight />
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        </Link>

        <Link
          href="/program-kerja"
          className="group relative flex flex-col justify-between min-h-[220px] p-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl shadow-emerald-500/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 no-underline overflow-hidden"
        >
          <div className="relative z-10 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl mb-auto">
            <FiCheckCircle />
          </div>
          <div className="relative z-10">
            <div className="text-emerald-100 font-semibold text-lg mb-1">
              Program Terlaksana
            </div>
            <div className="text-5xl font-extrabold">{stats.progjaSelesai}</div>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold group-hover:bg-white group-hover:text-slate-800 transition-colors">
              Lihat Arsip <FiArrowRight />
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        </Link>
      </section>

      {/* 4. PROGRAM KERJA MENDATANG */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-4 border-b-2 border-slate-100 gap-4">
          <h3 className="text-3xl font-extrabold text-slate-800 m-0 flex items-center gap-3">
            <span className="p-2 bg-blue-50 text-blue-500 rounded-xl">
              <FiTarget className="text-2xl" />
            </span>
            Agenda Mendatang
          </h3>
          <Link
            href="/program-kerja"
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 font-semibold rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors no-underline"
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
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-20 text-center text-slate-400 italic text-lg">
            Belum ada agenda mendatang.
          </div>
        )}
      </section>
    </PageContainer>
  );
}
