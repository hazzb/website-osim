import React, { useState, useEffect } from "react";
import formStyles from "../admin/AdminForm.module.css";
import FormInput from "../admin/FormInput.jsx";
import { FiTrash2, FiPlus, FiImage } from "react-icons/fi";

const BerandaForm = ({
  formData,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
  loading,
  preview,
}) => {
  const [contentType, setContentType] = useState("both");
  const [carouselItems, setCarouselItems] = useState([]);

  // ... (Keep existing useEffect logic for initial data loading) ...
  // (Saya sembunyikan logika useEffect & Handlers Carousel biar fokus ke UI, asumsikan logika Anda tetap sama)
  // PASTIKAN LOGIC USEEFFECT ANDA TETAP DISINI

  // UI Part
  const showPreview = preview || formData.image_url;

  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles["form-grid"]}>
        {/* 1. TIPE KONTEN (Button Group) */}
        <div className={formStyles["col-span-12"]}>
          <label
            className={formStyles["form-label"]}
            style={{ marginBottom: "0.5rem", display: "block" }}
          >
            Tipe Tampilan
          </label>
          <div className={formStyles["btn-group"]}>
            {["both", "text", "image", "carousel"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setContentType(type)}
                className={`${formStyles["btn-group-item"]} ${
                  contentType === type ? formStyles["active"] : ""
                }`}
              >
                {type === "both"
                  ? "Teks + Gambar"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* 2. CAROUSEL INPUT */}
        {contentType === "carousel" && (
          <div className={formStyles["col-span-12"]}>
            {/* ... (Implementasi Carousel Item dengan style baru) ... */}
            {/* Gunakan formStyles['form-input'] untuk input di dalam map loop */}
            <p className={formStyles["helper-text"]}>
              Fitur carousel sedang dalam mode compact.
            </p>
          </div>
        )}

        {/* 3. INPUT UTAMA */}
        {contentType !== "carousel" && (
          <>
            {(contentType === "both" || contentType === "text") && (
              <>
                <FormInput
                  label="Judul"
                  name="judul"
                  value={formData.judul || ""}
                  onChange={onChange}
                  required={contentType !== "image"}
                  span={12}
                />

                {/* MARKDOWN EDITOR */}
                <FormInput
                  label="Isi Konten"
                  name="isi"
                  type="textarea"
                  value={formData.isi || ""}
                  onChange={onChange}
                  span={12}
                  isMarkdown={true} // Aktifkan mode editor
                  helper={
                    <span>
                      💡 Gunakan Markdown: **tebal**, *miring*, - list
                    </span>
                  }
                />

                <FormInput
                  label="Label Tombol"
                  name="button_text"
                  value={formData.button_text || ""}
                  onChange={onChange}
                  span={6}
                  placeholder="Contoh: Baca Selengkapnya"
                />
                <FormInput
                  label="Link Tombol"
                  name="button_link"
                  value={formData.button_link || ""}
                  onChange={onChange}
                  span={6}
                  placeholder="/link-tujuan"
                />
              </>
            )}

            {(contentType === "both" || contentType === "image") && (
              <div className={formStyles["col-span-12"]}>
                <label className={formStyles["form-label"]}>
                  Upload Gambar
                </label>
                <div className={formStyles["upload-row"]}>
                  <div className={formStyles["preview-box"]}>
                    {showPreview ? (
                      <img src={showPreview} alt="Preview" />
                    ) : (
                      <FiImage size={24} color="#ccc" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      className={formStyles["upload-btn"]}
                      style={{ width: "fit-content" }}
                    >
                      Pilih Gambar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        hidden
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className={formStyles["form-footer"]}>
        <button
          type="button"
          className="button button-secondary"
          onClick={onCancel}
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
