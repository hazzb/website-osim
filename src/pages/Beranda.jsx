import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import {
  FiPlus,
  FiSettings,
  FiToggleLeft,
  FiToggleRight,
  FiLayers,
} from "react-icons/fi";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import Modal from "../components/Modal.jsx";

// Layouts
import HomeHero from "../components/layouts/home/HomeHero.jsx";
import HomeStats from "../components/layouts/home/HomeStats.jsx";
import LayoutSplit from "../components/layouts/visimisi/LayoutSplit.jsx";

// Forms & Reorder
import BerandaForm from "../components/forms/BerandaForm.jsx";
import KontenReorderModal from "../components/admin/KontenReorderModal.jsx";

function Beranda() {
  const { session } = useAuth();
  const isAdmin = !!session;

  // Data State
  const [contents, setContents] = useState([]);
  const [showHero, setShowHero] = useState(true);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);

  // Form Logic States
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  // State Upload: Single File & Carousel Array
  const [formFile, setFormFile] = useState(null); // Single Image File
  const [formPreview, setFormPreview] = useState(null); // Single Image Preview URL
  const [carouselData, setCarouselData] = useState([]); // Array [{file, url, caption}]

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Ambil Pengaturan
      const { data: settings } = await supabase
        .from("pengaturan")
        .select("beranda_tampilkan_hero")
        .eq("id", 1)
        .single();

      if (settings) {
        setShowHero(settings.beranda_tampilkan_hero !== false);
      }

      // 2. Ambil Konten Beranda
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

  // --- LOGIC PEMBAGIAN KONTEN ---
  const heroContent = showHero && contents.length > 0 ? contents[0] : null;
  const bodyContents =
    showHero && contents.length > 0 ? contents.slice(1) : contents;

  // --- HANDLERS ---
  const handleToggleHero = async () => {
    const newValue = !showHero;
    setShowHero(newValue);
    try {
      await supabase
        .from("pengaturan")
        .update({ beranda_tampilkan_hero: newValue })
        .eq("id", 1);
    } catch (err) {
      setShowHero(!newValue);
    }
  };

  // Handle Input Form biasa & Carousel Data update
  const handleFormChange = (e) => {
    if (e.target.name === "carousel_data") {
      setCarouselData(e.target.value);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Handle Input File Single (Legacy support / Image Only mode)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormFile(file);
      setFormPreview(URL.createObjectURL(file));
      setCarouselData([]); // Reset carousel jika user switch ke single image
    }
  };

  const openModal = (item = null) => {
    setFormFile(null);
    setFormPreview(null);
    setCarouselData([]);

    if (item) {
      setEditingId(item.id);
      setFormData(item);
      setFormPreview(item.image_url);

      // Populate Carousel Data jika ada
      if (
        item.gallery_urls &&
        Array.isArray(item.gallery_urls) &&
        item.gallery_urls.length > 0
      ) {
        const mapped = item.gallery_urls.map((g) => ({
          url: typeof g === "string" ? g : g.url,
          caption: typeof g === "string" ? "" : g.caption,
          file: null,
        }));
        setCarouselData(mapped);
      }
    } else {
      setEditingId(null);
      const lastOrder =
        contents.length > 0 ? contents[contents.length - 1].urutan : 0;
      setFormData({
        judul: "",
        isi: "",
        urutan: lastOrder + 10,
        page_type: "beranda",
      });
    }
    setIsModalOpen(true);
  };

  // --- LOGIKA SUBMIT (HANDLE SINGLE & CAROUSEL) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let singleImageUrl = formData.image_url;
      let finalGallery = [];

      // A. PROSES CAROUSEL
      if (carouselData.length > 0) {
        for (let i = 0; i < carouselData.length; i++) {
          const item = carouselData[i];
          let itemUrl = item.url;

          // Upload jika ada file baru di slide ini
          if (item.file) {
            const ext = item.file.name.split(".").pop();
            const fileName = `carousel_${Date.now()}_${i}.${ext}`;
            const { error: uploadError } = await supabase.storage
              .from("logos")
              .upload(fileName, item.file);
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
              .from("logos")
              .getPublicUrl(fileName);
            itemUrl = urlData.publicUrl;
          }

          // Push ke final array (URL + Caption)
          finalGallery.push({ url: itemUrl, caption: item.caption || "" });
        }
        singleImageUrl = null; // Reset single image karena ini mode carousel

        // B. PROSES SINGLE IMAGE
      } else if (formFile) {
        const ext = formFile.name.split(".").pop();
        const fileName = `home_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("logos")
          .upload(fileName, formFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("logos")
          .getPublicUrl(fileName);
        singleImageUrl = urlData.publicUrl;
      }

      // C. SUSUN PAYLOAD
      const payload = {
        ...formData,
        image_url: finalGallery.length > 0 ? null : singleImageUrl,
        gallery_urls: finalGallery.length > 0 ? finalGallery : null,

        // Bersihkan field yang tidak relevan
        judul: finalGallery.length > 0 ? null : formData.judul,
        isi: finalGallery.length > 0 ? null : formData.isi,

        page_type: "beranda",
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
      {/* HEADER CONTROLS (Admin) */}
      {isAdmin && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <button
            onClick={() => setIsReorderOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "white",
              border: "1px solid #e2e8f0",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#64748b",
              fontWeight: "600",
            }}
          >
            <FiLayers /> Atur Urutan
          </button>
          <button
            onClick={() => setIsSettingOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "white",
              border: "1px solid #e2e8f0",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#64748b",
              fontWeight: "600",
            }}
          >
            <FiSettings /> Pengaturan
          </button>
        </div>
      )}

      {/* 1. HERO SECTION */}
      {showHero && (
        <>
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
        </>
      )}

      {/* 2. STATISTIK */}
      <HomeStats />

      {/* 3. KONTEN BODY (Auto Layout) */}
      {bodyContents.length > 0 && (
        <LayoutSplit
          data={bodyContents}
          isAdmin={isAdmin}
          onEdit={openModal}
          onDelete={handleDelete}
        />
      )}

      {/* Tombol Tambah */}
      {isAdmin && (
        <div
          style={{
            textAlign: "center",
            marginTop: "4rem",
            marginBottom: "2rem",
          }}
        >
          <button
            onClick={() => openModal()}
            className="button button-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.8rem 1.5rem",
            }}
          >
            <FiPlus /> Tambah Konten Baru
          </button>
        </div>
      )}

      {/* --- MODALS --- */}
      {isAdmin && (
        <>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingId ? "Edit Konten Beranda" : "Tambah Konten Beranda"}
          >
            <BerandaForm
              formData={formData}
              onChange={handleFormChange}
              onFileChange={handleFileChange}
              onSubmit={handleSubmit}
              onCancel={() => setIsModalOpen(false)}
              loading={modalLoading}
              preview={formPreview}
            />
          </Modal>

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

          <Modal
            isOpen={isSettingOpen}
            onClose={() => setIsSettingOpen(false)}
            title="Pengaturan Beranda"
          >
            <div style={{ padding: "0.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  background: "#f8fafc",
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
                    Tampilkan konten pertama sebagai banner besar.
                  </span>
                </div>
                <div
                  onClick={handleToggleHero}
                  style={{
                    fontSize: "2.5rem",
                    color: showHero ? "#3182ce" : "#cbd5e0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showHero ? <FiToggleRight /> : <FiToggleLeft />}
                </div>
              </div>
              <button
                onClick={() => setIsSettingOpen(false)}
                className="button button-primary"
                style={{ width: "100%", marginTop: "1.5rem" }}
              >
                Selesai
              </button>
            </div>
          </Modal>
        </>
      )}
    </PageContainer>
  );
}

export default Beranda;
