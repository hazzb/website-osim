"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import Modal from "@/components/Modal";
import BeritaForm from "@/components/forms/BeritaForm";
import { FilterSearch } from "@/components/ui/FilterBar";
import tableStyles from "@/components/admin/AdminTable.module.css";
import { uploadImage } from "@/utils/uploadHelper";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiEye,
  FiAlertCircle,
  FiCopy,
  FiCheck,
} from "react-icons/fi";

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

const KATEGORI_WARNA = {
  Internal: "bg-blue-50 text-blue-600",
  Event: "bg-purple-50 text-purple-600",
  Edukasi: "bg-emerald-50 text-emerald-600",
  Sosial: "bg-orange-50 text-orange-600",
  Prestasi: "bg-amber-50 text-amber-600",
  Lainnya: "bg-slate-100 text-slate-500",
};

export default function BeritaManagement() {
  const supabase = createClient();

  // ---- State Data ----
  const [beritaList, setBeritaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [copiedSlug, setCopiedSlug] = useState(null);

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

  // ==============================================================
  //  Fetch Data
  // ==============================================================
  const fetchBerita = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("berita")
        .select("*")
        .order("tanggal", { ascending: false });

      if (error) throw error;
      setBeritaList(data || []);
    } catch (err) {
      console.error("Error fetching berita:", err);
      // Fallback ke empty jika table belum siap, agar tidak crash
      setBeritaList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBerita();
  }, []);

  // ==============================================================
  //  Handlers
  // ==============================================================
  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ 
        ...item, 
        tanggal: item.tanggal ? item.tanggal.split("T")[0] : "" 
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

  const copyToClipboard = (slug) => {
    const url = `${window.location.origin}/berita/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    });
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
      fetchBerita();
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
      fetchBerita();
      alert("Berita berhasil dihapus!");
    } catch (err) {
      alert("Gagal menghapus: " + (err?.message ?? err));
    }
  };

  // ==============================================================
  //  Filter + Search
  // ==============================================================
  const filteredList = beritaList.filter((b) => {
    const matchSearch =
      !searchTerm ||
      b.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.penulis?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKategori = !filterKategori || b.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  const allKategori = [...new Set(beritaList.map((b) => b.kategori))];

  return (
    <PageContainer breadcrumbText="Kelola Berita">
      <PageHeader
        title="Kelola Berita & Reportase"
        subtitle={`${beritaList.length} artikel terbit di database`}
        primaryAction={
          <button
            onClick={() => openModal()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <FiPlus /> Tulis Berita
          </button>
        }
        searchBar={
          <FilterSearch
            placeholder="Cari judul atau penulis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        }
        filters={
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori:</span>
            {["", ...allKategori].map((k) => (
              <button
                key={k || "all"}
                onClick={() => setFilterKategori(k)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                  filterKategori === k
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {k || "Semua"}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <LoadingState message="Memuat data berita dari Supabase..." />
      ) : (
        <div className={tableStyles.wrapper}>
          <div className={tableStyles.tableContainer}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Berita</th>
                  <th>Kategori</th>
                  <th>Penulis</th>
                  <th>Tanggal</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <FiSearch size={40} className="mb-2" />
                        <p className="text-sm font-bold">Tidak ada berita ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr key={item.id}>
                      {/* Berita Info & Slug */}
                      <td className="max-w-xs">
                        <div className="flex items-center gap-3">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.judul}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">
                              {item.judul}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">
                                /berita/{item.slug}
                              </span>
                              <button
                                onClick={() => copyToClipboard(item.slug)}
                                className="text-slate-400 hover:text-blue-600 transition-colors p-0.5"
                                title="Salin Link Publik"
                              >
                                {copiedSlug === item.slug ? (
                                  <FiCheck className="text-emerald-500" size={11} />
                                ) : (
                                  <FiCopy size={11} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td>
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                            KATEGORI_WARNA[item.kategori] ?? "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.kategori}
                        </span>
                      </td>

                      {/* Penulis */}
                      <td className="text-xs text-slate-500 font-medium">{item.penulis || "-"}</td>

                      {/* Tanggal */}
                      <td className="text-xs text-slate-500 font-medium whitespace-nowrap">
                        {item.tanggal
                          ? new Date(item.tanggal).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>

                      {/* Aksi */}
                      <td>
                        <div className={tableStyles.actionCell}>
                          <a
                            href={`/berita/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${tableStyles.btnAction} text-emerald-600 hover:bg-emerald-50`}
                            title="Lihat di publik"
                          >
                            <FiEye />
                          </a>
                          <button
                            onClick={() => openModal(item)}
                            className={`${tableStyles.btnAction} ${tableStyles.btnEdit}`}
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => confirmDelete(item.id)}
                            className={`${tableStyles.btnAction} ${tableStyles.btnDelete}`}
                            title="Hapus"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className={tableStyles.paginationContainer}>
            <div className="text-xs text-slate-400 font-bold">
              Menampilkan <strong>{filteredList.length}</strong> dari{" "}
              <strong>{beritaList.length}</strong> berita
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL TAMBAH / EDIT ===== */}
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

      {/* ===== MODAL KONFIRMASI HAPUS ===== */}
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
          <p className="text-sm font-bold text-slate-700 mb-1">
            Yakin ingin menghapus berita ini?
          </p>
          <p className="text-xs text-slate-400 mb-6">
            Tindakan ini tidak dapat dibatalkan dari database.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 transition-all"
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
