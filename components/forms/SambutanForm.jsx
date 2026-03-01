import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { FiSave, FiX, FiCamera } from "react-icons/fi";
import { uploadImage } from "../../utils/uploadHelper";

const SambutanForm = ({ initialData, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    sambutan_judul: initialData?.nama_ketua || "",
    sambutan_isi: initialData?.isi_sambutan || "",
    sambutan_foto_url: initialData?.foto_url || "",
  });
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialData?.foto_url || null);

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
      }
      const { error } = await supabase
        .from("pengaturan")
        .update({
          sambutan_judul: formData.sambutan_judul,
          sambutan_isi: formData.sambutan_isi,
          sambutan_foto_url: finalUrl,
        })
        .eq("id", 1);
      if (error) throw error;
      alert("Berhasil diperbarui!");
      onSuccess();
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
          <label className="text-sm font-bold text-slate-700">Foto Ketua</label>
          <div className="relative group w-full aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                className="w-full h-full object-cover"
                alt="Preview"
              />
            ) : (
              <FiCamera size={40} className="text-slate-300" />
            )}
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*"
            />
          </div>
          <p className="text-[10px] text-slate-400 italic">
            Klik area foto untuk ganti gambar.
          </p>
        </div>

        {/* INPUT COLUMN */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">
              Judul Sambutan
            </label>
            <input
              type="text"
              value={formData.sambutan_judul}
              onChange={(e) =>
                setFormData({ ...formData, sambutan_judul: e.target.value })
              }
              className="w-full font-bold"
              placeholder="Contoh: Sambutan Ketua OSIS"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">
              Isi Sambutan (Mendukung Markdown)
            </label>
            <textarea
              rows={12}
              value={formData.sambutan_isi}
              onChange={(e) =>
                setFormData({ ...formData, sambutan_isi: e.target.value })
              }
              className="w-full text-base leading-relaxed"
              placeholder="Tulis sambutan di sini..."
              required
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100 bg-white">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all font-sans"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-sans"
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
