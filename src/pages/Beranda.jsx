import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { FiPlus } from "react-icons/fi";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import Modal from "../components/Modal.jsx";

// Layouts
import HomeHero from "../components/layouts/home/HomeHero.jsx";
import HomeStats from "../components/layouts/home/HomeStats.jsx";
import LayoutSplit from "../components/layouts/visimisi/LayoutSplit.jsx"; // Reuse Split Layout (Sambutan Ketua)

// Forms
import BerandaForm from "../components/forms/BerandaForm.jsx";

function Beranda() {
  const { session } = useAuth();
  const isAdmin = !!session;

  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Filter hanya konten 'beranda'
      const { data, error } = await supabase
        .from("konten_halaman")
        .select("*")
        .eq("page_type", "beranda")
        .order("urutan", { ascending: true });

      if (error) throw error;
      setContents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC CRUD ---
  // Hero adalah item pertama (urutan paling kecil)
  const heroContent = contents.length > 0 ? contents[0] : null;
  // Sisanya adalah konten body (Sambutan Ketua, Fitur, dll)
  const bodyContents = contents.length > 0 ? contents.slice(1) : [];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormFile(file);
      setFormPreview(URL.createObjectURL(file));
    }
  };

  const openModal = (item = null) => {
    setFormFile(null);
    setFormPreview(null);
    if (item) {
      setEditingId(item.id);
      setFormData(item);
      setFormPreview(item.image_url);
    } else {
      setEditingId(null);
      const lastOrder =
        contents.length > 0 ? contents[contents.length - 1].urutan : 0;
      setFormData({
        judul: "",
        isi: "",
        urutan: lastOrder + 10,
        page_type: "beranda", // PENTING: Default ke beranda
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let imageUrl = formData.image_url;

      // Upload Gambar jika ada file baru
      if (formFile) {
        const ext = formFile.name.split(".").pop();
        const fileName = `home_${Date.now()}.${ext}`;
        // Upload ke bucket 'logos' sesuai request
        const { error: uploadError } = await supabase.storage
          .from("logos")
          .upload(fileName, formFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("logos")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const payload = { ...formData, image_url: imageUrl };

      if (editingId) {
        await supabase
          .from("konten_halaman")
          .update(payload)
          .eq("id", editingId);
      } else {
        await supabase.from("konten_halaman").insert(payload);
      }

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
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <PageContainer breadcrumbText="Memuat...">
        <LoadingState message="Menyiapkan halaman beranda..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer breadcrumbText="Beranda">
      {/* 1. HERO SECTION */}
      {heroContent ? (
        <HomeHero data={heroContent} isAdmin={isAdmin} onEdit={openModal} />
      ) : (
        isAdmin && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              border: "2px dashed #cbd5e0",
              borderRadius: "12px",
              marginBottom: "3rem",
            }}
          >
            <h2>Belum ada Banner Utama</h2>
            <button
              onClick={() => openModal()}
              className="button button-primary"
              style={{ marginTop: "1rem" }}
            >
              + Buat Hero Banner
            </button>
          </div>
        )
      )}

      {/* 2. STATISTIK (Glorifikasi) */}
      <HomeStats />

      {/* 3. KONTEN DINAMIS (Sambutan Ketua, dll) */}
      {/* Kita reuse LayoutSplit karena cocok (Gambar Kiri/Kanan + Teks) */}
      {bodyContents.length > 0 && (
        <LayoutSplit
          data={bodyContents}
          isAdmin={isAdmin}
          onEdit={openModal}
          onDelete={handleDelete}
        />
      )}

      {isAdmin && (
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <button
            onClick={() => openModal()}
            className="button button-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FiPlus /> Tambah Konten Lain
          </button>
        </div>
      )}

      {/* MODAL FORM */}
      {isAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Konten Beranda" : "Tambah Konten Beranda"}
        >
          <BerandaForm
            formData={formData}
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            loading={modalLoading}
            preview={formPreview}
          />
        </Modal>
      )}
    </PageContainer>
  );
}

export default Beranda;
