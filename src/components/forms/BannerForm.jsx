import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { uploadImage } from "../../utils/uploadHelper";
import formStyles from "../admin/AdminForm.module.css";
import FormInput from "../admin/FormInput.jsx";

const BannerForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    urutan: 10,
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Pilih gambar slide terlebih dahulu!");

    setLoading(true);
    try {
      // 1. Upload Gambar
      // Pastikan bucket 'banners' atau 'beranda_slides' ada di Supabase Storage
      // Jika belum ada, gunakan 'public' atau sesuaikan helper
      const imageUrl = await uploadImage(file, "banners");

      // 2. Simpan ke Tabel beranda_slides
      const { error } = await supabase.from("beranda_slides").insert({
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        image_url: imageUrl,
        urutan: parseInt(formData.urutan) || 10,
        is_active: true,
      });

      if (error) throw error;

      // 3. Reset & Success
      setFormData({ judul: "", deskripsi: "", urutan: 10 });
      setFile(null);
      alert("Slide berhasil ditambahkan!");
      if (onSuccess) onSuccess();
    } catch (error) {
      alert("Gagal upload slide: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <h3 style={{ margin: 0, color: "#1e293b", fontSize: "1.1rem" }}>
        Tambah Slide Baru
      </h3>

      <div className={formStyles.formGrid}>
        <FormInput
          label="Judul Slide"
          name="judul"
          value={formData.judul}
          onChange={handleChange}
          required
          span={8}
          placeholder="Contoh: Selamat Datang"
        />

        <FormInput
          label="Urutan"
          name="urutan"
          type="number"
          value={formData.urutan}
          onChange={handleChange}
          span={4}
          placeholder="Default: 10"
        />

        <FormInput
          label="Deskripsi (Opsional)"
          name="deskripsi"
          value={formData.deskripsi}
          onChange={handleChange}
          span={12}
          type="textarea"
          rows={2}
          placeholder="Keterangan singkat..."
        />

        <div style={{ gridColumn: "span 12" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#475569",
              marginBottom: "0.5rem",
            }}
          >
            Gambar Slide (Landscape)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
            }}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="button button-primary"
        disabled={loading}
        style={{ marginTop: "0.5rem" }}
      >
        {loading ? "Mengupload..." : "Upload Slide"}
      </button>
    </form>
  );
};

export default BannerForm;
