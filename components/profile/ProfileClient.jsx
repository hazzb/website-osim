"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/AuthContext";
import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
// Note: Modals and Forms should be migrated for full admin functionality
// import Modal from "@/components/Modal";

// Layout Components
import LayoutModular from "@/components/layouts/profile/LayoutModular";
import LayoutSplit from "@/components/layouts/profile/LayoutSplit";
import LayoutZigZag from "@/components/layouts/profile/LayoutZigZag";
import LayoutSimple from "@/components/layouts/profile/LayoutSimple";

// Icons
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

export default function ProfileClient({
  initialSettings,
  initialContentBlocks,
}) {
  const { session } = useAuth();
  const isAdmin = !!session;
  const supabase = createClient();

  const [settings, setSettings] = useState(initialSettings);
  const [contentBlocks, setContentBlocks] = useState(initialContentBlocks);
  const [loading, setLoading] = useState(false);

  // Modal states (placeholder for now, to be implemented with Phase 4)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: settingsData } = await supabase
        .from("pengaturan")
        .select("*")
        .eq("id", 1)
        .single();
      setSettings(settingsData || {});

      const { data: kontenData } = await supabase
        .from("konten_halaman")
        .select("*")
        .eq("page_type", "profile")
        .order("urutan", { ascending: true });
      setContentBlocks(kontenData || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus konten ini?")) return;
    try {
      await supabase.from("konten_halaman").delete().eq("id", id);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus.");
    }
  };

  const openEditModal = (content) => {
    alert("Edit Modal Placeholder");
  };

  const heroContent = contentBlocks[0] || null;
  const regularContent = contentBlocks.slice(1);

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
      await supabase
        .from("pengaturan")
        .update({ visi_misi_layout: newLayout })
        .eq("id", 1);
      setSettings((prev) => ({ ...prev, visi_misi_layout: newLayout }));
    } catch (err) {
      alert("Gagal update layout.");
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
              className="flex bg-border-dim p-1 rounded-lg border border-border-dim"
              title="Pintasan Layout"
            >
              {[
                { id: "modular", icon: <FiGrid size={14} />, label: "Modular" },
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
                      ? "bg-bg-card text-primary shadow-sm"
                      : "text-text-muted hover:text-text-body"
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
              className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-2"
            >
              <FiPlus /> Tambah Konten
            </button>
          )
        }
      />

      <div className="py-12">
        {loading ? (
          <div className="flex flex-col gap-8 animate-pulse">
            <div className="h-64 bg-border-dim rounded-2xl w-full"></div>
            <div className="grid grid-cols-2 gap-8">
              <div className="h-40 bg-border-dim rounded-2xl"></div>
              <div className="h-40 bg-border-dim rounded-2xl"></div>
            </div>
          </div>
        ) : (
          <>
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
                        className="inline-block mt-8 px-8 py-4 bg-bg-card text-primary font-bold rounded-xl hover:shadow-2xl transition-all"
                      >
                        {heroContent.button_text}
                      </a>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(heroContent)}
                      className="px-4 py-2 bg-bg-card/90 backdrop-blur-sm text-text-main rounded-lg shadow-lg hover:bg-bg-card transition-all text-sm font-bold"
                    >
                      <FiEdit className="inline mr-1" /> Edit Hero
                    </button>
                  </div>
                )}
              </div>
            )}

            {renderLayout()}

            {contentBlocks.length === 0 && (
              <div className="text-center py-20">
                <FiSettings size={64} className="mx-auto text-slate-300 mb-6" />
                <h3 className="text-2xl font-bold text-text-muted mb-4">
                  Belum Ada Konten
                </h3>
                {isAdmin && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-bold"
                  >
                    <FiPlus className="inline mr-2" /> Tambah Konten Pertama
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
