import React from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";

const VisiMisiForm = ({
  formData,
  onChange,
  onFileChange, // Prop baru
  onSubmit,
  onCancel,
  loading,
  preview, // Prop baru untuk preview gambar
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles.formGrid}>
        {/* Judul */}
        <FormInput
          label="Judul Seksi"
          name="judul"
          value={formData.judul || ""}
          onChange={onChange}
          required
          span={12}
          placeholder="Contoh: Misi, Nilai Kami"
        />

        {/* --- INPUT GAMBAR (BARU) --- */}
        <FormInput
          label="Gambar Ilustrasi (Opsional)"
          name="file_gambar"
          type="file"
          onChange={onFileChange}
          accept="image/*"
          span={12}
          preview={preview} // Menampilkan preview dari parent
          helper="Format: JPG/PNG/WEBP. Max 1MB."
        />

        {/* Isi Konten */}
        <FormInput
          label="Isi Konten"
          name="isi"
          type="textarea"
          value={formData.isi || ""}
          onChange={onChange}
          span={12}
          isMarkdown={true}
          placeholder="Tuliskan konten di sini..."
          helper={
            <span
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              💡 Tips: Gunakan **Tebal**, *Miring*, atau - List item.
            </span>
          }
        />
      </div>

      <div className={formStyles.formFooter}>
        <button
          type="button"
          onClick={onCancel}
          className="button button-secondary"
        >
          Batal
        </button>
        <button
          type="submit"
          className="button button-primary"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Konten"}
        </button>
      </div>
    </form>
  );
};

export default VisiMisiForm;
