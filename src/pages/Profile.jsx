import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Modal from "../components/Modal.jsx";
import {
  FiEdit,
  FiPlus,
  FiList,
  FiSettings,
  FiRepeat,
  FiGrid,
  FiColumns,
  FiAlignCenter,
} from "react-icons/fi";

// Layout Components
import LayoutModular from "../components/layouts/profile/LayoutModular.jsx";
import LayoutSplit from "../components/layouts/profile/LayoutSplit.jsx";
import LayoutZigZag from "../components/layouts/profile/LayoutZigZag.jsx";
import LayoutSimple from "../components/layouts/profile/LayoutSimple.jsx";

// Forms & CMS
import KontenHalamanForm from "../components/forms/KontenHalamanForm.jsx";
import LayoutSettingsForm from "../components/forms/LayoutSettingsForm.jsx";
import KontenReorderModal from "../components/admin/KontenReorderModal.jsx";

function Profile() {
  const { session } = useAuth();
  const isAdmin = !!session;

  const [contentBlocks, setContentBlocks] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Settings (Layout & Hero options)
      const { data: settingsData, error: settingsError } = await supabase
        .from("pengaturan")
        .select("*")
        .eq("id", 1)
        .single();

      if (settingsError) throw settingsError;
      setSettings(settingsData || {});

      // 2. Fetch ALL Content Blocks for this page
      const { data: kontenData, error: kontenError } = await supabase
        .from("konten_halaman")
        .select("*")
        .eq("page_type", "profile")
        .order("urutan", { ascending: true });

      if (kontenError) throw kontenError;
      setContentBlocks(kontenData || []);
    } catch (err) {
      console.error("Error fetching Profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus konten ini?")) return;

    try {
      const { error } = await supabase
        .from("konten_halaman")
        .delete()
        .eq("id", id);

      if (error) throw error;
      alert("Konten berhasil dihapus!");
      fetchData();
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  const openEditModal = (content) => {
    setEditingContent(content);
    setIsEditModalOpen(true);
  };

  // Separate hero and regular content
  const heroContent = contentBlocks[0] || null; // First item
  const regularContent = contentBlocks.slice(1); // Rest

  const renderLayout = () => {
    const layout = settings?.visi_misi_layout || "modular";
    const layoutProps = {
      contentBlocks: regularContent,
      settings,
      isAdmin,
      onEdit: openEditModal,
      onDelete: handleDelete,
    };

    switch (layout) {
      case "split":
        return <LayoutSplit {...layoutProps} />;
      case "zigzag":
        return <LayoutZigZag {...layoutProps} />;
      case "simple":
        return <LayoutSimple {...layoutProps} />;
      case "modular":
      default:
        return <LayoutModular {...layoutProps} />;
    }
  };

  const handleUpdateLayout = async (newLayout) => {
    try {
      const { error } = await supabase
        .from("pengaturan")
        .update({ visi_misi_layout: newLayout })
        .eq("id", 1);

      if (error) throw error;
      setSettings((prev) => ({ ...prev, visi_misi_layout: newLayout }));
    } catch (err) {
      alert("Gagal update layout: " + err.message);
    }
  };

  return (
    <PageContainer breadcrumbText="Profile">
      <PageHeader
        title="Profile"
        subtitle="Menjawab siapa kami, apa visi kami, dan bagaimana kami bergerak."
        extraActions={
          isAdmin && (
            <div
              className="flex bg-slate-100 p-1 rounded-lg border border-slate-200"
              title="Pintasan Layout"
            >
              {[
                {
                  id: "modular",
                  icon: <FiGrid size={14} />,
                  label: "Modular",
                },
                { id: "split", icon: <FiColumns size={14} />, label: "Split" },
                { id: "zigzag", icon: <FiRepeat size={14} />, label: "ZigZag" },
                {
                  id: "simple",
                  icon: <FiAlignCenter size={14} />,
                  label: "Simple",
                },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleUpdateLayout(l.id)}
                  className={`p-1.5 rounded-md transition-all flex items-center justify-center ${
                    (settings?.visi_misi_layout || "modular") === l.id
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title={`Ganti ke Layout ${l.label}`}
                >
                  {l.icon}
                </button>
              ))}
            </div>
          )
        }
        primaryAction={
          isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="button button-primary !py-2 !px-4 !text-xs whitespace-nowrap"
              title="Tambah Konten Baru"
            >
              <FiPlus /> <span className="hidden xs:inline">Tambah Konten</span>
            </button>
          )
        }
        actions={
          isAdmin && [
            <button
              key="reorder"
              onClick={() => setIsReorderModalOpen(true)}
              className="button button-secondary"
              title="Atur Urutan"
            >
              <FiList /> Urutan
            </button>,
            <button
              key="layout"
              onClick={() => setIsLayoutModalOpen(true)}
              className="button button-secondary"
              title="Ganti Layout"
            >
              <FiSettings /> Layout Settings
            </button>,
          ]
        }
      />

      <div className="py-12">
        {loading ? (
          <div className="flex flex-col gap-8 animate-pulse">
            <div className="h-64 bg-slate-200 rounded-2xl w-full"></div>
            <div className="grid grid-cols-2 gap-8">
              <div className="h-40 bg-slate-100 rounded-2xl"></div>
              <div className="h-40 bg-slate-100 rounded-2xl"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section (First Content Block) */}
            {heroContent && (
              <div className="mb-12 relative group">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden">
                  {heroContent.image_url && (
                    <div className="absolute inset-0 opacity-30">
                      <img
                        src={heroContent.image_url}
                        alt={heroContent.judul}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tighter">
                      {heroContent.judul}
                    </h2>
                    <div className="prose prose-invert prose-lg max-w-none">
                      {heroContent.isi}
                    </div>

                    {heroContent.button_text && heroContent.button_link && (
                      <a
                        href={heroContent.button_link}
                        className="inline-block mt-8 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-2xl transition-all"
                      >
                        {heroContent.button_text}
                      </a>
                    )}
                  </div>
                </div>

                {/* Admin Controls on Hero */}
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(heroContent)}
                      className="px-4 py-2 bg-white/90 backdrop-blur-sm text-slate-700 rounded-lg shadow-lg hover:bg-white transition-all text-sm font-bold"
                    >
                      <FiEdit className="inline mr-1" /> Edit Hero
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Regular Content (Rendered by Layout) */}
            {renderLayout()}

            {/* Empty State */}
            {contentBlocks.length === 0 && (
              <div className="text-center py-20">
                <div className="text-slate-300 mb-6">
                  <FiSettings size={64} className="mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-slate-400 mb-4">
                  Belum Ada Konten
                </h3>
                <p className="text-slate-500 mb-6">
                  Klik tombol "Tambah Konten" untuk mulai menambahkan profil
                  organisasi
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="button button-primary"
                  >
                    <FiPlus /> Tambah Konten Pertama
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Content Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Konten Baru"
      >
        <KontenHalamanForm
          pageType="profile"
          onSuccess={() => {
            fetchData();
            setIsAddModalOpen(false);
          }}
          onClose={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Content Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingContent(null);
        }}
        title="Edit Konten"
      >
        <KontenHalamanForm
          initialData={editingContent}
          pageType="profile"
          onSuccess={() => {
            fetchData();
            setIsEditModalOpen(false);
            setEditingContent(null);
          }}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingContent(null);
          }}
        />
      </Modal>

      {/* Reorder Modal */}
      <Modal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        title="Atur Urutan Konten"
      >
        <KontenReorderModal
          isOpen={isReorderModalOpen}
          onClose={() => setIsReorderModalOpen(false)}
          contentList={contentBlocks}
          onSuccess={fetchData}
        />
      </Modal>

      {/* Layout Settings Modal */}
      <Modal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        title="Pengaturan Layout"
      >
        <LayoutSettingsForm
          currentLayout={settings?.visi_misi_layout}
          onSuccess={() => {
            fetchData();
            setIsLayoutModalOpen(false);
          }}
          onClose={() => setIsLayoutModalOpen(false)}
        />
      </Modal>
    </PageContainer>
  );
}

export default Profile;
