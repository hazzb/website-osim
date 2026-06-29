"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/utils/uploadHelper";
import { FiSave, FiCamera } from "react-icons/fi";

const BerandaSlideForm = ({ initialData, onSuccess, onClose }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    judul: initialData?.judul || "",
    deskripsi: initialData?.deskripsi || "",
    image_url: initialData?.image_url || "",
    urutan: initialData?.urutan || 0,
    is_active: initialData?.is_active ?? true,
  });
  
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialData?.image_url || null);
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
    if (!file && !formData.image_url) {
      alert("Gambar slide wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      let finalUrl = formData.image_url;
      if (file) {
        finalUrl = await uploadImage(file, "banners");
        if (!finalUrl) throw new Error("Gagal mengunggah gambar.");
      }

      const payload = {
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        image_url: finalUrl,
        urutan: parseInt(formData.urutan) || 0,
        is_active: formData.is_active,
      };

      let error;
      if (isEdit) {
        const res = await supabase.from("beranda_slides").update(payload).eq("id", initialData.id);
        error = res.error;
      } else {
        const res = await supabase.from("beranda_slides").insert([payload]);
        error = res.error;
      }

      if (error) throw error;
      
      onSuccess();
    } catch (err) {
      alert("Kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
      {/* Gambar Cover */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-text-main">Gambar Slide</label>
        <div className="relative group w-full h-[200px] bg-border-dim rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-primary transition-colors">
          {preview ? (
            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
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
        <p className="text-[10px] text-text-muted italic">
          Gunakan gambar landscape beresolusi tinggi (misal: 1920x1080).
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-text-main">Judul Utama</label>
        <input
          type="text"
          value={formData.judul}
          onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
          className="w-full font-bold px-4 py-2 rounded-lg border border-border-dim bg-bg-card focus:border-primary outline-none transition-colors"
          placeholder="Judul Hero"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-text-main">Deskripsi Singkat</label>
        <textarea
          rows={3}
          value={formData.deskripsi}
          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-border-dim bg-bg-card focus:border-primary outline-none transition-colors"
          placeholder="Opsional"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-bold text-text-main">Urutan Tampil</label>
          <input
            type="number"
            value={formData.urutan}
            onChange={(e) => setFormData({ ...formData, urutan: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-border-dim bg-bg-card focus:border-primary outline-none transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-bold text-text-main">Status Aktif</label>
          <select
            value={formData.is_active.toString()}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}
            className="w-full px-4 py-2 rounded-lg border border-border-dim bg-bg-card focus:border-primary outline-none transition-colors"
          >
            <option value="true">Aktif</option>
            <option value="false">Sembunyikan</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border-dim mt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-2.5 bg-bg-card border border-border-dim text-text-body rounded-xl font-bold hover:bg-bg-page transition-all"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "Menyimpan..." : <><FiSave /> Simpan Slide</>}
        </button>
      </div>
    </form>
  );
};

export default BerandaSlideForm;
