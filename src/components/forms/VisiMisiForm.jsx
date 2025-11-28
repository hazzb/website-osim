import React from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";

const VisiMisiForm = ({ formData, onChange, onSubmit, onCancel, loading }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles.formGrid}>
        {/* Baris 1: Judul (Lebar) & Urutan (Kecil) */}
        <FormInput
          label="Judul Seksi"
          name="judul"
          value={formData.judul || ""}
          onChange={onChange}
          required
          span={9}
          placeholder="Contoh: Misi, Nilai Kami"
        />

        <FormInput
          label="Urutan"
          name="urutan"
          type="number"
          value={formData.urutan || 10}
          onChange={onChange}
          required
          span={3}
        />

        {/* Baris 2: Isi Konten (Markdown Editor) */}
        <FormInput
          label="Isi Konten"
          name="isi"
          type="textarea"
          value={formData.isi || ""}
          onChange={onChange}
          span={12}
          isMarkdown={true} // Mode editor coding
          placeholder="Tuliskan konten di sini..."
          helper={
            <span
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              💡 Tips: Gunakan **Tebal**, *Miring*, atau - List item.
              <a
                href="https://www.markdownguide.org/basic-syntax/"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#3b82f6",
                  textDecoration: "none",
                  fontWeight: "bold",
                  marginLeft: "4px",
                }}
              >
                Panduan Markdown 📝
              </a>
            </span>
          }
        />
      </div>

      {/* Footer Tombol (Rata Kanan) */}
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
