import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import styles from "./VisiMisi.module.css";
// Kita aktifkan ini untuk styling footer modal yang konsisten
import formStyles from "../components/admin/AdminForm.module.css";

// UI Components
import PageContainer from "../components/ui/PageContainer.jsx";
// Ganti LoadingState biasa dengan Skeleton khusus Visi Misi
import { VisiMisiSkeleton } from "../components/ui/Skeletons.jsx";
import Modal from "../components/Modal.jsx";

// Forms & Reorder
import VisiMisiForm from "../components/forms/VisiMisiForm.jsx";
import KontenReorderModal from "../components/admin/KontenReorderModal.jsx";

// Layouts
import LayoutModular from "../components/layouts/visimisi/LayoutModular.jsx";
import LayoutSplit from "../components/layouts/visimisi/LayoutSplit.jsx";
import LayoutZigZag from "../components/layouts/visimisi/LayoutZigZag.jsx";

// ICONS
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

  // States Data
  const [contents, setContents] = useState([]);

  // States Pengaturan
  const [layoutMode, setLayoutMode] = useState("modular");
  const [showHero, setShowHero] = useState(true);

  const [loading, setLoading] = useState(true);

  // Modals
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
      // 1. Ambil Pengaturan (Layout & Hero)
      const { data: settings } = await supabase
        .from("pengaturan")
        .select("visi_misi_layout, tampilkan_hero")
        .eq("id", 1)
        .single();

      if (settings) {
        setLayoutMode(settings.visi_misi_layout || "modular");
        setShowHero(settings.tampilkan_hero !== false);
      }

      // 2. Ambil Konten
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

  // --- LOGIC PEMBAGIAN KONTEN ---
  // Jika Hero Aktif: Item pertama (urutan 1) jadi Hero.
  const heroContent = showHero && contents.length > 0 ? contents[0] : null;
  // Sisanya masuk ke grid di bawahnya.
  const gridContents =
    showHero && contents.length > 0 ? contents.slice(1) : contents;

  // Handlers
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
      console.error(err);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      // Auto-increment urutan
      const lastOrder =
        contents.length > 0 ? contents[contents.length - 1].urutan : 0;
      setFormData({
        judul: "",
        isi: "",
        urutan: lastOrder + 10,
        page_type: "visimisi",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const payload = { ...formData, page_type: "visimisi" };
      if (editingId)
        await supabase
          .from("konten_halaman")
          .update(payload)
          .eq("id", editingId);
      else await supabase.from("konten_halaman").insert(payload);

      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Gagal: " + err.message);
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

  if (loading) {
    return (
      <PageContainer breadcrumbText="Memuat...">
        <VisiMisiSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer breadcrumbText="Visi & Misi">
      {/* HEADER */}
      <div className={styles.headerSection}>
        <div></div> {/* Spacer agar tombol ada di kanan */}
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
      {showHero && (
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
                  <FiPlus style={{ marginRight: "4px" }} /> Buat Judul Utama
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* DYNAMIC CONTENT GRID */}
      <div className={styles.contentWrapper}>
        {renderLayout()}

        {isAdmin && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button onClick={() => openModal()} className={styles.addBtn}>
              <FiPlus size={20} /> Tambah Seksi Baru
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL FORM --- */}
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

      {/* --- MODAL REORDER --- */}
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

      {/* --- MODAL SETTING TAMPILAN --- */}
      <Modal
        isOpen={isSettingOpen}
        onClose={() => setIsSettingOpen(false)}
        title="Pengaturan Tampilan"
      >
        {/* 1. Toggle Hero Section */}
        <div
          style={{
            marginBottom: "1.5rem",
            paddingBottom: "1.5rem",
            borderBottom: "1px dashed #e2e8f0",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <div>
              <span
                style={{
                  display: "block",
                  fontWeight: "700",
                  color: "#2d3748",
                }}
              >
                Banner Utama (Hero)
              </span>
              <span style={{ fontSize: "0.85rem", color: "#718096" }}>
                Tampilkan judul besar di bagian paling atas.
              </span>
            </div>
            <div
              onClick={handleToggleHero}
              style={{
                fontSize: "2rem",
                color: showHero ? "#3182ce" : "#cbd5e0",
                display: "flex",
                alignItems: "center",
              }}
            >
              {showHero ? <FiToggleRight /> : <FiToggleLeft />}
            </div>
          </label>
        </div>

        {/* 2. Pilihan Layout Grid */}
        <div>
          <span
            style={{
              display: "block",
              fontWeight: "700",
              color: "#2d3748",
              marginBottom: "0.5rem",
            }}
          >
            Gaya Tampilan Konten
          </span>
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
              <div className={styles.layoutIcon}>
                <FiGitMerge />
              </div>
              <span>Zig-Zag</span>
            </div>
          </div>
        </div>

        <div className={formStyles.formFooter} style={{ marginTop: "2rem" }}>
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
