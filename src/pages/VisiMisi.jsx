import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import styles from "./VisiMisi.module.css"; // CSS Halaman
import formStyles from "../components/admin/AdminForm.module.css"; // CSS Tombol Save Layout

// UI Components
import Modal from "../components/Modal.jsx";

// Forms & Reorder (NEW)
import VisiMisiForm from "../components/forms/VisiMisiForm.jsx";
import KontenReorderModal from "../components/admin/KontenReorderModal.jsx";

// Layouts
import LayoutModular from "../components/layouts/visimisi/LayoutModular.jsx";
import LayoutSplit from "../components/layouts/visimisi/LayoutSplit.jsx";
import LayoutZigZag from "../components/layouts/visimisi/LayoutZigZag.jsx";

function VisiMisi() {
  const { session } = useAuth();
  const isAdmin = !!session;

  // States
  const [contents, setContents] = useState([]);
  const [layoutMode, setLayoutMode] = useState("modular");
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false); // Form
  const [isReorderOpen, setIsReorderOpen] = useState(false); // Reorder
  const [isSettingOpen, setIsSettingOpen] = useState(false); // Layout Setting

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
      <div className="main-content">
        <p style={{ textAlign: "center", padding: "3rem" }}>Memuat...</p>
      </div>
    );

  return (
    <div className="main-content">
      {/* TOP BAR: Admin Controls */}
      {isAdmin && (
        <div className={styles.topBar} style={{ gap: "0.5rem" }}>
          <button
            onClick={() => setIsReorderOpen(true)}
            className={styles.settingBtn}
            style={{
              backgroundColor: "#ebf8ff",
              borderColor: "#bee3f8",
              color: "#2b6cb0",
            }}
          >
            ↕️ Atur Urutan
          </button>
          <button
            onClick={() => setIsSettingOpen(true)}
            className={styles.settingBtn}
          >
            ⚙️ Tampilan
          </button>
        </div>
      )}

      {/* HERO SECTION (Item #1) */}
      <div className={styles.headerSection}>
        {heroContent ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            <h1 className={styles.pageTitle}>{heroContent.judul}</h1>
            <p className={styles.pageSubtitle}>{heroContent.isi}</p>
            {isAdmin && (
              <div
                style={{ position: "absolute", top: "-10px", right: "-40px" }}
              >
                <button
                  onClick={() => openModal(heroContent)}
                  className={styles.iconBtn}
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h1 className={styles.pageTitle}>Visi & Misi</h1>
            {isAdmin && (
              <button onClick={() => openModal()}>+ Buat Judul Utama</button>
            )}
          </div>
        )}
      </div>

      {/* CONTENT GRID (Item #2 dst) */}
      <div className={styles.container}>
        {renderLayout()}
        {isAdmin && (
          <button onClick={() => openModal()} className={styles.addBtn}>
            + Tambah Seksi Baru
          </button>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. FORM (Create/Edit) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Konten" : "Tambah Konten Baru"}
      >
        <VisiMisiForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={modalLoading}
        />
      </Modal>

      {/* 2. REORDER (Urutan) */}
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

      {/* 3. LAYOUT (Setting) */}
      <Modal
        isOpen={isSettingOpen}
        onClose={() => setIsSettingOpen(false)}
        title="Pilih Tampilan Halaman"
      >
        <div className={styles.layoutOptionGrid}>
          <div
            className={`${styles.layoutOption} ${layoutMode === "modular" ? styles.active : ""}`}
            onClick={() => handleLayoutChange("modular")}
          >
            Modular
          </div>
          <div
            className={`${styles.layoutOption} ${layoutMode === "split" ? styles.active : ""}`}
            onClick={() => handleLayoutChange("split")}
          >
            Split
          </div>
          <div
            className={`${styles.layoutOption} ${layoutMode === "zigzag" ? styles.active : ""}`}
            onClick={() => handleLayoutChange("zigzag")}
          >
            Zig-Zag
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
    </div>
  );
}

export default VisiMisi;
