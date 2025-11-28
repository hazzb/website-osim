import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import FormInput from "../admin/FormInput";
import formStyles from "../admin/AdminForm.module.css";
import { FiImage } from "react-icons/fi";

const BannerForm = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ judul: "", deskripsi: "" });
  const [formFile, setFormFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formFile) return alert("Pilih gambar banner!");
    setLoading(true);
    try {
      const ext = formFile.name.split(".").pop();
      const fileName = `banner_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("banners")
        .upload(fileName, formFile);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage
        .from("banners")
        .getPublicUrl(fileName);

      const { error: dbErr } = await supabase.from("beranda_slides").insert({
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        image_url: urlData.publicUrl,
        is_active: true,
      });
      if (dbErr) throw dbErr;
      alert("Banner berhasil ditambahkan!");
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
        {/* Upload Row Compact */}
        <div className={formStyles["col-span-12"]}>
          <label className={formStyles["form-label"]}>
            Gambar Banner <span className={formStyles.required}>*</span>
          </label>
          <div className={formStyles["upload-row"]}>
            <div className={formStyles["preview-box"]}>
              {preview ? (
                <img src={preview} alt="Preview" />
              ) : (
                <FiImage size={20} color="#cbd5e0" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label
                className={formStyles["upload-btn"]}
                style={{ display: "inline-block" }}
              >
                Pilih File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  hidden
                />
              </label>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#94a3b8",
                  marginLeft: "0.5rem",
                }}
              >
                {formFile ? formFile.name : "Belum ada file dipilih"}
              </span>
            </div>
          </div>
        </div>

        <FormInput
          label="Judul Banner"
          name="judul"
          value={formData.judul}
          onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
          required
          span={12}
          placeholder="Contoh: Selamat Datang"
        />

        <FormInput
          label="Deskripsi Singkat"
          name="deskripsi"
          value={formData.deskripsi}
          onChange={(e) =>
            setFormData({ ...formData, deskripsi: e.target.value })
          }
          span={12}
          placeholder="Keterangan tambahan..."
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

export default BannerForm;
