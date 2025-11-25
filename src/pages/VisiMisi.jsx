// src/pages/VisiMisi.jsx

import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import styles from "./VisiMisi.module.css";
import formStyles from "../components/admin/AdminForm.module.css";

// UI Components
import PageContainer from "../components/ui/PageContainer.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import Modal from "../components/Modal.jsx";

// Forms & Reorder
import VisiMisiForm from "../components/forms/VisiMisiForm.jsx";
import KontenReorderModal from "../components/admin/KontenReorderModal.jsx";

// Layouts
import LayoutModular from "../components/layouts/visimisi/LayoutModular.jsx";
import LayoutSplit from "../components/layouts/visimisi/LayoutSplit.jsx";
import LayoutZigZag from "../components/layouts/visimisi/LayoutZigZag.jsx";

// --- UPDATE IMPORT ICONS ---
import {
  FiEdit, // GANTI: Edit standar (Pensil)
  FiLayout,
  FiLayers,
  FiGrid,
  FiColumns,
  FiGitMerge, // GANTI: Ikon ZigZag (Simbol percabangan/selang-seling)
  FiPlus, // BARU: Ikon Tambah
} from "react-icons/fi";

function VisiMisi() {
  const { session } = useAuth();
  const isAdmin = !!session;

  // States
  const [contents, setContents] = useState([]);
  const [layoutMode, setLayoutMode] = useState("modular");
  const [loading, setLoading] = useState(true);

  // Modals & Form States...
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: settings } = await supabase
        .from("pengaturan")
        .select("visi_misi_layout")
        .eq("id", 1)
        .single();
      if (settings) setLayoutMode(settings.visi_misi_layout || "modular");

      const { data, error } = await supabase
        .from("konten_halaman")
        .select("*")
        .order("urutan", { ascending: true });
      if (error) throw error;
      setContents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const heroContent = contents.length > 0 ? contents[0] : null;
  const gridContents = contents.length > 0 ? contents.slice(1) : [];

  // Handlers...
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

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      const lastOrder =
        contents.length > 0 ? contents[contents.length - 1].urutan : 0;
      setFormData({ judul: "", isi: "", urutan: lastOrder + 10 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingId)
        await supabase
          .from("konten_halaman")
          .update(formData)
          .eq("id", editingId);
      else await supabase.from("konten_halaman").insert(formData);
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus?")) return;
    try {
      await supabase.from("konten_halaman").delete().eq("id", id);
      setContents((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  const handleFormChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
        <LoadingState message="Memuat konten..." />
      </PageContainer>
    );

  return (
    <PageContainer breadcrumbText="Visi & Misi">
      {/* HEADER */}
      <div className={styles.headerSection}>
        <div></div>
        {isAdmin && (
          <div className={styles.adminControls}>
            <button
              onClick={() => setIsReorderOpen(true)}
              className={styles.settingBtn}
              title="Atur Urutan"
            >
              <FiLayers /> Atur Urutan
            </button>
            <button
              onClick={() => setIsSettingOpen(true)}
              className={styles.settingBtn}
              title="Ganti Tampilan"
            >
              <FiLayout /> Tampilan
            </button>
          </div>
        )}
      </div>

      {/* HERO CONTENT */}
      <div className={styles.heroWrapper}>
        {heroContent ? (
          <div className={styles.heroContent}>
            <h1 className={styles.pageTitle}>{heroContent.judul}</h1>
            <p className={styles.pageSubtitle}>{heroContent.isi}</p>
            {isAdmin && (
              <button
                onClick={() => openModal(heroContent)}
                className={styles.editHeroBtn}
                title="Edit Judul Utama"
              >
                {/* GANTI ICON EDIT */}
                <FiEdit />
              </button>
            )}
          </div>
        ) : (
          <div className={styles.emptyHero}>
            <h1 className={styles.pageTitle}>Visi & Misi</h1>
            {isAdmin && (
              <button
                onClick={() => openModal()}
                className="button button-primary"
              >
                {/* GANTI ICON PLUS */}
                <FiPlus style={{ marginRight: "4px" }} /> Buat Judul Utama
              </button>
            )}
          </div>
        )}
      </div>

      {/* DYNAMIC CONTENT GRID */}
      <div className={styles.contentWrapper}>
        {renderLayout()}

        {isAdmin && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              onClick={() => openModal()}
              className={styles.addBtn}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              {/* GANTI ICON PLUS */}
              <FiPlus size={20} /> Tambah Seksi Baru
            </button>
          </div>
        )}
      </div>

      {/* MODALS (Form, Reorder) ... (Sama seperti sebelumnya) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Konten" : "Tambah Konten"}
      >
        <VisiMisiForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={modalLoading}
        />
      </Modal>

      {isAdmin && (
        <Modal
          isOpen={isReorderOpen}
          onClose={() => setIsReorderOpen(false)}
          title="Atur Urutan Konten"
        >
          <KontenReorderModal
            isOpen={isReorderOpen}
            onClose={() => setIsReorderOpen(false)}
            contentList={contents}
            onSuccess={fetchData}
          />
        </Modal>
      )}

      {/* LAYOUT SETTING (Icons Updated) */}
      <Modal
        isOpen={isSettingOpen}
        onClose={() => setIsSettingOpen(false)}
        title="Pilih Tampilan"
      >
        <div className={styles.layoutOptionGrid}>
          <div
            className={`${styles.layoutOption} ${
              layoutMode === "modular" ? styles.active : ""
            }`}
            onClick={() => handleLayoutChange("modular")}
          >
            <div className={styles.layoutIcon}>
              <FiGrid />
            </div>
            <span>Modular</span>
          </div>
          <div
            className={`${styles.layoutOption} ${
              layoutMode === "split" ? styles.active : ""
            }`}
            onClick={() => handleLayoutChange("split")}
          >
            <div className={styles.layoutIcon}>
              <FiColumns />
            </div>
            <span>Split</span>
          </div>
          <div
            className={`${styles.layoutOption} ${
              layoutMode === "zigzag" ? styles.active : ""
            }`}
            onClick={() => handleLayoutChange("zigzag")}
          >
            {/* GANTI ICON ZIGZAG KE GIT MERGE (Lebih mirip cabang) */}
            <div className={styles.layoutIcon}>
              <FiGitMerge />
            </div>
            <span>Zig-Zag</span>
          </div>
        </div>
        <div
          className={formStyles["form-footer"]}
          style={{ marginTop: "2rem" }}
        >
          <button
            onClick={() => setIsSettingOpen(false)}
            className="button button-primary"
            style={{ width: "100%" }}
          >
            Selesai
          </button>
        </div>
      </Modal>
    </PageContainer>
  );
}

export default VisiMisi;
