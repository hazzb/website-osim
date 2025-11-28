import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { FiUser, FiCamera } from "react-icons/fi";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";

const SambutanForm = ({ onClose, onSuccess, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ judul: "", isi: "" });
  const [formFile, setFormFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Load data awal saat modal dibuka
  useEffect(() => {
    if (initialData) {
      setFormData({
        judul: initialData.sambutan_judul || "",
        isi: initialData.sambutan_isi || "",
      });
      setPreview(initialData.sambutan_foto_url);
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalUrl = initialData?.sambutan_foto_url;

      // Upload jika ada file baru
      if (formFile) {
        const ext = formFile.name.split(".").pop();
        const fileName = `sambutan_${Date.now()}.${ext}`;

        // Upload ke bucket 'banners' (karena public)
        const { error: upErr } = await supabase.storage
          .from("banners")
          .upload(fileName, formFile);
        if (upErr) throw upErr;

        const { data: urlData } = supabase.storage
          .from("banners")
          .getPublicUrl(fileName);
        finalUrl = urlData.publicUrl;
      }

      // Update DB (Tabel pengaturan)
      const { error } = await supabase
        .from("pengaturan")
        .update({
          sambutan_judul: formData.judul,
          sambutan_isi: formData.isi,
          sambutan_foto_url: finalUrl,
        })
        .eq("id", 1);

      if (error) throw error;

      alert("Sambutan diperbarui!");
      onSuccess();
      onClose();
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={formStyles.formGrid}>
        {/* Upload Row (Compact Style) */}
        <div className={formStyles.colSpan12}>
          <label className={formStyles.formLabel}>Foto Ketua</label>
          <div className={formStyles.uploadRow}>
            <div
              className={`${formStyles.previewBox} ${formStyles.previewCircle}`}
            >
              {preview ? (
                <img src={preview} alt="Ketua" />
              ) : (
                <FiUser size={24} />
              )}
            </div>
            <div>
              <label className={formStyles.uploadBtn}>
                <FiCamera /> Ganti Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  hidden
                />
              </label>
            </div>
          </div>
        </div>

        <FormInput
          label="Judul Sambutan"
          name="judul"
          value={formData.judul}
          onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
          required
          span={12}
        />

        {/* Markdown Textarea */}
        <FormInput
          label="Isi Sambutan"
          name="isi"
          type="textarea"
          value={formData.isi}
          onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
          required
          span={12}
          isMarkdown={true}
          helper="Gunakan Enter untuk baris baru."
        />
      </div>

      <div className={formStyles.formFooter}>
        <button
          type="button"
          onClick={onClose}
          className="button button-secondary"
        >
          Batal
        </button>
        <button
          type="submit"
          className="button button-primary"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default SambutanForm;
