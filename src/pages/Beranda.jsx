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
      5000,
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
          className="relative w-full h-[300px] md:h-[500px] rounded-2xl overflow-hidden bg-slate-200 mb-16 shadow-lg shadow-black/15 group"
          style={{
            opacity: settings?.beranda_tampilkan_hero ? 1 : 0.6,
            filter: settings?.beranda_tampilkan_hero
              ? "none"
              : "grayscale(100%)",
          }}
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
                onClick={() => setActiveModal("banner")}
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
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out z-1 ${
                    index === currentSlide ? "opacity-100 z-10" : "opacity-0"
                  }`}
                >
                  <img
                    src={slide.image_url}
                    alt={slide.judul}
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
          className="relative mb-16 p-8 md:p-14 rounded-3xl bg-gradient-to-br from-white to-sky-50 border border-sky-100 shadow-xl shadow-sky-500/5 group"
          style={{
            opacity: settings.tampilkan_sambutan ? 1 : 0.6,
            borderStyle: settings.tampilkan_sambutan ? "solid" : "dashed",
            borderColor: settings.tampilkan_sambutan ? "#e0f2fe" : "#94a3b8",
          }}
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
                className={`w-11 h-11 bg-white rounded-xl flex items-center justify-center border-0 cursor-pointer shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
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
                onClick={() => setActiveModal("sambutan")}
                className="h-10 px-4 bg-white border border-slate-200 rounded-lg flex items-center gap-2 font-semibold text-slate-600 shadow-sm hover:border-blue-500 hover:text-blue-500 transition-colors"
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

          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-12 items-center text-center md:text-left">
            <div className="relative group-hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute inset-0 bg-blue-600 rounded-2xl rotate-3 opacity-20 blur-lg"></div>
              <img
                src={
                  settings.sambutan_foto_url ||
                  "https://via.placeholder.com/400x500?text=Foto+Ketua"
                }
                alt="Ketua"
                className="relative w-full aspect-[3/4] object-cover rounded-2xl border-[6px] border-white shadow-2xl -rotate-2 group-hover:rotate-0 transition-transform duration-500 max-w-[280px] md:max-w-full mx-auto"
              />
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-800 to-slate-600">
                {settings.sambutan_judul || "Sambutan Ketua"}
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg mb-8 max-w-2xl">
                {settings.sambutan_isi || "Belum ada isi sambutan."}
              </p>

              {/* TOMBOL ACTION PROFIL */}
              <Link
                to="/visi-misi"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30 hover:-translate-y-1 hover:shadow-blue-600/40 transition-all duration-300 no-underline"
              >
                <FiUsers size={18} /> Lihat Profil Lengkap
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. STATISTIK & SHORTCUT (COLORFUL) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20">
        {/* Card 1: Anggota (BIRU) */}
        <Link
          to="/anggota"
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
          {/* Decorative Circle */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        </Link>

        {/* Card 2: Visi Misi (UNGU) */}
        <Link
          to="/visi-misi"
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

        {/* Card 3: Program Terlaksana (HIJAU) */}
        <Link
          to="/program-kerja"
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

      {/* 4. PROGRAM KERJA MENDATANG (MASONRY) */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-4 border-b-2 border-slate-100 gap-4">
          <h3 className="text-3xl font-extrabold text-slate-800 m-0 flex items-center gap-3">
            <span className="p-2 bg-blue-50 text-blue-500 rounded-xl">
              <FiTarget className="text-2xl" />
            </span>
            Agenda Mendatang
          </h3>
          <Link
            to="/program-kerja"
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 font-semibold rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors no-underline"
          >
            Lihat Semua <FiArrowRight />
          </Link>
        </div>
        {latestProgja.length > 0 ? (
          <div className="w-full columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {latestProgja.map((progja) => (
              <div key={progja.id} className="break-inside-avoid">
                <ProgramKerjaCard data={progja} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-20 text-center text-slate-400 italic text-lg">
            Belum ada agenda mendatang.
          </div>
        )}
      </section>

      {/* MODALS */}
      <Modal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={activeModal === "banner" ? "Kelola Slide" : "Edit Sambutan"}
      >
        {activeModal === "banner" ? (
          <div className="p-4">
            <BannerForm onSuccess={fetchAllData} />
            <div className="mt-8 pt-4 border-t border-slate-200">
              <h4 className="mb-4 text-slate-700 font-bold">
                Daftar Slide Aktif
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {slides.map((s) => (
                  <div key={s.id} className="relative group">
                    <img
                      src={s.image_url}
                      className="w-full aspect-video object-cover rounded-lg border border-slate-300"
                      alt="thumb"
                    />
                    <button
                      onClick={() => handleDeleteBanner(s.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-md hover:bg-red-600 transition-colors shadow-sm"
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
