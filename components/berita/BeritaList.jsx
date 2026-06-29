"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/AuthContext";
import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import BeritaCard from "./BeritaCard";
import Modal from "@/components/Modal";
import BeritaForm from "@/components/forms/BeritaForm";
import { uploadImage } from "@/utils/uploadHelper";
import { FiSearch, FiRefreshCw, FiPlus, FiAlertCircle, FiEdit3, FiEdit2, FiEdit, FiPlusCircle } from "react-icons/fi";

const INITIAL_LIMIT = 6;
const LOAD_MORE_COUNT = 6;

const EMPTY_FORM = {
  judul: "",
  slug: "",
  kategori: "",
  tanggal: new Date().toISOString().split("T")[0],
  penulis: "",
  excerpt: "",
  konten: "",
  image_url: "",
};

export default function BeritaList({ initialBerita }) {
  const supabase = createClient();
  const { session } = useAuth();
  const isAdmin = !!session;

  // ---- State Data ----
  const [beritaList, setBeritaList] = useState(initialBerita || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [visibleCount, setVisibleCount] = useState(INITIAL_LIMIT);
  const [loading, setLoading] = useState(false);
  const observerTarget = useRef(null);

  // ---- State Modal ----
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // ---- State Image Upload ----
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // ---- State Delete Confirm ----
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch the latest real-time data on the client side
  const fetchLatestBerita = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("berita")
        .select("*")
        .order("tanggal", { ascending: false });

      if (error) throw error;
      if (data) {
        setBeritaList(data);
      }
    } catch (err) {
      console.error("Gagal memperbarui berita secara real-time:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestBerita();
  }, [supabase]);

  // Extract unique categories dynamically from the loaded news
  const categories = useMemo(() => {
    const cats = new Set(beritaList.map((b) => b.kategori));
    return ["Semua", ...Array.from(cats)];
  }, [beritaList]);

  // Filter and search logic
  const filteredBerita = useMemo(() => {
    return beritaList.filter((berita) => {
      const matchSearch =
        berita.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        berita.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchKategori =
        selectedKategori === "Semua" || berita.kategori === selectedKategori;
      return matchSearch && matchKategori;
    });
  }, [beritaList, searchTerm, selectedKategori]);

  // Sliced data based on visibleCount (Infinite Scroll)
  const displayedBerita = filteredBerita.slice(0, visibleCount);
  const hasMore = visibleCount < filteredBerita.length;

  // Infinite Scroll Observer
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, loading]);

  // ---- Modal Action Handlers ----
  const openModal = (item = null) => {
    if (item && item.id) {
      setEditingId(item.id);
      setFormData({
        ...item,
        tanggal: item.tanggal ? item.tanggal.split("T")[0] : "",
      });
      setImagePreview(item.image_url || null);
    } else {
      setEditingId(null);
      setFormData({ ...EMPTY_FORM });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setImagePreview(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    setUploadingImage(true);
    try {
      const publicUrl = await uploadImage(file, "berita", 2);
      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      setImagePreview(publicUrl);
    } catch (err) {
      alert("Gagal upload gambar: " + (err?.message ?? err));
      setImagePreview(null);
      setFormData((prev) => ({ ...prev, image_url: "" }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image_url: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadingImage) return;

    setModalLoading(true);
    try {
      const payload = {
        judul: formData.judul,
        slug: formData.slug,
        kategori: formData.kategori,
        tanggal: formData.tanggal ? new Date(formData.tanggal).toISOString() : new Date().toISOString(),
        penulis: formData.penulis,
        excerpt: formData.excerpt,
        konten: formData.konten,
        image_url: formData.image_url,
      };

      if (editingId) {
        const { error } = await supabase
          .from("berita")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("berita")
          .insert([payload]);
        if (error) throw error;
      }

      closeModal();
      fetchLatestBerita();
      alert(editingId ? "Berita berhasil diperbarui!" : "Berita baru berhasil ditambahkan!");
    } catch (err) {
      alert("Gagal menyimpan: " + (err?.message ?? err));
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("berita")
        .delete()
        .eq("id", deletingId);
      if (error) throw error;

      setIsDeleteModalOpen(false);
      setDeletingId(null);
      fetchLatestBerita();
      alert("Berita berhasil dihapus!");
    } catch (err) {
      alert("Gagal menghapus: " + (err?.message ?? err));
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setVisibleCount(INITIAL_LIMIT); // Reset limit on search
  };

  const handleKategoriChange = (kategori) => {
    setSelectedKategori(kategori);
    setVisibleCount(INITIAL_LIMIT); // Reset limit on filter
  };

  return (
    <PageContainer breadcrumbText="Berita & Reportase">
      <PageHeader
        title="Berita & Reportase"
        subtitle="Kumpulan reportase, artikel, dan dokumentasi kegiatan OSIM."
        primaryAction={
          isAdmin && (
            <div className="flex items-center gap-2">
              <Link
                href="/admin/berita"
                className="px-3.5 py-2.5 bg-bg-card border border-border-dim hover:bg-bg-page hover:text-primary rounded-xl text-text-body flex items-center justify-center transition-all shadow-sm cursor-pointer"
                title="Kelola Berita"
              >
                <FiEdit3 size={18} />
              </Link>
              <button
                onClick={() => openModal()}
                className="button button-primary flex items-center justify-center cursor-pointer"
                title="Tulis Berita"
              >
                <FiPlus size={18} strokeWidth={3} />
              </button>
            </div>
          )
        }
        searchBar={
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Cari berita..."
              className="w-full pl-9 pr-4 py-2 bg-bg-card border border-border-dim rounded-lg text-sm text-text-main focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-light transition-all"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        }
        filters={
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleKategoriChange(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${selectedKategori === cat
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/25"
                  : "bg-bg-card text-text-body border-border-dim hover:border-primary hover:text-primary"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        }
      />

      <div className="py-8">
        {displayedBerita.length === 0 && !loading ? (
          <div className="text-center py-20 bg-bg-card border border-border-dim rounded-2xl">
            <h3 className="text-xl font-bold text-text-main mb-2">
              Tidak ada berita ditemukan
            </h3>
            <p className="text-text-muted mb-6">
              Coba gunakan kata kunci pencarian yang lain atau reset filter.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedKategori("Semua");
              }}
              className="button button-primary"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {displayedBerita.map((berita) => (
                <div key={berita.id} className="animate-scale-in">
                  <BeritaCard
                    berita={berita}
                    isAdmin={isAdmin}
                    onEdit={openModal}
                    onDelete={confirmDelete}
                  />
                </div>
              ))}
            </div>

            {/* Observer Target for Infinite Scroll */}
            {hasMore && (
              <div ref={observerTarget} className="flex justify-center py-8">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-muted">
                  <FiRefreshCw className="animate-spin text-primary" />
                  Memuat lebih banyak berita...
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== MODAL TAMBAH / EDIT (Pintasan Admin) ===== */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Edit Berita" : "Tulis Berita Baru"}
        maxWidth="760px"
      >
        <BeritaForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={modalLoading}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
          onImageRemove={handleImageRemove}
          uploadingImage={uploadingImage}
        />
      </Modal>

      {/* ===== MODAL KONFIRMASI HAPUS (Pintasan Admin) ===== */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Berita"
        maxWidth="420px"
      >
        <div className="p-2 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle size={32} className="text-red-500" />
          </div>
          <p className="text-sm font-bold text-text-main mb-1">
            Yakin ingin menghapus berita ini?
          </p>
          <p className="text-xs text-text-muted mb-6">
            Tindakan ini tidak dapat dibatalkan dari database.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-text-muted hover:bg-bg-page border border-border-dim transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-100 active:scale-95"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
