"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/utils/uploadHelper";
import { FiSave, FiX, FiCamera } from "react-icons/fi";

const SambutanForm = ({ initialData, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    sambutan_judul: initialData?.sambutan_judul || "",
    sambutan_isi: initialData?.sambutan_isi || "",
    sambutan_foto_url: initialData?.sambutan_foto_url || "",
  });
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialData?.sambutan_foto_url || null);

  const supabase = createClient();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalUrl = formData.sambutan_foto_url;
      if (file) {
        finalUrl = await uploadImage(file, "banners");
        if (!finalUrl) throw new Error("Gagal mengunggah foto.");
      }
      
      const payload = {
        sambutan_judul: formData.sambutan_judul,
        sambutan_isi: formData.sambutan_isi,
        sambutan_foto_url: finalUrl,
      };

      const { error } = await supabase
        .from("pengaturan")
        .update(payload)
        .eq("id", 1);
        
      if (error) throw error;
      
      onSuccess(payload);
    } catch (err) {
      alert("Kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* FOTO COLUMN */}
        <div className="flex flex-col gap-3 w-full md:w-[200px]">
          <label className="text-sm font-bold text-text-main">Foto Ketua</label>
          <div className="relative group w-full aspect-[3/4] bg-border-dim rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-primary transition-colors">
            {preview ? (
              <img
                src={preview}
                className="w-full h-full object-cover"
                alt="Preview"
              />
            ) : (
              <FiCamera size={40} className="text-slate-300 group-hover:text-primary transition-colors" />
            )}
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*"
            />
          </div>
          <p className="text-[10px] text-text-muted italic text-center">
            Klik area kotak untuk ganti gambar.
          </p>
        </div>

        {/* INPUT COLUMN */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-main">
              Judul Sambutan
            </label>
            <input
              type="text"
              value={formData.sambutan_judul}
              onChange={(e) =>
                setFormData({ ...formData, sambutan_judul: e.target.value })
              }
              className="w-full font-bold px-4 py-2 rounded-lg border border-border-dim bg-bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Contoh: Sambutan Ketua OSIM"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-main">
              Isi Sambutan (Mendukung Markdown)
            </label>
            <textarea
              rows={10}
              value={formData.sambutan_isi}
              onChange={(e) =>
                setFormData({ ...formData, sambutan_isi: e.target.value })
              }
              className="w-full text-base leading-relaxed px-4 py-3 rounded-lg border border-border-dim bg-bg-card focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y"
              placeholder="Tulis sambutan di sini..."
              required
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border-dim">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 bg-bg-card border border-border-dim text-text-body rounded-xl font-bold hover:bg-bg-page transition-all font-sans"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-sans"
        >
          {loading ? (
            "Menyimpan..."
          ) : (
            <>
              <FiSave /> Simpan Perubahan
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default SambutanForm;
