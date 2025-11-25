import React from "react";
import formStyles from "../admin/AdminForm.module.css";
import FormInput from "../admin/FormInput.jsx";

const BerandaForm = ({
  formData,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
  loading,
  preview,
}) => {
  const showPreview = preview || formData.image_url;

  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles["form-grid"]}>
        {/* --- JUDUL & ISI --- */}
        <FormInput
          label="Judul Utama (Headline)"
          name="judul"
          value={formData.judul || ""}
          onChange={onChange}
          required
          span="col-span-3"
        />

        <div
          className={`${formStyles["col-span-3"]} ${formStyles["form-group"]}`}
        >
          <label className={formStyles["form-label"]}>
            Isi Konten / Subjudul
          </label>
          <textarea
            name="isi"
            value={formData.isi || ""}
            onChange={onChange}
            className={formStyles["form-textarea"]}
            rows="5"
            placeholder="Tulis deskripsi di sini..."
          />
        </div>

        {/* --- UPLOAD GAMBAR --- */}
        <div
          className={`${formStyles["col-span-3"]} ${formStyles["upload-section"]}`}
        >
          <label
            className={formStyles["form-label"]}
            style={{ alignSelf: "flex-start" }}
          >
            Gambar Ilustrasi (Opsional)
          </label>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              marginTop: "0.5rem",
            }}
          >
            {/* Preview Box */}
            <div
              style={{
                width: "120px",
                height: "80px",
                borderRadius: "8px",
                overflow: "hidden",
                background: "#f7fafc",
                border: "1px solid #cbd5e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showPreview ? (
                <img
                  src={showPreview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "2rem" }}>🖼️</span>
              )}
            </div>

            {/* Input File */}
            <div style={{ flex: 1 }}>
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className={formStyles["form-input"]}
              />
              <p className={formStyles["form-helper"]}>
                Format: JPG/PNG. Max 2MB. Kosongkan jika hanya ingin teks.
              </p>
            </div>
          </div>
        </div>

        {/* --- TOMBOL CTA (Opsional) --- */}
        <div
          className={formStyles["col-span-3"]}
          style={{ borderTop: "1px dashed #e2e8f0", margin: "1rem 0" }}
        ></div>

        <FormInput
          label="Teks Tombol (Opsional)"
          name="button_text"
          value={formData.button_text || ""}
          onChange={onChange}
          placeholder="Contoh: Lihat Selengkapnya"
        />

        <FormInput
          label="Link Tujuan (Opsional)"
          name="button_link"
          value={formData.button_link || ""}
          onChange={onChange}
          placeholder="Contoh: /program-kerja"
        />
      </div>

      <div className={formStyles["form-footer"]}>
        <button
          type="button"
          onClick={onCancel}
          className="button button-secondary"
          disabled={loading}
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

export default BerandaForm;
