import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { uploadImage } from "../../utils/uploadHelper";
import { FiSave, FiX, FiImage, FiTrash2 } from "react-icons/fi";

/**
 * KontenHalamanForm - Form untuk add/edit konten halaman (VisiMisi, dll)
 * Supports: title, content (markdown), image upload, button config
 */
const KontenHalamanForm = ({
  initialData,
  pageType = "profile",
  onSuccess,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    judul: "",
    isi: "",
    tipe: "text",
    image_url: "",
    button_text: "",
    button_link: "",
    ...initialData,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialData?.image_url || "",
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image_url: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let updates = { ...formData, page_type: pageType };

      // Upload image if new file selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, "konten");
        updates.image_url = uploadedUrl;
      }

      // Upsert: Update if id exists, insert if new
      if (initialData?.id) {
        // Update existing
        const { error } = await supabase
          .from("konten_halaman")
          .update(updates)
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        // Insert new - get max urutan first
        const { data: maxData } = await supabase
          .from("konten_halaman")
          .select("urutan")
          .eq("page_type", pageType)
          .order("urutan", { ascending: false })
          .limit(1)
          .single();

        updates.urutan = (maxData?.urutan || 0) + 1;

        const { error } = await supabase.from("konten_halaman").insert(updates);

        if (error) throw error;
      }

      alert(
        initialData?.id
          ? "Konten berhasil diperbarui!"
          : "Konten berhasil ditambahkan!",
      );
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
      {/* Judul */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">
          Judul <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="judul"
          value={formData.judul}
          onChange={handleChange}
          placeholder="Contoh: Visi Kami, Misi Pertama, dll"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>

      {/* Isi (Content - Markdown) */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">
          Isi Konten <span className="text-red-500">*</span>
        </label>
        <textarea
          name="isi"
          value={formData.isi}
          onChange={handleChange}
          rows={8}
          placeholder="Tulis konten di sini. Mendukung Markdown (**bold**, *italic*, - list, dll)"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed font-mono text-sm"
          required
        />
        <small className="text-slate-500">
          💡 Tip: Gunakan Markdown untuk formatting. Contoh: **bold**, *italic*,
          `- item list`
        </small>
      </div>

      {/* Tipe Konten */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">Tipe Konten</label>
        <select
          name="tipe"
          value={formData.tipe}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="text">Text</option>
          <option value="image">Image Featured</option>
          <option value="hero">Hero Banner</option>
        </select>
      </div>

      {/* Image Upload */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <FiImage /> Gambar (Opsional)
        </label>

        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-slate-200"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              title="Hapus gambar"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <FiImage size={32} />
              <span className="text-sm font-medium">
                Klik untuk upload gambar
              </span>
              <span className="text-xs">PNG, JPG (Max 2MB)</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Optional Button Config */}
      <div className="border-t border-slate-200 pt-4">
        <p className="text-sm font-bold text-slate-700 mb-3">
          Tombol Call-to-Action (Opsional)
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-600">Teks Tombol</label>
            <input
              type="text"
              name="button_text"
              value={formData.button_text}
              onChange={handleChange}
              placeholder="Contoh: Selengkapnya"
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-600">Link Tombol</label>
            <input
              type="url"
              name="button_link"
              value={formData.button_link}
              onChange={handleChange}
              placeholder="https://example.com"
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
        >
          <FiX className="inline mr-2" />
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            "Menyimpan..."
          ) : (
            <>
              <FiSave className="inline mr-2" />
              {initialData?.id ? "Update" : "Tambah"} Konten
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default KontenHalamanForm;
