import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { FiSave, FiX, FiLayout } from "react-icons/fi";

const VisiMisiForm = ({ initialData, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    visi: initialData?.visi || "",
    misi: initialData?.misi || "",
    visi_misi_layout: initialData?.visi_misi_layout || "modular",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Update Layout (in pengaturan)
      const { error: layoutError } = await supabase
        .from("pengaturan")
        .update({ visi_misi_layout: formData.visi_misi_layout })
        .eq("id", 1);

      if (layoutError)
        throw new Error("Gagal update layout: " + layoutError.message);

      // 2. Upsert Visi (in konten_halaman)
      // Check if row exists or just upsert based on ID if we had it, but we only have content.
      // We'll search by page_type + judul first, if strict, but 'konten_halaman_pkey' is ID.
      // Since no unique constraint on (page_type, judul), upsert might duplicate if not careful.
      // Strategy: Fetch ID first, then update. If not exists, insert.
      // OR simpler: Just insert/update assuming unique titles for this page_type.
      // Let's rely on finding by page_type & judul for update.

      // Helper function to update/insert content
      const upsertContent = async (judul, isi) => {
        // Find existing record
        const { data: existing } = await supabase
          .from("konten_halaman")
          .select("id")
          .eq("page_type", "profile")
          .eq("judul", judul)
          .single();

        if (existing) {
          // Update
          const { error } = await supabase
            .from("konten_halaman")
            .update({ isi, updated_at: new Date() })
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          // Insert
          const { error } = await supabase.from("konten_halaman").insert({
            page_type: "profile",
            judul: judul,
            isi: isi,
            tipe: "text",
          });
          if (error) throw error;
        }
      };

      await upsertContent("Visi", formData.visi);
      await upsertContent("Misi", formData.misi);

      alert("Berhasil diperbarui!");
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <FiLayout className="text-blue-600" /> Pilih Layout Tampilan
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["modular", "split", "zigzag", "simple"].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setFormData({ ...formData, visi_misi_layout: l })}
              className={`py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-wider transition-all ${
                formData.visi_misi_layout === l
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">
          Visi Organisasi
        </label>
        <textarea
          rows={3}
          value={formData.visi}
          onChange={(e) => setFormData({ ...formData, visi: e.target.value })}
          placeholder="Tuliskan visi di sini..."
          className="w-full text-lg font-bold border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700">
          Misi Organisasi (Pisahkan dengan baris baru)
        </label>
        <textarea
          rows={10}
          value={formData.misi}
          onChange={(e) => setFormData({ ...formData, misi: e.target.value })}
          placeholder="Tulis misi per baris..."
          className="w-full leading-relaxed border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>

      <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all font-sans"
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

export default VisiMisiForm;
