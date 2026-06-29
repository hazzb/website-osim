"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/components/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/utils/uploadHelper";
import Modal from "@/components/Modal";
import BeritaForm from "@/components/forms/BeritaForm";
import { FiCalendar, FiUser, FiArrowLeft, FiEdit, FiTrash2, FiAlertCircle } from "react-icons/fi";

const KATEGORI_WARNA = {
  Internal: "bg-primary-light text-primary border-primary-border",
  Event: "bg-purple-50 text-purple-600 border-purple-100",
  Edukasi: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Sosial: "bg-orange-50 text-orange-600 border-orange-100",
  Prestasi: "bg-amber-50 text-amber-600 border-amber-100",
  Lainnya: "bg-bg-page text-text-body border-border-dim",
};

export default function BeritaDetail({ berita: initialBerita }) {
  const { session } = useAuth();
  const isAdmin = !!session;
  const router = useRouter();
  const supabase = createClient();

  const [berita, setBerita] = useState(initialBerita);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    judul: "",
    slug: "",
    kategori: "",
    tanggal: "",
    penulis: "",
    excerpt: "",
    konten: "",
    image_url: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const dateObj = new Date(berita.tanggal);
  const formattedDate = dateObj.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const openModal = () => {
    setFormData({
      ...berita,
      tanggal: berita.tanggal ? berita.tanggal.split("T")[0] : "",
    });
    setImagePreview(berita.image_url || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
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

      const { error } = await supabase
        .from("berita")
        .update(payload)
        .eq("id", berita.id);

      if (error) throw error;

      closeModal();
      setBerita({ ...berita, ...payload });
      alert("Berita berhasil diperbarui!");
      if (payload.slug !== berita.slug) {
        router.push(`/berita/${payload.slug}`);
      }
    } catch (err) {
      alert("Gagal menyimpan: " + (err?.message ?? err));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const { error } = await supabase.from("berita").delete().eq("id", berita.id);
      if (error) throw error;
      router.push("/berita");
    } catch (err) {
      alert("Gagal menghapus: " + (err?.message ?? err));
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in">
      {/* Navigation & Admin Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <Link
          href="/berita"
          className="button button-secondary"
        >
          <FiArrowLeft /> Kembali ke Daftar Berita
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={openModal}
              className="button button-primary cursor-pointer flex items-center gap-1.5"
            >
              <FiEdit /> Edit Berita
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer"
            >
              <FiTrash2 /> Hapus
            </button>
          </div>
        )}
      </div>

      {/* Header Section */}
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className={`text-[10px] uppercase font-black tracking-wider px-3 py-1.5 rounded-full border ${
            KATEGORI_WARNA[berita.kategori] ?? "bg-bg-page text-text-muted border-border-dim"
          }`}>
            {berita.kategori}
          </span>
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-text-main mb-6 leading-tight tracking-tight">
          {berita.judul}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-text-muted">
          <span className="flex items-center gap-1.5">
            <FiCalendar className="text-primary" size={16} />
            {formattedDate}
          </span>
          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
          <span className="flex items-center gap-1.5">
            <FiUser className="text-primary" size={16} />
            {berita.penulis}
          </span>
        </div>
      </header>

      {/* Cover Image */}
      {berita.image_url && (
        <figure className="mb-12 rounded-2xl overflow-hidden shadow-lg border border-border-dim">
          <img
            src={berita.image_url}
            alt={berita.judul}
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </figure>
      )}

      {/* Markdown Content */}
      <div className="bg-bg-card card p-6 md:p-10 lg:p-12 shadow-sm-custom">
        <div className="prose prose-slate prose-lg md:prose-xl max-w-none prose-headings:text-text-main prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary-hover prose-img:rounded-xl prose-img:shadow-md">
          <ReactMarkdown>{berita.konten}</ReactMarkdown>
        </div>
      </div>

      {/* ADMIN EDIT MODAL */}
      {isAdmin && (
        <>
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            title="Edit Berita"
            maxWidth="1000px"
          >
            <BeritaForm
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              onCancel={closeModal}
              loading={modalLoading}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onImageRemove={handleImageRemove}
              uploadingImage={uploadingImage}
            />
          </Modal>

          {/* HAPUS KONFIRMASI */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Hapus Berita"
            maxWidth="420px"
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle size={32} className="text-red-500" />
              </div>
              <p className="text-sm font-bold text-text-main mb-1">
                Yakin ingin menghapus berita ini?
              </p>
              <p className="text-xs text-text-muted mb-6">
                Berita &ldquo;<strong>{berita.judul}</strong>&rdquo; akan dihapus permanen dan tidak dapat dikembalikan.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-text-muted hover:bg-bg-page border border-border-dim transition-all cursor-pointer"
                  disabled={deleteLoading}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </article>
  );
}
