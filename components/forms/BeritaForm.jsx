"use client";

import React, { useState, useRef } from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";
import {
  FiType,
  FiTag,
  FiAlignLeft,
  FiFileText,
  FiImage,
  FiX,
  FiUpload,
  FiHash,
} from "react-icons/fi";

const KATEGORI_OPTIONS = ["Internal", "Event", "Edukasi", "Sosial", "Prestasi", "Lainnya"];

const BeritaForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  loading,
  imagePreview,
  onImageChange,
  onImageRemove,
  uploadingImage,
}) => {
  const fileInputRef = useRef(null);

  // Auto-generate slug dari judul
  const handleJudulChange = (e) => {
    onChange(e);
    // Hanya auto-generate slug jika form baru (tidak sedang edit)
    if (!formData.id) {
      const slug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      onChange({ target: { name: "slug", value: slug } });
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-2">
      <div className={formStyles.formGrid}>

        {/* JUDUL */}
        <div className="col-span-12">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
            Judul Berita <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiType className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              name="judul"
              value={formData.judul || ""}
              onChange={handleJudulChange}
              required
              placeholder="Contoh: Rapat Kerja OSIM 2026 Berjalan Sukses"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all bg-slate-50"
            />
          </div>
        </div>

        {/* SLUG */}
        <div className="col-span-12">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
            Slug URL <span className="text-slate-300 text-[9px] normal-case font-normal tracking-normal">(auto-generated, bisa diedit)</span>
          </label>
          <div className="relative">
            <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              name="slug"
              value={formData.slug || ""}
              onChange={onChange}
              required
              placeholder="rapat-kerja-osim-2026"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all bg-slate-50"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 pl-1">
            URL: /berita/<strong>{formData.slug || "..."}</strong>
          </p>
        </div>

        {/* KATEGORI & TANGGAL */}
        <div className="col-span-12 sm:col-span-6">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
            Kategori <span className="text-red-500">*</span>
          </label>
          <select
            name="kategori"
            value={formData.kategori || ""}
            onChange={onChange}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all bg-slate-50 appearance-none"
          >
            <option value="">- Pilih Kategori -</option>
            {KATEGORI_OPTIONS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        <div className="col-span-12 sm:col-span-6">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
            Tanggal Terbit <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="tanggal"
            value={formData.tanggal || ""}
            onChange={onChange}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all bg-slate-50"
          />
        </div>

        {/* PENULIS */}
        <div className="col-span-12">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
            Nama Penulis / Divisi
          </label>
          <input
            name="penulis"
            value={formData.penulis || ""}
            onChange={onChange}
            placeholder="Contoh: Divisi Jurnalistik"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all bg-slate-50"
          />
        </div>

        {/* GAMBAR COVER */}
        <div className="col-span-12">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
            Gambar Cover
          </label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mb-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={onImageRemove}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all"
                title="Hapus Gambar"
              >
                <FiX size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
            >
              <FiUpload className="mx-auto text-slate-300 group-hover:text-blue-400 transition-colors mb-2" size={32} />
              <p className="text-xs font-bold text-slate-400 group-hover:text-blue-500 transition-colors">
                {uploadingImage ? "Mengupload gambar..." : "Klik untuk pilih gambar cover"}
              </p>
              <p className="text-[10px] text-slate-300 mt-1">JPG, PNG, WEBP • Maks. 2MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onImageChange}
          />
          {/* Simpan URL gambar yang sudah diupload */}
          <input type="hidden" name="image_url" value={formData.image_url || ""} />
        </div>

        {/* SECTION DIVIDER */}
        <div className="col-span-12 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Konten Artikel</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
        </div>

        {/* EXCERPT */}
        <div className="col-span-12">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
            Kutipan Singkat (Excerpt) <span className="text-red-500">*</span>
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt || ""}
            onChange={onChange}
            required
            rows={2}
            placeholder="Rangkuman singkat berita yang tampil di kartu daftar berita..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all bg-slate-50 resize-none"
          />
        </div>

        {/* KONTEN MARKDOWN */}
        <div className="col-span-12">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
            Konten Berita (Markdown) <span className="text-red-500">*</span>
          </label>
          <textarea
            name="konten"
            value={formData.konten || ""}
            onChange={onChange}
            required
            rows={12}
            placeholder={`# Judul Utama\n\nIsi berita ditulis di sini...\n\n## Sub-judul\nParagraf isi berita.\n\n> Kutipan penting di sini`}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all bg-slate-50"
          />
          <p className="text-[10px] text-slate-400 mt-1 pl-1">
            Gunakan sintaks Markdown. Heading: <code className="bg-slate-100 px-1 rounded"># H1</code> <code className="bg-slate-100 px-1 rounded">## H2</code> · Bold: <code className="bg-slate-100 px-1 rounded">**teks**</code> · Kutipan: <code className="bg-slate-100 px-1 rounded">{"> teks"}</code>
          </p>
        </div>

      </div>

      {/* FORM ACTIONS */}
      <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading || uploadingImage}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all border border-slate-200 disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="px-8 py-2.5 rounded-xl text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 active:scale-95"
        >
          {loading ? "Menyimpan..." : uploadingImage ? "Upload gambar..." : "Simpan Berita"}
        </button>
      </div>
    </form>
  );
};

export default BeritaForm;
