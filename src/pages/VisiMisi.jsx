import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
// import styles from "./VisiMisi.module.css"; // REMOVED
// import formStyles from "../components/admin/AdminForm.module.css"; // Keeping for now if needed by Modal content, or replace with inline

// Library Markdown
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Utils & Helpers
import { uploadImage } from "../utils/uploadHelper";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import { VisiMisiSkeleton } from "../components/ui/Skeletons.jsx";
import Modal from "../components/Modal.jsx";

// Forms & Layouts
import VisiMisiForm from "../components/forms/VisiMisiForm.jsx";
import KontenReorderModal from "../components/admin/KontenReorderModal.jsx";
import LayoutModular from "../components/layouts/visimisi/LayoutModular.jsx";
import LayoutSplit from "../components/layouts/visimisi/LayoutSplit.jsx";
import LayoutZigZag from "../components/layouts/visimisi/LayoutZigZag.jsx";

import {
  FiEdit,
  FiLayout,
  FiLayers,
  FiGrid,
  FiColumns,
  FiGitMerge,
  FiPlus,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";

function VisiMisi() {
  const { session } = useAuth();
  const isAdmin = !!session;

  const [contents, setContents] = useState([]);
  const [layoutMode, setLayoutMode] = useState("modular");
  const [showHero, setShowHero] = useState(true);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);

  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  // STATE BARU UNTUK FILE
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: settings } = await supabase
        .from("pengaturan")
        .select("visi_misi_layout, tampilkan_hero")
        .eq("id", 1)
        .single();

      if (settings) {
        setLayoutMode(settings.visi_misi_layout || "modular");
        setShowHero(settings.tampilkan_hero !== false);
      }

      const { data, error } = await supabase
        .from("konten_halaman")
        .select("*")
        .eq("page_type", "visimisi")
        .order("urutan", { ascending: true });

      if (error) throw error;
      setContents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const heroContent = showHero && contents.length > 0 ? contents[0] : null;
  const gridContents =
    showHero && contents.length > 0 ? contents.slice(1) : contents;

  // --- HANDLER MODAL ---
  const openModal = (item = null) => {
    setFormFile(null); // Reset file baru
    setFormPreview(null); // Reset preview

    if (item) {
      setEditingId(item.id);
      setFormData(item);
      setFormPreview(item.image_url); // Tampilkan gambar lama jika ada
    } else {
      setEditingId(null);
      const lastOrder =
        contents.length > 0 ? contents[contents.length - 1].urutan : 0;
      setFormData({
        judul: "",
        isi: "",
        image_url: "", // Field baru di DB
        urutan: lastOrder + 10,
        page_type: "visimisi",
      });
    }
    setIsModalOpen(true);
  };

  // --- HANDLER FILE ---
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormFile(file);
      setFormPreview(URL.createObjectURL(file));
    }
  };

  const handleFormChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- SUBMIT DENGAN GAMBAR ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      let finalImageUrl = formData.image_url;

      // 1. Upload jika ada file baru
      if (formFile) {
        finalImageUrl = await uploadImage(formFile, "visimisi"); // Simpan di folder visimisi
      }

      // 2. Siapkan Payload
      const payload = {
        ...formData,
        image_url: finalImageUrl, // Update URL gambar
        page_type: "visimisi",
      };

      if (editingId)
        await supabase
          .from("konten_halaman")
          .update(payload)
          .eq("id", editingId);
      else await supabase.from("konten_halaman").insert(payload);

      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Gagal: " + (err.message || err));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus konten ini?")) return;
    try {
      await supabase.from("konten_halaman").delete().eq("id", id);
      setContents((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  const handleLayoutChange = async (mode) => {
    setLayoutMode(mode);
    try {
      await supabase
        .from("pengaturan")
        .update({ visi_misi_layout: mode })
        .eq("id", 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleHero = async () => {
    const newValue = !showHero;
    setShowHero(newValue);
    try {
      await supabase
        .from("pengaturan")
        .update({ tampilkan_hero: newValue })
        .eq("id", 1);
    } catch (err) {
      setShowHero(!newValue);
    }
  };

  const renderLayout = () => {
    const props = {
      data: gridContents,
      isAdmin,
      onEdit: openModal,
      onDelete: handleDelete,
    };
    switch (layoutMode) {
      case "split":
        return <LayoutSplit {...props} />;
      case "zigzag":
        return <LayoutZigZag {...props} />;
      case "modular":
      default:
        return <LayoutModular {...props} />;
    }
  };

  if (loading)
    return (
      <PageContainer breadcrumbText="Memuat...">
        <VisiMisiSkeleton />
      </PageContainer>
    );

  return (
    <PageContainer breadcrumbText="Visi & Misi">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div></div>
        {isAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => setIsReorderOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-600 font-semibold shadow-sm hover:bg-white hover:text-blue-600 hover:-translate-y-0.5 transition-all"
            >
              <FiLayers /> Atur Urutan
            </button>
            <button
              onClick={() => setIsSettingOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-600 font-semibold shadow-sm hover:bg-white hover:text-blue-600 hover:-translate-y-0.5 transition-all"
            >
              <FiLayout /> Tampilan
            </button>
          </div>
        )}
      </div>

      {/* HERO CONTENT */}
      {showHero && (
        <div className="relative bg-gradient-to-br from-blue-600/90 to-violet-600/90 rounded-3xl p-8 md:p-16 text-center text-white mb-14 border border-white/30 backdrop-blur-3xl shadow-2xl overflow-hidden">
          {/* DEKORASI LIGHT ORBS */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/20 blur-[60px] rounded-full z-0 pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-cyan-400/30 blur-[50px] rounded-full z-0 pointer-events-none"></div>

          {heroContent ? (
            <div className="relative z-10 max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-white tracking-tight drop-shadow-md">
                {heroContent.judul}
              </h1>
              {/* Gambar Hero (Jika Ada) */}
              {heroContent.image_url && (
                <img
                  src={heroContent.image_url}
                  alt={heroContent.judul}
                  className="w-full max-h-[400px] object-cover rounded-2xl mb-8 shadow-xl border-4 border-white/20"
                />
              )}
              <div className="text-white/90 text-lg leading-relaxed max-w-3xl mx-auto prose prose-invert prose-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {heroContent.isi}
                </ReactMarkdown>
              </div>
              {isAdmin && (
                <button
                  onClick={() => openModal(heroContent)}
                  className="absolute top-0 right-0 w-10 h-10 bg-white/20 border border-white/40 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-violet-600 hover:rotate-12 transition-all cursor-pointer"
                  title="Edit Hero"
                >
                  <FiEdit />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-8 text-white/70">
              <h1 className="text-4xl font-extrabold text-white">
                Visi & Misi
              </h1>
              {isAdmin && (
                <button
                  onClick={() => openModal()}
                  className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:bg-blue-50 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FiPlus /> Buat Judul Utama
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* DYNAMIC CONTENT */}
      <div className="flex flex-col gap-10">
        {renderLayout()}
        {isAdmin && (
          <div className="text-center mt-8">
            <button
              onClick={() => openModal()}
              className="w-full p-6 border-2 border-dashed border-indigo-300 rounded-2xl bg-indigo-50 text-indigo-500 font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 hover:border-indigo-500 transition-all cursor-pointer group"
            >
              <FiPlus
                size={20}
                className="group-hover:scale-125 transition-transform"
              />{" "}
              Tambah Seksi Baru
            </button>
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Konten" : "Tambah Konten"}
      >
        <VisiMisiForm
          formData={formData}
          onChange={handleFormChange}
          onFileChange={handleFileChange} // Handler file
          preview={formPreview} // Preview
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={modalLoading}
        />
      </Modal>

      {/* REORDER & SETTINGS MODALS */}
      <Modal
        isOpen={isReorderOpen}
        onClose={() => setIsReorderOpen(false)}
        title="Atur Urutan"
      >
        <KontenReorderModal
          isOpen={isReorderOpen}
          onClose={() => setIsReorderOpen(false)}
          contentList={contents}
          onSuccess={fetchData}
        />
      </Modal>

      <Modal
        isOpen={isSettingOpen}
        onClose={() => setIsSettingOpen(false)}
        title="Pengaturan Tampilan"
      >
        <div className="mb-6 pb-6 border-b border-dashed border-slate-200">
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <span className="block font-bold text-slate-800">
                Banner Utama (Hero)
              </span>
              <span className="text-sm text-slate-500">
                Tampilkan judul besar di bagian paling atas.
              </span>
            </div>
            <div
              onClick={handleToggleHero}
              className={`text-3xl flex items-center transition-colors ${showHero ? "text-blue-500" : "text-slate-300"}`}
            >
              {showHero ? <FiToggleRight /> : <FiToggleLeft />}
            </div>
          </label>
        </div>
        <div>
          <span className="block font-bold text-slate-800 mb-2">
            Gaya Tampilan Konten
          </span>
          <div className="grid grid-cols-3 gap-4 py-2">
            {[
              { id: "modular", icon: FiGrid, label: "Modular" },
              { id: "split", icon: FiColumns, label: "Split" },
              { id: "zigzag", icon: FiGitMerge, label: "Zig-Zag" },
            ].map((option) => (
              <div
                key={option.id}
                className={`border-2 p-4 rounded-xl text-center cursor-pointer transition-all ${
                  layoutMode === option.id
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:-translate-y-1"
                }`}
                onClick={() => handleLayoutChange(option.id)}
              >
                <div
                  className={`text-4xl mb-3 ${layoutMode === option.id ? "text-indigo-500" : "text-slate-300"}`}
                >
                  <option.icon className="mx-auto" />
                </div>
                <span className="font-semibold text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-slate-100">
          <button
            onClick={() => setIsSettingOpen(false)}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all"
          >
            Selesai
          </button>
        </div>
      </Modal>
    </PageContainer>
  );
}

export default VisiMisi;
