"use client";

import React, { useRef } from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";
import { FiFileText } from "react-icons/fi";

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
  // Auto-generate slug dari judul
  const handleJudulChange = (e) => {
    onChange(e);
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
        <FormInput
          label="Judul Berita"
          name="judul"
          value={formData.judul || ""}
          onChange={handleJudulChange}
          required
          span={12}
          placeholder="Contoh: Rapat Kerja OSIM Periode 2026 Berjalan Sukses"
        />

        {/* SLUG */}
        <FormInput
          label="Slug URL"
          name="slug"
          value={formData.slug || ""}
          onChange={onChange}
          required
          span={12}
          placeholder="rapat-kerja-osim-2026"
          helper={
            <span className="text-[10px] text-text-muted font-mono">
              Link: /berita/<strong>{formData.slug || "..."}</strong>
            </span>
          }
        />

        {/* KATEGORI & TANGGAL */}
        <FormInput
          label="Kategori"
          name="kategori"
          type="select"
          value={formData.kategori || ""}
          onChange={onChange}
          required
          span={6}
        >
          <option value="">- Pilih Kategori -</option>
          {KATEGORI_OPTIONS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </FormInput>

        <FormInput
          label="Tanggal Terbit"
          name="tanggal"
          type="date"
          value={formData.tanggal || ""}
          onChange={onChange}
          required
          span={6}
        />

        {/* PENULIS */}
        <FormInput
          label="Nama Penulis / Divisi"
          name="penulis"
          value={formData.penulis || ""}
          onChange={onChange}
          span={12}
          placeholder="Contoh: Divisi Jurnalistik"
        />

        {/* GAMBAR COVER */}
        <div className="col-span-12 flex items-end gap-3">
          <div className="flex-grow min-w-0">
            <FormInput
              label="Gambar Cover"
              name="image_file"
              type="file"
              preview={imagePreview}
              onChange={onImageChange}
              disabled={uploadingImage}
              helper={uploadingImage ? "Mengunggah..." : "Rekomendasi: Lanskap, JPG/PNG/WEBP (Maks. 2MB)"}
              accept="image/*"
            />
          </div>
          {imagePreview && (
            <button
              type="button"
              onClick={onImageRemove}
              className="h-[38px] px-4 border border-red-200 text-red-500 rounded-md text-xs font-semibold hover:bg-red-50 transition-colors shrink-0 mb-[18px] cursor-pointer"
            >
              Hapus
            </button>
          )}
        </div>

        {/* SECTION DIVIDER */}
        <div className="col-span-12 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border-dim" />
            <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
              <FiFileText /> Konten Artikel
            </span>
            <div className="flex-1 h-px bg-border-dim" />
          </div>
        </div>

        {/* EXCERPT */}
        <FormInput
          label="Kutipan Singkat (Excerpt)"
          name="excerpt"
          type="textarea"
          value={formData.excerpt || ""}
          onChange={onChange}
          required
          span={12}
          rows={2}
          placeholder="Rangkuman singkat berita yang tampil di kartu daftar berita..."
        />

        {/* KONTEN MARKDOWN */}
        <FormInput
          label="Konten Berita (Markdown)"
          name="konten"
          type="textarea"
          isMarkdown
          value={formData.konten || ""}
          onChange={onChange}
          required
          span={12}
          rows={10}
          placeholder={`# Judul Utama\n\nIsi berita ditulis di sini...\n\n## Sub-judul\nParagraf isi berita.\n\n> Kutipan penting di sini`}
        />
      </div>

      {/* FORM ACTIONS */}
      <div className="mt-8 pt-5 border-t border-border-dim flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading || uploadingImage}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-text-muted hover:bg-bg-page transition-all border border-border-dim disabled:opacity-50 cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="px-8 py-2.5 rounded-xl text-xs font-extrabold text-white bg-primary hover:bg-primary-hover transition-all shadow-lg shadow-blue-200 disabled:opacity-50 active:scale-95 cursor-pointer"
        >
          {loading ? "Menyimpan..." : uploadingImage ? "Upload..." : "Simpan Berita"}
        </button>
      </div>
    </form>
  );
};

export default BeritaForm;
